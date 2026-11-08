<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\JobCard;
use App\Models\JobCardChecklist;
use App\Models\Site;
use App\Models\Unit;
use App\Models\WorkOrder;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class JobCardController extends Controller
{
    public function index(Request $request)
    {
        $siteId = $request->input('site_id');
        $unitId = $request->input('unit_id');
        $status = $request->input('status');
        $search = $request->input('search');

        $query = JobCard::with([
            'workOrder:id,wo_number,job_type,priority,status,breakdown_time,completion_time,actual_cost',
            'unit:id,unit_code,registration_number,unit_type',
            'site:id,name,code',
            'leadMechanic:id,name,employee_code',
            'supervisor:id,name',
            'checklists',
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
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('job_card_number', 'like', "%{$search}%")
                  ->orWhere('initial_complaint', 'like', "%{$search}%")
                  ->orWhere('work_performed', 'like', "%{$search}%")
                  ->orWhereHas('workOrder', fn($wq) => $wq->where('wo_number', 'like', "%{$search}%"))
                  ->orWhereHas('unit', fn($uq) => $uq->where('unit_code', 'like', "%{$search}%"));
            });
        }

        $jobCards = $query->orderBy('issue_date', 'desc')->paginate(12)->withQueryString();

        $sites = Site::where('is_active', true)->select('id', 'name', 'code')->get();
        $units = Unit::where('is_active', true)->select('id', 'unit_code', 'unit_type', 'status')->get();
        $employees = Employee::where('is_active', true)->select('id', 'name', 'employee_code')->get();

        return Inertia::render('Maintenance/JobCards/Index', [
            'jobCards' => $jobCards,
            'filters' => [
                'site_id' => $siteId,
                'unit_id' => $unitId,
                'status' => $status,
                'search' => $search,
            ],
            'master' => [
                'sites' => $sites,
                'units' => $units,
                'employees' => $employees,
            ],
        ]);
    }

    public function show(JobCard $jobCard)
    {
        $jobCard->load([
            'workOrder.assignments.mechanic',
            'workOrder.tasks',
            'workOrder.mechanicLogs.mechanic',
            'workOrder.sparepartRequests.items',
            'workOrder.costs',
            'workOrder.latestInspection',
            'unit',
            'site',
            'leadMechanic',
            'supervisor',
            'checklists',
        ]);

        return response()->json($jobCard);
    }

    public function updateChecklist(Request $request, JobCardChecklist $checklist)
    {
        $isChecked = $request->boolean('is_checked');
        $checklist->update([
            'is_checked' => $isChecked,
            'checked_by' => $isChecked ? (Auth::user()->employee_id ?? null) : null,
            'notes' => $request->input('notes', $checklist->notes),
        ]);

        return redirect()->back()->with('success', 'Status checklist Job Card diperbarui.');
    }

    public function supervisorSignOff(Request $request, JobCard $jobCard)
    {
        $validated = $request->validate([
            'supervisor_id' => 'required|exists:employees,id',
            'supervisor_notes' => 'required|string|min:5',
        ]);

        $jobCard->update([
            'supervisor_id' => $validated['supervisor_id'],
            'supervisor_notes' => $validated['supervisor_notes'],
            'supervisor_inspected_at' => Carbon::now(),
            'status' => 'signed_off',
        ]);

        return redirect()->back()->with('success', "Job Card {$jobCard->job_card_number} berhasil disetujui & ditandatangani oleh Supervisor.");
    }

    /**
     * Printable Job Card View (Clean layout ready for browser print / Save as PDF)
     */
    public function print(JobCard $jobCard)
    {
        $jobCard->load([
            'workOrder.assignments.mechanic',
            'workOrder.sparepartRequests.items',
            'workOrder.costs',
            'workOrder.latestInspection',
            'unit.site',
            'unit.vendor',
            'site',
            'leadMechanic',
            'supervisor',
            'checklists',
        ]);

        return Inertia::render('Maintenance/JobCards/Print', [
            'jobCard' => $jobCard,
        ]);
    }
}
