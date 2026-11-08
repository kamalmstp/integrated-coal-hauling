import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import DashboardLayout from '../../../components/templates/DashboardLayout';
import { ClipboardList, CheckCircle2, XCircle, Plus, ShieldCheck, X } from 'lucide-react';

const formatIDR = (val) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(val || 0));

export default function PurchaseRequestsIndex({ requests, metrics = {}, filters = {}, master = {} }) {
    const [showCreateModal, setShowCreateModal] = useState(false);

    const firstSite = master.sites?.[0]?.id ?? '';
    const firstItem = master.items?.[0];

    const form = useForm({
        site_id: firstSite,
        warehouse_id: (master.warehouses || []).find((w) => String(w.site_id) === String(firstSite))?.id ?? '',
        department_id: master.departments?.[0]?.id ?? '',
        request_date: new Date().toISOString().slice(0, 10),
        required_date: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
        source: 'warehouse_reorder',
        purchase_category: 'sparepart',
        priority: 'high',
        purpose: 'Pengadaan suku cadang operasional armada coal hauling',
        requested_by: master.employees?.[0]?.id ?? '',
        notes: '',
        items: [
            {
                inventory_item_id: firstItem?.id ?? '',
                item_name: firstItem?.item_name ?? 'Oil Filter',
                specification: firstItem?.specification ?? 'OEM Standard',
                requested_qty: 10,
                unit: firstItem?.unit_of_measurement ?? 'PCS',
                estimated_unit_price: firstItem?.standard_cost ?? 425000,
                purpose: 'Stok cadangan workshop',
            },
        ],
    });

    const submitPr = (e) => {
        e.preventDefault();
        form.post('/procurement/purchase-requests', {
            onSuccess: () => setShowCreateModal(false),
        });
    };

    const rows = requests?.data || [];

    return (
        <DashboardLayout title="Purchase Request (PR) & Multi-Level Approval">
            <Head title="Purchase Requests (PR) - TAP" />

            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                            <ClipboardList className="w-5 h-5 text-indigo-600" />
                            Purchase Request (PR) & Histori Otorisasi Multi-Level
                        </h1>
                        <p className="text-xs text-slate-500 mt-1">
                            Sumber PR: Warehouse Reorder, Maintenance Request, Operational Requirement, dan General Purchase.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
                    >
                        <Plus className="w-4 h-4" /> Buat Purchase Request (PR)
                    </button>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                        <span className="text-xs text-slate-500">Total Dokumen PR</span>
                        <p className="text-2xl font-extrabold mt-1">{metrics.total || 0}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                        <span className="text-xs text-amber-600 font-bold">Menunggu Approval</span>
                        <p className="text-2xl font-extrabold text-amber-600 mt-1">{metrics.pending_approval || 0}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                        <span className="text-xs text-emerald-600 font-bold">Telah Disetujui (Approved)</span>
                        <p className="text-2xl font-extrabold text-emerald-600 mt-1">{metrics.approved || 0}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                        <span className="text-xs text-indigo-600 font-bold">Total Estimasi Nilai PR</span>
                        <p className="text-xl font-extrabold text-indigo-600 mt-1">
                            {formatIDR(metrics.total_estimated)}
                        </p>
                    </div>
                </div>

                {/* PR List */}
                <div className="space-y-4">
                    {rows.map((pr) => (
                        <div
                            key={pr.id}
                            className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3"
                        >
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                                            {pr.pr_number}
                                        </span>
                                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-indigo-100 text-indigo-800">
                                            {pr.status}
                                        </span>
                                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-slate-100 dark:bg-slate-800">
                                            Sumber: {pr.source}
                                        </span>
                                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-amber-50 text-amber-700">
                                            Prioritas: {pr.priority}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                        <strong>Tujuan:</strong> {pr.purpose || pr.notes || '-'}
                                    </p>
                                    <div className="text-[11px] text-slate-500 mt-0.5">
                                        Site: {pr.site?.code} • Dept: {pr.department?.name || '-'} • Pemohon:{' '}
                                        {pr.requester?.name || '-'} • Tgl Request: {pr.request_date} • Required:{' '}
                                        {pr.required_date || '-'}
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-2">
                                    <div className="text-sm font-extrabold text-indigo-600">
                                        Estimasi: {formatIDR(pr.estimated_total)}
                                    </div>
                                    {['submitted', 'pending_approval'].includes(pr.status) && (
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    router.post(`/procurement/purchase-requests/${pr.id}/approve`, {
                                                        approve_all: true,
                                                    })
                                                }
                                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold"
                                            >
                                                <CheckCircle2 className="w-3.5 h-3.5" /> Approve PR
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    router.post(`/procurement/purchase-requests/${pr.id}/reject`, {
                                                        rejection_reason: 'Anggaran ditunda ke periode berikutnya',
                                                    })
                                                }
                                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold"
                                            >
                                                <XCircle className="w-3.5 h-3.5" /> Reject
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Items */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead>
                                        <tr className="text-slate-400 border-b border-slate-100 dark:border-slate-800">
                                            <th className="py-1.5 px-2">Item & Spesifikasi</th>
                                            <th className="py-1.5 px-2 text-right">Qty Diminta</th>
                                            <th className="py-1.5 px-2 text-right">Est. Harga Satuan</th>
                                            <th className="py-1.5 px-2 text-right">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(pr.items || []).map((it) => (
                                            <tr key={it.id} className="border-b border-slate-50 dark:border-slate-800/50">
                                                <td className="py-1.5 px-2">
                                                    <span className="font-bold">
                                                        {it.item?.item_code ? `${it.item.item_code} — ` : ''}
                                                        {it.item_name || it.item?.item_name}
                                                    </span>
                                                    {it.specification && (
                                                        <span className="text-[10px] text-slate-400 ml-2">
                                                            ({it.specification})
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-1.5 px-2 text-right font-bold">
                                                    {it.requested_qty} {it.unit}
                                                </td>
                                                <td className="py-1.5 px-2 text-right">
                                                    {formatIDR(it.estimated_unit_price)}
                                                </td>
                                                <td className="py-1.5 px-2 text-right font-semibold">
                                                    {formatIDR(it.estimated_subtotal)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Approval History Trail */}
                            {(pr.approvals || []).length > 0 && (
                                <div className="pt-2 flex flex-wrap items-center gap-2 text-[11px]">
                                    <span className="text-slate-400 font-semibold flex items-center gap-1">
                                        <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" /> Histori Approval:
                                    </span>
                                    {(pr.approvals || []).map((ap) => (
                                        <span
                                            key={ap.id}
                                            className={`px-2 py-0.5 rounded-lg border ${
                                                ap.status === 'approved'
                                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                                                    : 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
                                            }`}
                                        >
                                            Step {ap.step_order}: {ap.step_name} — <strong>{ap.status.toUpperCase()}</strong>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal Buat PR */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden shadow-xl">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                Buat Purchase Request (PR) Baru
                            </h3>
                            <button onClick={() => setShowCreateModal(false)} className="text-slate-400">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={submitPr} className="p-4 space-y-3 text-xs max-h-[80vh] overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
                                    <label className="block font-semibold mb-1">Departemen *</label>
                                    <select
                                        value={form.data.department_id}
                                        onChange={(e) => form.setData('department_id', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                    >
                                        {(master.departments || []).map((d) => (
                                            <option key={d.id} value={d.id}>
                                                {d.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-semibold mb-1">Sumber PR *</label>
                                    <select
                                        value={form.data.source}
                                        onChange={(e) => form.setData('source', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                    >
                                        <option value="warehouse_reorder">Warehouse Reorder</option>
                                        <option value="maintenance_request">Maintenance Request</option>
                                        <option value="operational_requirement">Operational Requirement</option>
                                        <option value="general_purchase">General Purchase</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                    <label className="block font-semibold mb-1">Kategori Pembelian *</label>
                                    <select
                                        value={form.data.purchase_category}
                                        onChange={(e) => form.setData('purchase_category', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                    >
                                        <option value="sparepart">Sparepart</option>
                                        <option value="tire_tyre">Tire & Tyre</option>
                                        <option value="lubricant">Lubricant</option>
                                        <option value="operational">Operational</option>
                                        <option value="general">General Supplies</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-semibold mb-1">Prioritas *</label>
                                    <select
                                        value={form.data.priority}
                                        onChange={(e) => form.setData('priority', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                    >
                                        <option value="normal">Normal</option>
                                        <option value="high">High</option>
                                        <option value="critical">Critical</option>
                                        <option value="low">Low</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-semibold mb-1">Tanggal Dibutuhkan *</label>
                                    <input
                                        type="date"
                                        value={form.data.required_date}
                                        onChange={(e) => form.setData('required_date', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-semibold mb-1">Tujuan Pembelian (Purpose) *</label>
                                <input
                                    type="text"
                                    value={form.data.purpose}
                                    onChange={(e) => form.setData('purpose', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                    required
                                />
                            </div>

                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-2">
                                <label className="block font-bold">Item yang Diminta</label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                    <select
                                        value={form.data.items[0].inventory_item_id}
                                        onChange={(e) => {
                                            const it = (master.items || []).find(
                                                (x) => String(x.id) === String(e.target.value)
                                            );
                                            form.setData('items', [
                                                {
                                                    ...form.data.items[0],
                                                    inventory_item_id: e.target.value,
                                                    item_name: it ? it.item_name : form.data.items[0].item_name,
                                                    specification: it ? it.specification : '',
                                                    unit: it ? it.unit_of_measurement : 'PCS',
                                                    estimated_unit_price: it ? it.standard_cost : 0,
                                                },
                                            ]);
                                        }}
                                        className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                                    >
                                        {(master.items || []).map((i) => (
                                            <option key={i.id} value={i.id}>
                                                {i.item_code} — {i.item_name}
                                            </option>
                                        ))}
                                    </select>
                                    <input
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                        value={form.data.items[0].requested_qty}
                                        onChange={(e) =>
                                            form.setData('items', [
                                                { ...form.data.items[0], requested_qty: e.target.value },
                                            ])
                                        }
                                        placeholder="Qty"
                                        className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                                    />
                                    <input
                                        type="number"
                                        min="0"
                                        value={form.data.items[0].estimated_unit_price}
                                        onChange={(e) =>
                                            form.setData('items', [
                                                { ...form.data.items[0], estimated_unit_price: e.target.value },
                                            ])
                                        }
                                        placeholder="Est. Harga Satuan"
                                        className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
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
                                    Ajukan Purchase Request
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
