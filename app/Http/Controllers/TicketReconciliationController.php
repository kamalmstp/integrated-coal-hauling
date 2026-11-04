<?php

namespace App\Http\Controllers;

use App\Models\DumpingTicket;
use App\Models\ReconciliationItem;
use App\Models\Site;
use App\Models\TicketReconciliation;
use App\Services\ExcelCsvImportService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TicketReconciliationController extends Controller
{
    protected ExcelCsvImportService $importService;

    public function __construct(ExcelCsvImportService $importService)
    {
        $this->importService = $importService;
    }

    public function index(Request $request)
    {
        $status = $request->input('status');
        $siteId = $request->input('site_id');

        $query = TicketReconciliation::with(['site:id,name,code', 'reconciler:id,name'])
            ->withCount([
                'items as total_items',
                'items as matched_items_count' => fn($q) => $q->where('match_status', 'match'),
                'items as discrepancy_items_count' => fn($q) => $q->where('match_status', '!=', 'match'),
            ]);

        if ($status) {
            $query->where('status', $status);
        }
        if ($siteId) {
            $query->where('site_id', $siteId);
        }

        $reconciliations = $query->orderBy('created_at', 'desc')->paginate(10);
        $sites = Site::where('is_active', true)->select('id', 'name', 'code')->get();

        return Inertia::render('Production/Reconciliation/Index', [
            'reconciliations' => $reconciliations,
            'filters' => [
                'status' => $status,
                'site_id' => $siteId,
            ],
            'sites' => $sites,
        ]);
    }

    public function show(TicketReconciliation $reconciliation, Request $request)
    {
        $matchFilter = $request->input('match_status');

        $reconciliation->load(['site', 'reconciler']);

        $itemsQuery = $reconciliation->items()->with(['dumpingTicket.unit', 'dumpingTicket.driver.employee']);

        if ($matchFilter && $matchFilter !== 'all') {
            $itemsQuery->where('match_status', $matchFilter);
        }

        $items = $itemsQuery->paginate(20)->withQueryString();

        $itemCounts = [
            'all' => $reconciliation->items()->count(),
            'match' => $reconciliation->items()->where('match_status', 'match')->count(),
            'tonnage_diff' => $reconciliation->items()->where('match_status', 'tonnage_diff')->count(),
            'unit_diff' => $reconciliation->items()->where('match_status', 'unit_diff')->count(),
            'missing_in_tap' => $reconciliation->items()->where('match_status', 'missing_in_tap')->count(),
            'missing_in_jsi' => $reconciliation->items()->where('match_status', 'missing_in_jsi')->count(),
            'duplicate' => $reconciliation->items()->where('match_status', 'duplicate')->count(),
        ];

        return Inertia::render('Production/Reconciliation/Detail', [
            'reconciliation' => $reconciliation,
            'items' => $items,
            'filters' => [
                'match_status' => $matchFilter ?? 'all',
            ],
            'counts' => $itemCounts,
        ]);
    }

    /**
     * Create automated reconciliation comparing TAP tickets with uploaded JSI file or database records.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'site_id' => 'required|exists:sites,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'jsi_file' => 'nullable|file|mimes:csv,txt,xlsx|max:10240',
        ]);

        return DB::transaction(function () use ($validated, $request) {
            $reconciliationCode = 'REC-' . Carbon::parse($validated['start_date'])->format('Ymd') . '-' . rand(100, 999);
            $fileName = $request->hasFile('jsi_file') ? $request->file('jsi_file')->getClientOriginalName() : 'AUTO_DATABASE_CHECK';

            // Query TAP tickets in date range
            $tapTickets = DumpingTicket::with(['unit'])
                ->where('site_id', $validated['site_id'])
                ->whereDate('ticket_date', '>=', $validated['start_date'])
                ->whereDate('ticket_date', '<=', $validated['end_date'])
                ->get()
                ->keyBy('ticket_number');

            $jsiRows = [];
            if ($request->hasFile('jsi_file')) {
                $preview = $this->importService->previewFile($request->file('jsi_file'));
                $jsiRows = $preview['rows'];
            }

            // Create Master Reconciliation Record
            $rec = TicketReconciliation::create([
                'reconciliation_code' => $reconciliationCode,
                'site_id' => $validated['site_id'],
                'start_date' => $validated['start_date'],
                'end_date' => $validated['end_date'],
                'source_file_name' => $fileName,
                'total_tap_tickets' => $tapTickets->count(),
                'total_tap_tonnage' => $tapTickets->sum('tonnage'),
                'total_jsi_tickets' => count($jsiRows),
                'total_jsi_tonnage' => array_sum(array_column($jsiRows, 'tonnage')),
                'status' => 'in_review',
                'reconciled_by' => Auth::id(),
                'reconciled_at' => Carbon::now(),
                'created_by' => Auth::id(),
            ]);

            $matchedCount = 0;
            $matchedTonnage = 0;
            $discrepancyCount = 0;
            $discrepancyTonnage = 0;
            $missingInTapCount = 0;
            $missingInJsiCount = 0;

            $matchedTapTicketNumbers = [];

            // Process JSI rows
            foreach ($jsiRows as $jsiRow) {
                $ticketNum = $jsiRow['ticket_number'];
                $jsiTon = floatval($jsiRow['tonnage']);
                $jsiUnit = $jsiRow['unit_code'];

                if (isset($tapTickets[$ticketNum])) {
                    $tap = $tapTickets[$ticketNum];
                    $matchedTapTicketNumbers[] = $ticketNum;
                    $tapTon = floatval($tap->tonnage);
                    $tonDiff = round($jsiTon - $tapTon, 2);
                    $tapUnit = $tap->unit?->unit_code ?? '';

                    $matchStatus = 'match';
                    if (abs($tonDiff) > 0.05) {
                        $matchStatus = 'tonnage_diff';
                    } elseif ($tapUnit !== '' && strtoupper($tapUnit) !== strtoupper($jsiUnit)) {
                        $matchStatus = 'unit_diff';
                    }

                    if ($matchStatus === 'match') {
                        $matchedCount++;
                        $matchedTonnage += $tapTon;
                    } else {
                        $discrepancyCount++;
                        $discrepancyTonnage += abs($tonDiff);
                    }

                    ReconciliationItem::create([
                        'reconciliation_id' => $rec->id,
                        'dumping_ticket_id' => $tap->id,
                        'jsi_ticket_number' => $ticketNum,
                        'tap_ticket_number' => $ticketNum,
                        'ticket_date' => $tap->ticket_date->toDateString(),
                        'jsi_tonnage' => $jsiTon,
                        'tap_tonnage' => $tapTon,
                        'tonnage_diff' => $tonDiff,
                        'jsi_unit_code' => $jsiUnit,
                        'tap_unit_code' => $tapUnit,
                        'match_status' => $matchStatus,
                        'resolution_status' => $matchStatus === 'match' ? 'resolved_accept_tap' : 'unresolved',
                    ]);
                } else {
                    // Missing in TAP
                    $missingInTapCount++;
                    ReconciliationItem::create([
                        'reconciliation_id' => $rec->id,
                        'dumping_ticket_id' => null,
                        'jsi_ticket_number' => $ticketNum,
                        'tap_ticket_number' => null,
                        'ticket_date' => $jsiRow['ticket_date'],
                        'jsi_tonnage' => $jsiTon,
                        'tap_tonnage' => 0,
                        'tonnage_diff' => $jsiTon,
                        'jsi_unit_code' => $jsiUnit,
                        'tap_unit_code' => null,
                        'match_status' => 'missing_in_tap',
                        'resolution_status' => 'unresolved',
                    ]);
                }
            }

            // TAP tickets not in JSI
            foreach ($tapTickets as $ticketNum => $tap) {
                if (!in_array($ticketNum, $matchedTapTicketNumbers)) {
                    $missingInJsiCount++;
                    ReconciliationItem::create([
                        'reconciliation_id' => $rec->id,
                        'dumping_ticket_id' => $tap->id,
                        'jsi_ticket_number' => null,
                        'tap_ticket_number' => $ticketNum,
                        'ticket_date' => $tap->ticket_date->toDateString(),
                        'jsi_tonnage' => 0,
                        'tap_tonnage' => floatval($tap->tonnage),
                        'tonnage_diff' => -floatval($tap->tonnage),
                        'jsi_unit_code' => null,
                        'tap_unit_code' => $tap->unit?->unit_code,
                        'match_status' => 'missing_in_jsi',
                        'resolution_status' => 'unresolved',
                    ]);
                }
            }

            $rec->update([
                'matched_tickets_count' => $matchedCount,
                'matched_tonnage' => $matchedTonnage,
                'discrepancy_tickets_count' => $discrepancyCount,
                'discrepancy_tonnage' => $discrepancyTonnage,
                'missing_in_tap_count' => $missingInTapCount,
                'missing_in_jsi_count' => $missingInJsiCount,
            ]);

            return redirect()->route('production.reconciliation.show', $rec->id)
                ->with('success', "Rekonsiliasi {$reconciliationCode} berhasil diproses: {$matchedCount} cocok, {$discrepancyCount} selisih, {$missingInTapCount} tidak ada di TAP.");
        });
    }

    /**
     * Resolve individual item discrepancy.
     */
    public function resolveItem(Request $request, ReconciliationItem $item)
    {
        $validated = $request->validate([
            'resolution_status' => 'required|in:resolved_accept_tap,resolved_accept_jsi,resolved_adjusted,ignored',
            'resolution_notes' => 'required|string|min:3',
        ]);

        $item->update($validated);

        return redirect()->back()->with('success', 'Status penyelesaian selisih tiket berhasil disimpan.');
    }

    /**
     * Settle full reconciliation.
     */
    public function settle(Request $request, TicketReconciliation $reconciliation)
    {
        $validated = $request->validate([
            'status' => 'required|in:settled,disputed',
            'settlement_notes' => 'required|string|min:5',
        ]);

        $reconciliation->update(array_merge($validated, [
            'updated_by' => Auth::id(),
        ]));

        return redirect()->back()->with('success', "Rekonsiliasi {$reconciliation->reconciliation_code} telah diselesaikan (Status: {$validated['status']}).");
    }
}
