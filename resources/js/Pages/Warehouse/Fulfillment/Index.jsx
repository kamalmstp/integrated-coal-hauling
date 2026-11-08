import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import DashboardLayout from '../../../components/templates/DashboardLayout';
import { PackageCheck, CheckCircle2, RotateCcw, XCircle, Layers, X } from 'lucide-react';

const formatIDR = (val) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(val || 0));

export default function WarehouseFulfillmentIndex({ requests, metrics = {}, filters = {}, master = {} }) {
    const [selectedReq, setSelectedReq] = useState(null);
    const [issueQuantities, setIssueQuantities] = useState({});
    const [returnModalItem, setReturnModalItem] = useState(null);

    const returnForm = useForm({
        sparepart_request_item_id: '',
        quantity: 1,
        remarks: 'Retur sparepart tidak terpakai dari Work Order kembali ke Gudang.',
    });

    const openIssueModal = (req) => {
        const map = {};
        (req.items || []).forEach((it) => {
            const rem = Math.max(0, Number(it.quantity_approved || it.quantity_requested) - Number(it.quantity_issued || 0));
            map[it.id] = rem;
        });
        setIssueQuantities(map);
        setSelectedReq(req);
    };

    const handlePick = (req) => {
        const defaultWh =
            req.warehouse_id ||
            (master.warehouses || []).find((w) => String(w.site_id) === String(req.site_id))?.id ||
            master.warehouses?.[0]?.id;

        router.post(`/warehouse/fulfillment/${req.id}/pick`, {
            warehouse_id: defaultWh,
        });
    };

    const submitIssue = (e) => {
        e.preventDefault();
        if (!selectedReq) return;
        const defaultWh =
            selectedReq.warehouse_id ||
            (master.warehouses || []).find((w) => String(w.site_id) === String(selectedReq.site_id))?.id ||
            master.warehouses?.[0]?.id;

        router.post(
            `/warehouse/fulfillment/${selectedReq.id}/issue`,
            {
                warehouse_id: defaultWh,
                items: issueQuantities,
                notes: 'Serah terima & konfirmasi pengeluaran barang Gudang ke Mekanik Work Order.',
            },
            {
                onSuccess: () => setSelectedReq(null),
            }
        );
    };

    const submitReturn = (e) => {
        e.preventDefault();
        if (!returnModalItem) return;
        returnForm.post(`/warehouse/fulfillment/${returnModalItem.reqId}/return`, {
            onSuccess: () => setReturnModalItem(null),
        });
    };

    const rows = requests?.data || [];

    return (
        <DashboardLayout title="Pemenuhan Permintaan Sparepart Work Order (Fulfillment & Return)">
            <Head title="Fulfillment Sparepart Work Order - TAP" />

            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                    <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                        <PackageCheck className="w-5 h-5 text-indigo-600" />
                        Integrasi Permintaan Sparepart Work Order (8-Step Workflow)
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                        1. Request Mekanik &rarr; 2. Approval Supervisor &rarr; 3. Cek Stok &rarr; 4. Picking/Reservasi Storeman &rarr; 5. Serah Terima &rarr; 6. Konfirmasi Penerima &rarr; 7. Potong Stok Otomatis &rarr; 8. Catat Biaya ke Work Order. Mendukung Full Issue, Partial Issue, Backorder, dan Return Item.
                    </p>
                </div>

                {/* Status Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-xs">
                    <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                        <span className="text-slate-500">Total Request</span>
                        <p className="text-xl font-extrabold mt-1">{metrics.total || 0}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                        <span className="text-slate-500">Submitted</span>
                        <p className="text-xl font-extrabold text-slate-700 dark:text-slate-300 mt-1">{metrics.submitted || 0}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                        <span className="text-blue-600 font-bold">Approved</span>
                        <p className="text-xl font-extrabold text-blue-600 mt-1">{metrics.approved || 0}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                        <span className="text-amber-600 font-bold">Picking (Reserved)</span>
                        <p className="text-xl font-extrabold text-amber-600 mt-1">{metrics.picking || 0}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                        <span className="text-purple-600 font-bold">Partial / Backorder</span>
                        <p className="text-xl font-extrabold text-purple-600 mt-1">{metrics.partially_issued || 0}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                        <span className="text-emerald-600 font-bold">Full Issued</span>
                        <p className="text-xl font-extrabold text-emerald-600 mt-1">{metrics.issued || 0}</p>
                    </div>
                </div>

                {/* Requests List */}
                <div className="space-y-4">
                    {rows.map((req) => (
                        <div
                            key={req.id}
                            className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3"
                        >
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 border-b border-slate-200/60 dark:border-slate-800 pb-3">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                                            {req.request_number}
                                        </span>
                                        <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full bg-indigo-100 text-indigo-800">
                                            {req.status}
                                        </span>
                                        <span className="text-xs text-slate-500">
                                            WO: <strong>{req.work_order?.wo_number || '-'}</strong> (Unit:{' '}
                                            {req.work_order?.unit?.unit_code || '-'})
                                        </span>
                                    </div>
                                    <div className="text-[11px] text-slate-500 mt-0.5">
                                        Site: {req.site?.name} • Pemohon: {req.requester?.name || '-'} • Tanggal:{' '}
                                        {req.request_date} • Nilai: <strong>{formatIDR(req.total_cost)}</strong>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {req.status === 'submitted' && (
                                        <button
                                            type="button"
                                            onClick={() => router.post(`/maintenance/spareparts/${req.id}/approve`)}
                                            className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold"
                                        >
                                            Approve Supervisor (Step 2)
                                        </button>
                                    )}
                                    {req.status === 'approved' && (
                                        <button
                                            type="button"
                                            onClick={() => handlePick(req)}
                                            className="px-3 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-bold"
                                        >
                                            Picking & Reserve Stok (Step 4)
                                        </button>
                                    )}
                                    {['approved', 'picking', 'partially_issued'].includes(req.status) && (
                                        <button
                                            type="button"
                                            onClick={() => openIssueModal(req)}
                                            className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold"
                                        >
                                            Serah Terima & Issue Barang (Step 5-8)
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Items Table inside Request */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="text-slate-400 border-b border-slate-100 dark:border-slate-800">
                                            <th className="py-1.5 px-2">Part Number & Nama</th>
                                            <th className="py-1.5 px-2 text-right">Stok Gudang</th>
                                            <th className="py-1.5 px-2 text-right">Approved</th>
                                            <th className="py-1.5 px-2 text-right">Picked</th>
                                            <th className="py-1.5 px-2 text-right">Issued</th>
                                            <th className="py-1.5 px-2 text-right">Backorder</th>
                                            <th className="py-1.5 px-2 text-right">Returned</th>
                                            <th className="py-1.5 px-2 text-right">Harga MWA</th>
                                            <th className="py-1.5 px-2 text-right">Aksi Retur</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                        {(req.items || []).map((it) => (
                                            <tr key={it.id}>
                                                <td className="py-2 px-2 font-semibold">
                                                    {it.part_number} — {it.part_name}
                                                </td>
                                                <td className="py-2 px-2 text-right font-mono text-indigo-600">
                                                    OnHand: {it.warehouse_on_hand ?? 0} (Avail: {it.warehouse_available ?? 0})
                                                </td>
                                                <td className="py-2 px-2 text-right font-bold">
                                                    {it.quantity_approved} {it.unit}
                                                </td>
                                                <td className="py-2 px-2 text-right text-amber-600 font-bold">
                                                    {it.quantity_picked || 0}
                                                </td>
                                                <td className="py-2 px-2 text-right text-emerald-600 font-bold">
                                                    {it.quantity_issued || 0}
                                                </td>
                                                <td className="py-2 px-2 text-right text-rose-600 font-bold">
                                                    {it.quantity_backorder || 0}
                                                </td>
                                                <td className="py-2 px-2 text-right text-purple-600 font-bold">
                                                    {it.quantity_returned || 0}
                                                </td>
                                                <td className="py-2 px-2 text-right">{formatIDR(it.unit_price)}</td>
                                                <td className="py-2 px-2 text-right">
                                                    {Number(it.quantity_issued) - Number(it.quantity_returned || 0) > 0 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                returnForm.setData({
                                                                    sparepart_request_item_id: it.id,
                                                                    quantity: 1,
                                                                    remarks: `Retur sparepart ${it.part_name} dari ${req.request_number}`,
                                                                });
                                                                setReturnModalItem({ reqId: req.id, item: it });
                                                            }}
                                                            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-purple-100 text-purple-800 text-[10px] font-bold"
                                                        >
                                                            <RotateCcw className="w-3 h-3" /> Return Item
                                                        </button>
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

            {/* Modal Full / Partial Issue */}
            {selectedReq && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl overflow-hidden shadow-xl">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                Konfirmasi Serah Terima & Pengeluaran Barang ({selectedReq.request_number})
                            </h3>
                            <button onClick={() => setSelectedReq(null)} className="text-slate-400">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={submitIssue} className="p-4 space-y-4 text-xs">
                            <p className="text-slate-500">
                                Masukkan jumlah yang diserahkan sekarang. Jika jumlah yang dikeluarkan lebih kecil dari sisa yang disetujui, sistem otomatis mencatat <strong>Partial Issue</strong> dan sisanya menjadi <strong>Backorder</strong>.
                            </p>
                            <div className="space-y-2">
                                {(selectedReq.items || []).map((it) => {
                                    const rem = Math.max(
                                        0,
                                        Number(it.quantity_approved || it.quantity_requested) - Number(it.quantity_issued || 0)
                                    );
                                    return (
                                        <div
                                            key={it.id}
                                            className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-between gap-3"
                                        >
                                            <div>
                                                <div className="font-bold text-slate-900 dark:text-white">
                                                    {it.part_number} — {it.part_name}
                                                </div>
                                                <div className="text-[10px] text-slate-500">
                                                    Sisa Disetujui: {rem} {it.unit} • Stok Gudang: {it.warehouse_on_hand ?? 0}
                                                </div>
                                            </div>
                                            <div className="w-28">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max={rem}
                                                    step="0.01"
                                                    value={issueQuantities[it.id] ?? rem}
                                                    onChange={(e) =>
                                                        setIssueQuantities({
                                                            ...issueQuantities,
                                                            [it.id]: e.target.value,
                                                        })
                                                    }
                                                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-right font-bold"
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setSelectedReq(null)}
                                    className="px-4 py-2 rounded-xl border border-slate-200"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold"
                                >
                                    Konfirmasi Issue & Potong Stok Gudang
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Return Item from Maintenance */}
            {returnModalItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden shadow-xl">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                Retur Barang dari Work Order ke Gudang
                            </h3>
                            <button onClick={() => setReturnModalItem(null)} className="text-slate-400">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={submitReturn} className="p-4 space-y-3 text-xs">
                            <div>
                                <label className="block font-semibold mb-1">
                                    Kuantitas Retur ({returnModalItem.item.part_name})
                                </label>
                                <input
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    value={returnForm.data.quantity}
                                    onChange={(e) => returnForm.setData('quantity', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Alasan Retur</label>
                                <textarea
                                    rows={2}
                                    value={returnForm.data.remarks}
                                    onChange={(e) => returnForm.setData('remarks', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setReturnModalItem(null)}
                                    className="px-4 py-2 rounded-xl border border-slate-200"
                                >
                                    Batal
                                </button>
                                <button type="submit" className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold">
                                    Terima Retur & Kembalikan Stok
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
