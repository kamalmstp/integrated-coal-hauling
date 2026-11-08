<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\InventoryBalance;
use App\Models\InventoryItem;
use App\Models\Site;
use App\Models\SparepartRequest;
use App\Models\Warehouse;
use App\Services\InventoryService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WarehouseSparepartFulfillmentController extends Controller
{
    public function index(Request $request)
    {
        $siteId = $request->input('site_id');
        $status = $request->input('status');
        $search = $request->input('search');

        $query = SparepartRequest::with([
            'workOrder.unit:id,unit_code,registration_number',
            'site:id,name,code',
            'warehouse:id,name,code',
            'requester:id,name,employee_code',
            'approver:id,name',
            'issuer:id,name',
            'storeman:id,name,employee_code',
            'receiver:id,name,employee_code',
            'items.inventoryItem:id,item_code,part_number,item_name,unit_of_measurement',
            'reservations',
        ]);

        if ($siteId) {
            $query->where('site_id', $siteId);
        }
        if ($status) {
            $query->where('status', $status);
        }
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('request_number', 'like', "%{$search}%")
                  ->orWhereHas('workOrder', fn ($wq) => $wq->where('wo_number', 'like', "%{$search}%"));
            });
        }

        $requests = $query->orderByDesc('id')->paginate(12)->withQueryString();

        // Attach current warehouse stock availability to each request item
        $balances = InventoryBalance::all()->groupBy('inventory_item_id');
        $itemsByPart = InventoryItem::all()->keyBy(fn ($i) => strtoupper($i->part_number ?: $i->item_code));

        $requests->getCollection()->transform(function (SparepartRequest $spReq) use ($balances, $itemsByPart) {
            foreach ($spReq->items as $rItem) {
                $invId = $rItem->inventory_item_id;
                if (!$invId && $rItem->part_number) {
                    $matched = $itemsByPart->get(strtoupper($rItem->part_number));
                    $invId = $matched?->id;
                }
                $itemBals = $invId ? $balances->get($invId, collect()) : collect();
                if ($spReq->warehouse_id) {
                    $itemBals = $itemBals->where('warehouse_id', $spReq->warehouse_id);
                } else {
                    $itemBals = $itemBals->where('site_id', $spReq->site_id);
                }

                $rItem->warehouse_on_hand = round((float) $itemBals->sum('on_hand_qty'), 2);
                $rItem->warehouse_available = round((float) $itemBals->sum('available_qty'), 2);
                $rItem->warehouse_mwa_cost = $itemBals->isNotEmpty()
                    ? round((float) $itemBals->avg('average_unit_cost'), 2)
                    : (float) $rItem->unit_price;
            }
            return $spReq;
        });

        $all = SparepartRequest::when($siteId, fn ($q) => $q->where('site_id', $siteId))->get();

        return Inertia::render('Warehouse/Fulfillment/Index', [
            'requests' => $requests,
            'metrics' => [
                'total' => $all->count(),
                'submitted' => $all->where('status', 'submitted')->count(),
                'approved' => $all->where('status', 'approved')->count(),
                'picking' => $all->where('status', 'picking')->count(),
                'partially_issued' => $all->where('status', 'partially_issued')->count(),
                'issued' => $all->whereIn('status', ['issued', 'issued_by_warehouse'])->count(),
                'rejected' => $all->where('status', 'rejected')->count(),
            ],
            'filters' => [
                'site_id' => $siteId,
                'status' => $status,
                'search' => $search,
            ],
            'master' => [
                'sites' => Site::where('is_active', true)->select('id', 'name', 'code')->get(),
                'warehouses' => Warehouse::where('is_active', true)->select('id', 'site_id', 'code', 'name', 'storeman_id')->get(),
                'employees' => Employee::where('is_active', true)->select('id', 'name', 'employee_code', 'site_id')->get(),
            ],
        ]);
    }

    public function pick(Request $request, SparepartRequest $sparepartRequest, InventoryService $inventoryService)
    {
        $validated = $request->validate([
            'warehouse_id' => 'required|exists:warehouses,id',
            'storeman_id' => 'nullable|exists:employees,id',
            'picked_lines' => 'nullable|array',
        ]);

        $inventoryService->pickSparepartRequest(
            $sparepartRequest,
            (int) $validated['warehouse_id'],
            $validated['storeman_id'] ?? null,
            $validated['picked_lines'] ?? []
        );

        return redirect()->back()->with('success', "Picking & Reservasi stok untuk {$sparepartRequest->request_number} berhasil dicatat (stok telah di-reserve namun belum dikurangi hingga konfirmasi serah terima).");
    }

    public function issue(Request $request, SparepartRequest $sparepartRequest, InventoryService $inventoryService)
    {
        $validated = $request->validate([
            'warehouse_id' => 'nullable|exists:warehouses,id',
            'storeman_id' => 'nullable|exists:employees,id',
            'received_by' => 'nullable|exists:employees,id',
            'notes' => 'nullable|string',
            'items' => 'nullable|array',
        ]);

        $updated = $inventoryService->issueSparepartRequest($sparepartRequest, $validated);

        $msg = $updated->status === 'partially_issued'
            ? "Pengeluaran Sebagian (Partial Issue) untuk {$updated->request_number} berhasil dikonfirmasi. Sisa barang otomatis tercatat sebagai Backorder."
            : "Pengeluaran Penuh (Full Issue) untuk {$updated->request_number} berhasil dikonfirmasi. Stok gudang dikurangi dan biaya masuk ke Work Order.";

        return redirect()->back()->with('success', $msg);
    }

    public function reject(Request $request, SparepartRequest $sparepartRequest)
    {
        $validated = $request->validate([
            'rejection_reason' => 'required|string|max:500',
        ]);

        $sparepartRequest->update([
            'status' => 'rejected',
            'rejection_reason' => $validated['rejection_reason'],
            'updated_by' => auth()->id(),
        ]);

        $sparepartRequest->items()->update(['status' => 'rejected']);

        return redirect()->back()->with('success', "Permintaan sparepart {$sparepartRequest->request_number} telah ditolak.");
    }

    public function returnItem(Request $request, SparepartRequest $sparepartRequest, InventoryService $inventoryService)
    {
        $validated = $request->validate([
            'sparepart_request_item_id' => 'required|exists:sparepart_request_items,id',
            'quantity' => 'required|numeric|min:0.01',
            'remarks' => 'nullable|string|max:255',
        ]);

        $tx = $inventoryService->returnFromMaintenance(
            $sparepartRequest,
            (int) $validated['sparepart_request_item_id'],
            (float) $validated['quantity'],
            $validated['remarks'] ?? null
        );

        return redirect()->back()->with('success', "Retur sparepart berhasil diterima kembali ke Gudang ({$tx->document_number}) dan biaya Work Order telah disesuaikan.");
    }
}
