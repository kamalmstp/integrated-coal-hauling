<?php

namespace App\Services;

use App\Models\DumpingTicket;
use App\Models\FuelAdjustment;
use App\Models\FuelCalibration;
use App\Models\FuelParameter;
use App\Models\FuelReceipt;
use App\Models\FuelReconciliation;
use App\Models\FuelSounding;
use App\Models\FuelTank;
use App\Models\FuelTransaction;
use App\Models\Shift;
use App\Models\Site;
use App\Models\Unit;
use App\Models\UnitHmKmLog;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class FuelService
{
    public function generateNumber(string $prefix): string
    {
        return "{$prefix}-" . now()->format('Ymd') . '-' . strtoupper(Str::random(4));
    }

    /**
     * Get or initialize configurable site fuel parameters (default estimation_factor = 0.0475).
     */
    public function getOrCreateSiteParameter(int $siteId): FuelParameter
    {
        return FuelParameter::firstOrCreate(
            ['site_id' => $siteId],
            [
                'estimation_factor' => 0.047500,
                'default_haul_distance_km' => 32.00,
                'standard_fuel_price_per_liter' => 14850.00,
                'low_stock_threshold_percent' => 20.00,
                'variance_tolerance_percent' => 0.50,
                'max_dispense_per_tx_liter' => 450.00,
                'authorization_notes' => 'Default TAP Coal Hauling Fuel Estimation Factor (Tonase x Jarak x 0.0475)',
            ]
        );
    }

    /**
     * Update configurable site fuel parameter with authorization check.
     */
    public function updateSiteParameter(int $siteId, array $data): FuelParameter
    {
        if (!auth()->check()) {
            throw ValidationException::withMessages([
                'authorization' => 'Perubahan parameter formula estimasi solar wajib melalui otorisasi pengguna.',
            ]);
        }

        $param = $this->getOrCreateSiteParameter($siteId);

        $param->update([
            'estimation_factor' => isset($data['estimation_factor']) ? round((float) $data['estimation_factor'], 6) : $param->estimation_factor,
            'default_haul_distance_km' => isset($data['default_haul_distance_km']) ? round((float) $data['default_haul_distance_km'], 2) : $param->default_haul_distance_km,
            'standard_fuel_price_per_liter' => isset($data['standard_fuel_price_per_liter']) ? round((float) $data['standard_fuel_price_per_liter'], 2) : $param->standard_fuel_price_per_liter,
            'low_stock_threshold_percent' => isset($data['low_stock_threshold_percent']) ? round((float) $data['low_stock_threshold_percent'], 2) : $param->low_stock_threshold_percent,
            'variance_tolerance_percent' => isset($data['variance_tolerance_percent']) ? round((float) $data['variance_tolerance_percent'], 2) : $param->variance_tolerance_percent,
            'max_dispense_per_tx_liter' => isset($data['max_dispense_per_tx_liter']) ? round((float) $data['max_dispense_per_tx_liter'], 2) : $param->max_dispense_per_tx_liter,
            'authorization_notes' => $data['authorization_notes'] ?? $param->authorization_notes,
            'updated_by' => auth()->id(),
        ]);

        return $param->fresh(['site', 'updater']);
    }

    /**
     * Convert Tank Sounding Height (cm) to Volume (Liters) using Validated Calibration Chart
     * or Validated Cylinder Tank Geometry.
     * STRICT RULE: Never equate height in cm directly to volume in liters!
     */
    public function calculateVolumeFromSounding(FuelTank $tank, float $heightCm): array
    {
        if ($heightCm < 0) {
            throw ValidationException::withMessages([
                'measurement_cm' => 'Tinggi sounding tidak boleh bernilai negatif.',
            ]);
        }

        $maxHeight = (float) $tank->max_height_cm;
        if ($maxHeight <= 0 || $heightCm > $maxHeight) {
            throw ValidationException::withMessages([
                'measurement_cm' => "Tinggi sounding ({$heightCm} cm) melebihi batas tinggi maksimum tangki tervalidasi ({$maxHeight} cm).",
            ]);
        }

        $calibrations = FuelCalibration::where('fuel_tank_id', $tank->id)
            ->orderBy('height_cm')
            ->get();

        if ($calibrations->count() >= 2) {
            $lower = $calibrations->where('height_cm', '<=', $heightCm)->last();
            $upper = $calibrations->where('height_cm', '>=', $heightCm)->first();

            if (!$lower) {
                $lower = $calibrations->first();
            }
            if (!$upper) {
                $upper = $calibrations->last();
            }

            $h1 = (float) $lower->height_cm;
            $v1 = (float) $lower->volume_liters;
            $h2 = (float) $upper->height_cm;
            $v2 = (float) $upper->volume_liters;

            if (abs($h2 - $h1) < 0.0001) {
                $interpolatedVolume = $v1;
                $mmFactor = (float) $lower->mm_increment_factor;
            } else {
                $ratio = ($heightCm - $h1) / ($h2 - $h1);
                $interpolatedVolume = $v1 + ($ratio * ($v2 - $v1));
                $mmFactor = round(($v2 - $v1) / (($h2 - $h1) * 10), 4);
            }

            $interpolatedVolume = min((float) $tank->capacity_liters, max(0, round($interpolatedVolume, 2)));

            return [
                'volume_liters' => $interpolatedVolume,
                'method' => 'calibration_chart',
                'snapshot' => [
                    'tank_number' => $tank->tank_number,
                    'measurement_cm' => $heightCm,
                    'lower_point_cm' => $h1,
                    'lower_point_liters' => $v1,
                    'upper_point_cm' => $h2,
                    'upper_point_liters' => $v2,
                    'mm_increment_factor' => $mmFactor,
                    'certificate_no' => $lower->calibration_certificate_no ?? 'CAL-CERT-TAP',
                ],
            ];
        }

        // Fallback to validated geometric horizontal/vertical cylinder configuration if dimensions are set
        $diameter = (float) $tank->diameter_cm;
        $length = (float) $tank->length_cm;
        $capacity = (float) $tank->capacity_liters;

        if ($diameter > 0 && $length > 0 && $capacity > 0) {
            $r = $diameter / 2.0;
            $h = min($diameter, max(0.0, $heightCm));

            if ($tank->shape_type === 'vertical_cylinder') {
                $fillRatio = $h / $maxHeight;
            } else {
                // Horizontal cylinder circular segment area formula
                $theta = 2.0 * acos(($r - $h) / $r);
                $segmentArea = 0.5 * $r * $r * ($theta - sin($theta));
                $fullCircleArea = M_PI * $r * $r;
                $fillRatio = $fullCircleArea > 0 ? ($segmentArea / $fullCircleArea) : 0;
            }

            $volumeLiters = round($capacity * $fillRatio, 2);

            return [
                'volume_liters' => $volumeLiters,
                'method' => 'cylinder_geometry',
                'snapshot' => [
                    'tank_number' => $tank->tank_number,
                    'shape_type' => $tank->shape_type,
                    'diameter_cm' => $diameter,
                    'length_cm' => $length,
                    'capacity_liters' => $capacity,
                    'fill_ratio' => round($fillRatio, 6),
                ],
            ];
        }

        throw ValidationException::withMessages([
            'fuel_tank_id' => "Tangki {$tank->tank_number} belum memiliki tabel kalibrasi (Calibration Chart) atau dimensi geometri tervalidasi.",
        ]);
    }

    /**
     * 1. Record Fuel Receiving or Opening Stock into Fuel Tank(s).
     */
    public function recordFuelReceipt(array $data, array $items): FuelReceipt
    {
        return DB::transaction(function () use ($data, $items) {
            $siteId = (int) $data['site_id'];
            $receiptType = $data['receipt_type'] ?? 'fuel_receiving';
            $receiptDate = $data['receipt_date'] ?? now()->toDateString();

            $receipt = FuelReceipt::create([
                'receipt_number' => $data['receipt_number'] ?? $this->generateNumber('FREC'),
                'receipt_type' => $receiptType,
                'receipt_date' => $receiptDate,
                'site_id' => $siteId,
                'fuel_supplier_id' => $data['fuel_supplier_id'] ?? null,
                'purchase_order_id' => $data['purchase_order_id'] ?? null,
                'po_number' => $data['po_number'] ?? null,
                'do_number' => $data['do_number'] ?? null,
                'invoice_number' => $data['invoice_number'] ?? null,
                'invoice_date' => $data['invoice_date'] ?? null,
                'invoice_status' => !empty($data['invoice_number']) ? ($data['invoice_status'] ?? 'invoiced') : 'unbilled',
                'transport_vehicle_no' => $data['transport_vehicle_no'] ?? null,
                'driver_name' => $data['driver_name'] ?? null,
                'total_do_liters' => 0,
                'total_received_liters' => 0,
                'total_amount' => 0,
                'status' => 'confirmed',
                'received_by' => $data['received_by'] ?? null,
                'created_by' => auth()->id(),
                'remarks' => $data['remarks'] ?? null,
                'attachment_path' => $data['attachment_path'] ?? null,
            ]);

            $param = $this->getOrCreateSiteParameter($siteId);
            $totalDo = 0;
            $totalReceived = 0;
            $totalAmount = 0;

            foreach ($items as $line) {
                /** @var FuelTank $tank */
                $tank = FuelTank::where('id', $line['fuel_tank_id'])->lockForUpdate()->firstOrFail();

                if ((int) $tank->site_id !== $siteId) {
                    throw ValidationException::withMessages([
                        'fuel_tank_id' => "Site isolation violation: Tangki {$tank->tank_number} tidak berada pada site penerimaan BBM.",
                    ]);
                }

                $receivedLiters = round((float) ($line['received_volume_liters'] ?? 0), 2);
                $doLiters = round((float) ($line['do_volume_liters'] ?? $receivedLiters), 2);
                $unitPrice = round((float) ($line['unit_price'] ?? $param->standard_fuel_price_per_liter), 2);

                if ($receivedLiters <= 0) {
                    throw ValidationException::withMessages([
                        'received_volume_liters' => 'Volume solar yang diterima harus lebih besar dari 0 liter.',
                    ]);
                }

                $stockBefore = (float) $tank->current_stock_liters;
                $stockAfter = round($stockBefore + $receivedLiters, 2);

                if ($stockAfter > (float) $tank->capacity_liters) {
                    throw ValidationException::withMessages([
                        'received_volume_liters' => "Penerimaan {$receivedLiters} L pada tangki {$tank->tank_number} melebihi kapasitas tangki ({$tank->capacity_liters} L). Stok saat ini: {$stockBefore} L.",
                    ]);
                }

                $oldValue = $stockBefore * (float) $tank->average_cost_per_liter;
                $incomingValue = round($receivedLiters * $unitPrice, 2);
                $newAvgCost = $stockAfter > 0
                    ? round(($oldValue + $incomingValue) / $stockAfter, 2)
                    : $unitPrice;

                $tankUpdate = [
                    'current_stock_liters' => $stockAfter,
                    'average_cost_per_liter' => $newAvgCost,
                ];
                if ($receiptType === 'opening_stock' && (float) $tank->opening_stock_liters == 0) {
                    $tankUpdate['opening_stock_liters'] = $receivedLiters;
                }
                $tank->update($tankUpdate);

                $receipt->items()->create([
                    'fuel_tank_id' => $tank->id,
                    'do_volume_liters' => $doLiters,
                    'received_volume_liters' => $receivedLiters,
                    'temperature_celsius' => $line['temperature_celsius'] ?? 30.0,
                    'density_kg_m3' => $line['density_kg_m3'] ?? 0.8400,
                    'flowmeter_start' => $line['flowmeter_start'] ?? null,
                    'flowmeter_end' => $line['flowmeter_end'] ?? null,
                    'sounding_before_cm' => $line['sounding_before_cm'] ?? null,
                    'sounding_after_cm' => $line['sounding_after_cm'] ?? null,
                    'unit_price' => $unitPrice,
                    'subtotal_amount' => $incomingValue,
                    'stock_before_liters' => $stockBefore,
                    'stock_after_liters' => $stockAfter,
                    'remarks' => $line['remarks'] ?? null,
                ]);

                // Record ledger transaction
                $tx = FuelTransaction::create([
                    'transaction_number' => $this->generateNumber('FTX-IN'),
                    'digital_ticket_code' => $this->generateNumber('DFT-IN'),
                    'transaction_type' => $receiptType === 'opening_stock' ? 'opening_stock' : 'receiving',
                    'transaction_date' => $receiptDate,
                    'transaction_time' => now()->format('H:i:s'),
                    'site_id' => $siteId,
                    'destination_tank_id' => $tank->id,
                    'fuelman_id' => $data['received_by'] ?? null,
                    'reference_ticket_number' => $receipt->receipt_number,
                    'liters' => $receivedLiters,
                    'unit_cost' => $unitPrice,
                    'total_cost' => $incomingValue,
                    'stock_before_liters' => $stockBefore,
                    'stock_after_liters' => $stockAfter,
                    'status' => 'completed',
                    'remarks' => "Fuel Receiving {$receipt->receipt_number} ke {$tank->tank_number}",
                    'created_by' => auth()->id(),
                ]);

                $tx->items()->create([
                    'fuel_tank_id' => $tank->id,
                    'movement_direction' => 'in',
                    'fuel_grade' => 'Solar B35',
                    'quantity_liters' => $receivedLiters,
                    'unit_cost' => $unitPrice,
                    'subtotal_cost' => $incomingValue,
                    'balance_before_liters' => $stockBefore,
                    'balance_after_liters' => $stockAfter,
                    'notes' => "Receipt {$receipt->receipt_number}",
                ]);

                $totalDo += $doLiters;
                $totalReceived += $receivedLiters;
                $totalAmount += $incomingValue;
            }

            $receipt->update([
                'total_do_liters' => round($totalDo, 2),
                'total_received_liters' => round($totalReceived, 2),
                'total_amount' => round($totalAmount, 2),
            ]);

            return $receipt->load(['items.tank', 'supplier', 'site']);
        });
    }

    /**
     * 2. Dispense Fuel to a Hauling/Support Unit & Generate Digital Fuel Ticket.
     * Enforces concurrency row-level lock and prevents stock from dropping below available stock.
     */
    public function dispenseFuel(array $data): FuelTransaction
    {
        return DB::transaction(function () use ($data) {
            $siteId = (int) $data['site_id'];
            $tankId = (int) $data['source_tank_id'];
            $unitId = (int) $data['unit_id'];
            $liters = round((float) $data['liters'], 2);

            if ($liters <= 0) {
                throw ValidationException::withMessages([
                    'liters' => 'Jumlah pengisian solar harus lebih dari 0 liter.',
                ]);
            }

            /** @var FuelTank $tank */
            $tank = FuelTank::where('id', $tankId)->lockForUpdate()->firstOrFail();

            if ((int) $tank->site_id !== $siteId) {
                throw ValidationException::withMessages([
                    'source_tank_id' => "Site isolation violation: Tangki BBM {$tank->tank_number} tidak berada pada site transaksi.",
                ]);
            }

            /** @var Unit $unit */
            $unit = Unit::where('id', $unitId)->lockForUpdate()->firstOrFail();

            if ((int) $unit->site_id !== $siteId) {
                throw ValidationException::withMessages([
                    'unit_id' => "Site isolation violation: Unit {$unit->unit_code} tidak terdaftar pada site transaksi.",
                ]);
            }

            if (!empty($data['dumping_ticket_id'])) {
                $ticket = DumpingTicket::findOrFail($data['dumping_ticket_id']);
                if ((int) $ticket->site_id !== $siteId) {
                    throw ValidationException::withMessages([
                        'dumping_ticket_id' => 'Site isolation violation: Tiket produksi tidak berada pada site yang sama.',
                    ]);
                }

                $dupByTicket = FuelTransaction::where('transaction_type', 'dispensing')
                    ->where('status', 'completed')
                    ->where('dumping_ticket_id', $ticket->id)
                    ->exists();

                if ($dupByTicket) {
                    throw ValidationException::withMessages([
                        'dumping_ticket_id' => "Duplicate fuel dispensing terdeteksi: Tiket produksi {$ticket->ticket_number} sudah memiliki transaksi pengisian solar aktif.",
                    ]);
                }
            }

            if (!empty($data['reference_ticket_number'])) {
                $dupByRef = FuelTransaction::where('transaction_type', 'dispensing')
                    ->where('status', 'completed')
                    ->where('site_id', $siteId)
                    ->where('reference_ticket_number', trim($data['reference_ticket_number']))
                    ->exists();

                if ($dupByRef) {
                    throw ValidationException::withMessages([
                        'reference_ticket_number' => "Duplicate fuel dispensing terdeteksi: Nomor referensi {$data['reference_ticket_number']} sudah pernah digunakan.",
                    ]);
                }
            }

            if (!empty($data['transaction_time'])) {
                $txDateCheck = $data['transaction_date'] ?? now()->toDateString();
                $dupExact = FuelTransaction::where('transaction_type', 'dispensing')
                    ->where('status', 'completed')
                    ->where('site_id', $siteId)
                    ->where('source_tank_id', $tank->id)
                    ->where('unit_id', $unit->id)
                    ->whereDate('transaction_date', $txDateCheck)
                    ->where('transaction_time', $data['transaction_time'])
                    ->where('liters', $liters)
                    ->exists();

                if ($dupExact) {
                    throw ValidationException::withMessages([
                        'liters' => "Duplicate fuel dispensing terdeteksi: Pengisian {$liters} L untuk Unit {$unit->unit_code} pada tanggal {$txDateCheck} jam {$data['transaction_time']} sudah tercatat.",
                    ]);
                }
            }

            $availableStock = (float) $tank->current_stock_liters;
            if ($liters > $availableStock) {
                throw ValidationException::withMessages([
                    'liters' => "Stok solar pada tangki {$tank->tank_number} tidak mencukupi (Tersedia: {$availableStock} L, Diminta: {$liters} L). Transaksi pengisian solar tidak dapat mengurangi stok melebihi stok tersedia tanpa prosedur adjustment resmi.",
                ]);
            }

            $prevHm = (float) $unit->last_hm;
            $prevKm = (float) $unit->last_km;
            $currHm = isset($data['current_hm']) && $data['current_hm'] !== '' ? round((float) $data['current_hm'], 2) : $prevHm;
            $currKm = isset($data['current_km']) && $data['current_km'] !== '' ? round((float) $data['current_km'], 2) : $prevKm;

            if ($currHm < $prevHm) {
                throw ValidationException::withMessages([
                    'current_hm' => "HM pengisian ({$currHm}) tidak boleh lebih kecil dari HM terakhir unit ({$prevHm}).",
                ]);
            }
            if ($currKm < $prevKm) {
                throw ValidationException::withMessages([
                    'current_km' => "KM pengisian ({$currKm}) tidak boleh lebih kecil dari KM terakhir unit ({$prevKm}).",
                ]);
            }

            $hmDelta = max(0, round($currHm - $prevHm, 2));
            $kmDelta = max(0, round($currKm - $prevKm, 2));

            $stockAfter = round($availableStock - $liters, 2);
            $unitCost = (float) $tank->average_cost_per_liter;
            $totalCost = round($liters * $unitCost, 2);

            $tank->update([
                'current_stock_liters' => $stockAfter,
            ]);

            if ($currHm > $prevHm || $currKm > $prevKm) {
                $unit->update([
                    'last_hm' => max($prevHm, $currHm),
                    'last_km' => max($prevKm, $currKm),
                ]);
            }

            $tx = FuelTransaction::create([
                'transaction_number' => $data['transaction_number'] ?? $this->generateNumber('FTX'),
                'digital_ticket_code' => $data['digital_ticket_code'] ?? $this->generateNumber('DFT-TAP'),
                'transaction_type' => 'dispensing',
                'transaction_date' => $data['transaction_date'] ?? now()->toDateString(),
                'transaction_time' => $data['transaction_time'] ?? now()->format('H:i:s'),
                'site_id' => $siteId,
                'shift_id' => $data['shift_id'] ?? Shift::first()?->id,
                'source_tank_id' => $tank->id,
                'unit_id' => $unit->id,
                'driver_id' => $data['driver_id'] ?? null,
                'fuelman_id' => $data['fuelman_id'] ?? null,
                'dumping_ticket_id' => $data['dumping_ticket_id'] ?? null,
                'dispatch_assignment_id' => $data['dispatch_assignment_id'] ?? null,
                'reference_ticket_number' => $data['reference_ticket_number'] ?? null,
                'fuel_source_type' => $data['fuel_source_type'] ?? ($tank->tank_type === 'mobile_bowser' ? 'mobile_bowser' : 'stationary_station'),
                'current_hm' => $currHm,
                'previous_hm' => $prevHm,
                'hm_delta' => $hmDelta,
                'current_km' => $currKm,
                'previous_km' => $prevKm,
                'km_delta' => $kmDelta,
                'liters' => $liters,
                'unit_cost' => $unitCost,
                'total_cost' => $totalCost,
                'flowmeter_start' => $data['flowmeter_start'] ?? null,
                'flowmeter_end' => $data['flowmeter_end'] ?? null,
                'stock_before_liters' => $availableStock,
                'stock_after_liters' => $stockAfter,
                'status' => 'completed',
                'remarks' => $data['remarks'] ?? null,
                'created_by' => auth()->id(),
            ]);

            $tx->items()->create([
                'fuel_tank_id' => $tank->id,
                'unit_id' => $unit->id,
                'movement_direction' => 'out',
                'fuel_grade' => 'Solar B35',
                'quantity_liters' => $liters,
                'unit_cost' => $unitCost,
                'subtotal_cost' => $totalCost,
                'balance_before_liters' => $availableStock,
                'balance_after_liters' => $stockAfter,
                'notes' => "Dispensing ke Unit {$unit->unit_code}",
            ]);

            return $tx->load(['unit', 'driver.employee', 'fuelman', 'sourceTank', 'site', 'shift', 'dumpingTicket']);
        });
    }

    /**
     * 3. Inter-Tank Fuel Transfer (e.g., Main Storage Tank -> Mobile Fuel Bowser).
     */
    public function transferFuel(array $data): FuelTransaction
    {
        return DB::transaction(function () use ($data) {
            $siteId = (int) $data['site_id'];
            $sourceId = (int) $data['source_tank_id'];
            $destId = (int) $data['destination_tank_id'];
            $liters = round((float) $data['liters'], 2);

            if ($sourceId === $destId) {
                throw ValidationException::withMessages([
                    'destination_tank_id' => 'Tangki asal dan tangki tujuan transfer tidak boleh sama.',
                ]);
            }

            if ($liters <= 0) {
                throw ValidationException::withMessages([
                    'liters' => 'Volume transfer solar harus lebih dari 0 liter.',
                ]);
            }

            // Lock in deterministic ID order to avoid deadlocks
            $firstId = min($sourceId, $destId);
            $secondId = max($sourceId, $destId);
            FuelTank::whereIn('id', [$firstId, $secondId])->orderBy('id')->lockForUpdate()->get();

            $sourceTank = FuelTank::findOrFail($sourceId);
            $destTank = FuelTank::findOrFail($destId);

            if ((int) $sourceTank->site_id !== $siteId || (int) $destTank->site_id !== $siteId) {
                throw ValidationException::withMessages([
                    'site_id' => 'Site isolation violation: Transfer antar-tangki harus berada pada site yang sama.',
                ]);
            }

            $srcBefore = (float) $sourceTank->current_stock_liters;
            if ($liters > $srcBefore) {
                throw ValidationException::withMessages([
                    'liters' => "Stok tangki asal {$sourceTank->tank_number} ({$srcBefore} L) tidak mencukupi untuk transfer {$liters} L.",
                ]);
            }

            $dstBefore = (float) $destTank->current_stock_liters;
            $dstAfter = round($dstBefore + $liters, 2);
            if ($dstAfter > (float) $destTank->capacity_liters) {
                throw ValidationException::withMessages([
                    'liters' => "Transfer {$liters} L melebihi kapasitas tangki tujuan {$destTank->tank_number} ({$destTank->capacity_liters} L).",
                ]);
            }

            $srcAfter = round($srcBefore - $liters, 2);
            $unitCost = (float) $sourceTank->average_cost_per_liter;
            $transferValue = round($liters * $unitCost, 2);

            $dstOldValue = $dstBefore * (float) $destTank->average_cost_per_liter;
            $dstNewAvgCost = $dstAfter > 0
                ? round(($dstOldValue + $transferValue) / $dstAfter, 2)
                : $unitCost;

            $sourceTank->update(['current_stock_liters' => $srcAfter]);
            $destTank->update([
                'current_stock_liters' => $dstAfter,
                'average_cost_per_liter' => $dstNewAvgCost,
            ]);

            $tx = FuelTransaction::create([
                'transaction_number' => $data['transaction_number'] ?? $this->generateNumber('FTRF'),
                'digital_ticket_code' => $this->generateNumber('DFT-TRF'),
                'transaction_type' => 'transfer',
                'transaction_date' => $data['transaction_date'] ?? now()->toDateString(),
                'transaction_time' => $data['transaction_time'] ?? now()->format('H:i:s'),
                'site_id' => $siteId,
                'source_tank_id' => $sourceTank->id,
                'destination_tank_id' => $destTank->id,
                'fuelman_id' => $data['fuelman_id'] ?? null,
                'liters' => $liters,
                'unit_cost' => $unitCost,
                'total_cost' => $transferValue,
                'stock_before_liters' => $srcBefore,
                'stock_after_liters' => $srcAfter,
                'status' => 'completed',
                'remarks' => $data['remarks'] ?? "Transfer dari {$sourceTank->tank_number} ke {$destTank->tank_number}",
                'created_by' => auth()->id(),
            ]);

            $tx->items()->createMany([
                [
                    'fuel_tank_id' => $sourceTank->id,
                    'movement_direction' => 'out',
                    'fuel_grade' => 'Solar B35',
                    'quantity_liters' => $liters,
                    'unit_cost' => $unitCost,
                    'subtotal_cost' => $transferValue,
                    'balance_before_liters' => $srcBefore,
                    'balance_after_liters' => $srcAfter,
                    'notes' => "Transfer Out ke {$destTank->tank_number}",
                ],
                [
                    'fuel_tank_id' => $destTank->id,
                    'movement_direction' => 'in',
                    'fuel_grade' => 'Solar B35',
                    'quantity_liters' => $liters,
                    'unit_cost' => $unitCost,
                    'subtotal_cost' => $transferValue,
                    'balance_before_liters' => $dstBefore,
                    'balance_after_liters' => $dstAfter,
                    'notes' => "Transfer In dari {$sourceTank->tank_number}",
                ],
            ]);

            return $tx->load(['sourceTank', 'destinationTank', 'items']);
        });
    }

    /**
     * 4. Record Daily Tank Sounding (Height cm -> Calibrated Volume Liters -> Variance vs System Stock).
     */
    public function recordTankSounding(array $data): FuelSounding
    {
        return DB::transaction(function () use ($data) {
            $tank = FuelTank::where('id', $data['fuel_tank_id'])->lockForUpdate()->firstOrFail();
            $siteId = (int) ($data['site_id'] ?? $tank->site_id);

            if ((int) $tank->site_id !== $siteId) {
                throw ValidationException::withMessages([
                    'fuel_tank_id' => "Site isolation violation: Tangki {$tank->tank_number} tidak berada pada site sounding.",
                ]);
            }

            $measurementCm = round((float) $data['measurement_cm'], 2);
            $conversion = $this->calculateVolumeFromSounding($tank, $measurementCm);

            $estimatedVolume = $conversion['volume_liters'];
            $systemStock = round((float) $tank->current_stock_liters, 2);
            $varianceLiters = round($estimatedVolume - $systemStock, 2);
            $variancePercent = $systemStock > 0
                ? round((abs($varianceLiters) / $systemStock) * 100, 4)
                : ($estimatedVolume > 0 ? 100.0 : 0.0);

            $param = $this->getOrCreateSiteParameter($siteId);
            $tolerance = (float) $param->variance_tolerance_percent;

            $status = abs($varianceLiters) < 0.01
                ? 'matched'
                : ($variancePercent <= $tolerance ? 'within_tolerance' : 'investigation_required');

            $sounding = FuelSounding::create([
                'sounding_number' => $data['sounding_number'] ?? $this->generateNumber('SND'),
                'site_id' => $siteId,
                'fuel_tank_id' => $tank->id,
                'sounding_date' => $data['sounding_date'] ?? now()->toDateString(),
                'sounding_time' => $data['sounding_time'] ?? now()->format('H:i:s'),
                'measurement_cm' => $measurementCm,
                'water_level_cm' => $data['water_level_cm'] ?? 0,
                'temperature_celsius' => $data['temperature_celsius'] ?? 30.0,
                'calibration_method' => $conversion['method'],
                'conversion_snapshot' => $conversion['snapshot'],
                'estimated_volume_liters' => $estimatedVolume,
                'system_stock_liters' => $systemStock,
                'variance_liters' => $varianceLiters,
                'variance_percent' => $variancePercent,
                'reconciliation_status' => $status,
                'recorded_by' => auth()->id(),
                'attachment_path' => $data['attachment_path'] ?? null,
                'remarks' => $data['remarks'] ?? null,
            ]);

            $tank->update([
                'last_sounding_at' => Carbon::parse($sounding->sounding_date->toDateString() . ' ' . $sounding->sounding_time),
                'last_sounding_cm' => $measurementCm,
                'last_sounding_liters' => $estimatedVolume,
            ]);

            return $sounding->load(['tank', 'site', 'recorder']);
        });
    }

    /**
     * 5. Official Fuel Adjustment Procedure (Create & Approve).
     */
    public function createAndApproveFuelAdjustment(array $data, bool $autoApprove = true): FuelAdjustment
    {
        return DB::transaction(function () use ($data, $autoApprove) {
            $tank = FuelTank::where('id', $data['fuel_tank_id'])->lockForUpdate()->firstOrFail();
            $siteId = (int) ($data['site_id'] ?? $tank->site_id);

            if ((int) $tank->site_id !== $siteId) {
                throw ValidationException::withMessages([
                    'fuel_tank_id' => 'Site isolation violation: Tangki adjustment tidak berada pada site yang sesuai.',
                ]);
            }

            $systemBefore = (float) $tank->current_stock_liters;
            $adjustmentLiters = round((float) $data['adjustment_liters'], 2);
            $afterStock = round($systemBefore + $adjustmentLiters, 2);

            if ($afterStock < 0) {
                throw ValidationException::withMessages([
                    'adjustment_liters' => 'Prosedur adjustment tidak dapat membuat stok tangki menjadi negatif.',
                ]);
            }
            if ($afterStock > (float) $tank->capacity_liters) {
                throw ValidationException::withMessages([
                    'adjustment_liters' => 'Prosedur adjustment tidak dapat melebihi kapasitas maksimum tangki.',
                ]);
            }

            $unitCost = (float) $tank->average_cost_per_liter;
            $totalVal = round(abs($adjustmentLiters) * $unitCost, 2);

            $adjustment = FuelAdjustment::create([
                'adjustment_number' => $data['adjustment_number'] ?? $this->generateNumber('FADJ'),
                'site_id' => $siteId,
                'fuel_tank_id' => $tank->id,
                'fuel_sounding_id' => $data['fuel_sounding_id'] ?? null,
                'adjustment_date' => $data['adjustment_date'] ?? now()->toDateString(),
                'adjustment_type' => $data['adjustment_type'] ?? ($adjustmentLiters >= 0 ? 'gain' : 'loss'),
                'system_stock_before_liters' => $systemBefore,
                'adjustment_liters' => $adjustmentLiters,
                'physical_stock_after_liters' => $afterStock,
                'unit_cost' => $unitCost,
                'total_adjustment_value' => $totalVal,
                'status' => 'pending_approval',
                'reason' => $data['reason'] ?? 'Penyesuaian hasil rekonsiliasi sounding fisik tangki.',
                'investigation_notes' => $data['investigation_notes'] ?? null,
                'requested_by' => auth()->id(),
            ]);

            if ($autoApprove) {
                return $this->approveFuelAdjustment($adjustment);
            }

            return $adjustment->load(['tank', 'site']);
        });
    }

    public function approveFuelAdjustment(FuelAdjustment $adjustment): FuelAdjustment
    {
        return DB::transaction(function () use ($adjustment) {
            if ($adjustment->status === 'approved') {
                return $adjustment;
            }

            $tank = FuelTank::where('id', $adjustment->fuel_tank_id)->lockForUpdate()->firstOrFail();
            $before = (float) $tank->current_stock_liters;
            $delta = (float) $adjustment->adjustment_liters;
            $after = round($before + $delta, 2);

            if ($after < 0 || $after > (float) $tank->capacity_liters) {
                throw ValidationException::withMessages([
                    'adjustment_liters' => 'Persetujuan adjustment gagal karena saldo akhir berada di luar batas kapasitas tangki.',
                ]);
            }

            $tank->update(['current_stock_liters' => $after]);

            $tx = FuelTransaction::create([
                'transaction_number' => $this->generateNumber('FTX-ADJ'),
                'digital_ticket_code' => $this->generateNumber('DFT-ADJ'),
                'transaction_type' => 'adjustment',
                'transaction_date' => $adjustment->adjustment_date->toDateString(),
                'transaction_time' => now()->format('H:i:s'),
                'site_id' => $adjustment->site_id,
                'source_tank_id' => $delta < 0 ? $tank->id : null,
                'destination_tank_id' => $delta >= 0 ? $tank->id : null,
                'reference_ticket_number' => $adjustment->adjustment_number,
                'liters' => abs($delta),
                'unit_cost' => $adjustment->unit_cost,
                'total_cost' => $adjustment->total_adjustment_value,
                'stock_before_liters' => $before,
                'stock_after_liters' => $after,
                'status' => 'completed',
                'remarks' => "Approved Fuel Adjustment {$adjustment->adjustment_number}: {$adjustment->reason}",
                'created_by' => auth()->id(),
            ]);

            $tx->items()->create([
                'fuel_tank_id' => $tank->id,
                'movement_direction' => $delta >= 0 ? 'in' : 'out',
                'fuel_grade' => 'Solar B35',
                'quantity_liters' => abs($delta),
                'unit_cost' => $adjustment->unit_cost,
                'subtotal_cost' => $adjustment->total_adjustment_value,
                'balance_before_liters' => $before,
                'balance_after_liters' => $after,
                'notes' => "Fuel Adjustment {$adjustment->adjustment_number}",
            ]);

            $adjustment->update([
                'system_stock_before_liters' => $before,
                'physical_stock_after_liters' => $after,
                'status' => 'approved',
                'approved_by' => auth()->id(),
                'approved_at' => now(),
                'fuel_transaction_id' => $tx->id,
            ]);

            if ($adjustment->fuel_sounding_id) {
                FuelSounding::where('id', $adjustment->fuel_sounding_id)->update([
                    'reconciliation_status' => 'adjusted',
                ]);
            }

            return $adjustment->fresh(['tank', 'site', 'transaction']);
        });
    }

    /**
     * 6. Fuel Reconciliation (Compare Opening Stock, Received, Issued, Transfer, Adjustment, System Closing vs Physical Sounding).
     */
    public function generateTankReconciliation(array $data): FuelReconciliation
    {
        return DB::transaction(function () use ($data) {
            $tank = FuelTank::findOrFail($data['fuel_tank_id']);
            $siteId = (int) ($data['site_id'] ?? $tank->site_id);

            if ((int) $tank->site_id !== $siteId) {
                throw ValidationException::withMessages([
                    'fuel_tank_id' => 'Site isolation violation: Tangki rekonsiliasi tidak berada pada site yang sesuai.',
                ]);
            }

            $date = $data['reconciliation_date'] ?? now()->toDateString();

            // Determine movements on the reconciliation date
            $received = (float) FuelTransaction::where('destination_tank_id', $tank->id)
                ->whereDate('transaction_date', $date)
                ->where('transaction_type', 'receiving')
                ->where('status', 'completed')
                ->sum('liters');

            $issued = (float) FuelTransaction::where('source_tank_id', $tank->id)
                ->whereDate('transaction_date', $date)
                ->where('transaction_type', 'dispensing')
                ->where('status', 'completed')
                ->sum('liters');

            $transferIn = (float) FuelTransaction::where('destination_tank_id', $tank->id)
                ->whereDate('transaction_date', $date)
                ->where('transaction_type', 'transfer')
                ->where('status', 'completed')
                ->sum('liters');

            $transferOut = (float) FuelTransaction::where('source_tank_id', $tank->id)
                ->whereDate('transaction_date', $date)
                ->where('transaction_type', 'transfer')
                ->where('status', 'completed')
                ->sum('liters');

            $adjGain = (float) FuelAdjustment::where('fuel_tank_id', $tank->id)
                ->whereDate('adjustment_date', $date)
                ->where('status', 'approved')
                ->sum('adjustment_liters');

            $netMovementToday = $received - $issued + $transferIn - $transferOut + $adjGain;

            $openingStock = isset($data['opening_stock_liters'])
                ? round((float) $data['opening_stock_liters'], 2)
                : round((float) $tank->current_stock_liters - $netMovementToday, 2);

            $systemClosing = round($openingStock + $received - $issued + $transferIn - $transferOut + $adjGain, 2);

            $sounding = !empty($data['fuel_sounding_id'])
                ? FuelSounding::findOrFail($data['fuel_sounding_id'])
                : FuelSounding::where('fuel_tank_id', $tank->id)
                    ->whereDate('sounding_date', $date)
                    ->latest('id')
                    ->first();

            if (isset($data['physical_sounding_cm']) && !$sounding) {
                $sounding = $this->recordTankSounding([
                    'site_id' => $siteId,
                    'fuel_tank_id' => $tank->id,
                    'sounding_date' => $date,
                    'sounding_time' => now()->format('H:i:s'),
                    'measurement_cm' => $data['physical_sounding_cm'],
                    'remarks' => 'Sounding untuk Rekonsiliasi Harian',
                ]);
            }

            $physicalCm = $sounding ? (float) $sounding->measurement_cm : (float) ($tank->last_sounding_cm ?? 0);
            $physicalLiters = isset($data['physical_sounding_liters'])
                ? round((float) $data['physical_sounding_liters'], 2)
                : ($sounding ? (float) $sounding->estimated_volume_liters : $systemClosing);

            $varianceLiters = round($physicalLiters - $systemClosing, 2);
            $variancePercent = $systemClosing > 0
                ? round((abs($varianceLiters) / $systemClosing) * 100, 4)
                : 0.0;

            $param = $this->getOrCreateSiteParameter($siteId);
            $tolerance = (float) $param->variance_tolerance_percent;

            $status = abs($varianceLiters) < 0.01
                ? 'balanced'
                : ($variancePercent <= $tolerance ? 'minor_variance' : 'investigation_required');

            if (!empty($data['corrective_action']) && $status === 'investigation_required') {
                $status = 'resolved';
            }

            $recon = FuelReconciliation::create([
                'reconciliation_number' => $data['reconciliation_number'] ?? $this->generateNumber('FRECON'),
                'site_id' => $siteId,
                'fuel_tank_id' => $tank->id,
                'reconciliation_date' => $date,
                'opening_stock_liters' => $openingStock,
                'fuel_received_liters' => round($received, 2),
                'fuel_issued_liters' => round($issued, 2),
                'transfer_in_liters' => round($transferIn, 2),
                'transfer_out_liters' => round($transferOut, 2),
                'adjustment_liters' => round($adjGain, 2),
                'system_closing_stock_liters' => $systemClosing,
                'physical_sounding_cm' => $physicalCm,
                'physical_sounding_liters' => $physicalLiters,
                'variance_liters' => $varianceLiters,
                'variance_percent' => $variancePercent,
                'status' => $status,
                'investigation_findings' => $data['investigation_findings'] ?? ($status === 'investigation_required' ? 'Selisih melebihi batas toleransi site, perlu pemeriksaan flowmeter dan kebocoran pipa.' : 'Stok buku dan fisik sesuai toleransi.'),
                'corrective_action' => $data['corrective_action'] ?? null,
                'fuel_sounding_id' => $sounding?->id,
                'reconciled_by' => auth()->id(),
                'verified_by' => auth()->id(),
                'verified_at' => now(),
            ]);

            return $recon->load(['tank', 'site', 'sounding']);
        });
    }

    /**
     * 7. Fuel Consumption Analysis & Production Integration.
     * Formula: Estimated Fuel = Tonase x Jarak x estimation_factor (default 0.0475).
     * Separates Actual Fuel Consumption (from Fuel Dispensing) from Estimated Fuel Consumption (from Production).
     * NEVER uses dumping tonnage as a substitute for actual fuel volume!
     */
    public function analyzeFuelConsumption(array $filters = []): array
    {
        $siteId = $filters['site_id'] ?? null;
        $startDate = $filters['start_date'] ?? null;
        $endDate = $filters['end_date'] ?? null;
        $unitId = $filters['unit_id'] ?? null;

        // 1. Actual Fuel Dispensing Transactions
        $dispenseQuery = FuelTransaction::with(['unit:id,unit_code,brand,model,site_id', 'shift:id,name', 'site:id,code,name'])
            ->where('transaction_type', 'dispensing')
            ->where('status', 'completed')
            ->when($siteId, fn ($q) => $q->where('site_id', $siteId))
            ->when($unitId, fn ($q) => $q->where('unit_id', $unitId))
            ->when($startDate, fn ($q) => $q->whereDate('transaction_date', '>=', $startDate))
            ->when($endDate, fn ($q) => $q->whereDate('transaction_date', '<=', $endDate));

        $dispensings = $dispenseQuery->get();

        // 2. Verified Production Dumping Tickets
        $ticketQuery = DumpingTicket::with(['unit:id,unit_code', 'shift:id,name', 'site:id,code,name'])
            ->where('status', 'verified')
            ->where('is_production', true)
            ->when($siteId, fn ($q) => $q->where('site_id', $siteId))
            ->when($unitId, fn ($q) => $q->where('unit_id', $unitId))
            ->when($startDate, fn ($q) => $q->whereDate('ticket_date', '>=', $startDate))
            ->when($endDate, fn ($q) => $q->whereDate('ticket_date', '<=', $endDate));

        $tickets = $ticketQuery->get();

        // 3. HM/KM Shift Logs for accurate operating hours & distance
        $hmKmQuery = UnitHmKmLog::when($unitId, fn ($q) => $q->where('unit_id', $unitId))
            ->when($startDate, fn ($q) => $q->whereDate('log_date', '>=', $startDate))
            ->when($endDate, fn ($q) => $q->whereDate('log_date', '<=', $endDate))
            ->when($siteId, fn ($q) => $q->whereHas('unit', fn ($uq) => $uq->where('site_id', $siteId)));

        $hmKmLogs = $hmKmQuery->get();

        // Cache site parameters
        $siteParams = [];
        foreach (Site::pluck('id') as $sId) {
            $siteParams[$sId] = $this->getOrCreateSiteParameter((int) $sId);
        }

        // Calculate Estimated Fuel per Verified Ticket: Tonnage x Haul Distance x Site Estimation Factor (0.0475)
        $ticketEstimations = $tickets->map(function (DumpingTicket $t) use ($siteParams) {
            $param = $siteParams[$t->site_id] ?? $this->getOrCreateSiteParameter((int) $t->site_id);
            $factor = (float) $param->estimation_factor;
            $distanceKm = (float) $param->default_haul_distance_km;
            $tonnage = (float) $t->tonnage;
            $estimatedLiters = round($tonnage * $distanceKm * $factor, 2);

            return [
                'ticket_id' => $t->id,
                'site_id' => $t->site_id,
                'unit_id' => $t->unit_id,
                'shift_id' => $t->shift_id,
                'month' => $t->ticket_date ? $t->ticket_date->format('Y-m') : now()->format('Y-m'),
                'tonnage' => $tonnage,
                'distance_km' => $distanceKm,
                'estimation_factor' => $factor,
                'estimated_fuel_liters' => $estimatedLiters,
            ];
        });

        $totalActualFuelLiters = round((float) $dispensings->sum('liters'), 2);
        $totalActualFuelCost = round((float) $dispensings->sum('total_cost'), 2);
        $totalVerifiedTonnage = round((float) $ticketEstimations->sum('tonnage'), 2);
        $totalEstimatedFuelLiters = round((float) $ticketEstimations->sum('estimated_fuel_liters'), 2);

        $dispenseHmSum = (float) $dispensings->sum('hm_delta');
        $dispenseKmSum = (float) $dispensings->sum('km_delta');
        $logHmSum = (float) $hmKmLogs->sum('diff_hm');
        $logKmSum = (float) $hmKmLogs->sum('diff_km');

        $totalOperatingHm = round(max($dispenseHmSum, $logHmSum), 2);
        $totalDistanceKm = round(max($dispenseKmSum, $logKmSum), 2);

        $literPerTon = $totalVerifiedTonnage > 0 ? round($totalActualFuelLiters / $totalVerifiedTonnage, 4) : 0.0;
        $literPerKm = $totalDistanceKm > 0 ? round($totalActualFuelLiters / $totalDistanceKm, 4) : 0.0;
        $literPerHm = $totalOperatingHm > 0 ? round($totalActualFuelLiters / $totalOperatingHm, 4) : 0.0;
        $fuelCostPerTon = $totalVerifiedTonnage > 0 ? round($totalActualFuelCost / $totalVerifiedTonnage, 2) : 0.0;

        // Consumption per Unit
        $unitIds = $dispensings->pluck('unit_id')
            ->merge($tickets->pluck('unit_id'))
            ->filter()
            ->unique()
            ->values();

        $unitsMap = Unit::whereIn('id', $unitIds)->get()->keyBy('id');

        $consumptionPerUnit = $unitIds->map(function ($uId) use ($unitsMap, $dispensings, $ticketEstimations, $hmKmLogs) {
            $unit = $unitsMap[$uId] ?? null;
            $uDisp = $dispensings->where('unit_id', $uId);
            $uTicks = $ticketEstimations->where('unit_id', $uId);
            $uLogs = $hmKmLogs->where('unit_id', $uId);

            $actualLiters = round((float) $uDisp->sum('liters'), 2);
            $actualCost = round((float) $uDisp->sum('total_cost'), 2);
            $estimatedLiters = round((float) $uTicks->sum('estimated_fuel_liters'), 2);
            $tonnage = round((float) $uTicks->sum('tonnage'), 2);
            $hm = round(max((float) $uDisp->sum('hm_delta'), (float) $uLogs->sum('diff_hm')), 2);
            $km = round(max((float) $uDisp->sum('km_delta'), (float) $uLogs->sum('diff_km')), 2);

            return [
                'unit_id' => $uId,
                'unit_code' => $unit?->unit_code ?? "UNIT-{$uId}",
                'brand_model' => trim(($unit?->brand ?? '') . ' ' . ($unit?->model ?? '')),
                'actual_fuel_liters' => $actualLiters,
                'estimated_fuel_liters' => $estimatedLiters,
                'variance_liters' => round($actualLiters - $estimatedLiters, 2),
                'verified_tonnage' => $tonnage,
                'operating_hm' => $hm,
                'distance_km' => $km,
                'liter_per_ton' => $tonnage > 0 ? round($actualLiters / $tonnage, 4) : 0.0,
                'liter_per_hm' => $hm > 0 ? round($actualLiters / $hm, 4) : 0.0,
                'liter_per_km' => $km > 0 ? round($actualLiters / $km, 4) : 0.0,
                'total_fuel_cost' => $actualCost,
                'cost_per_ton' => $tonnage > 0 ? round($actualCost / $tonnage, 2) : 0.0,
            ];
        })->sortByDesc('actual_fuel_liters')->values()->all();

        // Consumption per Shift
        $shifts = Shift::all();
        $consumptionPerShift = $shifts->map(function (Shift $shift) use ($dispensings, $ticketEstimations) {
            $sDisp = $dispensings->where('shift_id', $shift->id);
            $sTicks = $ticketEstimations->where('shift_id', $shift->id);

            $actualLiters = round((float) $sDisp->sum('liters'), 2);
            $estimatedLiters = round((float) $sTicks->sum('estimated_fuel_liters'), 2);
            $tonnage = round((float) $sTicks->sum('tonnage'), 2);

            return [
                'shift_id' => $shift->id,
                'shift_name' => $shift->name,
                'actual_fuel_liters' => $actualLiters,
                'estimated_fuel_liters' => $estimatedLiters,
                'verified_tonnage' => $tonnage,
                'liter_per_ton' => $tonnage > 0 ? round($actualLiters / $tonnage, 4) : 0.0,
            ];
        })->values()->all();

        // Consumption per Month
        $months = $dispensings->map(fn ($d) => $d->transaction_date?->format('Y-m'))
            ->merge($ticketEstimations->pluck('month'))
            ->filter()
            ->unique()
            ->sort()
            ->values();

        $consumptionPerMonth = $months->map(function (string $ym) use ($dispensings, $ticketEstimations) {
            $mDisp = $dispensings->filter(fn ($d) => $d->transaction_date?->format('Y-m') === $ym);
            $mTicks = $ticketEstimations->where('month', $ym);

            $actualLiters = round((float) $mDisp->sum('liters'), 2);
            $actualCost = round((float) $mDisp->sum('total_cost'), 2);
            $estimatedLiters = round((float) $mTicks->sum('estimated_fuel_liters'), 2);
            $tonnage = round((float) $mTicks->sum('tonnage'), 2);

            return [
                'month' => $ym,
                'actual_fuel_liters' => $actualLiters,
                'estimated_fuel_liters' => $estimatedLiters,
                'variance_liters' => round($actualLiters - $estimatedLiters, 2),
                'verified_tonnage' => $tonnage,
                'liter_per_ton' => $tonnage > 0 ? round($actualLiters / $tonnage, 4) : 0.0,
                'total_fuel_cost' => $actualCost,
            ];
        })->values()->all();

        $activeParam = $siteId
            ? ($siteParams[$siteId] ?? $this->getOrCreateSiteParameter((int) $siteId))
            : collect($siteParams)->first();

        return [
            'summary' => [
                'actual_fuel_liters' => $totalActualFuelLiters,
                'estimated_fuel_liters' => $totalEstimatedFuelLiters,
                'variance_liters' => round($totalActualFuelLiters - $totalEstimatedFuelLiters, 2),
                'verified_tonnage' => $totalVerifiedTonnage,
                'total_operating_hm' => $totalOperatingHm,
                'total_distance_km' => $totalDistanceKm,
                'liter_per_ton' => $literPerTon,
                'liter_per_km' => $literPerKm,
                'liter_per_hm' => $literPerHm,
                'total_fuel_cost' => $totalActualFuelCost,
                'fuel_cost_per_ton' => $fuelCostPerTon,
                'estimation_factor' => (float) ($activeParam?->estimation_factor ?? 0.0475),
                'default_haul_distance_km' => (float) ($activeParam?->default_haul_distance_km ?? 32.0),
                'formula_label' => 'Estimated Fuel (L) = Verified Tonnage × Haul Distance (KM) × Site Estimation Factor',
            ],
            'consumption_per_unit' => $consumptionPerUnit,
            'consumption_per_shift' => $consumptionPerShift,
            'consumption_per_month' => $consumptionPerMonth,
        ];
    }
}
