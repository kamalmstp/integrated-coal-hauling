<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Driver;
use App\Models\Employee;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DriverController extends Controller
{
    /**
     * Display listing of drivers with Server-Side Processing
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $mcuStatus = $request->input('mcu_status');
        $status = $request->input('status');
        $simType = $request->input('sim_type');
        $sortBy = $request->input('sort_by', 'created_at');
        $sortDirection = $request->input('sort_direction', 'desc');
        $perPage = (int) $request->input('per_page', 10);

        $allowedSorts = ['id', 'driver_code', 'sim_expiry', 'simper_expiry', 'mcu_status', 'is_active', 'created_at'];
        if (!in_array($sortBy, $allowedSorts)) {
            $sortBy = 'created_at';
        }

        $query = Driver::with(['employee.site', 'employee.department']);

        // Search
        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('driver_code', 'like', "%{$search}%")
                  ->orWhere('sim_number', 'like', "%{$search}%")
                  ->orWhere('simper_number', 'like', "%{$search}%")
                  ->orWhereHas('employee', function ($sub) use ($search) {
                      $sub->where('name', 'like', "%{$search}%")
                          ->orWhere('nik', 'like', "%{$search}%")
                          ->orWhere('phone', 'like', "%{$search}%");
                  });
            });
        }

        // Filters
        if (!empty($mcuStatus) && $mcuStatus !== 'all') {
            $query->where('mcu_status', $mcuStatus);
        }
        if (!empty($status) && $status !== 'all') {
            $query->where('is_active', $status === 'active');
        }
        if (!empty($simType) && $simType !== 'all') {
            $query->where('sim_type', $simType);
        }

        $query->orderBy($sortBy, $sortDirection === 'asc' ? 'asc' : 'desc');

        $drivers = $query->paginate($perPage)->withQueryString();

        // Get unassigned employees for driver assignment dropdown
        $availableEmployees = Employee::where('is_active', true)
            ->whereDoesntHave('driver')
            ->select('id', 'name', 'employee_code', 'nik')
            ->get();

        return Inertia::render('Drivers/Index', [
            'drivers' => $drivers,
            'filters' => [
                'search' => $search ?? '',
                'mcu_status' => $mcuStatus ?? 'all',
                'status' => $status ?? 'all',
                'sim_type' => $simType ?? 'all',
                'sort_by' => $sortBy,
                'sort_direction' => $sortDirection,
                'per_page' => $perPage,
            ],
            'availableEmployees' => $availableEmployees,
            'statistics' => [
                'total' => Driver::count(),
                'fit' => Driver::where('mcu_status', 'fit')->where('is_active', true)->count(),
                'fit_with_note' => Driver::where('mcu_status', 'fit_with_note')->count(),
                'unfit' => Driver::where('mcu_status', 'unfit')->count(),
            ],
        ]);
    }

    /**
     * Store new driver
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'driver_code' => 'required|string|max:50|unique:drivers,driver_code',
            'employee_id' => 'required|exists:employees,id|unique:drivers,employee_id',
            'sim_number' => 'required|string|max:50',
            'sim_type' => 'required|string|max:30',
            'sim_expiry' => 'required|date',
            'simper_number' => 'required|string|max:50',
            'simper_expiry' => 'required|date',
            'mcu_status' => 'required|in:fit,unfit,fit_with_note',
            'mcu_date' => 'nullable|date',
            'mcu_expiry' => 'nullable|date',
            'notes' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $validated['created_by'] = auth()->id();
        $driver = Driver::create($validated);

        ActivityLog::log('create', 'driver', "Mendaftarkan driver baru: {$driver->driver_code}");

        notify()->success('Driver Berhasil Didaftarkan!', "Driver {$driver->driver_code} siap ditugaskan.");
        return redirect()->back();
    }

    /**
     * Update driver
     */
    public function update(Request $request, Driver $driver)
    {
        $validated = $request->validate([
            'driver_code' => "required|string|max:50|unique:drivers,driver_code,{$driver->id}",
            'employee_id' => "required|exists:employees,id|unique:drivers,employee_id,{$driver->id}",
            'sim_number' => 'required|string|max:50',
            'sim_type' => 'required|string|max:30',
            'sim_expiry' => 'required|date',
            'simper_number' => 'required|string|max:50',
            'simper_expiry' => 'required|date',
            'mcu_status' => 'required|in:fit,unfit,fit_with_note',
            'mcu_date' => 'nullable|date',
            'mcu_expiry' => 'nullable|date',
            'notes' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $validated['updated_by'] = auth()->id();
        $driver->update($validated);

        ActivityLog::log('update', 'driver', "Memperbarui data driver: {$driver->driver_code}");

        notify()->success('Data Driver Diperbarui!', "Data driver {$driver->driver_code} berhasil diperbarui.");
        return redirect()->back();
    }

    /**
     * Delete driver
     */
    public function destroy(Driver $driver)
    {
        $code = $driver->driver_code;
        $driver->delete();

        ActivityLog::log('delete', 'driver', "Menghapus driver: {$code}");

        notify()->success('Driver Dihapus!', "Data driver {$code} telah dihapus.");
        return redirect()->back();
    }
}
