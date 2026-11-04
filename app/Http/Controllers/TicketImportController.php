<?php

namespace App\Http\Controllers;

use App\Models\TicketImportBatch;
use App\Services\ExcelCsvImportService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\StreamedResponse;

class TicketImportController extends Controller
{
    protected ExcelCsvImportService $importService;

    public function __construct(ExcelCsvImportService $importService)
    {
        $this->importService = $importService;
    }

    public function index()
    {
        $batches = TicketImportBatch::with('user:id,name')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('Production/Import/Index', [
            'batches' => $batches,
        ]);
    }

    /**
     * Preview uploaded file and validate rows before committing.
     */
    public function preview(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt,xlsx|max:10240',
        ]);

        $file = $request->file('file');
        $fileName = $file->getClientOriginalName();
        $previewData = $this->importService->previewFile($file);

        return response()->json([
            'success' => true,
            'file_name' => $fileName,
            'summary' => [
                'total_rows' => $previewData['total_rows'],
                'valid_count' => $previewData['valid_count'],
                'error_count' => $previewData['error_count'],
                'duplicate_count' => $previewData['duplicate_count'],
            ],
            'rows' => $previewData['rows'],
        ]);
    }

    /**
     * Execute the validated import rows.
     */
    public function execute(Request $request)
    {
        $validated = $request->validate([
            'file_name' => 'required|string',
            'rows' => 'required|array|min:1',
            'site_id' => 'nullable|exists:sites,id',
        ]);

        $result = $this->importService->executeImport(
            $validated['rows'],
            Auth::id(),
            $validated['file_name'],
            $validated['site_id'] ?? null
        );

        return redirect()->back()->with('success', "Import selesai: {$result['successful_rows']} tiket berhasil diimpor, {$result['duplicate_rows']} duplikat diabaikan, {$result['failed_rows']} gagal.");
    }

    /**
     * Download standard CSV import template.
     */
    public function downloadTemplate(): StreamedResponse
    {
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="TEMPLATE_IMPORT_TIKET_TAP.csv"',
        ];

        return response()->stream(function () {
            $handle = fopen('php://output', 'w');
            // Header line
            fputcsv($handle, [
                'ticket_number',
                'ticket_date',
                'dumping_time',
                'unit_code',
                'driver_code',
                'loading_point_code',
                'dumping_point_code',
                'material_code',
                'shift_code',
                'tonnage',
                'checker_name',
                'remarks',
            ]);

            // Sample rows
            fputcsv($handle, [
                'TKT-20261105-901',
                '2026-11-05',
                '08:30',
                'DT-101',
                'DRV-001',
                'LOC-FRONT-A',
                'LOC-STP-JETTY',
                'MAT-ROM',
                'SHIFT-DS',
                '31.50',
                'Suryadi (JSI Checker)',
                'Batubara ROM Seam A1',
            ]);

            fputcsv($handle, [
                'TKT-20261105-902',
                '2026-11-05',
                '09:15',
                'DT-102',
                'DRV-002',
                'LOC-FRONT-A',
                'LOC-STP-JETTY',
                'MAT-ROM',
                'SHIFT-DS',
                '30.80',
                'Suryadi (JSI Checker)',
                'Batubara ROM Seam A1',
            ]);

            fclose($handle);
        }, 200, $headers);
    }
}
