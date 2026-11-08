<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\JobCard;
use App\Models\JobCardChecklist;
use App\Models\MaintenanceSchedule;
use App\Models\Site;
use App\Models\Unit;
use App\Models\WorkOrder;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PreventiveMaintenanceController extends Controller
{
    public function index(Request $request)
    {
        $siteId = $request->input('site_id');
        $unitId = $request->input('unit_id');
        $status = $request->input('status');
        $serviceType = $request->input('service_type');

        $query = MaintenanceSchedule::with([
            'unit:id,unit_code,registration_number,unit_type,status,last_hm,last_km,site_id',
            'site:id,name,code',
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
        if ($serviceType) {
            $query->where('service_type', $serviceType);
        }

        $schedules = $query->orderBy('status', 'desc')
            ->orderBy('next_due_hm', 'asc')
            ->paginate(15)
            ->withQueryString();

        // Calculate and re-evaluate statuses based on latest unit HM/KM
        $allSchedules = MaintenanceSchedule::with('unit')->get();
        foreach ($allSchedules as $sched) {
            if ($sched->unit && $sched->schedule_basis === 'hm' && $sched->next_due_hm) {
                $rem = (float) $sched->next_due_hm - (float) $sched->unit->last_hm;
                $newStatus = 'normal';
                if ($rem <= 0) {
                    $newStatus = 'overdue';
                } elseif ($rem <= 40) {
                    $newStatus = 'due_soon';
                }
                if ($sched->status !== 'in_service' && $sched->status !== $newStatus) {
                    $sched->update(['status' => $newStatus]);
                }
            }
        }

        // PM Completion Rate calculation:
        $totalPmOrders = WorkOrder::where('job_type', 'preventive_maintenance')->count();
        $completedPmOrders = WorkOrder::where('job_type', 'preventive_maintenance')->where('status', 'completed')->count();
        $pmCompletionRate = $totalPmOrders > 0 ? round(($completedPmOrders / $totalPmOrders) * 100, 1) : 100;

        $metrics = [
            'total_schedules' => $allSchedules->count(),
            'normal' => $allSchedules->where('status', 'normal')->count(),
            'due_soon' => $allSchedules->where('status', 'due_soon')->count(),
            'overdue' => $allSchedules->where('status', 'overdue')->count(),
            'in_service' => $allSchedules->where('status', 'in_service')->count(),
            'pm_completion_rate' => $pmCompletionRate,
            'completed_pm' => $completedPmOrders,
            'total_pm' => $totalPmOrders,
        ];

        // PM History: past completed PM work orders
        $pmHistory = WorkOrder::with(['unit', 'mechanic'])
            ->where('job_type', 'preventive_maintenance')
            ->where('status', 'completed')
            ->orderBy('completion_time', 'desc')
            ->take(10)
            ->get();

        $sites = Site::where('is_active', true)->select('id', 'name', 'code')->get();
        $units = Unit::where('is_active', true)->select('id', 'unit_code', 'unit_type', 'status', 'last_hm', 'last_km', 'site_id')->get();
        $mechanics = Employee::where('is_active', true)->select('id', 'name', 'employee_code')->get();

        return Inertia::render('Maintenance/Preventive/Index', [
            'schedules' => $schedules,
            'metrics' => $metrics,
            'pmHistory' => $pmHistory,
            'filters' => [
                'site_id' => $siteId,
                'unit_id' => $unitId,
                'status' => $status,
                'service_type' => $serviceType,
            ],
            'master' => [
                'sites' => $sites,
                'units' => $units,
                'mechanics' => $mechanics,
            ],
        ]);
    }

    public function generateWorkOrder(Request $request, MaintenanceSchedule $schedule)
    {
        $unit = $schedule->unit;

        if (!$unit->last_hm || $unit->last_hm <= 0) {
            return redirect()->back()->with('error', "Peringatan Validasi: Armada {$unit->unit_code} belum memiliki data HM aktual yang valid! Mohon lengkapi catatan log HM/KM sebelum menerbitkan SPK Servis PM.");
        }

        // Prevent duplicate open PM work orders for the same unit and service type
        $existingOpenWo = WorkOrder::where('unit_id', $unit->id)
            ->where('job_type', 'preventive_maintenance')
            ->whereIn('status', ['open', 'submitted', 'assigned', 'in_progress', 'waiting_sparepart'])
            ->first();

        if ($existingOpenWo) {
            return redirect()->back()->with('error', "Gagal: Armada {$unit->unit_code} sudah memiliki Work Order PM aktif ({$existingOpenWo->wo_number})! Duplikasi perintah servis dicegah.");
        }

        $validated = $request->validate([
            'assigned_mechanic_id' => 'required|exists:employees,id',
            'target_completion_date' => 'nullable|date',
            'estimated_cost' => 'nullable|numeric|min:0',
        ]);

        return DB::transaction(function () use ($schedule, $unit, $validated) {
            $woNumber = 'WO-PM-' . Carbon::now()->format('Ym') . '-' . rand(100, 999);

            $wo = WorkOrder::create([
                'wo_number' => $woNumber,
                'site_id' => $schedule->site_id,
                'unit_id' => $unit->id,
                'source' => 'scheduled_pm',
                'job_type' => 'preventive_maintenance',
                'priority' => $schedule->status === 'overdue' ? 'high' : 'medium',
                'breakdown_time' => Carbon::now(),
                'target_completion_date' => $validated['target_completion_date'] ?? Carbon::now()->addDay(),
                'hm_at_service' => $unit->last_hm,
                'km_at_service' => $unit->last_km ?: 0,
                'initial_complaint' => "Pelaksanaan Servis Berkala {$schedule->service_type} ({$schedule->interval_value} HM)",
                'defect_summary' => "Program Servis Berkala {$schedule->service_type} pada HM " . number_format($unit->last_hm, 1),
                'assigned_mechanic_id' => $validated['assigned_mechanic_id'],
                'estimated_cost' => $validated['estimated_cost'] ?? 3500000,
                'status' => 'assigned',
                'rfu_status' => 'repair_in_progress',
                'approval_status' => 'approved',
                'created_by' => Auth::id(),
            ]);

            // Create Job Card
            $jc = JobCard::create([
                'job_card_number' => 'JC-' . Carbon::now()->format('Ym') . '-' . rand(100, 999),
                'work_order_id' => $wo->id,
                'site_id' => $schedule->site_id,
                'unit_id' => $unit->id,
                'issue_date' => Carbon::today()->toDateString(),
                'initial_complaint' => "Servis Berkala {$schedule->service_type}",
                'lead_mechanic_id' => $validated['assigned_mechanic_id'],
                'status' => 'active',
            ]);

            // Seed Standard PM Checklists
            $standardPmItems = [
                ['item' => 'Ganti Oli Mesin 15W-40 (Kapasitas 28 Liter)', 'cat' => 'Engine & Lubrication'],
                ['item' => 'Ganti Filter Oli Mesin (Spin-on Type)', 'cat' => 'Filters'],
                ['item' => 'Ganti Filter Bahan Bakar Primary & Secondary', 'cat' => 'Fuel System'],
                ['item' => 'Pembersihan / Penggantian Air Filter Element', 'cat' => 'Air Intake'],
                ['item' => 'Greasing / Pelumasan Seluruh Nipple Chassis & Propeller Shaft', 'cat' => 'Lubrication'],
                ['item' => 'Pemeriksaan Kekencangan Baut Roda (Torque Check 600 Nm)', 'cat' => 'Wheels & Safety'],
                ['item' => 'Pemeriksaan Level Air Radiator Coolant & Uji Kebocoran', 'cat' => 'Cooling System'],
                ['item' => 'Pemeriksaan Ketebalan Kampas Rem (Brake Lining)', 'cat' => 'Brake System'],
            ];

            foreach ($standardPmItems as $chk) {
                JobCardChecklist::create([
                    'job_card_id' => $jc->id,
                    'item_name' => $chk['item'],
                    'category' => $chk['cat'],
                    'is_checked' => false,
                ]);
            }

            // Update schedule status to in_service
            $schedule->update([
                'status' => 'in_service',
                'last_service_date' => Carbon::today(),
                'last_service_hm' => $unit->last_hm,
            ]);

            $unit->update(['status' => 'maintenance']);

            return redirect()->back()->with('success', "Work Order PM {$woNumber} berhasil diterbitkan dengan 8 item checklist wajib.");
        });
    }

    public function storeSchedule(Request $request)
    {
        $validated = $request->validate([
            'site_id' => 'required|exists:sites,id',
            'unit_id' => 'required|exists:units,id',
            'service_type' => 'required|string|max:50',
            'schedule_basis' => 'required|in:hm,km,calendar',
            'interval_value' => 'required|integer|min:1',
            'next_due_hm' => 'nullable|numeric|min:0',
            'next_due_date' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        MaintenanceSchedule::create($validated);

        return redirect()->back()->with('success', 'Jadwal Preventative Maintenance berhasil ditambahkan.');
    }
}
