import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import DashboardLayout from '../../../components/templates/DashboardLayout';
import { FileSpreadsheet, Printer, CheckCircle2, Plus, X } from 'lucide-react';

const formatIDR = (val) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(val || 0));

export default function PurchaseOrdersIndex({ purchaseOrders, metrics = {}, filters = {}, master = {} }) {
    const [showCreateModal, setShowCreateModal] = useState(false);

    const firstSite = master.sites?.[0]?.id ?? '';
    const firstItem = master.items?.[0];

    const form = useForm({
        site_id: firstSite,
        warehouse_id: (master.warehouses || []).find((w) => String(w.site_id) === String(firstSite))?.id ?? '',
        department_id: master.departments?.[0]?.id ?? '',
        vendor_id: master.vendors?.[0]?.id ?? '',
        po_date: new Date().toISOString().slice(0, 10),
        expected_delivery_date: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
        delivery_location: 'Gudang Utama Site Operasional TAP',
        payment_terms: 'TOP 30 Days',
        purchase_category: 'sparepart',
        discount_amount: 0,
        tax_percent: 11,
        items: [
            {
                inventory_item_id: firstItem?.id ?? '',
                item_name: firstItem?.item_name ?? 'Oil Filter',
                specification: firstItem?.specification ?? 'OEM',
                quantity_ordered: 10,
                unit: firstItem?.unit_of_measurement ?? 'PCS',
                unit_price: firstItem?.standard_cost ?? 425000,
                discount_amount: 0,
            },
        ],
    });

    const submitPo = (e) => {
        e.preventDefault();
        form.post('/procurement/purchase-orders', {
            onSuccess: () => setShowCreateModal(false),
        });
    };

    const rows = purchaseOrders?.data || [];

    return (
        <DashboardLayout title="Purchase Order (PO), Otorisasi & Cetak PDF">
            <Head title="Purchase Orders (PO) - TAP" />

            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                            <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
                            Manajemen Purchase Order (PO), Otorisasi & Cetak Dokumen Resmi
                        </h1>
                        <p className="text-xs text-slate-500 mt-1">
                            Lengkap dengan kalkulasi Subtotal, Diskon, PPN, Grand Total, Lokasi Pengiriman, Termin Pembayaran, dan fasilitas Print / Save PDF.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
                    >
                        <Plus className="w-4 h-4" /> Buat Purchase Order (PO)
                    </button>
                </div>

                {/* PO Cards */}
                <div className="space-y-4">
                    {rows.map((po) => (
                        <div
                            key={po.id}
                            className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3"
                        >
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                                            {po.po_number}
                                        </span>
                                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-indigo-100 text-indigo-800">
                                            Status: {po.status}
                                        </span>
                                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-emerald-100 text-emerald-800">
                                            Approval: {po.approval_status}
                                        </span>
                                    </div>
                                    <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1">
                                        Vendor: {po.vendor?.name} ({po.vendor?.vendor_code}) • Site: {po.site?.code}
                                    </div>
                                    <div className="text-[11px] text-slate-500">
                                        Tgl PO: {po.po_date} • Target Kirim: {po.expected_delivery_date} • Termin:{' '}
                                        {po.payment_terms} • Lokasi: {po.delivery_location}
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-2">
                                    <div className="text-base font-extrabold text-indigo-600">
                                        Grand Total: {formatIDR(po.grand_total)}
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {po.approval_status === 'pending_approval' && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    router.post(`/procurement/purchase-orders/${po.id}/approve`, {
                                                        approve_all: true,
                                                    })
                                                }
                                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold"
                                            >
                                                <CheckCircle2 className="w-3.5 h-3.5" /> Approve PO
                                            </button>
                                        )}
                                        <Link
                                            href={`/procurement/purchase-orders/${po.id}/print`}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold"
                                        >
                                            <Printer className="w-3.5 h-3.5" /> Print / PDF
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* Items Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead>
                                        <tr className="text-slate-400 border-b border-slate-100 dark:border-slate-800">
                                            <th className="py-1.5 px-2">Item & Spesifikasi</th>
                                            <th className="py-1.5 px-2 text-right">Ordered</th>
                                            <th className="py-1.5 px-2 text-right">Received</th>
                                            <th className="py-1.5 px-2 text-right">Outstanding</th>
                                            <th className="py-1.5 px-2 text-right">Harga Satuan</th>
                                            <th className="py-1.5 px-2 text-right">Total (+PPN)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(po.items || []).map((it) => (
                                            <tr key={it.id} className="border-b border-slate-50 dark:border-slate-800/50">
                                                <td className="py-1.5 px-2 font-semibold">
                                                    {it.inventory_item?.item_code ? `${it.inventory_item.item_code} — ` : ''}
                                                    {it.item_name}
                                                </td>
                                                <td className="py-1.5 px-2 text-right font-bold">
                                                    {it.quantity_ordered} {it.unit}
                                                </td>
                                                <td className="py-1.5 px-2 text-right text-emerald-600 font-bold">
                                                    {it.quantity_received}
                                                </td>
                                                <td className="py-1.5 px-2 text-right text-amber-600 font-bold">
                                                    {it.quantity_outstanding}
                                                </td>
                                                <td className="py-1.5 px-2 text-right">{formatIDR(it.unit_price)}</td>
                                                <td className="py-1.5 px-2 text-right font-bold">
                                                    {formatIDR(it.total_price)}
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

            {/* Modal Buat PO */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl overflow-hidden shadow-xl">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                Buat Purchase Order (PO) Baru
                            </h3>
                            <button onClick={() => setShowCreateModal(false)} className="text-slate-400">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={submitPo} className="p-4 space-y-3 text-xs">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold mb-1">Site *</label>
                                    <select
                                        value={form.data.site_id}
                                        onChange={(e) => form.setData('site_id', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                    >
                                        {(master.sites || []).map((s) => (
                                            <option key={s.id} value={s.id}>
                                                {s.code} — {s.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-semibold mb-1">Vendor *</label>
                                    <select
                                        value={form.data.vendor_id}
                                        onChange={(e) => form.setData('vendor_id', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                    >
                                        {(master.vendors || []).map((v) => (
                                            <option key={v.id} value={v.id}>
                                                {v.vendor_code} — {v.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold mb-1">Target Tanggal Pengiriman *</label>
                                    <input
                                        type="date"
                                        value={form.data.expected_delivery_date}
                                        onChange={(e) => form.setData('expected_delivery_date', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold mb-1">Termin Pembayaran *</label>
                                    <input
                                        type="text"
                                        value={form.data.payment_terms}
                                        onChange={(e) => form.setData('payment_terms', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 rounded-xl border border-slate-200"
                                >
                                    Batal
                                </button>
                                <button type="submit" className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold">
                                    Terbitkan PO
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
