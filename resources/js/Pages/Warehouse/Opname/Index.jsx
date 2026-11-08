import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import DashboardLayout from '../../../components/templates/DashboardLayout';
import { ClipboardCheck, ShieldAlert, CheckCircle2, Plus, X } from 'lucide-react';

const formatIDR = (val) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(val || 0));

export default function StockOpnameIndex({ opnames = [], adjustments = [], filters = {}, master = {} }) {
    const [showOpnameModal, setShowOpnameModal] = useState(false);

    const opForm = useForm({
        warehouse_id: master.warehouses?.[0]?.id ?? '',
        scheduled_date: new Date().toISOString().slice(0, 10),
        storeman_id: master.employees?.[0]?.id ?? '',
        auditor_id: master.employees?.[1]?.id ?? master.employees?.[0]?.id ?? '',
        remarks: 'Jadwal Stock Opname Fisik Bulanan Gudang.',
    });

    const submitOpname = (e) => {
        e.preventDefault();
        opForm.post('/warehouse/opname', { onSuccess: () => setShowOpnameModal(false) });
    };

    return (
        <DashboardLayout title="Stock Opname, Investigasi Selisih & Approval Adjustment">
            <Head title="Stock Opname & Adjustment - TAP" />

            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                            <ClipboardCheck className="w-5 h-5 text-indigo-600" />
                            Stock Opname, Investigasi Selisih & Otorisasi Stock Adjustment
                        </h1>
                        <p className="text-xs text-slate-500 mt-1">
                            Ketentuan Audit: Perbedaan hitung fisik (Physical Count) pada Stock Opname TIDAK mengubah stok sistem secara langsung. Selisih wajib melalui investigasi dan disetujui melalui dokumen resmi Stock Adjustment.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowOpnameModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
                    >
                        <Plus className="w-4 h-4" /> Buat Jadwal Stock Opname
                    </button>
                </div>

                {/* Stock Opnames List */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
                    <div className="p-4 border-b border-slate-200/80 dark:border-slate-800">
                        <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                            Daftar Dokumen Stock Opname (Physical Count vs System Qty)
                        </h2>
                    </div>
                    <div className="divide-y divide-slate-200/60 dark:divide-slate-800">
                        {opnames.map((op) => (
                            <div key={op.id} className="p-4 space-y-3">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                                                {op.opname_number}
                                            </span>
                                            <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full bg-amber-100 text-amber-800">
                                                {op.status}
                                            </span>
                                            <span className="text-xs text-slate-500">
                                                {op.warehouse?.name} ({op.site?.code})
                                            </span>
                                        </div>
                                        <div className="text-[11px] text-slate-500 mt-0.5">
                                            Jadwal: {op.scheduled_date} • Storeman: {op.storeman?.name || '-'} • Auditor:{' '}
                                            {op.auditor?.name || '-'}
                                        </div>
                                        {op.investigation_notes && (
                                            <div className="text-[11px] text-amber-700 dark:text-amber-400 mt-1">
                                                <strong>Catatan Investigasi:</strong> {op.investigation_notes}
                                            </div>
                                        )}
                                    </div>
                                    {op.status === 'under_investigation' && (op.adjustments || []).length === 0 && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                router.post('/warehouse/adjustments', {
                                                    stock_opname_id: op.id,
                                                    reason_category: 'opname_variance',
                                                })
                                            }
                                            className="px-3 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-bold"
                                        >
                                            Ajukan Dokumen Stock Adjustment
                                        </button>
                                    )}
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse text-xs">
                                        <thead>
                                            <tr className="text-slate-400 border-b border-slate-100 dark:border-slate-800">
                                                <th className="py-1.5 px-2">Item</th>
                                                <th className="py-1.5 px-2">Lokasi Rack/Bin</th>
                                                <th className="py-1.5 px-2 text-right">System Qty</th>
                                                <th className="py-1.5 px-2 text-right">Physical Count</th>
                                                <th className="py-1.5 px-2 text-right">Variance Qty</th>
                                                <th className="py-1.5 px-2 text-right">Variance Value</th>
                                                <th className="py-1.5 px-2">Status & Investigasi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                            {(op.items || []).map((it) => (
                                                <tr key={it.id}>
                                                    <td className="py-2 px-2 font-semibold">
                                                        {it.item?.item_code} — {it.item?.item_name}
                                                    </td>
                                                    <td className="py-2 px-2 font-mono text-[11px]">
                                                        {it.location?.location_code || '-'}
                                                    </td>
                                                    <td className="py-2 px-2 text-right font-bold">{it.system_qty}</td>
                                                    <td className="py-2 px-2 text-right font-bold">{it.physical_qty}</td>
                                                    <td
                                                        className={`py-2 px-2 text-right font-extrabold ${
                                                            Number(it.variance_qty) < 0
                                                                ? 'text-rose-600'
                                                                : Number(it.variance_qty) > 0
                                                                ? 'text-emerald-600'
                                                                : 'text-slate-500'
                                                        }`}
                                                    >
                                                        {it.variance_qty}
                                                    </td>
                                                    <td className="py-2 px-2 text-right">
                                                        {formatIDR(it.variance_value)}
                                                    </td>
                                                    <td className="py-2 px-2 text-[11px] text-slate-500">
                                                        <strong>{it.status}</strong> — {it.investigation_reason || '-'}
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

                {/* Stock Adjustments Approval Table */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
                    <div className="p-4 border-b border-slate-200/80 dark:border-slate-800">
                        <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                            Dokumen Otorisasi Penyesuaian Stok (Stock Adjustment Approval)
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                                    <th className="py-3 px-3 font-bold">No. Adjustment</th>
                                    <th className="py-3 px-3 font-bold">Gudang & Ref Opname</th>
                                    <th className="py-3 px-3 font-bold">Item yang Disesuaikan</th>
                                    <th className="py-3 px-3 font-bold">Status</th>
                                    <th className="py-3 px-3 font-bold text-right">Aksi Approval</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800">
                                {adjustments.map((adj) => (
                                    <tr key={adj.id}>
                                        <td className="py-3 px-3">
                                            <div className="font-extrabold text-slate-900 dark:text-white">
                                                {adj.adjustment_number}
                                            </div>
                                            <div className="text-[10px] text-slate-500">{adj.adjustment_date}</div>
                                        </td>
                                        <td className="py-3 px-3">
                                            <div className="font-semibold">{adj.warehouse?.name}</div>
                                            <div className="text-[10px] text-slate-500">
                                                Opname: {adj.opname?.opname_number || 'Standalone'} • Kategori:{' '}
                                                {adj.reason_category}
                                            </div>
                                        </td>
                                        <td className="py-3 px-3">
                                            {(adj.items || []).map((ai) => (
                                                <div key={ai.id} className="text-[11px]">
                                                    • {ai.item?.item_code} ({ai.item?.item_name}):{' '}
                                                    <strong>
                                                        {ai.direction} {ai.adjustment_qty}
                                                    </strong>{' '}
                                                    (Sys: {ai.system_qty} &rarr; Phys: {ai.physical_qty})
                                                </div>
                                            ))}
                                        </td>
                                        <td className="py-3 px-3">
                                            <span
                                                className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${
                                                    adj.status === 'approved'
                                                        ? 'bg-emerald-100 text-emerald-800'
                                                        : 'bg-amber-100 text-amber-800'
                                                }`}
                                            >
                                                {adj.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-3 text-right">
                                            {adj.status === 'pending_approval' ? (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        router.post(`/warehouse/adjustments/${adj.id}/approve`)
                                                    }
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold"
                                                >
                                                    <CheckCircle2 className="w-3.5 h-3.5" /> Approve & Sesuaikan Stok
                                                </button>
                                            ) : (
                                                <span className="text-[11px] text-emerald-600 font-bold">
                                                    Telah Disetujui
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

            {/* Modal Buat Jadwal Opname */}
            {showOpnameModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden shadow-xl">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                Buat Jadwal Stock Opname Baru
                            </h3>
                            <button onClick={() => setShowOpnameModal(false)} className="text-slate-400">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={submitOpname} className="p-4 space-y-3 text-xs">
                            <div>
                                <label className="block font-semibold mb-1">Pilih Gudang</label>
                                <select
                                    value={opForm.data.warehouse_id}
                                    onChange={(e) => opForm.setData('warehouse_id', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                >
                                    {(master.warehouses || []).map((w) => (
                                        <option key={w.id} value={w.id}>
                                            {w.code} — {w.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Tanggal Jadwal Opname</label>
                                <input
                                    type="date"
                                    value={opForm.data.scheduled_date}
                                    onChange={(e) => opForm.setData('scheduled_date', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowOpnameModal(false)}
                                    className="px-4 py-2 rounded-xl border border-slate-200"
                                >
                                    Batal
                                </button>
                                <button type="submit" className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold">
                                    Buat Lembar Hitung Opname
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
