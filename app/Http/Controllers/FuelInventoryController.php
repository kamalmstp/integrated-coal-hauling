<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\FuelCalibration;
use App\Models\FuelReceipt;
use App\Models\FuelSupplier;
use App\Models\FuelTank;
use App\Models\FuelTransaction;
use App\Models\Location;
use App\Models\PurchaseOrder;
use App\Models\Site;
use App\Models\Unit;
use App\Services\FuelService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FuelInventoryController extends Controller
{
    public function index(Request $request)
    {
        $siteId = $request->input('site_id');

        $tanks = FuelTank::with([
            'site:id,name,code',
            'location:id,name,code',
            'unit:id,unit_code',
            'calibrations',
        ])
            ->when($siteId, fn ($q) => $q->where('site_id', $siteId))
            ->orderBy('id')
            ->get();

        $suppliers = FuelSupplier::orderBy('name')->get();

        $receipts = FuelReceipt::with([
            'site:id,name,code',
            'supplier:id,name,supplier_code',
            'receiver:id,name,employee_code',
            'items.tank:id,tank_number,tank_name',
        ])
            ->when($siteId, fn ($q) => $q->where('site_id', $siteId))
            ->orderByDesc('id')
            ->paginate(10)
            ->withQueryString();

        $transfers = FuelTransaction::with([
            'site:id,name,code',
            'sourceTank:id,tank_number,tank_name',
            'destinationTank:id,tank_number,tank_name',
            'fuelman:id,name,employee_code',
        ])
            ->where('transaction_type', 'transfer')
            ->when($siteId, fn ($q) => $q->where('site_id', $siteId))
            ->orderByDesc('id')
            ->limit(15)
            ->get();

        return Inertia::render('Fuel/Inventory/Index', [
            'tanks' => $tanks,
            'suppliers' => $suppliers,
            'receipts' => $receipts,
            'transfers' => $transfers,
            'metrics' => [
                'total_tanks' => $tanks->count(),
                'opening_stock_liters' => round((float) $tanks->sum('opening_stock_liters'), 2),
                'closing_stock_liters' => round((float) $tanks->sum('current_stock_liters'), 2),
                'total_capacity_liters' => round((float) $tanks->sum('capacity_liters'), 2),
                'total_received_liters' => round((float) FuelReceipt::when($siteId, fn ($q) => $q->where('site_id', $siteId))->sum('total_received_liters'), 2),
            ],
            'filters' => [
                'site_id' => $siteId,
            ],
            'master' => [
                'sites' => Site::where('is_active', true)->select('id', 'name', 'code')->get(),
                'locations' => Location::where('is_active', true)->select('id', 'site_id', 'name', 'code')->get(),
                'units' => Unit::where('is_active', true)->select('id', 'site_id', 'unit_code', 'unit_type')->get(),
                'employees' => Employee::where('is_active', true)->select('id', 'site_id', 'name', 'employee_code')->get(),
                'purchaseOrders' => PurchaseOrder::select('id', 'po_number', 'site_id')->orderByDesc('id')->limit(20)->get(),
            ],
        ]);
    }

    public function storeSupplier(Request $request)
    {
        $validated = $request->validate([
            'supplier_code' => 'required|string|max:50|unique:fuel_suppliers,supplier_code',
            'name' => 'required|string|max:180',
            'contact_person' => 'nullable|string|max:120',
            'phone' => 'nullable|string|max:40',
            'email' => 'nullable|email|max:120',
            'address' => 'nullable|string',
            'fuel_type' => 'nullable|string|max:60',
            'contract_number' => 'nullable|string|max:100',
            'contract_price_per_liter' => 'required|numeric|min:0',
            'payment_terms' => 'nullable|string|max:60',
        ]);

        $validated['supplier_code'] = strtoupper($validated['supplier_code']);
        $validated['is_active'] = true;

        FuelSupplier::create($validated);

        return redirect()->back()->with('success', "Fuel Supplier {$validated['name']} berhasil ditambahkan.");
    }

    public function storeTank(Request $request)
    {
        $validated = $request->validate([
            'tank_number' => 'required|string|max:50|unique:fuel_tanks,tank_number',
            'tank_name' => 'required|string|max:150',
            'site_id' => 'required|exists:sites,id',
            'location_id' => 'nullable|exists:locations,id',
            'unit_id' => 'nullable|exists:units,id',
            'tank_type' => 'required|in:stationary_tank,mobile_bowser,daily_tank',
            'shape_type' => 'required|in:calibrated_chart,horizontal_cylinder,vertical_cylinder',
            'capacity_liters' => 'required|numeric|min:100',
            'dead_stock_liters' => 'nullable|numeric|min:0',
            'minimum_alert_liters' => 'required|numeric|min:0',
            'max_height_cm' => 'required|numeric|min:10',
            'length_cm' => 'nullable|numeric|min:10',
            'diameter_cm' => 'nullable|numeric|min:10',
            'average_cost_per_liter' => 'nullable|numeric|min:0',
        ]);

        $validated['tank_number'] = strtoupper($validated['tank_number']);
        $validated['opening_stock_liters'] = 0;
        $validated['current_stock_liters'] = 0;
        $validated['is_active'] = true;

        $tank = FuelTank::create($validated);

        // Auto-seed a 10-step horizontal cylinder strapping chart so the tank is immediately calibrated
        $maxH = (float) $tank->max_height_cm;
        $cap = (float) $tank->capacity_liters;
        $r = $maxH / 2.0;
        for ($i = 0; $i <= 10; $i++) {
            $h = round(($maxH / 10) * $i, 2);
            if ($i === 0) {
                $vol = 0.0;
            } elseif ($i === 10) {
                $vol = $cap;
            } else {
                $theta = 2.0 * acos(($r - $h) / $r);
                $segmentArea = 0.5 * $r * $r * ($theta - sin($theta));
                $vol = round($cap * ($segmentArea / (M_PI * $r * $r)), 2);
            }
            FuelCalibration::create([
                'fuel_tank_id' => $tank->id,
                'height_cm' => $h,
                'volume_liters' => $vol,
                'mm_increment_factor' => round($cap / ($maxH * 10), 4),
                'calibration_certificate_no' => "CERT-{$tank->tank_number}",
                'calibrated_date' => now()->toDateString(),
            ]);
        }

        return redirect()->back()->with('success', "Tangki BBM {$tank->tank_number} beserta Tabel Kalibrasi (Strapping Chart) berhasil dibuat.");
    }

    public function storeReceipt(Request $request, FuelService $fuelService)
    {
        $validated = $request->validate([
            'site_id' => 'required|exists:sites,id',
            'receipt_type' => 'required|in:fuel_receiving,opening_stock',
            'receipt_date' => 'required|date',
            'fuel_supplier_id' => 'nullable|exists:fuel_suppliers,id',
            'po_number' => 'nullable|string|max:60',
            'do_number' => 'nullable|string|max:80',
            'invoice_number' => 'nullable|string|max:80',
            'invoice_date' => 'nullable|date',
            'transport_vehicle_no' => 'nullable|string|max:40',
            'driver_name' => 'nullable|string|max:100',
            'received_by' => 'nullable|exists:employees,id',
            'remarks' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.fuel_tank_id' => 'required|exists:fuel_tanks,id',
            'items.*.do_volume_liters' => 'nullable|numeric|min:0',
            'items.*.received_volume_liters' => 'required|numeric|min:0.01',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        $receipt = $fuelService->recordFuelReceipt($validated, $validated['items']);

        return redirect()->back()->with('success', "Dokumen Penerimaan Solar {$receipt->receipt_number} sebesar " . number_format((float) $receipt->total_received_liters, 0, ',', '.') . " L berhasil dicatat ke stok tangki.");
    }

    public function storeTransfer(Request $request, FuelService $fuelService)
    {
        $validated = $request->validate([
            'site_id' => 'required|exists:sites,id',
            'source_tank_id' => 'required|exists:fuel_tanks,id',
            'destination_tank_id' => 'required|exists:fuel_tanks,id',
            'transaction_date' => 'required|date',
            'transaction_time' => 'nullable|string|max:10',
            'fuelman_id' => 'nullable|exists:employees,id',
            'liters' => 'required|numeric|min:0.01',
            'remarks' => 'nullable|string|max:500',
        ]);

        $tx = $fuelService->transferFuel($validated);

        return redirect()->back()->with('success', "Transfer Solar {$tx->transaction_number} sebesar {$tx->liters} L dari {$tx->sourceTank->tank_number} ke {$tx->destinationTank->tank_number} berhasil diproses.");
    }
}
