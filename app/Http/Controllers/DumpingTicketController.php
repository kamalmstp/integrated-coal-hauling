<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Driver;
use App\Models\DumpingTicket;
use App\Models\Location;
use App\Models\Material;
use App\Models\Shift;
use App\Models\Site;
use App\Models\TicketCorrection;
use App\Models\Unit;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DumpingTicketController extends Controller
{
    public function index(Request $request)
    {
        $status = $request->input('status');
        $search = $request->input('search');
        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');
        $shiftId = $request->input('shift_id');
        $unitId = $request->input('unit_id');
        $driverId = $request->input('driver_id');

        $query = DumpingTicket::with([
            'unit:id,unit_code,registration_number,unit_type',
            'driver.employee:id,name',
            'loadingPoint:id,name,code',
            'dumpingPoint:id,name,code',
            'material:id,name,code,unit_of_measure',
            'shift:id,name,code',
            'site:id,name,code',
            'verifier:id,name',
            'rejecter:id,name',
            'creator:id,name',
            'corrections.requester:id,name',
        ]);

        if ($status) {
            $query->where('status', $status);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('ticket_number', 'like', "%{$search}%")
                  ->orWhere('checker_name', 'like', "%{$search}%")
                  ->orWhereHas('unit', fn($u) => $u->where('unit_code', 'like', "%{$search}%"))
                  ->orWhereHas('driver.employee', fn($e) => $e->where('name', 'like', "%{$search}%"));
            });
        }

        if ($dateFrom) {
            $query->whereDate('ticket_date', '>=', $dateFrom);
        }
        if ($dateTo) {
            $query->whereDate('ticket_date', '<=', $dateTo);
        }

        if ($shiftId) {
            $query->where('shift_id', $shiftId);
        }

        if ($unitId) {
            $query->where('unit_id', $unitId);
        }

        if ($driverId) {
            $query->where('driver_id', $driverId);
        }

        $tickets = $query->orderBy('dumping_time', 'desc')->paginate(15)->withQueryString();

        // Master records for filtering and creating
        $sites = Site::where('is_active', true)->select('id', 'name', 'code')->get();
        $units = Unit::where('is_active', true)->select('id', 'unit_code', 'unit_type', 'capacity_ton')->get();
        $drivers = Driver::with('employee:id,name')->where('is_active', true)->get();
        $loadingPoints = Location::whereIn('location_type', ['pit', 'front_loading'])->select('id', 'name', 'code')->get();
        $dumpingPoints = Location::whereIn('location_type', ['stockpile', 'jetty', 'disposal'])->select('id', 'name', 'code')->get();
        $materials = Material::where('is_active', true)->select('id', 'name', 'code', 'unit_of_measure')->get();
        $shifts = Shift::where('is_active', true)->select('id', 'name', 'code')->get();

        // KPI Counts
        $counts = [
            'total' => DumpingTicket::count(),
            'verified' => DumpingTicket::where('status', 'verified')->count(),
            'pending' => DumpingTicket::whereIn('status', ['submitted', 'pending_verification'])->count(),
            'rejected' => DumpingTicket::where('status', 'rejected')->count(),
            'corrected' => DumpingTicket::where('status', 'corrected')->count(),
            'total_production_ton' => DumpingTicket::verifiedProduction()->sum('tonnage'),
        ];

        return Inertia::render('Production/Tickets/Index', [
            'tickets' => $tickets,
            'filters' => [
                'status' => $status,
                'search' => $search,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'shift_id' => $shiftId,
                'unit_id' => $unitId,
                'driver_id' => $driverId,
            ],
            'counts' => $counts,
            'master' => [
                'sites' => $sites,
                'units' => $units,
                'drivers' => $drivers,
                'loading_points' => $loadingPoints,
                'dumping_points' => $dumpingPoints,
                'materials' => $materials,
                'shifts' => $shifts,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'ticket_number' => 'required|string|max:50|unique:dumping_tickets,ticket_number',
            'ticket_date' => 'required|date',
            'dumping_time' => 'required|date_format:H:i',
            'site_id' => 'required|exists:sites,id',
            'unit_id' => 'required|exists:units,id',
            'driver_id' => 'required|exists:drivers,id',
            'loading_point_id' => 'required|exists:locations,id',
            'dumping_point_id' => 'required|exists:locations,id',
            'material_id' => 'required|exists:materials,id',
            'shift_id' => 'required|exists:shifts,id',
            'tonnage' => 'required|numeric|min:0.01',
            'gross_weight' => 'nullable|numeric|min:0',
            'tare_weight' => 'nullable|numeric|min:0',
            'checker_name' => 'required|string|max:100',
            'remarks' => 'nullable|string',
            'attachment' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
        ]);

        return DB::transaction(function () use ($validated, $request) {
            $attachmentPath = null;
            if ($request->hasFile('attachment')) {
                $attachmentPath = $request->file('attachment')->store('dumping_tickets', 'public');
            }

            $dumpingDateTime = Carbon::parse($validated['ticket_date'] . ' ' . $validated['dumping_time']);

            $ticket = DumpingTicket::create([
                'ticket_number' => $validated['ticket_number'],
                'ticket_date' => $validated['ticket_date'],
                'dumping_time' => $dumpingDateTime,
                'site_id' => $validated['site_id'],
                'unit_id' => $validated['unit_id'],
                'driver_id' => $validated['driver_id'],
                'loading_point_id' => $validated['loading_point_id'],
                'dumping_point_id' => $validated['dumping_point_id'],
                'material_id' => $validated['material_id'],
                'shift_id' => $validated['shift_id'],
                'tonnage' => $validated['tonnage'],
                'gross_weight' => $validated['gross_weight'] ?? ($validated['tonnage'] + 14.50),
                'tare_weight' => $validated['tare_weight'] ?? 14.50,
                'checker_name' => $validated['checker_name'],
                'source' => 'manual',
                'status' => 'submitted',
                'remarks' => $validated['remarks'] ?? null,
                'attachment_path' => $attachmentPath,
                'is_production' => false, // Will become true upon verification
                'created_by' => Auth::id(),
            ]);

            ActivityLog::create([
                'user_id' => Auth::id(),
                'action' => 'create',
                'module' => 'dumping_ticket',
                'description' => "Tiket Dumping {$ticket->ticket_number} dibuat dengan tonase {$ticket->tonnage} Ton.",
                'properties' => $ticket->toArray(),
            ]);

            return redirect()->back()->with('success', "Tiket dumping {$ticket->ticket_number} berhasil diinput dan masuk antrean verifikasi.");
        });
    }

    public function show(DumpingTicket $ticket)
    {
        $ticket->load([
            'unit',
            'driver.employee',
            'loadingPoint',
            'dumpingPoint',
            'material',
            'shift',
            'site',
            'verifier',
            'rejecter',
            'creator',
            'corrections.requester',
            'corrections.approver',
            'importBatch',
        ]);

        return response()->json($ticket);
    }

    /**
     * Dedicated Ticket Verification Queue Page
     */
    public function verificationQueue(Request $request)
    {
        $query = DumpingTicket::with([
            'unit:id,unit_code,registration_number,unit_type',
            'driver.employee:id,name',
            'loadingPoint:id,name,code',
            'dumpingPoint:id,name,code',
            'material:id,name,code',
            'shift:id,name,code',
            'creator:id,name',
        ])->whereIn('status', ['submitted', 'pending_verification']);

        if ($request->filled('date')) {
            $query->whereDate('ticket_date', $request->input('date'));
        }

        if ($request->filled('shift_id')) {
            $query->where('shift_id', $request->input('shift_id'));
        }

        $pendingTickets = $query->orderBy('dumping_time', 'asc')->paginate(20)->withQueryString();

        $shifts = Shift::where('is_active', true)->get();

        return Inertia::render('Production/Tickets/Verification', [
            'pendingTickets' => $pendingTickets,
            'filters' => [
                'date' => $request->input('date'),
                'shift_id' => $request->input('shift_id'),
            ],
            'shifts' => $shifts,
        ]);
    }

    /**
     * Verify ticket action (Sets status to verified & is_production to true).
     */
    public function verify(Request $request, DumpingTicket $ticket)
    {
        if ($ticket->status === 'verified') {
            return redirect()->back()->with('error', 'Tiket ini sudah dalam status terverifikasi.');
        }

        return DB::transaction(function () use ($ticket) {
            $ticket->update([
                'status' => 'verified',
                'is_production' => true,
                'verified_by' => Auth::id(),
                'verified_at' => Carbon::now(),
                'rejected_by' => null,
                'rejected_at' => null,
                'rejection_reason' => null,
                'updated_by' => Auth::id(),
            ]);

            ActivityLog::create([
                'user_id' => Auth::id(),
                'action' => 'verify',
                'module' => 'dumping_ticket',
                'description' => "Tiket Dumping {$ticket->ticket_number} disetujui (VERIFIED) sebagai data produksi resmi.",
                'properties' => ['ticket_id' => $ticket->id, 'tonnage' => $ticket->tonnage],
            ]);

            return redirect()->back()->with('success', "Tiket {$ticket->ticket_number} berhasil diverifikasi dan masuk rekap produksi resmi.");
        });
    }

    /**
     * Batch verify multiple tickets.
     */
    public function batchVerify(Request $request)
    {
        $validated = $request->validate([
            'ticket_ids' => 'required|array|min:1',
            'ticket_ids.*' => 'exists:dumping_tickets,id',
        ]);

        return DB::transaction(function () use ($validated) {
            $count = DumpingTicket::whereIn('id', $validated['ticket_ids'])
                ->where('status', '!=', 'verified')
                ->update([
                    'status' => 'verified',
                    'is_production' => true,
                    'verified_by' => Auth::id(),
                    'verified_at' => Carbon::now(),
                    'updated_by' => Auth::id(),
                ]);

            ActivityLog::create([
                'user_id' => Auth::id(),
                'action' => 'batch_verify',
                'module' => 'dumping_ticket',
                'description' => "Verifikasi massal {$count} tiket dumping.",
                'properties' => ['ticket_ids' => $validated['ticket_ids']],
            ]);

            return redirect()->back()->with('success', "{$count} tiket berhasil diverifikasi massal.");
        });
    }

    /**
     * Reject ticket action (Requires reason, is_production remains false).
     */
    public function reject(Request $request, DumpingTicket $ticket)
    {
        $validated = $request->validate([
            'rejection_reason' => 'required|string|min:5|max:500',
        ]);

        return DB::transaction(function () use ($ticket, $validated) {
            $ticket->update([
                'status' => 'rejected',
                'is_production' => false, // CANNOT count in production
                'rejected_by' => Auth::id(),
                'rejected_at' => Carbon::now(),
                'rejection_reason' => $validated['rejection_reason'],
                'updated_by' => Auth::id(),
            ]);

            ActivityLog::create([
                'user_id' => Auth::id(),
                'action' => 'reject',
                'module' => 'dumping_ticket',
                'description' => "Tiket Dumping {$ticket->ticket_number} ditolak. Alasan: {$validated['rejection_reason']}",
                'properties' => ['ticket_id' => $ticket->id, 'reason' => $validated['rejection_reason']],
            ]);

            return redirect()->back()->with('success', "Tiket {$ticket->ticket_number} telah ditolak dan tidak dihitung dalam produksi.");
        });
    }

    /**
     * Correct ticket action (Must provide reason and create audit trail).
     */
    public function correct(Request $request, DumpingTicket $ticket)
    {
        $validated = $request->validate([
            'reason' => 'required|string|min:5',
            'tonnage' => 'required|numeric|min:0.01',
            'unit_id' => 'required|exists:units,id',
            'driver_id' => 'required|exists:drivers,id',
            'loading_point_id' => 'required|exists:locations,id',
            'dumping_point_id' => 'required|exists:locations,id',
            'material_id' => 'required|exists:materials,id',
            'shift_id' => 'required|exists:shifts,id',
            'remarks' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($ticket, $validated) {
            $oldData = [
                'tonnage' => $ticket->tonnage,
                'unit_id' => $ticket->unit_id,
                'driver_id' => $ticket->driver_id,
                'loading_point_id' => $ticket->loading_point_id,
                'dumping_point_id' => $ticket->dumping_point_id,
                'material_id' => $ticket->material_id,
                'shift_id' => $ticket->shift_id,
                'remarks' => $ticket->remarks,
            ];

            $newData = [
                'tonnage' => $validated['tonnage'],
                'unit_id' => $validated['unit_id'],
                'driver_id' => $validated['driver_id'],
                'loading_point_id' => $validated['loading_point_id'],
                'dumping_point_id' => $validated['dumping_point_id'],
                'material_id' => $validated['material_id'],
                'shift_id' => $validated['shift_id'],
                'remarks' => $validated['remarks'] ?? $ticket->remarks,
            ];

            // Record in ticket corrections audit table
            TicketCorrection::create([
                'dumping_ticket_id' => $ticket->id,
                'requested_by' => Auth::id(),
                'approved_by' => Auth::id(),
                'old_data' => $oldData,
                'new_data' => $newData,
                'reason' => $validated['reason'],
                'status' => 'approved',
            ]);

            // Update ticket
            $ticket->update(array_merge($newData, [
                'status' => 'corrected',
                'is_production' => true, // Still verified/production with corrected figures
                'updated_by' => Auth::id(),
            ]));

            ActivityLog::create([
                'user_id' => Auth::id(),
                'action' => 'correct',
                'module' => 'dumping_ticket',
                'description' => "Koreksi tiket {$ticket->ticket_number}. Alasan: {$validated['reason']}",
                'properties' => ['old' => $oldData, 'new' => $newData],
            ]);

            return redirect()->back()->with('success', "Tiket {$ticket->ticket_number} berhasil dikoreksi dan riwayat tersimpan di audit trail.");
        });
    }
}
