<?php

namespace App\Http\Controllers;

use App\Models\Driver;
use App\Models\DumpingTicket;
use App\Models\Employee;
use App\Models\FuelTank;
use App\Models\FuelTransaction;
use App\Models\Shift;
use App\Models\Site;
use App\Models\Unit;
use App\Services\FuelService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FuelDispensingController extends Controller
{
    public function index(Request $request)
    {
        $siteId = $request->input('site_id');
        $unitId = $request->input('unit_id');
        $tankId = $request->input('source_tank_id');
        $search = $request->input('search');

        $transactions = FuelTransaction::with([
            'site:id,name,code',
            'shift:id,name',
            'sourceTank:id,tank_number,tank_name,tank_type',
            'unit:id,unit_code,registration_number,brand,model',
            'driver.employee:id,name,employee_code',
            'fuelman:id,name,employee_code',
            'dumpingTicket:id,ticket_number,tonnage',
        ])
            ->where('transaction_type', 'dispensing')
            ->when($siteId, fn ($q) => $q->where('site_id', $siteId))
            ->when($unitId, fn ($q) => $q->where('unit_id', $unitId))
            ->when($tankId, fn ($q) => $q->where('source_tank_id', $tankId))
            ->when($search, function ($q) use ($search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('transaction_number', 'like', "%{$search}%")
                        ->orWhere('digital_ticket_code', 'like', "%{$search}%")
                        ->orWhereHas('unit', fn ($uq) => $uq->where('unit_code', 'like', "%{$search}%"));
                });
            })
            ->orderByDesc('transaction_date')
            ->orderByDesc('id')
            ->paginate(12)
            ->withQueryString();

        $allDisp = FuelTransaction::where('transaction_type', 'dispensing')
            ->where('status', 'completed')
            ->when($siteId, fn ($q) => $q->where('site_id', $siteId))
            ->get();

        return Inertia::render('Fuel/Dispensing/Index', [
            'transactions' => $transactions,
            'metrics' => [
                'total_transactions' => $allDisp->count(),
                'total_liters_dispensed' => round((float) $allDisp->sum('liters'), 2),
                'total_fuel_cost' => round((float) $allDisp->sum('total_cost'), 2),
                'average_liters_per_fill' => $allDisp->count() > 0 ? round((float) $allDisp->avg('liters'), 2) : 0,
            ],
            'filters' => [
                'site_id' => $siteId,
                'unit_id' => $unitId,
                'source_tank_id' => $tankId,
                'search' => $search,
            ],
            'master' => [
                'sites' => Site::where('is_active', true)->select('id', 'name', 'code')->get(),
                'shifts' => Shift::select('id', 'name')->get(),
                'tanks' => FuelTank::where('is_active', true)->select('id', 'site_id', 'tank_number', 'tank_name', 'tank_type', 'current_stock_liters')->get(),
                'units' => Unit::where('is_active', true)->select('id', 'site_id', 'unit_code', 'registration_number', 'brand', 'model', 'last_hm', 'last_km')->orderBy('unit_code')->get(),
                'drivers' => Driver::with('employee:id,name,employee_code,site_id')->where('is_active', true)->get(),
                'employees' => Employee::where('is_active', true)->select('id', 'site_id', 'name', 'employee_code')->get(),
                'tickets' => DumpingTicket::where('status', 'verified')->select('id', 'site_id', 'unit_id', 'ticket_number', 'tonnage', 'ticket_date')->orderByDesc('id')->limit(40)->get(),
            ],
        ]);
    }

    public function store(Request $request, FuelService $fuelService)
    {
        $validated = $request->validate([
            'site_id' => 'required|exists:sites,id',
            'shift_id' => 'nullable|exists:shifts,id',
            'source_tank_id' => 'required|exists:fuel_tanks,id',
            'unit_id' => 'required|exists:units,id',
            'driver_id' => 'nullable|exists:drivers,id',
            'fuelman_id' => 'nullable|exists:employees,id',
            'dumping_ticket_id' => 'nullable|exists:dumping_tickets,id',
            'reference_ticket_number' => 'nullable|string|max:60',
            'transaction_date' => 'required|date',
            'transaction_time' => 'required|string|max:10',
            'current_hm' => 'nullable|numeric|min:0',
            'current_km' => 'nullable|numeric|min:0',
            'liters' => 'required|numeric|min:0.01',
            'flowmeter_start' => 'nullable|numeric|min:0',
            'flowmeter_end' => 'nullable|numeric|min:0',
            'remarks' => 'nullable|string|max:500',
        ]);

        $tx = $fuelService->dispenseFuel($validated);

        return redirect()->back()->with('success', "Pengisian Solar {$tx->transaction_number} (Tiket Digital: {$tx->digital_ticket_code}) sebesar {$tx->liters} L untuk Unit {$tx->unit->unit_code} berhasil dicatat.");
    }

    public function ticket(FuelTransaction $fuelTransaction)
    {
        $fuelTransaction->load([
            'site',
            'shift',
            'sourceTank',
            'unit',
            'driver.employee',
            'fuelman',
            'dumpingTicket',
            'creator',
        ]);

        return Inertia::render('Fuel/Dispensing/Ticket', [
            'transaction' => $fuelTransaction,
        ]);
    }
}
