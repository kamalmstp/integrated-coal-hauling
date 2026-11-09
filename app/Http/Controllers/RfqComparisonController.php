<?php

namespace App\Http\Controllers;

use App\Models\PurchaseRequest;
use App\Models\QuotationComparison;
use App\Models\Rfq;
use App\Models\Site;
use App\Models\Vendor;
use App\Services\ProcurementService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RfqComparisonController extends Controller
{
    public function index(Request $request)
    {
        $siteId = $request->input('site_id');
        $status = $request->input('status');

        $rfqs = Rfq::with([
            'site:id,name,code',
            'purchaseRequest.items.item',
            'invitedVendors.vendor:id,name,vendor_code,email,phone',
            'quotations.vendor:id,name,vendor_code',
            'quotations.items',
            'comparisons.selectedVendor:id,name,vendor_code',
            'comparisons.selectedQuotation',
        ])
            ->when($siteId, fn ($q) => $q->where('site_id', $siteId))
            ->when($status, fn ($q) => $q->where('status', $status))
            ->orderByDesc('id')
            ->get();

        $approvedPrs = PurchaseRequest::with(['site:id,name,code', 'items.item'])
            ->whereIn('status', ['approved', 'approved_for_po', 'rfq_process'])
            ->when($siteId, fn ($q) => $q->where('site_id', $siteId))
            ->orderByDesc('id')
            ->get();

        $comparisons = QuotationComparison::with([
            'rfq:id,rfq_number,title',
            'purchaseRequest:id,pr_number',
            'site:id,name,code',
            'selectedVendor:id,name,vendor_code',
            'selectedQuotation',
            'lowestPriceQuotation.vendor:id,name',
            'fastestDeliveryQuotation.vendor:id,name',
            'bestPaymentTermsQuotation.vendor:id,name',
        ])
            ->when($siteId, fn ($q) => $q->where('site_id', $siteId))
            ->orderByDesc('id')
            ->get();

        return Inertia::render('Procurement/Rfqs/Index', [
            'rfqs' => $rfqs,
            'comparisons' => $comparisons,
            'approvedPrs' => $approvedPrs,
            'filters' => [
                'site_id' => $siteId,
                'status' => $status,
            ],
            'master' => [
                'sites' => Site::where('is_active', true)->select('id', 'name', 'code')->get(),
                'vendors' => Vendor::where('is_active', true)->select('id', 'vendor_code', 'name', 'vendor_type', 'email')->get(),
            ],
        ]);
    }

    public function storeRfq(Request $request, ProcurementService $procurementService)
    {
        $validated = $request->validate([
            'purchase_request_id' => 'required|exists:purchase_requests,id',
            'issue_date' => 'required|date',
            'closing_date' => 'nullable|date',
            'title' => 'required|string|max:200',
            'vendor_ids' => 'required|array|min:1',
            'vendor_ids.*' => 'exists:vendors,id',
            'notes' => 'nullable|string',
        ]);

        $pr = PurchaseRequest::findOrFail($validated['purchase_request_id']);
        $rfq = $procurementService->createRfq($pr, $validated);

        return redirect()->back()->with('success', "Request for Quotation {$rfq->rfq_number} berhasil diterbitkan dan undangan dikirim ke " . count($validated['vendor_ids']) . " vendor.");
    }

    public function storeQuotation(Request $request, Rfq $rfq, ProcurementService $procurementService)
    {
        $validated = $request->validate([
            'quotation_number' => 'nullable|string|max:60',
            'vendor_id' => 'required|exists:vendors,id',
            'quotation_date' => 'required|date',
            'valid_until' => 'nullable|date',
            'delivery_lead_time_days' => 'required|integer|min:1',
            'payment_terms' => 'required|string|max:100',
            'remarks' => 'nullable|string',
            'quotation_file' => 'nullable|file|mimes:pdf,jpg,jpeg,png,doc,docx,xls,xlsx|max:5120',
            'items' => 'required|array|min:1',
            'items.*.purchase_request_item_id' => 'nullable|exists:purchase_request_items,id',
            'items.*.inventory_item_id' => 'nullable|exists:inventory_items,id',
            'items.*.item_name' => 'required|string|max:180',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.unit' => 'nullable|string|max:30',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.discount_amount' => 'nullable|numeric|min:0',
            'items.*.tax_rate' => 'nullable|numeric|min:0',
            'items.*.brand_offered' => 'nullable|string|max:100',
        ]);

        if ($request->hasFile('quotation_file')) {
            $validated['attachment_path'] = $request->file('quotation_file')->store('procurement/quotations', 'public');
        }

        $qtn = $procurementService->recordVendorQuotation($rfq, $validated, $validated['items']);

        return redirect()->back()->with('success', "Penawaran Vendor {$qtn->quotation_number} ({$qtn->vendor?->name}) berhasil dicatat.");
    }

    public function selectVendor(Request $request, Rfq $rfq, ProcurementService $procurementService)
    {
        $validated = $request->validate([
            'selected_quotation_id' => 'required|exists:vendor_quotations,id',
            'selection_remarks' => 'required|string|max:1000',
        ]);

        $cmp = $procurementService->compareAndSelectVendor(
            $rfq,
            (int) $validated['selected_quotation_id'],
            $validated['selection_remarks']
        );

        return redirect()->back()->with('success', "Evaluasi Perbandingan Vendor ({$cmp->comparison_number}) selesai. Pemenang: {$cmp->selectedVendor?->name}. Siap diterbitkan menjadi Purchase Order (PO).");
    }
}
