<?php

namespace App\Http\Controllers;

use App\Models\BreakdownReport;
use App\Models\Employee;
use App\Models\JobCard;
use App\Models\Location;
use App\Models\MaintenanceRequest;
use App\Models\Site;
use App\Models\Unit;
use App\Models\WorkOrder;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class BreakdownManagementController extends Controller
{
    public function index(Request $request)
    {
        $siteId = $request->input('site_id');
        $unitId = $request->input('unit_id');
        $priority = $request->input('priority');
        $status = $request->input('status');
        $category = $request->input('damage_category');
        $search = $request->input('search');

        $query = BreakdownReport::with([
            'unit:id,unit_code,registration_number,unit_type,status',
            'site:id,name,code',
            'reporter:id,name,employee_code',
            'location:id,name,code',
            'workOrder:id,wo_number,status',
        ]);

        if ($siteId) {
            $query->where('site_id', $siteId);
        }
        if ($unitId) {
            $query->where('unit_id', $unitId);
        }
        if ($priority) {
            $query->where('priority', $priority);
        }
        if ($status) {
            $query->where('status', $status);
        }
        if ($category) {
            $query->where('damage_category', $category);
        }
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('report_number', 'like', "%{$search}%")
                  ->orWhere('reporter_name', 'like', "%{$search}%")
                  ->orWhere('location_name', 'like', "%{$search}%")
                  ->orWhere('damage_description', 'like', "%{$search}%")
                  ->orWhereHas('unit', fn($uq) => $uq->where('unit_code', 'like', "%{$search}%"));
            });
        }

        $reports = $query->orderBy('breakdown_date', 'desc')
            ->orderBy('breakdown_time', 'desc')
            ->paginate(12)
            ->withQueryString();

        // Metrics
        $allReports = BreakdownReport::all();
        $metrics = [
            'total' => $allReports->count(),
            'submitted' => $allReports->where('status', 'submitted')->count(),
            'reviewed' => $allReports->where('status', 'reviewed')->count(),
            'converted' => $allReports->whereIn('status', ['converted_to_request', 'converted_to_wo'])->count(),
            'critical' => $allReports->where('is_critical', true)->count(),
        ];

        $sites = Site::where('is_active', true)->select('id', 'name', 'code')->get();
        $units = Unit::where('is_active', true)->select('id', 'unit_code', 'unit_type', 'status', 'last_hm', 'last_km', 'site_id')->get();
        $employees = Employee::where('is_active', true)->select('id', 'name', 'employee_code')->get();
        $locations = Location::where('is_active', true)->select('id', 'name', 'code')->get();

        return Inertia::render('Maintenance/Breakdown/Index', [
            'reports' => $reports,
            'metrics' => $metrics,
            'filters' => [
                'site_id' => $siteId,
                'unit_id' => $unitId,
                'priority' => $priority,
                'status' => $status,
                'damage_category' => $category,
                'search' => $search,
            ],
            'master' => [
                'sites' => $sites,
                'units' => $units,
                'employees' => $employees,
                'locations' => $locations,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'site_id' => 'required|exists:sites,id',
            'unit_id' => 'required|exists:units,id',
            'reporter_type' => 'required|in:driver,foreman,mechanic',
            'reporter_id' => 'nullable|exists:employees,id',
            'reporter_name' => 'required|string|max:100',
            'breakdown_date' => 'required|date',
            'breakdown_time' => 'required',
            'current_hm' => 'required|numeric|min:0',
            'current_km' => 'required|numeric|min:0',
            'location_name' => 'required|string|max:150',
            'location_id' => 'nullable|exists:locations,id',
            'damage_category' => 'required|in:engine,transmission,hydraulic,brake,steering,electrical,tire,suspension,cooling_system,body,other',
            'damage_description' => 'required|string|min:10',
            'priority' => 'required|in:critical,high,medium,low',
            'photo_path' => 'nullable|string',
            'video_path' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated) {
            $unit = Unit::findOrFail($validated['unit_id']);
            $isCritical = ($validated['priority'] === 'critical') || in_array($validated['damage_category'], ['brake', 'steering', 'hydraulic']);

            $reportNumber = 'BDR-' . Carbon::parse($validated['breakdown_date'])->format('Ym') . '-' . rand(100, 999);

            $report = BreakdownReport::create(array_merge($validated, [
                'report_number' => $reportNumber,
                'status' => 'submitted',
                'is_critical' => $isCritical,
                'created_by' => Auth::id(),
            ]));

            // Sync unit last HM / KM
            $unit->update([
                'last_hm' => max((float) $unit->last_hm, (float) $validated['current_hm']),
                'last_km' => max((float) $unit->last_km, (float) $validated['current_km']),
            ]);

            // Critical rule: Unit status set to breakdown immediately and locked from Dispatch
            if ($isCritical) {
                $unit->update(['status' => 'breakdown']);
                return redirect()->back()
                    ->with('error', "PERINGATAN KRITIS: Laporan Kerusakan {$reportNumber} tersimpan! Unit {$unit->unit_code} dikunci ke status BREAKDOWN dan DILARANG DIOPERASIKAN sampai perbaikan selesai dan lulus inspeksi RFU.")
                    ->with('success', "Laporan kerusakan kritis {$reportNumber} berhasil dicatat dan unit dikunci ke status breakdown.");
            }

            return redirect()->back()->with('success', "Laporan kerusakan armada {$reportNumber} berhasil dicatat dan diteruskan ke Maintenance Planner.");
        });
    }

    public function review(Request $request, BreakdownReport $report)
    {
        $validated = $request->validate([
            'review_notes' => 'required|string|min:5',
            'status' => 'required|in:reviewed,rejected',
        ]);

        $report->update([
            'review_notes' => $validated['review_notes'],
            'status' => $validated['status'],
            'reviewed_by' => Auth::id(),
            'reviewed_at' => Carbon::now(),
            'updated_by' => Auth::id(),
        ]);

        return redirect()->back()->with('success', "Laporan kerusakan {$report->report_number} berhasil direview.");
    }

    public function convertToRequest(Request $request, BreakdownReport $report)
    {
        if ($report->maintenanceRequest) {
            return redirect()->back()->with('error', 'Laporan kerusakan ini sudah pernah dikonversi ke Maintenance Request sebelumnya!');
        }

        return DB::transaction(function () use ($report) {
            $reqNumber = 'MR-' . Carbon::now()->format('Ym') . '-' . rand(100, 999);

            $mRequest = MaintenanceRequest::create([
                'request_number' => $reqNumber,
                'site_id' => $report->site_id,
                'unit_id' => $report->unit_id,
                'breakdown_report_id' => $report->id,
                'requested_by' => $report->reporter_id,
                'requester_name' => $report->reporter_name,
                'damage_category' => $report->damage_category,
                'work_description' => $report->damage_description,
                'priority' => $report->priority,
                'request_date' => Carbon::today()->toDateString(),
                'status' => 'submitted',
                'approval_status' => 'pending',
                'created_by' => Auth::id(),
            ]);

            $report->update([
                'status' => 'converted_to_request',
                'updated_by' => Auth::id(),
            ]);

            return redirect()->back()->with('success', "Laporan {$report->report_number} berhasil dikonversi menjadi Maintenance Request {$reqNumber}.");
        });
    }

    public function convertToWorkOrder(Request $request, BreakdownReport $report)
    {
        if ($report->workOrder) {
            return redirect()->back()->with('error', 'Laporan kerusakan ini sudah memiliki Work Order aktif!');
        }

        $validated = $request->validate([
            'job_type' => 'required|string',
            'assigned_mechanic_id' => 'nullable|exists:employees,id',
            'target_completion_date' => 'nullable|date',
            'estimated_cost' => 'nullable|numeric|min:0',
        ]);

        return DB::transaction(function () use ($report, $validated) {
            $woNumber = 'WO-' . Carbon::now()->format('Ym') . '-' . rand(100, 999);

            $wo = WorkOrder::create([
                'wo_number' => $woNumber,
                'site_id' => $report->site_id,
                'unit_id' => $report->unit_id,
                'breakdown_report_id' => $report->id,
                'source' => 'road_breakdown',
                'job_type' => $validated['job_type'],
                'priority' => $report->priority === 'critical' ? 'critical_emergency' : $report->priority,
                'breakdown_time' => Carbon::parse($report->breakdown_date->format('Y-m-d') . ' ' . $report->breakdown_time),
                'hm_at_service' => $report->current_hm,
                'km_at_service' => $report->current_km,
                'initial_complaint' => $report->damage_description,
                'defect_summary' => "Laporan [{$report->report_number}]: {$report->damage_description}",
                'assigned_mechanic_id' => $validated['assigned_mechanic_id'] ?? null,
                'target_completion_date' => $validated['target_completion_date'] ?? null,
                'estimated_cost' => $validated['estimated_cost'] ?? 0,
                'status' => 'open',
                'rfu_status' => 'waiting_repair',
                'approval_status' => 'approved',
                'created_by' => Auth::id(),
            ]);

            // Create default Job Card
            JobCard::create([
                'job_card_number' => 'JC-' . Carbon::now()->format('Ym') . '-' . rand(100, 999),
                'work_order_id' => $wo->id,
                'site_id' => $report->site_id,
                'unit_id' => $report->unit_id,
                'issue_date' => Carbon::today()->toDateString(),
                'initial_complaint' => $report->damage_description,
                'lead_mechanic_id' => $validated['assigned_mechanic_id'] ?? null,
                'status' => 'active',
            ]);

            $report->update([
                'status' => 'converted_to_wo',
                'updated_by' => Auth::id(),
            ]);

            $report->unit->update(['status' => 'breakdown']);

            return redirect()->back()->with('success', "Work Order {$woNumber} berhasil diterbitkan langsung dari Laporan Kerusakan {$report->report_number}.");
        });
    }
}
