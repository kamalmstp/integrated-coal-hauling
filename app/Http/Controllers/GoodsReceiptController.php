<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\GoodsReceipt;
use App\Models\PurchaseOrder;
use App\Models\Site;
use App\Models\Warehouse;
use App\Models\WarehouseLocation;
use App\Services\ProcurementService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GoodsReceiptController extends Controller
{
    public function index(Request $request)
    {
        $siteId = $request->input('site_id');
        $warehouseId = $request->input('warehouse_id');
        $status = $request->input('status');
        $receiptType = $request->input('receipt_type');

        $receipts = GoodsReceipt::with([
            'purchaseOrder:id,po_number,po_date,expected_delivery_date,status',
            'vendor:id,name,vendor_code',
            'site:id,name,code',
            'warehouse:id,name,code',
            'receiver:id,name,employee_code',
            'inspector:id,name,employee_code',
            'inventoryTransaction:id,document_number,total_amount',
            'items.poItem:id,item_name,quantity_ordered,quantity_received,quantity_outstanding',
            'items.inventoryItem:id,item_code,part_number,item_name',
        ])
            ->when($siteId, fn ($q) => $q->where('site_id', $siteId))
            ->when($warehouseId, fn ($q) => $q->where('warehouse_id', $warehouseId))
            ->when($status, fn ($q) => $q->where('status', $status))
            ->when($receiptType, fn ($q) => $q->where('receipt_type', $receiptType))
            ->orderByDesc('id')
            ->paginate(12)
            ->withQueryString();

        // POs eligible for Goods Receipt (Approved & Issued or Partial Received)
        $openPos = PurchaseOrder::with([
            'vendor:id,name,vendor_code',
            'site:id,name,code',
            'warehouse:id,name,code',
            'items.inventoryItem:id,item_code,item_name,unit_of_measurement',
        ])
            ->where('approval_status', 'approved')
            ->whereIn('status', ['approved', 'issued', 'partial_received'])
            ->when($siteId, fn ($q) => $q->where('site_id', $siteId))
            ->orderByDesc('id')
            ->get();

        $all = GoodsReceipt::when($siteId, fn ($q) => $q->where('site_id', $siteId))->get();

        return Inertia::render('Procurement/GoodsReceipts/Index', [
            'receipts' => $receipts,
            'openPos' => $openPos,
            'metrics' => [
                'total_grn' => $all->count(),
                'full_receiving' => $all->where('receipt_type', 'full_receiving')->count(),
                'partial_receiving' => $all->whereIn('receipt_type', ['partial_receiving', 'under_delivery'])->count(),
                'over_delivery_review' => $all->where('status', 'pending_over_delivery_review')->count(),
                'total_received_value' => round((float) $all->where('status', 'confirmed')->sum('total_received_value'), 2),
            ],
            'filters' => [
                'site_id' => $siteId,
                'warehouse_id' => $warehouseId,
                'status' => $status,
                'receipt_type' => $receiptType,
            ],
            'master' => [
                'sites' => Site::where('is_active', true)->select('id', 'name', 'code')->get(),
                'warehouses' => Warehouse::where('is_active', true)->select('id', 'site_id', 'code', 'name')->get(),
                'locations' => WarehouseLocation::where('is_active', true)->select('id', 'warehouse_id', 'location_code')->get(),
                'employees' => Employee::where('is_active', true)->select('id', 'name', 'employee_code', 'site_id')->get(),
            ],
        ]);
    }

    public function store(Request $request, ProcurementService $procurementService)
    {
        $validated = $request->validate([
            'purchase_order_id' => 'required|exists:purchase_orders,id',
            'site_id' => 'nullable|exists:sites,id',
            'warehouse_id' => 'required|exists:warehouses,id',
            'receipt_date' => 'required|date',
            'delivery_note_number' => 'nullable|string|max:100',
            'received_by' => 'nullable|exists:employees,id',
            'inspected_by' => 'nullable|exists:employees,id',
            'confirm_over_delivery' => 'nullable|boolean',
            'remarks' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.purchase_order_item_id' => 'required|exists:purchase_order_items,id',
            'items.*.warehouse_location_id' => 'nullable|exists:warehouse_locations,id',
            'items.*.qty_delivered' => 'required|numeric|min:0',
            'items.*.qty_accepted' => 'nullable|numeric|min:0',
            'items.*.qty_damaged' => 'nullable|numeric|min:0',
            'items.*.qty_rejected' => 'nullable|numeric|min:0',
            'items.*.condition_notes' => 'nullable|string|max:255',
        ]);

        $po = PurchaseOrder::findOrFail($validated['purchase_order_id']);
        $grn = $procurementService->recordGoodsReceipt($po, $validated, $validated['items']);

        $msg = $grn->status === 'pending_over_delivery_review'
            ? "Goods Receipt {$grn->grn_number} terdeteksi Over Delivery dan membutuhkan Review sebelum stok ditambahkan ke Gudang."
            : "Goods Receipt {$grn->grn_number} ({$grn->receipt_type}) berhasil dikonfirmasi. Hanya barang kondisi baik yang diterima (Accepted) telah ditambahkan otomatis ke Stok Gudang.";

        return redirect()->back()->with('success', $msg);
    }

    public function confirmOverDelivery(GoodsReceipt $goodsReceipt, ProcurementService $procurementService)
    {
        $updated = $procurementService->confirmOverDeliveryReceipt($goodsReceipt);

        return redirect()->back()->with('success', "Over Delivery pada {$updated->grn_number} telah disetujui dan stok gudang telah diperbarui.");
    }
}
