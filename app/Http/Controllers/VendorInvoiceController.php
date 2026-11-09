<?php

namespace App\Http\Controllers;

use App\Models\GoodsReceipt;
use App\Models\PurchaseOrder;
use App\Models\Site;
use App\Models\Vendor;
use App\Models\VendorInvoice;
use App\Services\ProcurementService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VendorInvoiceController extends Controller
{
    public function index(Request $request)
    {
        $siteId = $request->input('site_id');
        $vendorId = $request->input('vendor_id');
        $verificationStatus = $request->input('verification_status');

        $invoices = VendorInvoice::with([
            'site:id,name,code',
            'vendor:id,name,vendor_code,npwp',
            'purchaseOrder:id,po_number,grand_total,payment_terms,status',
            'goodsReceipt:id,grn_number,total_received_value,receipt_date',
            'verifier:id,name',
        ])
            ->when($siteId, fn ($q) => $q->where('site_id', $siteId))
            ->when($vendorId, fn ($q) => $q->where('vendor_id', $vendorId))
            ->when($verificationStatus, fn ($q) => $q->where('verification_status', $verificationStatus))
            ->orderByDesc('id')
            ->paginate(12)
            ->withQueryString();

        $eligiblePos = PurchaseOrder::with([
            'vendor:id,name,vendor_code',
            'site:id,name,code',
            'goodsReceipts' => fn ($q) => $q->where('status', 'confirmed'),
        ])
            ->whereIn('status', ['partial_received', 'received', 'invoiced', 'completed'])
            ->when($siteId, fn ($q) => $q->where('site_id', $siteId))
            ->orderByDesc('id')
            ->get();

        $all = VendorInvoice::when($siteId, fn ($q) => $q->where('site_id', $siteId))->get();

        return Inertia::render('Procurement/Invoices/Index', [
            'invoices' => $invoices,
            'eligiblePos' => $eligiblePos,
            'metrics' => [
                'total_invoices' => $all->count(),
                'three_way_matched' => $all->where('is_three_way_matched', true)->count(),
                'discrepancy' => $all->where('verification_status', 'discrepancy')->count(),
                'ready_for_finance' => $all->where('verification_status', 'ready_for_finance')->count(),
                'total_obligation_value' => round((float) $all->whereNotIn('verification_status', ['rejected'])->sum('total_invoice_amount'), 2),
            ],
            'filters' => [
                'site_id' => $siteId,
                'vendor_id' => $vendorId,
                'verification_status' => $verificationStatus,
            ],
            'master' => [
                'sites' => Site::where('is_active', true)->select('id', 'name', 'code')->get(),
                'vendors' => Vendor::where('is_active', true)->select('id', 'vendor_code', 'name')->get(),
            ],
        ]);
    }

    public function store(Request $request, ProcurementService $procurementService)
    {
        $validated = $request->validate([
            'vendor_invoice_number' => 'required|string|max:100',
            'invoice_date' => 'required|date',
            'payment_due_date' => 'required|date',
            'site_id' => 'nullable|exists:sites,id',
            'purchase_order_id' => 'required|exists:purchase_orders,id',
            'goods_receipt_id' => 'nullable|exists:goods_receipts,id',
            'subtotal_amount' => 'required|numeric|min:0',
            'tax_amount' => 'required|numeric|min:0',
            'total_invoice_amount' => 'required|numeric|min:0',
            'invoice_file' => 'nullable|file|mimes:pdf,jpg,jpeg,png,doc,docx,xls,xlsx|max:5120',
            'remarks' => 'nullable|string',
        ]);

        if ($request->hasFile('invoice_file')) {
            $validated['attachment_path'] = $request->file('invoice_file')->store('procurement/invoices', 'public');
        }

        $inv = $procurementService->recordVendorInvoice($validated);

        return redirect()->back()->with('success', "Invoice Vendor {$inv->invoice_number} ({$inv->vendor_invoice_number}) berhasil dicatat. Status 3-Way Matching: {$inv->verification_status} (Kewajiban bayar disiapkan untuk modul Finance tanpa pembayaran bank otomatis).");
    }

    public function verify(Request $request, VendorInvoice $vendorInvoice, ProcurementService $procurementService)
    {
        $validated = $request->validate([
            'verification_status' => 'required|in:verified,ready_for_finance,discrepancy,rejected',
            'remarks' => 'nullable|string|max:500',
        ]);

        $updated = $procurementService->verifyVendorInvoice(
            $vendorInvoice,
            $validated['verification_status'],
            $validated['remarks'] ?? null
        );

        return redirect()->back()->with('success', "Status verifikasi Invoice {$updated->invoice_number} diperbarui menjadi {$updated->verification_status}.");
    }
}
