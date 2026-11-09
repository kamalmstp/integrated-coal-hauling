<?php

namespace App\Http\Controllers;

use App\Models\Driver;
use App\Models\DriverTraining;
use App\Models\EmployeeTransfer;
use App\Models\Site;
use App\Models\Unit;
use App\Services\HrManagementService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HrDriverManagementController extends Controller
{
    public function index(Request $request, HrManagementService $hrService)
    {
        $siteId = $request->input('site_id');
        $eligibility = $request->input('eligibility');
        $search = $request->input('search');

        $drivers = Driver::with([
            'employee:id,employee_code,name,site_id,department_id,position_id,phone,employment_status,is_active',
            'employee.site:id,code,name',
            'employee.department:id,code,name',
            'employee.transfers.fromSite:id,code,name',
            'employee.transfers.toSite:id,code,name',
            'assignedUnit:id,unit_code,brand,model,site_id,status',
            'trainings',
        ])
            ->when($siteId, fn ($q) => $q->whereHas('employee', fn ($eq) => $eq->where('site_id', $siteId)))
            ->when($eligibility, fn ($q) => $q->where('administrative_eligibility_status', $eligibility))
            ->when($search, function ($q, $s) {
                $q->where(function ($sub) use ($s) {
                    $sub->where('driver_code', 'like', "%{$s}%")
                        ->orWhere('sim_number', 'like', "%{$s}%")
                        ->orWhere('simper_number', 'like', "%{$s}%")
                        ->orWhereHas('employee', fn ($eq) => $eq->where('name', 'like', "%{$s}%")->orWhere('employee_code', 'like', "%{$s}%"));
                });
            })
            ->orderBy('driver_code')
            ->get()
            ->map(function (Driver $d) use ($hrService) {
                $hrService->evaluateDriverEligibility($d);
                return $d;
            });

        $trainings = DriverTraining::with([
            'driver:id,driver_code,employee_id',
            'employee:id,employee_code,name',
            'site:id,code,name',
        ])
            ->when($siteId, fn ($q) => $q->where('site_id', $siteId))
            ->latest('training_date')
            ->limit(50)
            ->get();

        $driverSiteHistories = EmployeeTransfer::with([
            'employee:id,employee_code,name',
            'fromSite:id,code,name',
            'toSite:id,code,name',
        ])
            ->whereHas('employee.driver')
            ->when($siteId, function ($q, $sid) {
                $q->where(fn ($sub) => $sub->where('from_site_id', $sid)->orWhere('to_site_id', $sid));
            })
            ->latest('effective_date')
            ->limit(40)
            ->get();

        $units = Unit::where('is_active', true)
            ->when($siteId, fn ($q) => $q->where('site_id', $siteId))
            ->orderBy('unit_code')
            ->get(['id', 'unit_code', 'brand', 'model', 'site_id', 'status']);

        return Inertia::render('Hr/Drivers/Index', [
            'drivers' => $drivers,
            'trainings' => $trainings,
            'driverSiteHistories' => $driverSiteHistories,
            'units' => $units,
            'sites' => Site::where('is_active', true)->get(['id', 'code', 'name']),
            'filters' => [
                'site_id' => $siteId,
                'eligibility' => $eligibility,
                'search' => $search,
            ],
        ]);
    }

    public function updateCredentials(Request $request, Driver $driver, HrManagementService $hrService)
    {
        $validated = $request->validate([
            'sim_number' => 'required|string|max:50',
            'sim_type' => 'required|string|max:20',
            'sim_expiry' => 'required|date',
            'simper_number' => 'required|string|max:50',
            'simper_expiry' => 'required|date',
            'mcu_status' => 'required|in:fit,fit_with_note,unfit',
            'mcu_date' => 'required|date',
            'mcu_expiry' => 'required|date',
            'assigned_unit_id' => 'nullable|exists:units,id',
            'notes' => 'nullable|string|max:500',
        ]);

        $updated = $hrService->updateDriverCredentials($driver, $validated);

        return back()->with('notify', [
            'type' => 'success',
            'title' => 'Lisensi & Kelayakan Driver Diperbarui',
            'message' => "Status kelayakan administrasi {$updated->driver_code}: " . strtoupper($updated->administrative_eligibility_status),
        ]);
    }

    public function storeTraining(Request $request, Driver $driver, HrManagementService $hrService)
    {
        $validated = $request->validate([
            'site_id' => 'nullable|exists:sites,id',
            'training_name' => 'required|string|max:180',
            'training_category' => 'required|in:defensive_driving,safety_k3lh,unit_familiarization,fatigue_management,emergency_response',
            'provider' => 'nullable|string|max:120',
            'training_date' => 'required|date',
            'expiry_date' => 'nullable|date|after_or_equal:training_date',
            'score' => 'nullable|numeric|min:0|max:100',
            'certificate_number' => 'nullable|string|max:80',
            'status' => 'required|in:passed,in_progress,failed',
            'notes' => 'nullable|string|max:500',
        ]);

        $training = $hrService->recordDriverTraining($driver, $validated);

        return back()->with('notify', [
            'type' => 'success',
            'title' => 'Sertifikasi Training Driver Tercatat',
            'message' => "Training {$training->training_name} ({$training->training_code}) berhasil disimpan.",
        ]);
    }
}
