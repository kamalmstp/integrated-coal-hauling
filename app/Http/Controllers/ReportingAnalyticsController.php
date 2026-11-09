<?php

namespace App\Http\Controllers;

use App\Jobs\GenerateAnalyticsExportJob;
use App\Models\ReportExportJob;
use App\Services\ManagementAnalyticsService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ReportingAnalyticsController extends Controller
{
    public function dashboard(Request $request, ManagementAnalyticsService $service)
    {
        $filters = $service->resolveAuthorizedFilters($request->user(), $request->all());
        $master = $service->getFilterMasterOptions($request->user(), $filters);
        $report = $service->getExecutiveDashboard($filters);

        $exportJobs = ReportExportJob::with(['site:id,code,name', 'requester:id,name'])
            ->when($filters['site_id'], fn ($q, $sid) => $q->where('site_id', $sid))
            ->latest('id')
            ->limit(15)
            ->get();

        return Inertia::render('Analytics/Dashboard/Index', [
            'report' => $report,
            'filters' => $filters,
            'master' => $master,
            'exportJobs' => $exportJobs,
        ]);
    }

    public function production(Request $request, ManagementAnalyticsService $service)
    {
        $filters = $service->resolveAuthorizedFilters($request->user(), $request->all());
        $master = $service->getFilterMasterOptions($request->user(), $filters);
        $report = $service->getProductionReport($filters);

        return Inertia::render('Analytics/Production/Index', [
            'report' => $report,
            'filters' => $filters,
            'master' => $master,
        ]);
    }

    public function fleet(Request $request, ManagementAnalyticsService $service)
    {
        $filters = $service->resolveAuthorizedFilters($request->user(), $request->all());
        $master = $service->getFilterMasterOptions($request->user(), $filters);
        $report = $service->getFleetReport($filters);

        return Inertia::render('Analytics/Fleet/Index', [
            'report' => $report,
            'filters' => $filters,
            'master' => $master,
        ]);
    }

    public function maintenance(Request $request, ManagementAnalyticsService $service)
    {
        $filters = $service->resolveAuthorizedFilters($request->user(), $request->all());
        $master = $service->getFilterMasterOptions($request->user(), $filters);
        $report = $service->getMaintenanceReport($filters);

        return Inertia::render('Analytics/Maintenance/Index', [
            'report' => $report,
            'filters' => $filters,
            'master' => $master,
        ]);
    }

    public function warehouseProcurement(Request $request, ManagementAnalyticsService $service)
    {
        $filters = $service->resolveAuthorizedFilters($request->user(), $request->all());
        $master = $service->getFilterMasterOptions($request->user(), $filters);
        $report = $service->getWarehouseProcurementReport($filters);

        return Inertia::render('Analytics/WarehouseProcurement/Index', [
            'report' => $report,
            'filters' => $filters,
            'master' => $master,
        ]);
    }

    public function fuel(Request $request, ManagementAnalyticsService $service)
    {
        $filters = $service->resolveAuthorizedFilters($request->user(), $request->all());
        $master = $service->getFilterMasterOptions($request->user(), $filters);
        $report = $service->getFuelReport($filters);

        return Inertia::render('Analytics/Fuel/Index', [
            'report' => $report,
            'filters' => $filters,
            'master' => $master,
        ]);
    }

    public function export(Request $request, ManagementAnalyticsService $service)
    {
        $reportType = $request->input('report_type', 'executive');
        $format = strtolower($request->input('format', 'excel'));
        $filters = $service->resolveAuthorizedFilters($request->user(), $request->all());
        $exportCode = 'EXP-' . strtoupper($reportType) . '-' . now()->format('YmdHis') . '-' . strtoupper(Str::random(4));

        $shouldQueueBackground = $request->boolean('queue_background') || $request->isMethod('post');

        if ($shouldQueueBackground) {
            $exportJob = ReportExportJob::create([
                'export_code' => $exportCode,
                'report_type' => $reportType,
                'export_format' => $format,
                'site_id' => $filters['site_id'],
                'filters' => $filters,
                'status' => 'queued',
                'is_background_job' => true,
                'notes' => "Background export job untuk laporan {$reportType} ({$format})",
                'requested_by' => $request->user()?->id,
            ]);

            GenerateAnalyticsExportJob::dispatch($exportJob->id);

            return back()->with('notify', [
                'type' => 'success',
                'title' => 'Background Export Dijadwalkan',
                'message' => "Job Export {$exportJob->export_code} ({$format}) sedang diproses di background queue.",
            ]);
        }

        $dataset = $service->buildExportDataset($reportType, $filters);

        ReportExportJob::create([
            'export_code' => $exportCode,
            'report_type' => $reportType,
            'export_format' => $format,
            'site_id' => $filters['site_id'],
            'filters' => $filters,
            'row_count' => count($dataset['rows']),
            'status' => 'completed',
            'is_background_job' => false,
            'file_path' => "exports/{$exportCode}." . ($format === 'excel' ? 'csv' : 'pdf'),
            'requested_by' => $request->user()?->id,
            'completed_at' => now(),
        ]);

        if ($format === 'excel') {
            $lines = [];
            $lines[] = implode(',', array_map(fn ($h) => '"' . str_replace('"', '""', (string) $h) . '"', $dataset['headers']));
            foreach ($dataset['rows'] as $row) {
                $lines[] = implode(',', array_map(fn ($v) => '"' . str_replace('"', '""', (string) $v) . '"', $row));
            }
            $csvContent = "\xEF\xBB\xBF" . implode("\n", $lines);

            return response($csvContent, 200, [
                'Content-Type' => 'text/csv; charset=UTF-8',
                'Content-Disposition' => "attachment; filename=\"{$exportCode}.csv\"",
            ]);
        }

        return Inertia::render('Analytics/Print/Report', [
            'dataset' => $dataset,
            'reportType' => $reportType,
            'format' => $format,
            'exportCode' => $exportCode,
            'filters' => $filters,
        ]);
    }

    public function print(Request $request, ManagementAnalyticsService $service)
    {
        $reportType = $request->input('report_type', 'executive');
        $filters = $service->resolveAuthorizedFilters($request->user(), $request->all());
        $dataset = $service->buildExportDataset($reportType, $filters);

        return Inertia::render('Analytics/Print/Report', [
            'dataset' => $dataset,
            'reportType' => $reportType,
            'format' => 'printable',
            'exportCode' => 'PRT-' . strtoupper($reportType) . '-' . now()->format('YmdHi'),
            'filters' => $filters,
        ]);
    }
}
