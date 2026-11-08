<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\Employee;
use App\Models\JobCard;
use App\Models\MaintenanceCost;
use App\Models\MechanicWorkLog;
use App\Models\Position;
use App\Models\Site;
use App\Models\WorkOrder;
use App\Models\WorkOrderAssignment;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class MechanicManagementController extends Controller
{
    public function index(Request $request)
    {
        $siteId = $request->input('site_id');
        $search = $request->input('search');

        $plantDept = Department::where('code', 'PLANT')->first();
        $query = Employee::with([
            'site:id,name,code',
            'position:id,title,level',
            'department:id,name,code',
        ])
        ->where('is_active', true);

        if ($plantDept) {
            $query->where('department_id', $plantDept->id);
        }

        if ($siteId) {
            $query->where('site_id', $siteId);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('employee_code', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $mechanics = $query->get()->map(function ($mech) {
            $assignments = WorkOrderAssignment::where('mechanic_id', $mech->id)->get();
            $logs = MechanicWorkLog::where('mechanic_id', $mech->id)->get();
            $activeJobs = $assignments->where('status', 'active')->count();
            $completedJobs = $assignments->where('status', 'completed')->count();
            $totalHours = (float) $logs->sum('duration_hours');

            return [
                'id' => $mech->id,
                'employee_code' => $mech->employee_code,
                'name' => $mech->name,
                'phone' => $mech->phone,
                'site_name' => $mech->site?->name ?? 'Site Muara Teweh',
                'position_title' => $mech->position?->title ?? 'Mekanik Workshop',
                'active_jobs' => $activeJobs,
                'completed_jobs' => $completedJobs,
                'total_working_hours' => round($totalHours, 1),
            ];
        });

        // Summary metrics
        $metrics = [
            'total_mechanics' => $mechanics->count(),
            'active_mechanics' => $mechanics->where('active_jobs', '>', 0)->count(),
            'idle_mechanics' => $mechanics->where('active_jobs', 0)->count(),
            'total_working_hours' => round($mechanics->sum('total_working_hours'), 1),
        ];

        // Recent Work Logs
        $recentLogs = MechanicWorkLog::with(['mechanic', 'workOrder.unit'])
            ->orderBy('created_at', 'desc')
            ->take(15)
            ->get();

        $sites = Site::where('is_active', true)->select('id', 'name', 'code')->get();

        return Inertia::render('Maintenance/Mechanics/Index', [
            'mechanics' => $mechanics,
            'metrics' => $metrics,
            'recentLogs' => $recentLogs,
            'filters' => [
                'site_id' => $siteId,
                'search' => $search,
            ],
            'master' => [
                'sites' => $sites,
            ],
        ]);
    }

    /**
     * Mobile Portal for Mechanics on HP / Phone
     */
    public function portal(Request $request)
    {
        $mechanicId = $request->input('mechanic_id');
        $plantDept = Department::where('code', 'PLANT')->first();

        $mechanicsList = Employee::when($plantDept, fn($q) => $q->where('department_id', $plantDept->id))
            ->where('is_active', true)
            ->select('id', 'name', 'employee_code')
            ->get();

        $selectedMechanicId = $mechanicId ?: ($mechanicsList->first()?->id ?? 1);

        // Fetch assigned active work orders for this mechanic
        $assignedOrders = WorkOrder::with([
            'unit:id,unit_code,registration_number,unit_type,status',
            'site:id,name,code',
            'tasks',
            'jobCard.checklists',
        ])
        ->whereHas('assignments', fn($q) => $q->where('mechanic_id', $selectedMechanicId))
        ->whereIn('status', ['open', 'assigned', 'in_progress', 'waiting_sparepart', 'waiting_inspection'])
        ->orderBy('priority', 'desc')
        ->get();

        // Recent logs for this mechanic
        $myLogs = MechanicWorkLog::with('workOrder.unit')
            ->where('mechanic_id', $selectedMechanicId)
            ->orderBy('log_date', 'desc')
            ->take(8)
            ->get();

        return Inertia::render('Maintenance/Mechanics/MobilePortal', [
            'selectedMechanicId' => (int) $selectedMechanicId,
            'mechanicsList' => $mechanicsList,
            'assignedOrders' => $assignedOrders,
            'myLogs' => $myLogs,
        ]);
    }

    /**
     * Store mobile work log & status progress
     */
    public function storeWorkLog(Request $request)
    {
        $validated = $request->validate([
            'work_order_id' => 'required|exists:work_orders,id',
            'mechanic_id' => 'required|exists:employees,id',
            'log_date' => 'required|date',
            'start_time' => 'required',
            'end_time' => 'nullable',
            'duration_hours' => 'required|numeric|min:0.1',
            'diagnosis' => 'nullable|string',
            'action_taken' => 'required|string|min:5',
            'work_notes' => 'nullable|string',
            'photo_before' => 'nullable|string',
            'photo_after' => 'nullable|string',
            'status_update' => 'required|in:in_progress,waiting_sparepart,waiting_inspection,completed',
        ]);

        return DB::transaction(function () use ($validated) {
            $wo = WorkOrder::findOrFail($validated['work_order_id']);

            $log = MechanicWorkLog::create([
                'work_order_id' => $wo->id,
                'mechanic_id' => $validated['mechanic_id'],
                'log_date' => $validated['log_date'],
                'start_time' => Carbon::parse($validated['log_date'] . ' ' . $validated['start_time']),
                'end_time' => !empty($validated['end_time']) ? Carbon::parse($validated['log_date'] . ' ' . $validated['end_time']) : Carbon::now(),
                'duration_hours' => $validated['duration_hours'],
                'diagnosis' => $validated['diagnosis'] ?? $wo->diagnosis,
                'action_taken' => $validated['action_taken'],
                'work_notes' => $validated['work_notes'] ?? null,
                'photo_before' => $validated['photo_before'] ?? null,
                'photo_after' => $validated['photo_after'] ?? null,
                'status_update' => $validated['status_update'],
            ]);

            // Update cumulative working hours on assignment
            $assignment = WorkOrderAssignment::where('work_order_id', $wo->id)
                ->where('mechanic_id', $validated['mechanic_id'])
                ->first();

            if ($assignment) {
                $assignment->increment('working_hours', $validated['duration_hours']);
                if ($validated['status_update'] === 'completed') {
                    $assignment->update(['status' => 'completed']);
                }
            }

            // Update work order fields
            $woUpdates = [
                'status' => $validated['status_update'],
                'action_taken' => ($wo->action_taken ? $wo->action_taken . '; ' : '') . $validated['action_taken'],
            ];

            if ($validated['diagnosis']) {
                $woUpdates['diagnosis'] = $validated['diagnosis'];
            }

            if ($validated['status_update'] === 'waiting_inspection') {
                $woUpdates['rfu_status'] = 'waiting_inspection';
            } elseif ($validated['status_update'] === 'in_progress') {
                $woUpdates['rfu_status'] = 'repair_in_progress';
                if (!$wo->start_repair_time) {
                    $woUpdates['start_repair_time'] = Carbon::now();
                }
            }

            $wo->update($woUpdates);

            // Record labor cost into maintenance_costs
            $hourlyRate = 100000; // IDR 100,000 / hour standard labor cost
            $laborAmount = $validated['duration_hours'] * $hourlyRate;

            MaintenanceCost::create([
                'work_order_id' => $wo->id,
                'site_id' => $wo->site_id,
                'unit_id' => $wo->unit_id,
                'cost_date' => $validated['log_date'],
                'cost_type' => 'mechanic_labor',
                'description' => "Upah Kerja Mekanik ({$validated['duration_hours']} Jam) - " . ($assignment?->mechanic?->name ?? 'Mekanik'),
                'reference_number' => "LOG-{$log->id}",
                'estimated_amount' => $laborAmount,
                'actual_amount' => $laborAmount,
                'created_by' => Auth::id(),
            ]);

            $wo->increment('actual_cost', $laborAmount);

            return redirect()->back()->with('success', "Progres perbaikan berhasil dikirim dari HP. Status WO diperbarui ke {$validated['status_update']}.");
        });
    }
}
