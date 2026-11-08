<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\InventoryItem;
use App\Models\MaintenanceCost;
use App\Models\Site;
use App\Models\SparepartRequest;
use App\Models\SparepartRequestItem;
use App\Models\Warehouse;
use App\Models\WorkOrder;
use App\Services\InventoryService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SparepartRequestController extends Controller
{
    public function index(Request $request)
    {
        $siteId = $request->input('site_id');
        $status = $request->input('status');
        $workOrderId = $request->input('work_order_id');
        $search = $request->input('search');

        $query = SparepartRequest::with([
            'workOrder.unit:id,unit_code,registration_number',
            'site:id,name,code',
            'requester:id,name,employee_code',
            'approver:id,name',
            'issuer:id,name',
            'items',
        ]);

        if ($siteId) {
            $query->where('site_id', $siteId);
        }
        if ($status) {
            $query->where('status', $status);
        }
        if ($workOrderId) {
            $query->where('work_order_id', $workOrderId);
        }
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('request_number', 'like', "%{$search}%")
                  ->orWhereHas('workOrder', fn($wq) => $wq->where('wo_number', 'like', "%{$search}%"))
                  ->orWhereHas('items', fn($iq) => $iq->where('part_name', 'like', "%{$search}%")->orWhere('part_number', 'like', "%{$search}%"));
            });
        }

        $requests = $query->orderBy('request_date', 'desc')->paginate(12)->withQueryString();

        $allRequests = SparepartRequest::all();
        $metrics = [
            'total' => $allRequests->count(),
            'submitted' => $allRequests->where('status', 'submitted')->count(),
            'approved' => $allRequests->where('status', 'approved')->count(),
            'issued' => $allRequests->where('status', 'issued_by_warehouse')->count(),
            'pending_integration' => $allRequests->where('status', 'pending_integration')->count(),
            'total_cost' => (float) $allRequests->sum('total_cost'),
        ];

        $sites = Site::where('is_active', true)->select('id', 'name', 'code')->get();
        $workOrders = WorkOrder::with('unit:id,unit_code')->whereIn('status', ['open', 'submitted', 'assigned', 'in_progress', 'waiting_sparepart'])->get();
        $mechanics = Employee::where('is_active', true)->select('id', 'name', 'employee_code')->get();

        return Inertia::render('Maintenance/Spareparts/Index', [
            'requests' => $requests,
            'metrics' => $metrics,
            'filters' => [
                'site_id' => $siteId,
                'status' => $status,
                'work_order_id' => $workOrderId,
                'search' => $search,
            ],
            'master' => [
                'sites' => $sites,
                'workOrders' => $workOrders,
                'mechanics' => $mechanics,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $requestedBy = $request->input('requested_by') ?? $request->input('requester_id');
        $requestDate = $request->input('request_date') ?? Carbon::today()->toDateString();

        $items = $request->input('items', []);
        $normalizedItems = [];
        foreach ($items as $item) {
            if (!isset($item['quantity_requested']) && isset($item['quantity'])) {
                $item['quantity_requested'] = $item['quantity'];
            }
            $normalizedItems[] = $item;
        }
        $request->merge([
            'requested_by' => $requestedBy,
            'request_date' => $requestDate,
            'items' => $normalizedItems,
        ]);

        $validated = $request->validate([
            'work_order_id' => 'required|exists:work_orders,id',
            'warehouse_id' => 'nullable|exists:warehouses,id',
            'requested_by' => 'required|exists:employees,id',
            'request_date' => 'required|date',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.inventory_item_id' => 'nullable|exists:inventory_items,id',
            'items.*.part_number' => 'nullable|string|max:100',
            'items.*.part_name' => 'required|string|max:150',
            'items.*.category' => 'nullable|string|max:50',
            'items.*.quantity_requested' => 'required|numeric|min:0.1',
            'items.*.unit' => 'required|string|max:20',
            'items.*.unit_price' => 'nullable|numeric|min:0',
        ]);

        return DB::transaction(function () use ($validated) {
            $wo = WorkOrder::findOrFail($validated['work_order_id']);
            $reqNumber = 'SPR-' . Carbon::parse($validated['request_date'])->format('Ym') . '-' . rand(100, 999);

            $totalEstimatedCost = 0;
            foreach ($validated['items'] as $item) {
                $price = $item['unit_price'] ?? 0;
                $totalEstimatedCost += ($item['quantity_requested'] * $price);
            }

            $spr = SparepartRequest::create([
                'request_number' => $reqNumber,
                'work_order_id' => $wo->id,
                'site_id' => $wo->site_id,
                'warehouse_id' => $validated['warehouse_id'] ?? null,
                'requested_by' => $validated['requested_by'],
                'request_date' => $validated['request_date'],
                'status' => 'submitted',
                'total_cost' => $totalEstimatedCost,
                'notes' => $validated['notes'] ?? null,
                'created_by' => Auth::id(),
            ]);

            foreach ($validated['items'] as $item) {
                $invItem = null;
                if (!empty($item['inventory_item_id'])) {
                    $invItem = InventoryItem::find($item['inventory_item_id']);
                } elseif (!empty($item['part_number'])) {
                    $invItem = InventoryItem::where('item_code', $item['part_number'])
                        ->orWhere('part_number', $item['part_number'])
                        ->first();
                }

                $price = $item['unit_price'] ?? ($invItem ? (float) $invItem->standard_cost : 0);
                $subtotal = $item['quantity_requested'] * $price;

                SparepartRequestItem::create([
                    'sparepart_request_id' => $spr->id,
                    'inventory_item_id' => $invItem?->id,
                    'warehouse_id' => $validated['warehouse_id'] ?? $invItem?->default_warehouse_id,
                    'part_number' => strtoupper($item['part_number'] ?? $invItem?->part_number ?? 'GEN-PART'),
                    'part_name' => $item['part_name'] ?? $invItem?->item_name,
                    'category' => $item['category'] ?? $invItem?->category_code ?? 'Sparepart',
                    'quantity_requested' => $item['quantity_requested'],
                    'quantity_approved' => $item['quantity_requested'],
                    'quantity_issued' => 0,
                    'unit' => $item['unit'] ?? $invItem?->unit_of_measurement ?? 'PCS',
                    'unit_price' => $price,
                    'total_price' => $subtotal,
                    'status' => 'pending',
                ]);
            }

            // Update WO status to waiting_sparepart
            $wo->update([
                'status' => 'waiting_sparepart',
                'rfu_status' => 'waiting_repair',
            ]);

            return redirect()->back()->with('success', "Permintaan sparepart {$reqNumber} berhasil diajukan untuk Work Order {$wo->wo_number}.");
        });
    }

    public function approve(Request $request, SparepartRequest $sparepartRequest)
    {
        $validated = $request->validate([
            'notes' => 'nullable|string',
        ]);

        $sparepartRequest->update([
            'status' => 'approved',
            'approved_by' => Auth::id(),
            'approved_at' => Carbon::now(),
            'notes' => $validated['notes'] ?? $sparepartRequest->notes,
            'updated_by' => Auth::id(),
        ]);

        foreach ($sparepartRequest->items as $item) {
            $item->update([
                'status' => 'approved',
                'quantity_approved' => $item->quantity_requested,
            ]);
        }

        return redirect()->back()->with('success', "Permintaan sparepart {$sparepartRequest->request_number} disetujui dan diteruskan ke Gudang/Warehouse.");
    }

    /**
     * Warehouse Issuance Action (Integrated with Phase 5 InventoryService)
     */
    public function issueParts(Request $request, SparepartRequest $sparepartRequest)
    {
        $inventoryService = app(InventoryService::class);
        $updated = $inventoryService->issueSparepartRequest($sparepartRequest, $request->all());
        $woNumber = $updated->workOrder?->wo_number ?? '-';

        return redirect()->back()->with('success', "Sparepart untuk {$updated->request_number} berhasil dikeluarkan oleh Gudang. Biaya tercatat otomatis pada Work Order {$woNumber}.");
    }
}
