<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\InventoryItem;
use App\Models\PurchaseOrder;
use App\Models\PurchaseRequest;
use App\Models\QuotationComparison;
use App\Models\Site;
use App\Models\Vendor;
use App\Models\Warehouse;
use App\Services\ProcurementService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PurchaseOrderController extends Controller
{
    public function index(Request $request)
    {
        $siteId = $request->input('site_id');
        $status = $request->input('status');
        $vendorId = $request->input('vendor_id');
        $search = $request->input('search');

        $query = PurchaseOrder::with([
            'site:id,name,code',
            'warehouse:id,name,code',
            'department:id,name,code',
            'vendor:id,name,vendor_code,address,phone,email,npwp',
            'purchaseRequest:id,pr_number',
            'rfq:id,rfq_number',
            'comparison:id,comparison_number',
            'approver:id,name',
            'items.inventoryItem:id,item_code,part_number,item_name,unit_of_measurement',
            'approvals.approverPosition:id,title,code',
            'approvals.actor:id,name',
            'goodsReceipts:id,grn_number,purchase_order_id,receipt_date,receipt_type,status,total_received_value',
        ]);

        if ($siteId) {
            $query->where('site_id', $siteId);
        }
        if ($status) {
            $query->where('status', $status);
        }
        if ($vendorId) {
            $query->where('vendor_id', $vendorId);
        }
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('po_number', 'like', "%{$search}%")
                  ->orWhereHas('vendor', fn ($vq) => $vq->where('name', 'like', "%{$search}%"));
            });
        }

        $purchaseOrders = $query->orderByDesc('id')->paginate(12)->withQueryString();

        $all = PurchaseOrder::when($siteId, fn ($q) => $q->where('site_id', $siteId))->get();
        $today = now()->toDateString();

        return Inertia::render('Procurement/PurchaseOrders/Index', [
            'purchaseOrders' => $purchaseOrders,
            'metrics' => [
                'total' => $all->count(),
                'pending_approval' => $all->where('approval_status', 'pending_approval')->count(),
                'issued_outstanding' => $all->whereIn('status', ['approved', 'issued', 'partial_received'])->count(),
                'overdue' => $all->filter(fn ($p) => in_array($p->status, ['approved', 'issued', 'partial_received'], true) && $p->expected_delivery_date && $p->expected_delivery_date->toDateString() < $today)->count(),
                'completed' => $all->whereIn('status', ['received', 'invoiced', 'completed'])->count(),
                'total_value' => round((float) $all->sum('grand_total'), 2),
            ],
            'filters' => [
                'site_id' => $siteId,
                'status' => $status,
                'vendor_id' => $vendorId,
                'search' => $search,
            ],
            'master' => [
                'sites' => Site::where('is_active', true)->select('id', 'name', 'code')->get(),
                'warehouses' => Warehouse::where('is_active', true)->select('id', 'site_id', 'code', 'name')->get(),
                'departments' => Department::where('is_active', true)->select('id', 'name', 'code')->get(),
                'vendors' => Vendor::where('is_active', true)->select('id', 'vendor_code', 'name')->get(),
                'items' => InventoryItem::where('is_active', true)->select('id', 'item_code', 'part_number', 'item_name', 'specification', 'unit_of_measurement', 'standard_cost')->orderBy('item_code')->get(),
                'approvedPrs' => PurchaseRequest::with('items.item')->whereIn('status', ['approved', 'rfq_process'])->get(),
                'awardedComparisons' => QuotationComparison::with(['selectedQuotation.items', 'selectedVendor', 'purchaseRequest'])->where('status', 'completed')->get(),
            ],
        ]);
    }

    public function store(Request $request, ProcurementService $procurementService)
    {
        $validated = $request->validate([
            'site_id' => 'required|exists:sites,id',
            'warehouse_id' => 'nullable|exists:warehouses,id',
            'department_id' => 'nullable|exists:departments,id',
            'purchase_request_id' => 'nullable|exists:purchase_requests,id',
            'rfq_id' => 'nullable|exists:rfqs,id',
            'quotation_comparison_id' => 'nullable|exists:quotation_comparisons,id',
            'vendor_quotation_id' => 'nullable|exists:vendor_quotations,id',
            'vendor_id' => 'required|exists:vendors,id',
            'po_date' => 'required|date',
            'expected_delivery_date' => 'required|date',
            'delivery_location' => 'nullable|string|max:255',
            'payment_terms' => 'required|string|max:100',
            'purchase_category' => 'nullable|string|max:50',
            'discount_amount' => 'nullable|numeric|min:0',
            'tax_percent' => 'nullable|numeric|min:0',
            'terms_and_conditions' => 'nullable|string',
            'notes' => 'nullable|string',
            'items' => 'nullable|array',
            'items.*.purchase_request_item_id' => 'nullable|exists:purchase_request_items,id',
            'items.*.inventory_item_id' => 'nullable|exists:inventory_items,id',
            'items.*.item_name' => 'required_with:items|string|max:180',
            'items.*.specification' => 'nullable|string',
            'items.*.quantity_ordered' => 'required_with:items|numeric|min:0.01',
            'items.*.unit' => 'nullable|string|max:30',
            'items.*.unit_price' => 'required_with:items|numeric|min:0',
            'items.*.discount_amount' => 'nullable|numeric|min:0',
        ]);

        $po = $procurementService->createPurchaseOrder($validated, $validated['items'] ?? []);

        return redirect()->back()->with('success', "Purchase Order {$po->po_number} berhasil dibuat dengan nilai total Rp " . number_format((float) $po->grand_total, 0, ',', '.') . ".");
    }

    public function approve(Request $request, PurchaseOrder $purchaseOrder, ProcurementService $procurementService)
    {
        $validated = $request->validate([
            'approve_all' => 'nullable|boolean',
            'notes' => 'nullable|string|max:500',
        ]);

        $updated = $procurementService->approvePurchaseOrder($purchaseOrder, [
            'approve_all' => $validated['approve_all'] ?? true,
            'notes' => $validated['notes'] ?? null,
        ]);

        return redirect()->back()->with('success', "Purchase Order {$updated->po_number} telah disetujui (Approval Status: {$updated->approval_status}).");
    }

    public function print(PurchaseOrder $purchaseOrder)
    {
        $purchaseOrder->load([
            'site',
            'warehouse',
            'department',
            'vendor',
            'purchaseRequest',
            'approver',
            'creator',
            'items.inventoryItem',
            'approvals.approverPosition',
            'approvals.actor',
        ]);

        return Inertia::render('Procurement/PurchaseOrders/Print', [
            'purchaseOrder' => $purchaseOrder,
        ]);
    }
}
