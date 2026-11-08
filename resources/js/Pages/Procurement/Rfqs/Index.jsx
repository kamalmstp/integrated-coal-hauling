import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import DashboardLayout from '../../../components/templates/DashboardLayout';
import { Scale, Award, Plus, CheckCircle2, Clock, CreditCard, X } from 'lucide-react';

const formatIDR = (val) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(val || 0));

export default function RfqComparisonIndex({ rfqs = [], comparisons = [], approvedPrs = [], master = {} }) {
    const [showRfqModal, setShowRfqModal] = useState(false);
    const [quoteModalRfq, setQuoteModalRfq] = useState(null);

    const rfqForm = useForm({
        purchase_request_id: approvedPrs?.[0]?.id ?? '',
        issue_date: new Date().toISOString().slice(0, 10),
        closing_date: new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10),
        title: 'Tender Pengadaan Sparepart & Ban Operasional Hauling',
        vendor_ids: (master.vendors || []).slice(0, 2).map((v) => v.id),
        notes: 'Harap melampirkan garansi keaslian part dan estimasi waktu pengiriman ke site.',
    });

    const qtnForm = useForm({
        vendor_id: master.vendors?.[0]?.id ?? '',
        quotation_date: new Date().toISOString().slice(0, 10),
        delivery_lead_time_days: 5,
        payment_terms: 'TOP 30 Days',
        remarks: 'Harga termasuk pengiriman sampai gudang site.',
        items: [],
    });

    const openQuoteModal = (rfq) => {
        const prItems = rfq.purchase_request?.items || [];
        qtnForm.setData({
            vendor_id: master.vendors?.[0]?.id ?? '',
            quotation_date: new Date().toISOString().slice(0, 10),
            delivery_lead_time_days: 5,
            payment_terms: 'TOP 30 Days',
            remarks: 'Penawaran resmi vendor',
            items: prItems.map((pi) => ({
                purchase_request_item_id: pi.id,
                inventory_item_id: pi.inventory_item_id,
                item_name: pi.item_name || pi.item?.item_name || 'Sparepart',
                quantity: pi.requested_qty,
                unit: pi.unit,
                unit_price: pi.estimated_unit_price,
                discount_amount: 0,
                tax_rate: 11,
                brand_offered: 'OEM Genuine',
            })),
        });
        setQuoteModalRfq(rfq);
    };

    const submitRfq = (e) => {
        e.preventDefault();
        rfqForm.post('/procurement/rfqs', { onSuccess: () => setShowRfqModal(false) });
    };

    const submitQuotation = (e) => {
        e.preventDefault();
        if (!quoteModalRfq) return;
        qtnForm.post(`/procurement/rfqs/${quoteModalRfq.id}/quotations`, {
            onSuccess: () => setQuoteModalRfq(null),
        });
    };

    return (
        <DashboardLayout title="Request for Quotation (RFQ) & Vendor Comparison Matrix">
            <Head title="RFQ & Komparasi Vendor - TAP" />

            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                            <Scale className="w-5 h-5 text-indigo-600" />
                            Request for Quotation (RFQ), Penawaran Vendor & Komparasi Pemenang
                        </h1>
                        <p className="text-xs text-slate-500 mt-1">
                            Bandingkan penawaran antar-vendor berdasarkan Harga (Price), Waktu Kirim (Delivery Lead Time), dan Termin Pembayaran (Payment Terms).
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowRfqModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
                    >
                        <Plus className="w-4 h-4" /> Buat RFQ & Undang Vendor
                    </button>
                </div>

                {/* RFQs & Quotations */}
                <div className="space-y-4">
                    {rfqs.map((rfq) => (
                        <div
                            key={rfq.id}
                            className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-4"
                        >
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                                            {rfq.rfq_number}
                                        </span>
                                        <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full bg-indigo-100 text-indigo-800">
                                            {rfq.status}
                                        </span>
                                        <span className="text-xs text-slate-500">
                                            Ref PR: <strong>{rfq.purchase_request?.pr_number}</strong> ({rfq.site?.code})
                                        </span>
                                    </div>
                                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1">
                                        {rfq.title}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => openQuoteModal(rfq)}
                                    className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold"
                                >
                                    + Input Quotation Vendor
                                </button>
                            </div>

                            {/* Quotations Comparison Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500">
                                            <th className="py-2.5 px-3">No. Quotation & Vendor</th>
                                            <th className="py-2.5 px-3 text-right">Harga Total (Termasuk PPN)</th>
                                            <th className="py-2.5 px-3 text-center">Delivery Time</th>
                                            <th className="py-2.5 px-3 text-center">Payment Terms</th>
                                            <th className="py-2.5 px-3">Status</th>
                                            <th className="py-2.5 px-3 text-right">Aksi Penunjukan Pemenang</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {(rfq.quotations || []).map((q) => (
                                            <tr key={q.id}>
                                                <td className="py-2.5 px-3">
                                                    <div className="font-bold text-slate-900 dark:text-white">
                                                        {q.quotation_number} — {q.vendor?.name}
                                                    </div>
                                                    <div className="text-[10px] text-slate-500">{q.remarks || '-'}</div>
                                                </td>
                                                <td className="py-2.5 px-3 text-right font-extrabold text-indigo-600">
                                                    {formatIDR(q.total_amount)}
                                                </td>
                                                <td className="py-2.5 px-3 text-center font-bold">
                                                    {q.delivery_lead_time_days} Hari Kerja
                                                </td>
                                                <td className="py-2.5 px-3 text-center font-semibold">
                                                    {q.payment_terms}
                                                </td>
                                                <td className="py-2.5 px-3">
                                                    <span
                                                        className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${
                                                            q.status === 'selected'
                                                                ? 'bg-emerald-100 text-emerald-800'
                                                                : 'bg-slate-100 text-slate-700'
                                                        }`}
                                                    >
                                                        {q.status}
                                                    </span>
                                                </td>
                                                <td className="py-2.5 px-3 text-right">
                                                    {rfq.status !== 'awarded' ? (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                router.post(
                                                                    `/procurement/rfqs/${rfq.id}/select-vendor`,
                                                                    {
                                                                        selected_quotation_id: q.id,
                                                                        selection_remarks: `Vendor ${q.vendor?.name} dipilih berdasarkan evaluasi harga, waktu pengiriman (${q.delivery_lead_time_days} hari), dan termin ${q.payment_terms}.`,
                                                                    }
                                                                )
                                                            }
                                                            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-bold"
                                                        >
                                                            <Award className="w-3 h-3" /> Pilih sebagai Pemenang
                                                        </button>
                                                    ) : (
                                                        q.status === 'selected' && (
                                                            <span className="text-emerald-600 font-extrabold text-[11px]">
                                                                ★ Pemenang Tender
                                                            </span>
                                                        )
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal Buat RFQ */}
            {showRfqModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden shadow-xl">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                Buat Request for Quotation (RFQ) dari PR Approved
                            </h3>
                            <button onClick={() => setShowRfqModal(false)} className="text-slate-400">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={submitRfq} className="p-4 space-y-3 text-xs">
                            <div>
                                <label className="block font-semibold mb-1">Pilih Purchase Request (Approved) *</label>
                                <select
                                    value={rfqForm.data.purchase_request_id}
                                    onChange={(e) => rfqForm.setData('purchase_request_id', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                    required
                                >
                                    {approvedPrs.map((pr) => (
                                        <option key={pr.id} value={pr.id}>
                                            {pr.pr_number} — {pr.purpose || pr.purchase_category}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Judul RFQ *</label>
                                <input
                                    type="text"
                                    value={rfqForm.data.title}
                                    onChange={(e) => rfqForm.setData('title', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowRfqModal(false)}
                                    className="px-4 py-2 rounded-xl border border-slate-200"
                                >
                                    Batal
                                </button>
                                <button type="submit" className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold">
                                    Terbitkan RFQ
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Input Quotation Vendor */}
            {quoteModalRfq && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl overflow-hidden shadow-xl">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                Catat Penawaran Vendor ({quoteModalRfq.rfq_number})
                            </h3>
                            <button onClick={() => setQuoteModalRfq(null)} className="text-slate-400">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={submitQuotation} className="p-4 space-y-3 text-xs">
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block font-semibold mb-1">Vendor</label>
                                    <select
                                        value={qtnForm.data.vendor_id}
                                        onChange={(e) => qtnForm.setData('vendor_id', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                    >
                                        {(master.vendors || []).map((v) => (
                                            <option key={v.id} value={v.id}>
                                                {v.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-semibold mb-1">Waktu Kirim (Hari)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={qtnForm.data.delivery_lead_time_days}
                                        onChange={(e) => qtnForm.setData('delivery_lead_time_days', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold mb-1">Termin Pembayaran</label>
                                    <select
                                        value={qtnForm.data.payment_terms}
                                        onChange={(e) => qtnForm.setData('payment_terms', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                    >
                                        <option value="TOP 30 Days">TOP 30 Days</option>
                                        <option value="TOP 45 Days">TOP 45 Days</option>
                                        <option value="TOP 60 Days">TOP 60 Days</option>
                                        <option value="TOP 14 Days">TOP 14 Days</option>
                                        <option value="COD">COD</option>
                                        <option value="CBD">CBD</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                {qtnForm.data.items.map((it, idx) => (
                                    <div key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-between gap-2">
                                        <span className="font-semibold">
                                            {it.item_name} ({it.quantity} {it.unit})
                                        </span>
                                        <input
                                            type="number"
                                            value={it.unit_price}
                                            onChange={(e) => {
                                                const copy = [...qtnForm.data.items];
                                                copy[idx].unit_price = e.target.value;
                                                qtnForm.setData('items', copy);
                                            }}
                                            className="w-36 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-right font-bold"
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setQuoteModalRfq(null)}
                                    className="px-4 py-2 rounded-xl border border-slate-200"
                                >
                                    Batal
                                </button>
                                <button type="submit" className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold">
                                    Simpan Quotation Vendor
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
