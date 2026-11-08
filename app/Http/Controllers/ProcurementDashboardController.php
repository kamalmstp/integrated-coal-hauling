<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\GoodsReceipt;
use App\Models\GoodsReceiptItem;
use App\Models\Position;
use App\Models\ProcurementApprovalRule;
use App\Models\PurchaseOrder;
use App\Models\PurchaseRequest;
use App\Models\Site;
use App\Models\Vendor;
use App\Models\VendorInvoice;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProcurementDashboardController extends Controller
{
    public function index(Request $request)
    {
        $siteId = $request->input('site_id');

        $prQuery = PurchaseRequest::when($siteId, fn ($q) => $q->where('site_id', $siteId));
        $prs = $prQuery->get();

        $poQuery = PurchaseOrder::with(['vendor:id,name,vendor_code', 'site:id,name,code', 'items'])
            ->when($siteId, fn ($q) => $q->where('site_id', $siteId));
        $pos = $poQuery->get();

        $today = now()->toDateString();

        $prPendingApproval = $prs->whereIn('status', ['submitted', 'pending_approval'])->count();
        $prApproved = $prs->whereIn('status', ['approved', 'rfq_process', 'converted_to_po', 'completed'])->count();

        $poOutstanding = $pos->whereIn('status', ['pending_approval', 'approved', 'issued', 'partial_received'])->count();
        $partialDelivery = $pos->where('status', 'partial_received')->count();
        $overdueDelivery = $pos->filter(function (PurchaseOrder $po) use ($today) {
            return in_array($po->status, ['approved', 'issued', 'partial_received'], true)
                && $po->expected_delivery_date
                && $po->expected_delivery_date->toDateString() < $today;
        })->count();

        $totalPurchaseValue = (float) $pos->whereNotIn('status', ['cancelled', 'rejected'])->sum('grand_total');

        // Purchase by Site
        $purchaseBySite = Site::where('is_active', true)->get()->map(function (Site $site) {
            $sitePos = PurchaseOrder::where('site_id', $site->id)
                ->whereNotIn('status', ['cancelled', 'rejected'])
                ->get();
            $sitePrs = PurchaseRequest::where('site_id', $site->id)->count();

            return [
                'site_id' => $site->id,
                'site_code' => $site->code,
                'site_name' => $site->name,
                'pr_count' => $sitePrs,
                'po_count' => $sitePos->count(),
                'total_value' => round((float) $sitePos->sum('grand_total'), 2),
                'outstanding_po' => $sitePos->whereIn('status', ['pending_approval', 'approved', 'issued', 'partial_received'])->count(),
            ];
        })->values();

        // Vendor Performance Scorecard
        $vendorPerformance = Vendor::where('is_active', true)->get()->map(function (Vendor $vendor) use ($siteId) {
            $vPos = PurchaseOrder::where('vendor_id', $vendor->id)
                ->when($siteId, fn ($q) => $q->where('site_id', $siteId))
                ->get();

            $vGrns = GoodsReceipt::with('items')
                ->where('vendor_id', $vendor->id)
                ->where('status', 'confirmed')
                ->when($siteId, fn ($q) => $q->where('site_id', $siteId))
                ->get();

            $totalDelivered = 0;
            $totalAccepted = 0;
            $totalRejectedOrDamaged = 0;

            foreach ($vGrns as $grn) {
                $totalDelivered += (float) $grn->items->sum('qty_delivered');
                $totalAccepted += (float) $grn->items->sum('qty_accepted');
                $totalRejectedOrDamaged += (float) $grn->items->sum(fn ($i) => (float) $i->qty_damaged + (float) $i->qty_rejected);
            }

            $qualityRate = $totalDelivered > 0
                ? round(($totalAccepted / $totalDelivered) * 100, 1)
                : 100.0;

            $completedPos = $vPos->whereIn('status', ['received', 'invoiced', 'completed']);
            $onTimeCount = $completedPos->filter(function (PurchaseOrder $po) use ($vGrns) {
                $lastGrn = $vGrns->where('purchase_order_id', $po->id)->sortByDesc('receipt_date')->first();
                if (!$lastGrn || !$po->expected_delivery_date) {
                    return true;
                }
                return $lastGrn->receipt_date->lte($po->expected_delivery_date);
            })->count();

            $onTimeRate = $completedPos->count() > 0
                ? round(($onTimeCount / $completedPos->count()) * 100, 1)
                : 100.0;

            return [
                'vendor_id' => $vendor->id,
                'vendor_code' => $vendor->vendor_code,
                'vendor_name' => $vendor->name,
                'vendor_type' => $vendor->vendor_type,
                'po_count' => $vPos->count(),
                'total_po_value' => round((float) $vPos->sum('grand_total'), 2),
                'quality_acceptance_rate' => $qualityRate,
                'on_time_delivery_rate' => $onTimeRate,
                'damaged_or_rejected_qty' => $totalRejectedOrDamaged,
            ];
        })->values();

        $approvalRules = ProcurementApprovalRule::with(['site:id,name,code', 'department:id,name', 'approverPosition:id,title,code'])
            ->orderBy('step_order')
            ->orderBy('min_amount')
            ->get();

        $recentPos = PurchaseOrder::with(['vendor:id,name,vendor_code', 'site:id,name,code', 'purchaseRequest:id,pr_number'])
            ->when($siteId, fn ($q) => $q->where('site_id', $siteId))
            ->orderByDesc('id')
            ->limit(8)
            ->get();

        $pendingInvoicesCount = VendorInvoice::when($siteId, fn ($q) => $q->where('site_id', $siteId))
            ->whereIn('verification_status', ['pending_verification', 'discrepancy', 'verified', 'ready_for_finance'])
            ->count();

        return Inertia::render('Procurement/Dashboard/Index', [
            'metrics' => [
                'pr_pending_approval' => $prPendingApproval,
                'pr_approved' => $prApproved,
                'po_outstanding' => $poOutstanding,
                'partial_delivery' => $partialDelivery,
                'overdue_delivery' => $overdueDelivery,
                'total_purchase_value' => round($totalPurchaseValue, 2),
                'pending_invoices_count' => $pendingInvoicesCount,
            ],
            'purchaseBySite' => $purchaseBySite,
            'vendorPerformance' => $vendorPerformance,
            'approvalRules' => $approvalRules,
            'recentPos' => $recentPos,
            'filters' => [
                'site_id' => $siteId,
            ],
            'master' => [
                'sites' => Site::where('is_active', true)->select('id', 'name', 'code')->get(),
                'departments' => Department::where('is_active', true)->select('id', 'name', 'code')->get(),
                'positions' => Position::where('is_active', true)->select('id', 'title', 'code')->get(),
            ],
        ]);
    }

    public function storeApprovalRule(Request $request)
    {
        $validated = $request->validate([
            'rule_code' => 'required|string|max:50|unique:procurement_approval_rules,rule_code',
            'rule_name' => 'required|string|max:150',
            'document_type' => 'required|in:ALL,PR,PO',
            'site_id' => 'nullable|exists:sites,id',
            'department_id' => 'nullable|exists:departments,id',
            'purchase_category' => 'nullable|string|max:50',
            'min_amount' => 'required|numeric|min:0',
            'max_amount' => 'nullable|numeric|min:0',
            'step_order' => 'required|integer|min:1|max:10',
            'approver_position_id' => 'nullable|exists:positions,id',
            'approver_role_label' => 'required|string|max:100',
        ]);

        $validated['rule_code'] = strtoupper($validated['rule_code']);
        $validated['is_active'] = true;

        ProcurementApprovalRule::create($validated);

        return redirect()->back()->with('success', "Aturan Matriks Approval {$validated['rule_code']} berhasil disimpan.");
    }
}
