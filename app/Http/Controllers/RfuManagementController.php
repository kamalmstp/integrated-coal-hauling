<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\MaintenanceInspection;
use App\Models\RfuApproval;
use App\Models\Site;
use App\Models\Unit;
use App\Models\WorkOrder;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class RfuManagementController extends Controller
{
    public function index(Request $request)
    {
        $siteId = $request->input('site_id');
        $status = $request->input('rfu_status');
        $unitId = $request->input('unit_id');

        $query = WorkOrder::with([
            'unit:id,unit_code,registration_number,unit_type,status,last_hm,last_km',
            'site:id,name,code',
            'mechanic:id,name,employee_code',
            'latestInspection.inspector:id,name',
            'rfuApproval.approver:id,name',
        ])
        ->whereIn('status', ['waiting_inspection', 'completed', 'in_progress', 'waiting_sparepart']);

        if ($siteId) {
            $query->where('site_id', $siteId);
        }
        if ($unitId) {
            $query->where('unit_id', $unitId);
        }
        if ($status) {
            $query->where('rfu_status', $status);
        }

        $orders = $query->orderBy('breakdown_time', 'desc')->paginate(12)->withQueryString();

        // Metrics (Aggregated SQL query instead of loading all WorkOrders into memory)
        $statsRow = WorkOrder::when($siteId, fn ($q) => $q->where('site_id', $siteId))
            ->selectRaw("
                SUM(CASE WHEN rfu_status = 'waiting_repair' THEN 1 ELSE 0 END) as waiting_repair,
                SUM(CASE WHEN rfu_status = 'repair_in_progress' THEN 1 ELSE 0 END) as repair_in_progress,
                SUM(CASE WHEN rfu_status = 'waiting_inspection' THEN 1 ELSE 0 END) as waiting_inspection,
                SUM(CASE WHEN rfu_status = 'inspection_failed' THEN 1 ELSE 0 END) as inspection_failed,
                SUM(CASE WHEN rfu_status = 'approved_rfu' THEN 1 ELSE 0 END) as approved_rfu,
                SUM(CASE WHEN rfu_status = 'rejected_rfu' THEN 1 ELSE 0 END) as rejected_rfu
            ")
            ->first();

        $metrics = [
            'waiting_repair' => (int) ($statsRow->waiting_repair ?? 0),
            'repair_in_progress' => (int) ($statsRow->repair_in_progress ?? 0),
            'waiting_inspection' => (int) ($statsRow->waiting_inspection ?? 0),
            'inspection_failed' => (int) ($statsRow->inspection_failed ?? 0),
            'approved_rfu' => (int) ($statsRow->approved_rfu ?? 0),
            'rejected_rfu' => (int) ($statsRow->rejected_rfu ?? 0),
        ];

        // Recent RFU Approvals
        $recentApprovals = RfuApproval::with(['unit', 'workOrder', 'approver'])
            ->orderBy('approval_date', 'desc')
            ->take(8)
            ->get();

        $sites = Site::where('is_active', true)->select('id', 'name', 'code')->get();
        $units = Unit::where('is_active', true)->select('id', 'unit_code', 'unit_type', 'status')->get();
        $inspectors = Employee::where('is_active', true)->select('id', 'name', 'employee_code')->get();

        return Inertia::render('Maintenance/RFU/Index', [
            'orders' => $orders,
            'metrics' => $metrics,
            'recentApprovals' => $recentApprovals,
            'filters' => [
                'site_id' => $siteId,
                'rfu_status' => $status,
                'unit_id' => $unitId,
            ],
            'master' => [
                'sites' => $sites,
                'units' => $units,
                'inspectors' => $inspectors,
            ],
        ]);
    }

    /**
     * Submit QA Inspection (Pemeriksaan pra-RFU)
     */
    public function submitInspection(Request $request, ?WorkOrder $workOrder = null)
    {
        if (!$workOrder || !$workOrder->exists) {
            $woId = $request->input('work_order_id');
            $workOrder = WorkOrder::findOrFail($woId);
        }

        $inspDate = $request->input('inspection_date');
        $parsedDate = $inspDate ? Carbon::parse($inspDate)->toDateString() : Carbon::today()->toDateString();
        $parsedTime = $request->input('inspection_time') ?? ($inspDate ? Carbon::parse($inspDate)->toTimeString() : Carbon::now()->toTimeString());

        $request->merge([
            'inspection_date' => $parsedDate,
            'inspection_time' => $parsedTime,
            'inspection_type' => in_array($request->input('inspection_type'), ['post_repair', 'preventive_qa', 'safety_clearance']) ? $request->input('inspection_type') : 'post_repair',
            'inspector_notes' => $request->input('inspector_notes') ?? $request->input('notes'),
        ]);

        $validated = $request->validate([
            'inspector_id' => 'required|exists:employees,id',
            'inspection_date' => 'required|date',
            'inspection_time' => 'required',
            'inspection_type' => 'required|in:post_repair,preventive_qa,safety_clearance',
            'test_run_hm' => 'nullable|numeric|min:0',
            'test_run_km' => 'nullable|numeric|min:0',
            'test_run_result' => 'required|string|min:5',
            'result' => 'required|in:passed,failed,needs_rework',
            'defects_found' => 'nullable|string',
            'inspector_notes' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($workOrder, $validated) {
            $inspNumber = 'QC-' . Carbon::parse($validated['inspection_date'])->format('Ym') . '-' . rand(100, 999);
            $sigHash = hash('sha256', $inspNumber . $validated['inspector_id'] . $validated['result']);

            $inspection = MaintenanceInspection::create([
                'inspection_number' => $inspNumber,
                'work_order_id' => $workOrder->id,
                'site_id' => $workOrder->site_id,
                'unit_id' => $workOrder->unit_id,
                'inspector_id' => $validated['inspector_id'],
                'inspection_date' => $validated['inspection_date'],
                'inspection_time' => $validated['inspection_time'],
                'inspection_type' => $validated['inspection_type'],
                'test_run_hm' => $validated['test_run_hm'] ?? null,
                'test_run_km' => $validated['test_run_km'] ?? null,
                'test_run_result' => $validated['test_run_result'],
                'result' => $validated['result'],
                'defects_found' => $validated['defects_found'] ?? null,
                'inspector_notes' => $validated['inspector_notes'] ?? null,
                'inspector_signature_hash' => $sigHash,
            ]);

            if ($validated['result'] === 'passed') {
                $workOrder->update(['rfu_status' => 'waiting_inspection']);
                return redirect()->back()->with('success', "Inspeksi QC {$inspNumber} PASSED (LULUS). Unit siap untuk proses Approval RFU resmi.");
            } else {
                $workOrder->update([
                    'status' => 'in_progress',
                    'rfu_status' => 'inspection_failed',
                ]);
                return redirect()->back()->with('error', "Inspeksi QC {$inspNumber} TIDAK LULUS ({$validated['result']}). Unit dikembalikan ke status In Progress untuk perbaikan ulang.");
            }
        });
    }

    /**
     * RFU Final Approval Action
     */
    public function approveRfu(Request $request, ?WorkOrder $workOrder = null)
    {
        if (!$workOrder || !$workOrder->exists) {
            $woId = $request->input('work_order_id');
            $workOrder = WorkOrder::findOrFail($woId);
        }

        $request->merge([
            'decision' => $request->input('decision') ?? 'approved_rfu',
            'approval_notes' => $request->input('approval_notes') ?? $request->input('notes') ?? 'Unit dinyatakan Ready For Use (RFU).',
        ]);

        $validated = $request->validate([
            'approver_id' => 'required|exists:employees,id',
            'decision' => 'required|in:approved_rfu,rejected_rfu',
            'approval_notes' => 'required|string|min:5',
        ]);

        // STRICT BUSINESS RULE 1: Mechanic cannot approve their own work order!
        $isAssignedMechanic = ($workOrder->assigned_mechanic_id && (int) $workOrder->assigned_mechanic_id === (int) $validated['approver_id'])
            || $workOrder->assignments()->where('mechanic_id', $validated['approver_id'])->exists();

        if ($isAssignedMechanic) {
            return redirect()->back()->with('error', 'Pelanggaran SOP: Mekanik pelaksana dilarang menyetujui RFU atas pekerjaannya sendiri! Approval harus dilakukan oleh Maintenance Planner, Supervisor, atau Pejabat berwenang.');
        }

        // STRICT BUSINESS RULE 2: Critical breakdown cannot return to service without a passed inspection!
        $latestPassedInspection = $workOrder->inspections()->where('result', 'passed')->latest()->first();
        if (!$latestPassedInspection && $validated['decision'] === 'approved_rfu') {
            return redirect()->back()->with('error', 'Gagal: Unit tidak boleh dinyatakan RFU tanpa lolos pemeriksaan/inspeksi QC fisik terlebih dahulu!');
        }

        // STRICT BUSINESS RULE 3: Prevent duplicate RFU approval on already approved WorkOrder
        if ($workOrder->rfu_status === 'approved_rfu' && $validated['decision'] === 'approved_rfu') {
            return redirect()->back()->with('error', 'Work Order ini sudah mendapatkan persetujuan RFU sebelumnya.');
        }

        return DB::transaction(function () use ($workOrder, $validated, $latestPassedInspection) {
            $now = Carbon::now();
            $sigHash = hash('sha256', 'RFU-' . $workOrder->wo_number . $validated['decision'] . $now->timestamp);

            RfuApproval::create([
                'work_order_id' => $workOrder->id,
                'unit_id' => $workOrder->unit_id,
                'maintenance_inspection_id' => $latestPassedInspection?->id,
                'approver_id' => $validated['approver_id'],
                'approval_date' => $now,
                'decision' => $validated['decision'],
                'approval_notes' => $validated['approval_notes'],
                'signature_hash' => $sigHash,
            ]);

            if ($validated['decision'] === 'approved_rfu') {
                $startTime = $workOrder->breakdown_time ? Carbon::parse($workOrder->breakdown_time) : $now;
                $downtimeMin = (int) abs($now->diffInMinutes($startTime));

                $workOrder->update([
                    'status' => 'completed',
                    'rfu_status' => 'approved_rfu',
                    'completion_time' => $now,
                    'actual_completion_date' => $now,
                    'downtime_minutes' => max(1, $downtimeMin),
                ]);

                // CRITICAL RULE: Restore Unit to STANDBY (RFU Ready), NOT automatically Operating!
                $workOrder->unit->update(['status' => 'standby']);

                return redirect()->back()->with('success', "OTORISASI RFU SUKSES: Armada {$workOrder->unit->unit_code} dinyatakan SIAP OPERASI (RFU), status unit dipulihkan ke STANDBY, dan siap dipertimbangkan untuk Daily Dispatch oleh Foreman.");
            } else {
                $workOrder->update([
                    'status' => 'in_progress',
                    'rfu_status' => 'rejected_rfu',
                ]);
                $workOrder->unit->update(['status' => 'breakdown']);

                return redirect()->back()->with('warning', "Otorisasi RFU ditolak. Unit {$workOrder->unit->unit_code} dikembalikan ke status BREAKDOWN untuk perbaikan lanjutan.");
            }
        });
    }
}
