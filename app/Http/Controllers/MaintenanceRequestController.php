<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\JobCard;
use App\Models\MaintenanceRequest;
use App\Models\Site;
use App\Models\Unit;
use App\Models\WorkOrder;
use App\Models\WorkOrderAssignment;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class MaintenanceRequestController extends Controller
{
    public function index(Request $request)
    {
        $siteId = $request->input('site_id');
        $unitId = $request->input('unit_id');
        $status = $request->input('status');
        $priority = $request->input('priority');
        $search = $request->input('search');

        $query = MaintenanceRequest::with([
            'unit:id,unit_code,registration_number,unit_type,status,last_hm,last_km',
            'site:id,name,code',
            'requester:id,name,employee_code',
            'approver:id,name',
            'workOrder:id,wo_number,status',
            'breakdownReport:id,report_number',
        ]);

        if ($siteId) {
            $query->where('site_id', $siteId);
        }
        if ($unitId) {
            $query->where('unit_id', $unitId);
        }
        if ($status) {
            $query->where('status', $status);
        }
        if ($priority) {
            $query->where('priority', $priority);
        }
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('request_number', 'like', "%{$search}%")
                  ->orWhere('requester_name', 'like', "%{$search}%")
                  ->orWhere('work_description', 'like', "%{$search}%")
                  ->orWhereHas('unit', fn($uq) => $uq->where('unit_code', 'like', "%{$search}%"));
            });
        }

        $requests = $query->orderBy('request_date', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate(12)
            ->withQueryString();

        $allRequests = MaintenanceRequest::all();
        $metrics = [
            'total' => $allRequests->count(),
            'submitted' => $allRequests->where('status', 'submitted')->count(),
            'under_review' => $allRequests->where('status', 'under_review')->count(),
            'approved' => $allRequests->where('status', 'approved')->count(),
            'converted' => $allRequests->where('status', 'converted_to_wo')->count(),
            'rejected' => $allRequests->where('status', 'rejected')->count(),
        ];

        $sites = Site::where('is_active', true)->select('id', 'name', 'code')->get();
        $units = Unit::where('is_active', true)->select('id', 'unit_code', 'unit_type', 'status', 'last_hm', 'last_km', 'site_id')->get();
        $employees = Employee::where('is_active', true)->select('id', 'name', 'employee_code')->get();

        return Inertia::render('Maintenance/Requests/Index', [
            'requests' => $requests,
            'metrics' => $metrics,
            'filters' => [
                'site_id' => $siteId,
                'unit_id' => $unitId,
                'status' => $status,
                'priority' => $priority,
                'search' => $search,
            ],
            'master' => [
                'sites' => $sites,
                'units' => $units,
                'employees' => $employees,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'site_id' => 'required|exists:sites,id',
            'unit_id' => 'required|exists:units,id',
            'requested_by' => 'nullable|exists:employees,id',
            'requester_name' => 'required|string|max:100',
            'damage_category' => 'required|in:engine,transmission,hydraulic,brake,steering,electrical,tire,suspension,cooling_system,body,other',
            'work_description' => 'required|string|min:10',
            'priority' => 'required|in:critical,high,medium,low',
            'request_date' => 'required|date',
            'attachment_path' => 'nullable|string',
        ]);

        $reqNumber = 'MR-' . Carbon::parse($validated['request_date'])->format('Ym') . '-' . rand(100, 999);

        MaintenanceRequest::create(array_merge($validated, [
            'request_number' => $reqNumber,
            'status' => 'submitted',
            'approval_status' => 'pending',
            'created_by' => Auth::id(),
        ]));

        return redirect()->back()->with('success', "Maintenance Request {$reqNumber} berhasil diajukan dan menunggu persetujuan Planner.");
    }

    public function approve(Request $request, MaintenanceRequest $mRequest)
    {
        $validated = $request->validate([
            'approval_notes' => 'nullable|string',
        ]);

        $mRequest->update([
            'status' => 'approved',
            'approval_status' => 'approved',
            'approver_id' => Auth::id(),
            'approval_notes' => $validated['approval_notes'] ?? 'Disetujui untuk penjadwalan Work Order.',
            'approved_at' => Carbon::now(),
            'updated_by' => Auth::id(),
        ]);

        return redirect()->back()->with('success', "Maintenance Request {$mRequest->request_number} disetujui.");
    }

    public function reject(Request $request, MaintenanceRequest $mRequest)
    {
        $validated = $request->validate([
            'approval_notes' => 'required|string|min:5',
        ]);

        $mRequest->update([
            'status' => 'rejected',
            'approval_status' => 'rejected',
            'approver_id' => Auth::id(),
            'approval_notes' => $validated['approval_notes'],
            'approved_at' => Carbon::now(),
            'updated_by' => Auth::id(),
        ]);

        return redirect()->back()->with('warning', "Maintenance Request {$mRequest->request_number} ditolak dengan alasan: {$validated['approval_notes']}.");
    }

    public function convertToWorkOrder(Request $request, MaintenanceRequest $mRequest)
    {
        // Prevent duplicate work orders from the same request!
        if ($mRequest->work_order_id || $mRequest->status === 'converted_to_wo') {
            return redirect()->back()->with('error', "Gagal: Maintenance Request {$mRequest->request_number} sudah memiliki Work Order aktif ({$mRequest->workOrder?->wo_number})! Duplikasi Work Order dicegah oleh sistem.");
        }

        $validated = $request->validate([
            'job_type' => 'required|string',
            'assigned_mechanic_id' => 'required|exists:employees,id',
            'supervisor_id' => 'nullable|exists:employees,id',
            'target_completion_date' => 'nullable|date',
            'estimated_cost' => 'nullable|numeric|min:0',
        ]);

        return DB::transaction(function () use ($mRequest, $validated) {
            $woNumber = 'WO-' . Carbon::now()->format('Ym') . '-' . rand(100, 999);

            $wo = WorkOrder::create([
                'wo_number' => $woNumber,
                'site_id' => $mRequest->site_id,
                'unit_id' => $mRequest->unit_id,
                'maintenance_request_id' => $mRequest->id,
                'breakdown_report_id' => $mRequest->breakdown_report_id,
                'source' => 'inspection',
                'job_type' => $validated['job_type'],
                'priority' => $mRequest->priority === 'critical' ? 'critical_emergency' : $mRequest->priority,
                'breakdown_time' => Carbon::now(),
                'hm_at_service' => $mRequest->unit?->last_hm ?: 0,
                'km_at_service' => $mRequest->unit?->last_km ?: 0,
                'initial_complaint' => $mRequest->work_description,
                'defect_summary' => "MR [{$mRequest->request_number}]: {$mRequest->work_description}",
                'assigned_mechanic_id' => $validated['assigned_mechanic_id'],
                'supervisor_id' => $validated['supervisor_id'] ?? null,
                'target_completion_date' => $validated['target_completion_date'] ?? null,
                'estimated_cost' => $validated['estimated_cost'] ?? 0,
                'status' => 'assigned',
                'rfu_status' => 'repair_in_progress',
                'approval_status' => 'approved',
                'created_by' => Auth::id(),
            ]);

            // Assign lead mechanic
            WorkOrderAssignment::create([
                'work_order_id' => $wo->id,
                'mechanic_id' => $validated['assigned_mechanic_id'],
                'role' => 'lead_mechanic',
                'assigned_date' => Carbon::today()->toDateString(),
                'status' => 'active',
            ]);

            // Create Job Card
            JobCard::create([
                'job_card_number' => 'JC-' . Carbon::now()->format('Ym') . '-' . rand(100, 999),
                'work_order_id' => $wo->id,
                'site_id' => $mRequest->site_id,
                'unit_id' => $mRequest->unit_id,
                'issue_date' => Carbon::today()->toDateString(),
                'initial_complaint' => $mRequest->work_description,
                'lead_mechanic_id' => $validated['assigned_mechanic_id'],
                'supervisor_id' => $validated['supervisor_id'] ?? null,
                'status' => 'active',
            ]);

            $mRequest->update([
                'work_order_id' => $wo->id,
                'status' => 'converted_to_wo',
                'updated_by' => Auth::id(),
            ]);

            // Update Unit status to maintenance
            $mRequest->unit->update(['status' => 'maintenance']);

            return redirect()->back()->with('success', "Work Order {$woNumber} berhasil diterbitkan dari Maintenance Request {$mRequest->request_number}.");
        });
    }
}
