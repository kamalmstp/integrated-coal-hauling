<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\Unit;
use App\Models\WorkOrder;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class WorkOrderController extends Controller
{
    public function index(Request $request)
    {
        $status = $request->input('status');
        $priority = $request->input('priority');
        $unitId = $request->input('unit_id');

        $query = WorkOrder::with([
            'unit:id,unit_code,registration_number,unit_type,status',
            'p2hInspection:id,inspection_number,overall_condition',
            'mechanic:id,name',
            'creator:id,name',
        ]);

        if ($status) {
            $query->where('status', $status);
        }
        if ($priority) {
            $query->where('priority', $priority);
        }
        if ($unitId) {
            $query->where('unit_id', $unitId);
        }

        $workOrders = $query->orderBy('breakdown_time', 'desc')->paginate(12)->withQueryString();

        $units = Unit::where('is_active', true)->select('id', 'unit_code', 'unit_type', 'status')->get();
        $mechanics = Employee::where('is_active', true)->select('id', 'name', 'employee_code')->get();

        // Metrics
        $allOrders = WorkOrder::all();
        $metrics = [
            'total' => $allOrders->count(),
            'open' => $allOrders->where('status', 'open')->count(),
            'in_progress' => $allOrders->where('status', 'in_progress')->count(),
            'waiting_parts' => $allOrders->where('status', 'waiting_parts')->count(),
            'completed' => $allOrders->where('status', 'completed')->count(),
            'total_downtime_hours' => round($allOrders->sum('downtime_minutes') / 60, 1),
        ];

        return Inertia::render('Fleet/WorkOrders/Index', [
            'workOrders' => $workOrders,
            'filters' => [
                'status' => $status,
                'priority' => $priority,
                'unit_id' => $unitId,
            ],
            'metrics' => $metrics,
            'master' => [
                'units' => $units,
                'mechanics' => $mechanics,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'unit_id' => 'required|exists:units,id',
            'source' => 'required|in:p2h_defect,road_breakdown,scheduled_pm,inspection',
            'priority' => 'required|in:critical_emergency,high,medium,low',
            'breakdown_time' => 'required|date',
            'defect_summary' => 'required|string|min:5',
            'assigned_mechanic_id' => 'nullable|exists:employees,id',
        ]);

        return DB::transaction(function () use ($validated) {
            $unit = Unit::findOrFail($validated['unit_id']);
            $woNumber = 'WO-' . Carbon::now()->format('Ym') . '-' . rand(100, 999);

            $wo = WorkOrder::create([
                'wo_number' => $woNumber,
                'unit_id' => $unit->id,
                'source' => $validated['source'],
                'priority' => $validated['priority'],
                'breakdown_time' => $validated['breakdown_time'],
                'defect_summary' => $validated['defect_summary'],
                'assigned_mechanic_id' => $validated['assigned_mechanic_id'] ?? null,
                'status' => 'open',
                'created_by' => Auth::id(),
            ]);

            // Set unit status to breakdown
            $unit->update(['status' => 'breakdown']);

            return redirect()->back()->with('success', "Work Order {$wo->wo_number} diterbitkan. Unit {$unit->unit_code} diset ke status BREAKDOWN.");
        });
    }

    public function updateStatus(Request $request, WorkOrder $workOrder)
    {
        $validated = $request->validate([
            'status' => 'required|in:open,in_progress,waiting_parts,completed,cancelled',
            'action_taken' => 'nullable|string',
            'assigned_mechanic_id' => 'nullable|exists:employees,id',
        ]);

        return DB::transaction(function () use ($workOrder, $validated) {
            $now = Carbon::now();
            $updates = [
                'status' => $validated['status'],
                'action_taken' => $validated['action_taken'] ?? $workOrder->action_taken,
                'assigned_mechanic_id' => $validated['assigned_mechanic_id'] ?? $workOrder->assigned_mechanic_id,
                'updated_by' => Auth::id(),
            ];

            if ($validated['status'] === 'in_progress' && !$workOrder->start_repair_time) {
                $updates['start_repair_time'] = $now;
                $workOrder->unit->update(['status' => 'maintenance']);
            } elseif ($validated['status'] === 'completed') {
                $updates['completion_time'] = $now;
                $startTime = $workOrder->breakdown_time ? Carbon::parse($workOrder->breakdown_time) : $now;
                $downtimeMin = (int) abs($now->diffInMinutes($startTime));
                $updates['downtime_minutes'] = max(1, $downtimeMin);

                // RESTORE UNIT TO STANDBY / RFU READY!
                $workOrder->unit->update(['status' => 'standby']);
            }

            $workOrder->update($updates);

            return redirect()->back()->with('success', "Status Work Order {$workOrder->wo_number} diperbarui menjadi {$validated['status']}.");
        });
    }
}
