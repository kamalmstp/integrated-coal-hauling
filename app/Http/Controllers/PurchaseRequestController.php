<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\Employee;
use App\Models\InventoryItem;
use App\Models\Position;
use App\Models\ProcurementApprovalRule;
use App\Models\PurchaseRequest;
use App\Models\Site;
use App\Models\Warehouse;
use App\Models\WorkOrder;
use App\Services\ProcurementService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PurchaseRequestController extends Controller
{
    public function index(Request $request)
    {
        $siteId = $request->input('site_id');
        $status = $request->input('status');
        $source = $request->input('source');
        $category = $request->input('purchase_category');
        $search = $request->input('search');

        $query = PurchaseRequest::with([
            'site:id,name,code',
            'warehouse:id,name,code',
            'department:id,name,code',
            'workOrder:id,wo_number',
            'requester:id,name,employee_code',
            'approver:id,name',
            'items.item:id,item_code,part_number,item_name,unit_of_measurement',
            'approvals.approverPosition:id,title,code',
            'approvals.actor:id,name',
        ]);

        if ($siteId) {
            $query->where('site_id', $siteId);
        }
        if ($status) {
            $query->where('status', $status);
        }
        if ($source) {
            $query->where('source', $source);
        }
        if ($category) {
            $query->where('purchase_category', $category);
        }
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('pr_number', 'like', "%{$search}%")
                  ->orWhere('purpose', 'like', "%{$search}%")
                  ->orWhereHas('items', fn ($iq) => $iq->where('item_name', 'like', "%{$search}%"));
            });
        }

        $requests = $query->orderByDesc('id')->paginate(12)->withQueryString();

        $all = PurchaseRequest::when($siteId, fn ($q) => $q->where('site_id', $siteId))->get();

        return Inertia::render('Procurement/PurchaseRequests/Index', [
            'requests' => $requests,
            'metrics' => [
                'total' => $all->count(),
                'pending_approval' => $all->whereIn('status', ['submitted', 'pending_approval'])->count(),
                'approved' => $all->whereIn('status', ['approved', 'rfq_process', 'converted_to_po', 'completed'])->count(),
                'rejected' => $all->where('status', 'rejected')->count(),
                'total_estimated' => round((float) $all->sum('estimated_total'), 2),
            ],
            'approvalRules' => ProcurementApprovalRule::with(['site:id,code,name', 'department:id,name', 'approverPosition:id,title,code'])
                ->where('is_active', true)
                ->orderBy('step_order')
                ->get(),
            'filters' => [
                'site_id' => $siteId,
                'status' => $status,
                'source' => $source,
                'purchase_category' => $category,
                'search' => $search,
            ],
            'master' => [
                'sites' => Site::where('is_active', true)->select('id', 'name', 'code')->get(),
                'warehouses' => Warehouse::where('is_active', true)->select('id', 'site_id', 'code', 'name')->get(),
                'departments' => Department::where('is_active', true)->select('id', 'name', 'code')->get(),
                'positions' => Position::where('is_active', true)->select('id', 'title', 'code')->get(),
                'employees' => Employee::where('is_active', true)->select('id', 'name', 'employee_code', 'site_id', 'department_id')->get(),
                'items' => InventoryItem::where('is_active', true)->select('id', 'item_code', 'part_number', 'item_name', 'specification', 'unit_of_measurement', 'standard_cost', 'category_code')->orderBy('item_code')->get(),
                'workOrders' => WorkOrder::select('id', 'wo_number', 'site_id')->orderByDesc('id')->limit(30)->get(),
            ],
        ]);
    }

    public function store(Request $request, ProcurementService $procurementService)
    {
        $validated = $request->validate([
            'site_id' => 'required|exists:sites,id',
            'warehouse_id' => 'nullable|exists:warehouses,id',
            'department_id' => 'nullable|exists:departments,id',
            'work_order_id' => 'nullable|exists:work_orders,id',
            'request_date' => 'required|date',
            'required_date' => 'nullable|date',
            'source' => 'required|in:warehouse_reorder,reorder_point,maintenance_request,operational_requirement,general_purchase',
            'purchase_category' => 'required|string|max:50',
            'priority' => 'required|in:low,normal,high,critical',
            'purpose' => 'required|string|max:1000',
            'requested_by' => 'nullable|exists:employees,id',
            'notes' => 'nullable|string',
            'attachment' => 'nullable|file|mimes:pdf,jpg,jpeg,png,doc,docx,xls,xlsx,csv|max:5120',
            'items' => 'required|array|min:1',
            'items.*.inventory_item_id' => 'nullable|exists:inventory_items,id',
            'items.*.item_name' => 'nullable|string|max:180',
            'items.*.specification' => 'nullable|string',
            'items.*.requested_qty' => 'required|numeric|min:0.01',
            'items.*.unit' => 'nullable|string|max:30',
            'items.*.estimated_unit_price' => 'required|numeric|min:0',
            'items.*.purpose' => 'nullable|string|max:255',
        ]);

        if ($request->hasFile('attachment')) {
            $validated['attachment_path'] = $request->file('attachment')->store('procurement/pr', 'public');
        }

        $pr = $procurementService->createPurchaseRequest($validated, $validated['items']);

        return redirect()->back()->with('success', "Purchase Request {$pr->pr_number} berhasil dibuat dengan alur otorisasi multi-level.");
    }

    public function approve(Request $request, PurchaseRequest $purchaseRequest, ProcurementService $procurementService)
    {
        $validated = $request->validate([
            'approve_all' => 'nullable|boolean',
            'notes' => 'nullable|string|max:500',
        ]);

        $updated = $procurementService->approvePurchaseRequest($purchaseRequest, [
            'approve_all' => $validated['approve_all'] ?? true,
            'notes' => $validated['notes'] ?? null,
        ]);

        return redirect()->back()->with('success', "Purchase Request {$updated->pr_number} telah disetujui (Status: {$updated->status}).");
    }

    public function reject(Request $request, PurchaseRequest $purchaseRequest, ProcurementService $procurementService)
    {
        $validated = $request->validate([
            'rejection_reason' => 'required|string|max:500',
        ]);

        $procurementService->rejectPurchaseRequest($purchaseRequest, $validated['rejection_reason']);

        return redirect()->back()->with('success', "Purchase Request {$purchaseRequest->pr_number} telah ditolak.");
    }
}
