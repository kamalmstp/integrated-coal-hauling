import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import DashboardLayout from '@/components/templates/DashboardLayout';

export default function VendorInvoicesIndex({ invoices, eligiblePos, metrics, filters, master }) {
    const [showCreateModal, setShowCreateModal] = useState(false);

    const form = useForm({
        vendor_invoice_number: '',
        invoice_date: new Date().toISOString().slice(0, 10),
        payment_due_date: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
        site_id: '',
        purchase_order_id: '',
        goods_receipt_id: '',
        subtotal_amount: 0,
        tax_amount: 0,
        total_invoice_amount: 0,
        remarks: '',
    });

    const formatIDR = (val) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(val || 0));

    const selectedPo = (eligiblePos || []).find((p) => String(p.id) === String(form.data.purchase_order_id));

    const handleSelectPo = (poId) => {
        const po = (eligiblePos || []).find((p) => String(p.id) === String(poId));
        if (!po) {
            form.setData('purchase_order_id', poId);
            return;
        }
        const firstGrn = po.goods_receipts?.[0];
        const baseAmount = firstGrn ? Number(firstGrn.total_received_value) : Number(po.grand_total);
        const tax = Math.round(baseAmount * 0.11);
        form.setData({
            ...form.data,
            purchase_order_id: po.id,
            site_id: po.site_id,
            goods_receipt_id: firstGrn?.id || '',
            subtotal_amount: baseAmount,
            tax_amount: tax,
            total_invoice_amount: baseAmount + tax,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        form.post('/procurement/invoices', {
            onSuccess: () => {
                setShowCreateModal(false);
                form.reset();
            },
        });
    };

    const handleVerify = (invId, status) => {
        router.post(`/procurement/invoices/${invId}/verify`, {
            verification_status: status,
            remarks: `3-Way Matching Diverifikasi (${status}) — Siap diintegrasikan ke Finance AP.`,
        });
    };

    const applyFilter = (key, val) => {
        router.get('/procurement/invoices', { ...filters, [key]: val }, { preserveState: true, replace: true });
    };

    return (
        <DashboardLayout title="Vendor Invoice Recording & 3-Way Matching">
            <Head title="Vendor Invoices - Procurement Management" />

            <div className="space-y-6">
                {/* Workflow Navigation */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                        <Link href="/procurement/dashboard" className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            Dashboard
                        </Link>
                        <Link href="/procurement/purchase-requests" className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            1. Purchase Requests
                        </Link>
                        <Link href="/procurement/rfqs" className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            2. RFQ & Comparison
                        </Link>
                        <Link href="/procurement/purchase-orders" className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            3. Purchase Orders
                        </Link>
                        <Link href="/procurement/goods-receipts" className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            4. Goods Receipt (GRN)
                        </Link>
                        <Link href="/procurement/invoices" className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white">
                            5. Vendor Invoices (3-Way Match)
                        </Link>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowCreateModal(true)}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-sm transition"
                    >
                        + Catat Invoice Vendor
                    </button>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <div className="text-[11px] font-bold uppercase text-slate-400">Total Invoice Tercatat</div>
                        <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{metrics?.total_invoices || 0}</div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <div className="text-[11px] font-bold uppercase text-emerald-500">3-Way Matched (PO+GRN+INV)</div>
                        <div className="text-2xl font-black text-emerald-600 mt-1">{metrics?.three_way_matched || 0}</div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <div className="text-[11px] font-bold uppercase text-amber-500">Selisih / Discrepancy</div>
                        <div className="text-2xl font-black text-amber-600 mt-1">{metrics?.discrepancy || 0}</div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <div className="text-[11px] font-bold uppercase text-indigo-500">Ready for Finance AP</div>
                        <div className="text-2xl font-black text-indigo-600 mt-1">{metrics?.ready_for_finance || 0}</div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <div className="text-[11px] font-bold uppercase text-slate-500">Total Kewajiban Bayar</div>
                        <div className="text-lg font-black text-slate-900 dark:text-white mt-1">{formatIDR(metrics?.total_obligation_value)}</div>
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap gap-3 items-center">
                    <select
                        value={filters?.site_id || ''}
                        onChange={(e) => applyFilter('site_id', e.target.value)}
                        className="rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-xs"
                    >
                        <option value="">Semua Site</option>
                        {(master?.sites || []).map((s) => (
                            <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                        ))}
                    </select>
                    <select
                        value={filters?.vendor_id || ''}
                        onChange={(e) => applyFilter('vendor_id', e.target.value)}
                        className="rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-xs"
                    >
                        <option value="">Semua Vendor</option>
                        {(master?.vendors || []).map((v) => (
                            <option key={v.id} value={v.id}>{v.name} ({v.vendor_code})</option>
                        ))}
                    </select>
                    <select
                        value={filters?.verification_status || ''}
                        onChange={(e) => applyFilter('verification_status', e.target.value)}
                        className="rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-xs"
                    >
                        <option value="">Semua Status Verifikasi</option>
                        <option value="ready_for_finance">Ready for Finance (Purchase Completed)</option>
                        <option value="verified">Verified</option>
                        <option value="discrepancy">Discrepancy (Selisih Nilai)</option>
                        <option value="draft">Draft</option>
                    </select>
                </div>

                {/* Invoices Table */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase text-[10px]">
                                <tr>
                                    <th className="py-3 px-4 text-left">No. Internal & Faktur Vendor</th>
                                    <th className="py-3 px-4 text-left">Vendor & Site</th>
                                    <th className="py-3 px-4 text-left">Referensi PO & GRN</th>
                                    <th className="py-3 px-4 text-right">Nilai PO / GRN</th>
                                    <th className="py-3 px-4 text-right">Total Tagihan (Invoice)</th>
                                    <th className="py-3 px-4 text-center">3-Way Matching</th>
                                    <th className="py-3 px-4 text-center">Aksi Verifikasi Finance</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {(invoices?.data || []).map((inv) => (
                                    <tr key={inv.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                                        <td className="py-3.5 px-4">
                                            <div className="font-black text-slate-900 dark:text-white">{inv.invoice_number}</div>
                                            <div className="text-[11px] font-semibold text-indigo-600">
                                                Faktur: {inv.vendor_invoice_number}
                                            </div>
                                            <div className="text-[10px] text-slate-500">
                                                Tgl: {inv.invoice_date?.slice(0, 10)} • Jatuh Tempo: {inv.payment_due_date?.slice(0, 10)}
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <div className="font-bold text-slate-800 dark:text-slate-200">{inv.vendor?.name}</div>
                                            <div className="text-[11px] text-slate-500">{inv.site?.name} ({inv.site?.code})</div>
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <div className="font-bold text-slate-800 dark:text-slate-200">
                                                PO: {inv.purchase_order?.po_number} ({inv.purchase_order?.status})
                                            </div>
                                            <div className="text-[11px] text-emerald-600 font-semibold">
                                                GRN: {inv.goods_receipt?.grn_number || 'Multiple / Direct PO'}
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-4 text-right">
                                            <div className="text-slate-600 dark:text-slate-400">
                                                PO: <span className="font-semibold">{formatIDR(inv.po_matched_amount)}</span>
                                            </div>
                                            <div className="text-slate-600 dark:text-slate-400">
                                                GRN: <span className="font-semibold">{formatIDR(inv.grn_matched_amount)}</span>
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-4 text-right">
                                            <div className="font-black text-slate-900 dark:text-white">
                                                {formatIDR(inv.total_invoice_amount)}
                                            </div>
                                            <div className="text-[10px] text-slate-500">
                                                DPP {formatIDR(inv.subtotal_amount)} + PPN {formatIDR(inv.tax_amount)}
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-4 text-center">
                                            {inv.is_three_way_matched ? (
                                                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                                                    ✓ 3-WAY MATCHED
                                                </span>
                                            ) : (
                                                <div>
                                                    <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black">
                                                        SELISIH: {formatIDR(inv.variance_amount)}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="mt-1 text-[10px] uppercase font-bold text-slate-500">
                                                Status: {inv.verification_status}
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-4 text-center">
                                            {inv.verification_status !== 'ready_for_finance' ? (
                                                <button
                                                    type="button"
                                                    onClick={() => handleVerify(inv.id, 'ready_for_finance')}
                                                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold"
                                                >
                                                    Setujui → Ready for Finance
                                                </button>
                                            ) : (
                                                <span className="px-2.5 py-1 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-black">
                                                    PURCHASE COMPLETED (AP READY)
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal Record Invoice */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <form
                        onSubmit={handleSubmit}
                        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full p-6 space-y-4 shadow-xl"
                    >
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                            <div>
                                <h3 className="text-base font-black text-slate-900 dark:text-white">
                                    Catat Tagihan Vendor (Invoice Recording & 3-Way Matching)
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Menyiapkan kewajiban pembayaran (AP Obligation) untuk Finance tanpa pembayaran bank otomatis.
                                </p>
                            </div>
                            <button type="button" onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">
                                ✕
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div>
                                <label className="font-bold">Pilih Purchase Order</label>
                                <select
                                    required
                                    value={form.data.purchase_order_id}
                                    onChange={(e) => handleSelectPo(e.target.value)}
                                    className="w-full mt-1 rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-xs"
                                >
                                    <option value="">-- Pilih PO --</option>
                                    {(eligiblePos || []).map((po) => (
                                        <option key={po.id} value={po.id}>
                                            {po.po_number} - {po.vendor?.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="font-bold">Referensi Goods Receipt (GRN)</label>
                                <select
                                    value={form.data.goods_receipt_id}
                                    onChange={(e) => form.setData('goods_receipt_id', e.target.value)}
                                    className="w-full mt-1 rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-xs"
                                >
                                    <option value="">-- Semua GRN Terkonfirmasi --</option>
                                    {(selectedPo?.goods_receipts || []).map((grn) => (
                                        <option key={grn.id} value={grn.id}>
                                            {grn.grn_number} ({formatIDR(grn.total_received_value)})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="font-bold">Nomor Faktur / Invoice Vendor</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="INV-VND-2026-0091"
                                    value={form.data.vendor_invoice_number}
                                    onChange={(e) => form.setData('vendor_invoice_number', e.target.value)}
                                    className="w-full mt-1 rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-xs"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="font-bold">Tgl Invoice</label>
                                    <input
                                        type="date"
                                        required
                                        value={form.data.invoice_date}
                                        onChange={(e) => form.setData('invoice_date', e.target.value)}
                                        className="w-full mt-1 rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="font-bold">Jatuh Tempo</label>
                                    <input
                                        type="date"
                                        required
                                        value={form.data.payment_due_date}
                                        onChange={(e) => form.setData('payment_due_date', e.target.value)}
                                        className="w-full mt-1 rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-xs"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="font-bold">DPP / Subtotal Invoice (Rp)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={form.data.subtotal_amount}
                                    onChange={(e) => {
                                        const sub = Number(e.target.value || 0);
                                        const tax = Number(form.data.tax_amount || 0);
                                        form.setData({
                                            ...form.data,
                                            subtotal_amount: sub,
                                            total_invoice_amount: sub + tax,
                                        });
                                    }}
                                    className="w-full mt-1 rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-xs"
                                />
                            </div>
                            <div>
                                <label className="font-bold">PPN / Pajak (Rp)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={form.data.tax_amount}
                                    onChange={(e) => {
                                        const tax = Number(e.target.value || 0);
                                        const sub = Number(form.data.subtotal_amount || 0);
                                        form.setData({
                                            ...form.data,
                                            tax_amount: tax,
                                            total_invoice_amount: sub + tax,
                                        });
                                    }}
                                    className="w-full mt-1 rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-xs"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="font-bold">Total Tagihan Invoice (Rp)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={form.data.total_invoice_amount}
                                    onChange={(e) => form.setData('total_invoice_amount', e.target.value)}
                                    className="w-full mt-1 rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-xs font-black text-indigo-600"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                            <button
                                type="button"
                                onClick={() => setShowCreateModal(false)}
                                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={form.processing}
                                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black"
                            >
                                Simpan Invoice & Jalankan 3-Way Match
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </DashboardLayout>
    );
}
