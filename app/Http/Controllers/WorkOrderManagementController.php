<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\JobCard;
use App\Models\MaintenanceCost;
use App\Models\Site;
use App\Models\Unit;
use App\Models\WorkOrder;
use App\Models\WorkOrderAssignment;
use App\Models\WorkOrderTask;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class WorkOrderManagementController extends Controller
{
    public function index(Request $request)
    {
        $siteId = $request->input('site_id');
        $unitId = $request->input('unit_id');
        $status = $request->input('status');
        $priority = $request->input('priority');
        $jobType = $request->input('job_type');
        $search = $request->input('search');

        $query = WorkOrder::with([
            'unit:id,unit_code,registration_number,unit_type,status,last_hm,last_km',
            'site:id,name,code',
            'mechanic:id,name,employee_code',
            'supervisor:id,name',
            'assignments.mechanic:id,name,employee_code',
            'jobCard:id,job_card_number,work_order_id,status',
            'latestInspection:id,work_order_id,result,inspection_number',
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
        if ($jobType) {
            $query->where('job_type', $jobType);
        }
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('wo_number', 'like', "%{$search}%")
                  ->orWhere('defect_summary', 'like', "%{$search}%")
                  ->orWhere('diagnosis', 'like', "%{$search}%")
                  ->orWhereHas('unit', fn($uq) => $uq->where('unit_code', 'like', "%{$search}%"));
            });
        }

        $workOrders = $query->orderBy('breakdown_time', 'desc')->paginate(12)->withQueryString();

        // Metrics
        $allOrders = WorkOrder::all();
        $metrics = [
            'total' => $allOrders->count(),
            'open' => $allOrders->whereIn('status', ['open', 'submitted', 'approved', 'assigned'])->count(),
            'in_progress' => $allOrders->where('status', 'in_progress')->count(),
            'waiting_spareparts' => $allOrders->where('status', 'waiting_sparepart')->count(),
            'waiting_inspection' => $allOrders->where('status', 'waiting_inspection')->count(),
            'completed' => $allOrders->where('status', 'completed')->count(),
            'closed' => $allOrders->where('status', 'closed')->count(),
            'total_downtime_hours' => round($allOrders->sum('downtime_minutes') / 60, 1),
            'total_actual_cost' => (float) $allOrders->sum('actual_cost'),
        ];

        $sites = Site::where('is_active', true)->select('id', 'name', 'code')->get();
        $units = Unit::where('is_active', true)->select('id', 'unit_code', 'unit_type', 'status', 'last_hm', 'last_km', 'site_id')->get();
        $mechanics = Employee::where('is_active', true)->select('id', 'name', 'employee_code')->get();

        return Inertia::render('Maintenance/WorkOrders/Index', [
            'workOrders' => $workOrders,
            'metrics' => $metrics,
            'filters' => [
                'site_id' => $siteId,
                'unit_id' => $unitId,
                'status' => $status,
                'priority' => $priority,
                'job_type' => $jobType,
                'search' => $search,
            ],
            'master' => [
                'sites' => $sites,
                'units' => $units,
                'mechanics' => $mechanics,
            ],
        ]);
    }

    public function show(WorkOrder $workOrder)
    {
        $workOrder->load([
            'unit.site',
            'site',
            'mechanic',
            'supervisor',
            'maintenanceRequest',
            'breakdownReport',
            'assignments.mechanic',
            'tasks.completedBy',
            'mechanicLogs.mechanic',
            'jobCard.checklists',
            'sparepartRequests.items',
            'inspections.inspector',
            'rfuApproval.approver',
            'costs',
        ]);

        return response()->json($workOrder);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'site_id' => 'required|exists:sites,id',
            'unit_id' => 'required|exists:units,id',
            'job_type' => 'required|in:preventive_maintenance,corrective_maintenance,emergency_repair,inspection,tire_maintenance,electrical_repair,general_repair',
            'priority' => 'required|in:critical_emergency,high,medium,low',
            'breakdown_time' => 'required|date',
            'target_completion_date' => 'nullable|date',
            'initial_complaint' => 'nullable|string',
            'defect_summary' => 'required|string|min:5',
            'assigned_mechanic_id' => 'nullable|exists:employees,id',
            'supervisor_id' => 'nullable|exists:employees,id',
            'estimated_cost' => 'nullable|numeric|min:0',
        ]);

        return DB::transaction(function () use ($validated) {
            $unit = Unit::findOrFail($validated['unit_id']);
            $woNumber = 'WO-' . Carbon::now()->format('Ym') . '-' . rand(100, 999);

            $wo = WorkOrder::create([
                'wo_number' => $woNumber,
                'site_id' => $validated['site_id'],
                'unit_id' => $unit->id,
                'source' => $validated['job_type'] === 'emergency_repair' ? 'road_breakdown' : 'scheduled_pm',
                'job_type' => $validated['job_type'],
                'priority' => $validated['priority'],
                'breakdown_time' => $validated['breakdown_time'],
                'target_completion_date' => $validated['target_completion_date'] ?? null,
                'hm_at_service' => $unit->last_hm ?: 0,
                'km_at_service' => $unit->last_km ?: 0,
                'initial_complaint' => $validated['initial_complaint'] ?? $validated['defect_summary'],
                'defect_summary' => $validated['defect_summary'],
                'assigned_mechanic_id' => $validated['assigned_mechanic_id'] ?? null,
                'supervisor_id' => $validated['supervisor_id'] ?? null,
                'estimated_cost' => $validated['estimated_cost'] ?? 0,
                'status' => 'open',
                'rfu_status' => 'waiting_repair',
                'approval_status' => 'approved',
                'created_by' => Auth::id(),
            ]);

            // Assign lead mechanic if provided
            if (!empty($validated['assigned_mechanic_id'])) {
                WorkOrderAssignment::create([
                    'work_order_id' => $wo->id,
                    'mechanic_id' => $validated['assigned_mechanic_id'],
                    'role' => 'lead_mechanic',
                    'assigned_date' => Carbon::today()->toDateString(),
                    'status' => 'active',
                ]);
            }

            // Create default Job Card
            JobCard::create([
                'job_card_number' => 'JC-' . Carbon::now()->format('Ym') . '-' . rand(100, 999),
                'work_order_id' => $wo->id,
                'site_id' => $validated['site_id'],
                'unit_id' => $unit->id,
                'issue_date' => Carbon::today()->toDateString(),
                'initial_complaint' => $validated['initial_complaint'] ?? $validated['defect_summary'],
                'lead_mechanic_id' => $validated['assigned_mechanic_id'] ?? null,
                'supervisor_id' => $validated['supervisor_id'] ?? null,
                'status' => 'active',
            ]);

            // If job type is emergency or critical, put unit to breakdown
            if ($validated['priority'] === 'critical_emergency' || $validated['job_type'] === 'emergency_repair') {
                $unit->update(['status' => 'breakdown']);
            } else {
                $unit->update(['status' => 'maintenance']);
            }

            return redirect()->back()->with('success', "Work Order {$woNumber} berhasil diterbitkan.");
        });
    }

    public function updateStatus(Request $request, WorkOrder $workOrder)
    {
        $validated = $request->validate([
            'status' => 'required|in:open,submitted,approved,assigned,in_progress,waiting_sparepart,waiting_inspection,completed,closed,cancelled',
            'action_taken' => 'nullable|string',
            'diagnosis' => 'nullable|string',
            'root_cause' => 'nullable|string',
            'assigned_mechanic_id' => 'nullable|exists:employees,id',
            'actual_cost' => 'nullable|numeric|min:0',
        ]);

        return DB::transaction(function () use ($workOrder, $validated) {
            $now = Carbon::now();
            $updates = [
                'status' => $validated['status'],
                'action_taken' => $validated['action_taken'] ?? $workOrder->action_taken,
                'diagnosis' => $validated['diagnosis'] ?? $workOrder->diagnosis,
                'root_cause' => $validated['root_cause'] ?? $workOrder->root_cause,
                'assigned_mechanic_id' => $validated['assigned_mechanic_id'] ?? $workOrder->assigned_mechanic_id,
                'updated_by' => Auth::id(),
            ];

            if (isset($validated['actual_cost'])) {
                $updates['actual_cost'] = $validated['actual_cost'];
            }

            if ($validated['status'] === 'in_progress') {
                if (!$workOrder->start_repair_time) {
                    $updates['start_repair_time'] = $now;
                }
                $updates['rfu_status'] = 'repair_in_progress';
                $workOrder->unit->update(['status' => 'maintenance']);
            } elseif ($validated['status'] === 'waiting_sparepart') {
                $updates['rfu_status'] = 'waiting_repair';
            } elseif ($validated['status'] === 'waiting_inspection') {
                $updates['rfu_status'] = 'waiting_inspection';
            } elseif ($validated['status'] === 'completed' || $validated['status'] === 'closed') {
                $updates['completion_time'] = $workOrder->completion_time ?: $now;
                $updates['actual_completion_date'] = $workOrder->actual_completion_date ?: $now;

                $startTime = $workOrder->breakdown_time ? Carbon::parse($workOrder->breakdown_time) : $now;
                $downtimeMin = (int) abs($now->diffInMinutes($startTime));
                $updates['downtime_minutes'] = max(1, $downtimeMin);

                // Note: RFU approval is required to restore unit to RFU Standby
                // If it is closed without prior RFU, we restore unit to standby
                if ($workOrder->rfu_status === 'approved_rfu' || $validated['status'] === 'closed') {
                    $workOrder->unit->update(['status' => 'standby']);
                }
            }

            $workOrder->update($updates);

            return redirect()->back()->with('success', "Status Work Order {$workOrder->wo_number} diperbarui menjadi {$validated['status']}.");
        });
    }

    public function assignMechanic(Request $request, WorkOrder $workOrder)
    {
        $validated = $request->validate([
            'mechanic_id' => 'required|exists:employees,id',
            'role' => 'nullable|string',
            'assignment_role' => 'nullable|string',
            'shift' => 'nullable|string',
            'working_hours' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
            'instructions' => 'nullable|string',
        ]);

        $role = $validated['role'] ?? $validated['assignment_role'] ?? 'assistant_mechanic';

        WorkOrderAssignment::create([
            'work_order_id' => $workOrder->id,
            'mechanic_id' => $validated['mechanic_id'],
            'assignment_role' => $role,
            'role' => $role,
            'shift' => $validated['shift'] ?? 'shift_1',
            'assigned_date' => Carbon::today()->toDateString(),
            'working_hours' => $validated['working_hours'] ?? 0,
            'notes' => $validated['notes'] ?? $validated['instructions'] ?? null,
            'instructions' => $validated['instructions'] ?? null,
            'status' => 'active',
        ]);

        return redirect()->back()->with('success', 'Mekanik berhasil ditugaskan ke Work Order ini.');
    }

    public function addTask(Request $request, WorkOrder $workOrder)
    {
        $taskName = $request->input('task_name') ?? $request->input('task_description');
        $request->merge(['task_name' => $taskName]);

        $validated = $request->validate([
            'task_name' => 'required|string|max:150',
            'task_description' => 'nullable|string',
            'description' => 'nullable|string',
            'estimated_minutes' => 'nullable|integer',
        ]);

        WorkOrderTask::create([
            'work_order_id' => $workOrder->id,
            'task_name' => $validated['task_name'],
            'task_description' => $validated['task_description'] ?? $validated['description'] ?? $validated['task_name'],
            'description' => $validated['description'] ?? null,
            'estimated_minutes' => $validated['estimated_minutes'] ?? 60,
            'is_completed' => false,
            'status' => 'pending',
        ]);

        return redirect()->back()->with('success', 'Tugas perbaikan baru berhasil ditambahkan.');
    }

    public function toggleTask(Request $request, WorkOrderTask $task)
    {
        $completed = !$task->is_completed;
        $task->update([
            'is_completed' => $completed,
            'status' => $completed ? 'completed' : 'pending',
            'completed_by' => $completed ? (Auth::user()->employee_id ?? null) : null,
            'completed_at' => $completed ? Carbon::now() : null,
        ]);

        return redirect()->back()->with('success', 'Status tugas diperbarui.');
    }
}
