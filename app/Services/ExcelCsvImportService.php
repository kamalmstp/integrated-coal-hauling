<?php

namespace App\Services;

use App\Models\Driver;
use App\Models\DumpingTicket;
use App\Models\Location;
use App\Models\Material;
use App\Models\Shift;
use App\Models\Site;
use App\Models\TicketImportBatch;
use App\Models\Unit;
use Carbon\Carbon;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use ZipArchive;

class ExcelCsvImportService
{
    /**
     * Parse and validate file (CSV or XLSX) without saving to database.
     */
    public function previewFile(UploadedFile $file): array
    {
        $rows = $this->extractRowsFromFile($file);
        if (empty($rows)) {
            return [
                'total_rows' => 0,
                'valid_count' => 0,
                'error_count' => 0,
                'duplicate_count' => 0,
                'rows' => [],
            ];
        }

        // Cache lookups for high performance
        $existingTickets = DumpingTicket::pluck('ticket_number')->flip()->toArray();
        $units = Unit::pluck('id', 'unit_code')->toArray();
        $drivers = Driver::pluck('id', 'driver_code')->toArray();
        $locations = Location::pluck('id', 'code')->toArray();
        $materials = Material::pluck('id', 'code')->toArray();
        $shifts = Shift::pluck('id', 'code')->toArray();

        $validatedRows = [];
        $validCount = 0;
        $errorCount = 0;
        $duplicateCount = 0;
        $seenInFile = [];

        foreach ($rows as $index => $row) {
            $rowNum = $index + 2; // header is row 1
            $ticketNumber = trim($row['ticket_number'] ?? '');
            $date = trim($row['ticket_date'] ?? '');
            $time = trim($row['dumping_time'] ?? '');
            $unitCode = strtoupper(trim($row['unit_code'] ?? ''));
            $driverCode = strtoupper(trim($row['driver_code'] ?? ''));
            $loadingCode = strtoupper(trim($row['loading_point_code'] ?? ''));
            $dumpingCode = strtoupper(trim($row['dumping_point_code'] ?? ''));
            $materialCode = strtoupper(trim($row['material_code'] ?? ''));
            $shiftCode = strtoupper(trim($row['shift_code'] ?? ''));
            $tonnage = floatval(str_replace(',', '.', trim($row['tonnage'] ?? '0')));
            $checker = trim($row['checker_name'] ?? 'Checker JSI');
            $remarks = trim($row['remarks'] ?? '');

            $rowErrors = [];

            if (empty($ticketNumber)) {
                $rowErrors[] = 'Nomor tiket wajib diisi.';
            } elseif (isset($existingTickets[$ticketNumber])) {
                $rowErrors[] = "Nomor tiket '$ticketNumber' sudah terdaftar di database (duplikat).";
                $duplicateCount++;
            } elseif (isset($seenInFile[$ticketNumber])) {
                $rowErrors[] = "Nomor tiket '$ticketNumber' duplikat di dalam file (baris {$seenInFile[$ticketNumber]}).";
                $duplicateCount++;
            } else {
                $seenInFile[$ticketNumber] = $rowNum;
            }

            if (empty($date)) {
                $rowErrors[] = 'Tanggal tiket wajib diisi (YYYY-MM-DD).';
            }

            if (!isset($units[$unitCode])) {
                $rowErrors[] = "Unit '$unitCode' tidak ditemukan dalam Master Unit.";
            }

            if (!isset($drivers[$driverCode])) {
                $rowErrors[] = "Driver '$driverCode' tidak ditemukan dalam Master Driver.";
            }

            if (!isset($locations[$loadingCode])) {
                $rowErrors[] = "Loading Point '$loadingCode' tidak ditemukan dalam Master Lokasi.";
            }

            if (!isset($locations[$dumpingCode])) {
                $rowErrors[] = "Dumping Point '$dumpingCode' tidak ditemukan dalam Master Lokasi.";
            }

            if (!isset($materials[$materialCode])) {
                $rowErrors[] = "Material '$materialCode' tidak ditemukan dalam Master Material.";
            }

            if (!isset($shifts[$shiftCode])) {
                $rowErrors[] = "Shift '$shiftCode' tidak valid (gunakan SHIFT-DS / SHIFT-NS).";
            }

            if ($tonnage <= 0) {
                $rowErrors[] = 'Tonase harus berupa angka lebih besar dari 0.';
            }

            $isValid = empty($rowErrors);
            if ($isValid) {
                $validCount++;
            } else {
                $errorCount++;
            }

            $validatedRows[] = [
                'row_number' => $rowNum,
                'ticket_number' => $ticketNumber,
                'ticket_date' => $date,
                'dumping_time' => $time,
                'unit_code' => $unitCode,
                'driver_code' => $driverCode,
                'loading_point_code' => $loadingCode,
                'dumping_point_code' => $dumpingCode,
                'material_code' => $materialCode,
                'shift_code' => $shiftCode,
                'tonnage' => $tonnage,
                'checker_name' => $checker,
                'remarks' => $remarks,
                'is_valid' => $isValid,
                'errors' => $rowErrors,
            ];
        }

        return [
            'total_rows' => count($rows),
            'valid_count' => $validCount,
            'error_count' => $errorCount,
            'duplicate_count' => $duplicateCount,
            'rows' => $validatedRows,
        ];
    }

    /**
     * Execute the verified bulk import wrapped in DB::transaction.
     */
    public function executeImport(array $rows, int $userId, string $fileName, ?int $siteId = null): array
    {
        return DB::transaction(function () use ($rows, $userId, $fileName, $siteId) {
            $defaultSiteId = $siteId ?? (Site::first()?->id ?? 1);

            $units = Unit::pluck('id', 'unit_code')->toArray();
            $drivers = Driver::pluck('id', 'driver_code')->toArray();
            $locations = Location::pluck('id', 'code')->toArray();
            $materials = Material::pluck('id', 'code')->toArray();
            $shifts = Shift::pluck('id', 'code')->toArray();

            $batchCode = 'BAT-' . date('Ymd-His') . '-' . rand(100, 999);
            $successfulRows = 0;
            $failedRows = 0;
            $duplicateRows = 0;
            $errors = [];

            $batch = TicketImportBatch::create([
                'batch_code' => $batchCode,
                'file_name' => $fileName,
                'total_rows' => count($rows),
                'successful_rows' => 0,
                'failed_rows' => 0,
                'duplicate_rows' => 0,
                'error_summary' => [],
                'imported_by' => $userId,
            ]);

            foreach ($rows as $r) {
                $ticketNum = trim($r['ticket_number'] ?? '');
                if (!$r['is_valid']) {
                    $failedRows++;
                    $errors[] = [
                        'row' => $r['row_number'],
                        'ticket_number' => $ticketNum,
                        'errors' => $r['errors'],
                    ];
                    continue;
                }

                // Check again for duplicate to guarantee integrity
                if (DumpingTicket::where('ticket_number', $ticketNum)->exists()) {
                    $duplicateRows++;
                    $failedRows++;
                    $errors[] = [
                        'row' => $r['row_number'],
                        'ticket_number' => $ticketNum,
                        'errors' => ['Nomor tiket sudah ada di database.'],
                    ];
                    continue;
                }

                $unitId = $units[$r['unit_code']] ?? null;
                $driverId = $drivers[$r['driver_code']] ?? null;
                $loadingId = $locations[$r['loading_point_code']] ?? null;
                $dumpingId = $locations[$r['dumping_point_code']] ?? null;
                $materialId = $materials[$r['material_code']] ?? null;
                $shiftId = $shifts[$r['shift_code']] ?? null;

                if (!$unitId || !$driverId || !$loadingId || !$dumpingId || !$materialId || !$shiftId) {
                    $failedRows++;
                    continue;
                }

                $dumpTime = !empty($r['dumping_time'])
                    ? Carbon::parse($r['ticket_date'] . ' ' . $r['dumping_time'])
                    : Carbon::parse($r['ticket_date'] . ' 12:00:00');

                DumpingTicket::create([
                    'ticket_number' => $ticketNum,
                    'ticket_date' => $r['ticket_date'],
                    'dumping_time' => $dumpTime,
                    'site_id' => $defaultSiteId,
                    'unit_id' => $unitId,
                    'driver_id' => $driverId,
                    'loading_point_id' => $loadingId,
                    'dumping_point_id' => $dumpingId,
                    'material_id' => $materialId,
                    'shift_id' => $shiftId,
                    'tonnage' => $r['tonnage'],
                    'gross_weight' => $r['tonnage'] + 14.50,
                    'tare_weight' => 14.50,
                    'checker_name' => $r['checker_name'] ?? 'Checker JSI',
                    'source' => 'import_excel',
                    'status' => 'submitted', // Starts at submitted, awaiting verification
                    'remarks' => $r['remarks'] ?? 'Imported via bulk upload ' . $batchCode,
                    'batch_import_id' => $batch->id,
                    'is_production' => false,
                    'created_by' => $userId,
                ]);

                $successfulRows++;
            }

            $batch->update([
                'successful_rows' => $successfulRows,
                'failed_rows' => $failedRows,
                'duplicate_rows' => $duplicateRows,
                'error_summary' => $errors,
            ]);

            return [
                'batch_code' => $batchCode,
                'total_rows' => count($rows),
                'successful_rows' => $successfulRows,
                'failed_rows' => $failedRows,
                'duplicate_rows' => $duplicateRows,
                'errors' => $errors,
            ];
        });
    }

    /**
     * Extracts tabular rows from CSV or XLSX.
     */
    protected function extractRowsFromFile(UploadedFile $file): array
    {
        $extension = strtolower($file->getClientOriginalExtension());
        if ($extension === 'csv' || $extension === 'txt') {
            return $this->parseCsv($file->getRealPath());
        } elseif ($extension === 'xlsx') {
            return $this->parseXlsx($file->getRealPath());
        }

        // Default try CSV
        return $this->parseCsv($file->getRealPath());
    }

    /**
     * CSV Parser with delimiter detection.
     */
    protected function parseCsv(string $path): array
    {
        $content = file_get_contents($path);
        // Remove BOM if present
        $content = preg_replace('/^\xEF\xBB\xBF/', '', $content);
        $lines = explode("\n", str_replace(["\r\n", "\r"], "\n", $content));
        $lines = array_filter($lines, fn($l) => trim($l) !== '');

        if (empty($lines)) {
            return [];
        }

        $firstLine = reset($lines);
        $delimiter = ',';
        if (substr_count($firstLine, ';') > substr_count($firstLine, ',')) {
            $delimiter = ';';
        } elseif (substr_count($firstLine, "\t") > substr_count($firstLine, ',')) {
            $delimiter = "\t";
        }

        $header = str_getcsv(array_shift($lines), $delimiter);
        $cleanHeader = array_map(function ($h) {
            $clean = strtolower(trim($h));
            $clean = str_replace([' ', '-', '.'], '_', $clean);
            return $clean;
        }, $header);

        $results = [];
        foreach ($lines as $line) {
            $data = str_getcsv($line, $delimiter);
            if (empty($data) || count(array_filter($data)) === 0) {
                continue;
            }
            $row = [];
            foreach ($cleanHeader as $idx => $key) {
                $row[$key] = $data[$idx] ?? '';
            }
            $results[] = $row;
        }

        return $results;
    }

    /**
     * Native OpenXML XLSX Parser (pure PHP ZipArchive + SimpleXML, zero external dependencies).
     */
    protected function parseXlsx(string $path): array
    {
        $zip = new ZipArchive();
        if ($zip->open($path) !== true) {
            return [];
        }

        // 1. Read shared strings
        $sharedStrings = [];
        $sharedXml = $zip->getFromName('xl/sharedStrings.xml');
        if ($sharedXml !== false) {
            $xml = simplexml_load_string($sharedXml);
            if ($xml !== false) {
                foreach ($xml->si as $si) {
                    if (isset($si->t)) {
                        $sharedStrings[] = (string) $si->t;
                    } elseif (isset($si->r)) {
                        $str = '';
                        foreach ($si->r as $r) {
                            $str .= (string) $r->t;
                        }
                        $sharedStrings[] = $str;
                    } else {
                        $sharedStrings[] = '';
                    }
                }
            }
        }

        // 2. Read sheet1.xml
        $sheetXml = $zip->getFromName('xl/worksheets/sheet1.xml');
        $zip->close();

        if ($sheetXml === false) {
            return [];
        }

        $xml = simplexml_load_string($sheetXml);
        if ($xml === false || !isset($xml->sheetData)) {
            return [];
        }

        $matrix = [];
        foreach ($xml->sheetData->row as $row) {
            $rowIndex = (int) $row['r'];
            $rowCells = [];
            foreach ($row->c as $c) {
                $cellRef = (string) $c['r']; // e.g. A1, B2
                preg_match('/([A-Z]+)(\d+)/', $cellRef, $matches);
                $colLetters = $matches[1] ?? 'A';
                $colIndex = $this->columnLetterToIndex($colLetters);

                $cellType = (string) $c['t'];
                $val = isset($c->v) ? (string) $c->v : '';

                if ($cellType === 's') { // shared string
                    $val = $sharedStrings[(int) $val] ?? '';
                }

                $rowCells[$colIndex] = $val;
            }
            ksort($rowCells);
            $matrix[] = $rowCells;
        }

        if (empty($matrix)) {
            return [];
        }

        $headerRow = array_shift($matrix);
        $cleanHeader = [];
        foreach ($headerRow as $colIdx => $h) {
            $clean = strtolower(trim($h));
            $clean = str_replace([' ', '-', '.'], '_', $clean);
            $cleanHeader[$colIdx] = $clean;
        }

        $results = [];
        foreach ($matrix as $data) {
            if (empty(array_filter($data))) {
                continue;
            }
            $row = [];
            foreach ($cleanHeader as $colIdx => $key) {
                $row[$key] = $data[$colIdx] ?? '';
            }
            $results[] = $row;
        }

        return $results;
    }

    protected function columnLetterToIndex(string $letters): int
    {
        $letters = strtoupper($letters);
        $len = strlen($letters);
        $idx = 0;
        for ($i = 0; $i < $len; $i++) {
            $idx = $idx * 26 + (ord($letters[$i]) - 64);
        }
        return $idx - 1; // 0-based index
    }
}
