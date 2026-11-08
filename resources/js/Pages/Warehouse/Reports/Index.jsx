import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import DashboardLayout from '../../../components/templates/DashboardLayout';
import { BarChart3, Layers, Truck, Wrench, Clock, AlertTriangle, ShoppingCart } from 'lucide-react';

const formatIDR = (val) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(val || 0));

export default function InventoryReportsIndex({ reports = {}, summary = {}, filters = {}, master = {} }) {
    const [activeTab, setActiveTab] = useState('balance_valuation');
    const [siteId, setSiteId] = useState(filters.site_id || '');

    const tabs = [
        { id: 'balance_valuation', label: '1 & 4. Stock Balance & Valuation (MWA)' },
        { id: 'movement', label: '2 & 3. Stock Card & Movement' },
        { id: 'usage_unit', label: '5. Pemakaian Sparepart per Unit' },
        { id: 'usage_wo', label: '6. Pemakaian per Work Order' },
        { id: 'slow_non_moving', label: '7 & 8. Slow Moving & Non-Moving' },
        { id: 'opname_variance', label: '9. Stock Opname Variance' },
        { id: 'pr_proposals', label: '10. Procurement PR Proposals' },
    ];

    const applySiteFilter = (val) => {
        setSiteId(val);
        router.get('/warehouse/reports', { site_id: val || undefined }, { preserveState: true, preserveScroll: true });
    };

    return (
        <DashboardLayout title="9 Laporan Persediaan Resmi & Usulan Purchase Request (PR)">
            <Head title="Laporan Gudang & Sparepart - TAP" />

            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-indigo-600" />
                            Pusat 9 Laporan Persediaan (Inventory Reports) & Integrasi PR
                        </h1>
                        <p className="text-xs text-slate-500 mt-1">
                            Stock Balance, Stock Card, Stock Movement, Stock Valuation (Moving Weighted Average), Sparepart Usage per Unit, Usage per Work Order, Slow Moving, Non-Moving, dan Stock Opname Variance.
                        </p>
                    </div>
                    <select
                        value={siteId}
                        onChange={(e) => applySiteFilter(e.target.value)}
                        className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    >
                        <option value="">Semua Site Operasional</option>
                        {(master.sites || []).map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.code} — {s.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                        <span className="text-xs text-slate-500">Total Valuasi Persediaan (MWA)</span>
                        <p className="text-xl font-extrabold text-indigo-600 mt-1">
                            {formatIDR(summary.total_valuation)}
                        </p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                        <span className="text-xs text-amber-600 font-bold">
                            Slow Moving (30-89 Hari): {summary.slow_moving_count || 0} Item
                        </span>
                        <p className="text-xl font-extrabold text-amber-600 mt-1">
                            {formatIDR(summary.slow_moving_value)}
                        </p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                        <span className="text-xs text-rose-600 font-bold">
                            Non-Moving (&ge; 90 Hari): {summary.non_moving_count || 0} Item
                        </span>
                        <p className="text-xl font-extrabold text-rose-600 mt-1">
                            {formatIDR(summary.non_moving_value)}
                        </p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                        <span className="text-xs text-emerald-600 font-bold">Usulan Purchase Request (PR)</span>
                        <p className="text-xl font-extrabold text-emerald-600 mt-1">
                            {summary.pr_proposals_count || 0} Dokumen PR
                        </p>
                    </div>
                </div>

                {/* Report Tabs */}
                <div className="flex flex-wrap gap-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                                activeTab === tab.id
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab 1 & 4: Stock Balance & Valuation */}
                {activeTab === 'balance_valuation' && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
                        <div className="p-4 border-b border-slate-200/80 dark:border-slate-800">
                            <h2 className="text-sm font-bold">
                                Laporan Saldo Persediaan & Valuasi Moving Weighted Average (MWA)
                            </h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                                        <th className="py-3 px-3">Gudang & Site</th>
                                        <th className="py-3 px-3">Kode & Nama Barang</th>
                                        <th className="py-3 px-3">Kategori</th>
                                        <th className="py-3 px-3 text-right">On Hand</th>
                                        <th className="py-3 px-3 text-right">Reserved</th>
                                        <th className="py-3 px-3 text-right">Available</th>
                                        <th className="py-3 px-3 text-right">MWA Unit Cost</th>
                                        <th className="py-3 px-3 text-right">Total Valuation</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800">
                                    {(reports.stockBalances || []).map((b) => (
                                        <tr key={b.id}>
                                            <td className="py-2.5 px-3 font-semibold">
                                                {b.warehouse?.code} ({b.site?.code})
                                            </td>
                                            <td className="py-2.5 px-3">
                                                <div className="font-bold text-slate-900 dark:text-white">
                                                    {b.item?.item_code} — {b.item?.item_name}
                                                </div>
                                                <div className="text-[10px] text-slate-500">
                                                    Lokasi: {b.location?.location_code || '-'}
                                                </div>
                                            </td>
                                            <td className="py-2.5 px-3">{b.item?.category?.name}</td>
                                            <td className="py-2.5 px-3 text-right font-bold">{b.on_hand_qty}</td>
                                            <td className="py-2.5 px-3 text-right text-amber-600">{b.reserved_qty}</td>
                                            <td className="py-2.5 px-3 text-right text-emerald-600 font-bold">
                                                {b.available_qty}
                                            </td>
                                            <td className="py-2.5 px-3 text-right">{formatIDR(b.average_unit_cost)}</td>
                                            <td className="py-2.5 px-3 text-right font-extrabold text-indigo-600">
                                                {formatIDR(b.total_value)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Tab 2 & 3: Stock Movement */}
                {activeTab === 'movement' && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
                        <div className="p-4 border-b border-slate-200/80 dark:border-slate-800">
                            <h2 className="text-sm font-bold">Laporan Pergerakan Stok (Stock Movement & Card Report)</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                                        <th className="py-3 px-3">Tanggal</th>
                                        <th className="py-3 px-3">Dokumen & Tipe</th>
                                        <th className="py-3 px-3">Gudang</th>
                                        <th className="py-3 px-3">Item</th>
                                        <th className="py-3 px-3 text-right">In</th>
                                        <th className="py-3 px-3 text-right">Out</th>
                                        <th className="py-3 px-3 text-right">Running Bal</th>
                                        <th className="py-3 px-3 text-right">Nilai</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800">
                                    {(reports.stockMovements || []).map((m) => (
                                        <tr key={m.id}>
                                            <td className="py-2.5 px-3">
                                                {String(m.transaction_datetime || '').slice(0, 10)}
                                            </td>
                                            <td className="py-2.5 px-3 font-bold">
                                                {m.transaction?.document_number} ({m.transaction_type})
                                            </td>
                                            <td className="py-2.5 px-3">{m.warehouse?.code}</td>
                                            <td className="py-2.5 px-3">
                                                {m.item?.item_code} — {m.item?.item_name}
                                            </td>
                                            <td className="py-2.5 px-3 text-right text-emerald-600 font-bold">
                                                {m.qty_in}
                                            </td>
                                            <td className="py-2.5 px-3 text-right text-rose-600 font-bold">
                                                {m.qty_out}
                                            </td>
                                            <td className="py-2.5 px-3 text-right font-extrabold">
                                                {m.running_balance_qty}
                                            </td>
                                            <td className="py-2.5 px-3 text-right">{formatIDR(m.total_cost)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Tab 5: Usage per Unit */}
                {activeTab === 'usage_unit' && (
                    <div className="space-y-4">
                        {(reports.usagePerUnit || []).map((u) => (
                            <div
                                key={u.unit_code}
                                className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800"
                            >
                                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 mb-3">
                                    <div>
                                        <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                                            Unit: {u.unit_code}
                                        </span>
                                        <span className="text-xs text-slate-500 ml-2">({u.brand_model})</span>
                                    </div>
                                    <span className="text-sm font-extrabold text-indigo-600">
                                        Total Biaya Part: {formatIDR(u.total_cost)}
                                    </span>
                                </div>
                                <table className="w-full text-left text-xs">
                                    <thead>
                                        <tr className="text-slate-400">
                                            <th className="py-1">Tanggal</th>
                                            <th className="py-1">No. Dokumen / WO</th>
                                            <th className="py-1">Item</th>
                                            <th className="py-1 text-right">Qty</th>
                                            <th className="py-1 text-right">Biaya MWA</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(u.items || []).map((it, idx) => (
                                            <tr key={idx} className="border-t border-slate-100 dark:border-slate-800">
                                                <td className="py-1.5">{it.date}</td>
                                                <td className="py-1.5">
                                                    {it.document_number} ({it.wo_number})
                                                </td>
                                                <td className="py-1.5">
                                                    {it.item_code} — {it.item_name}
                                                </td>
                                                <td className="py-1.5 text-right font-bold">
                                                    {it.qty} {it.unit}
                                                </td>
                                                <td className="py-1.5 text-right font-semibold">
                                                    {formatIDR(it.total_cost)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ))}
                    </div>
                )}

                {/* Tab 6: Usage per Work Order */}
                {activeTab === 'usage_wo' && (
                    <div className="space-y-4">
                        {(reports.usagePerWorkOrder || []).map((w) => (
                            <div
                                key={w.wo_number}
                                className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800"
                            >
                                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 mb-3">
                                    <div>
                                        <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                                            Work Order: {w.wo_number}
                                        </span>
                                        <span className="text-xs text-slate-500 ml-2">
                                            Unit: {w.unit_code} • Tipe: {w.job_type}
                                        </span>
                                    </div>
                                    <span className="text-sm font-extrabold text-emerald-600">
                                        Total Sparepart WO: {formatIDR(w.total_parts_cost)}
                                    </span>
                                </div>
                                <table className="w-full text-left text-xs">
                                    <thead>
                                        <tr className="text-slate-400">
                                            <th className="py-1">Dokumen Issue</th>
                                            <th className="py-1">Item</th>
                                            <th className="py-1 text-right">Qty Keluar</th>
                                            <th className="py-1 text-right">Harga MWA</th>
                                            <th className="py-1 text-right">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(w.items || []).map((it, idx) => (
                                            <tr key={idx} className="border-t border-slate-100 dark:border-slate-800">
                                                <td className="py-1.5">{it.document_number}</td>
                                                <td className="py-1.5">
                                                    {it.item_code} — {it.item_name}
                                                </td>
                                                <td className="py-1.5 text-right font-bold">
                                                    {it.qty_out} {it.unit}
                                                </td>
                                                <td className="py-1.5 text-right">{formatIDR(it.mwa_unit_cost)}</td>
                                                <td className="py-1.5 text-right font-semibold">
                                                    {formatIDR(it.total_cost)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ))}
                    </div>
                )}

                {/* Tab 7 & 8: Slow Moving & Non-Moving */}
                {activeTab === 'slow_non_moving' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
                            <div className="p-4 border-b border-slate-200/80 dark:border-slate-800">
                                <h2 className="text-sm font-bold text-amber-600">
                                    7. Laporan Slow Moving Items (30 - 89 Hari Tanpa Pergerakan)
                                </h2>
                            </div>
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500">
                                        <th className="py-2.5 px-3">Item</th>
                                        <th className="py-2.5 px-3 text-right">On Hand</th>
                                        <th className="py-2.5 px-3 text-right">Hari Idle</th>
                                        <th className="py-2.5 px-3 text-right">Nilai Tertahan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {(reports.slowMoving || []).map((b) => (
                                        <tr key={b.id}>
                                            <td className="py-2.5 px-3 font-semibold">
                                                {b.item?.item_code} — {b.item?.item_name}
                                            </td>
                                            <td className="py-2.5 px-3 text-right">{b.on_hand_qty}</td>
                                            <td className="py-2.5 px-3 text-right font-bold text-amber-600">
                                                {b.days_without_movement} Hari
                                            </td>
                                            <td className="py-2.5 px-3 text-right font-bold">
                                                {formatIDR(b.total_value)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
                            <div className="p-4 border-b border-slate-200/80 dark:border-slate-800">
                                <h2 className="text-sm font-bold text-rose-600">
                                    8. Laporan Non-Moving / Deadstock (&ge; 90 Hari Tanpa Pergerakan)
                                </h2>
                            </div>
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500">
                                        <th className="py-2.5 px-3">Item</th>
                                        <th className="py-2.5 px-3 text-right">On Hand</th>
                                        <th className="py-2.5 px-3 text-right">Hari Idle</th>
                                        <th className="py-2.5 px-3 text-right">Nilai Tertahan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {(reports.nonMoving || []).map((b) => (
                                        <tr key={b.id}>
                                            <td className="py-2.5 px-3 font-semibold">
                                                {b.item?.item_code} — {b.item?.item_name}
                                            </td>
                                            <td className="py-2.5 px-3 text-right">{b.on_hand_qty}</td>
                                            <td className="py-2.5 px-3 text-right font-bold text-rose-600">
                                                {b.days_without_movement} Hari
                                            </td>
                                            <td className="py-2.5 px-3 text-right font-bold">
                                                {formatIDR(b.total_value)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Tab 9: Stock Opname Variance */}
                {activeTab === 'opname_variance' && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
                        <div className="p-4 border-b border-slate-200/80 dark:border-slate-800">
                            <h2 className="text-sm font-bold">9. Laporan Selisih Stock Opname (Stock Opname Variance Report)</h2>
                        </div>
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500">
                                    <th className="py-3 px-3">No. Opname & Gudang</th>
                                    <th className="py-3 px-3">Item</th>
                                    <th className="py-3 px-3 text-right">System Qty</th>
                                    <th className="py-3 px-3 text-right">Physical Qty</th>
                                    <th className="py-3 px-3 text-right">Variance Qty</th>
                                    <th className="py-3 px-3 text-right">Variance Value</th>
                                    <th className="py-3 px-3">Alasan Investigasi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800">
                                {(reports.opnameVariances || []).map((v) => (
                                    <tr key={v.id}>
                                        <td className="py-2.5 px-3 font-semibold">
                                            {v.opname?.opname_number} ({v.opname?.warehouse?.code})
                                        </td>
                                        <td className="py-2.5 px-3">
                                            {v.item?.item_code} — {v.item?.item_name}
                                        </td>
                                        <td className="py-2.5 px-3 text-right">{v.system_qty}</td>
                                        <td className="py-2.5 px-3 text-right">{v.physical_qty}</td>
                                        <td className="py-2.5 px-3 text-right font-extrabold text-rose-600">
                                            {v.variance_qty}
                                        </td>
                                        <td className="py-2.5 px-3 text-right">{formatIDR(v.variance_value)}</td>
                                        <td className="py-2.5 px-3">{v.investigation_reason || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Tab 10: Purchase Request Proposals */}
                {activeTab === 'pr_proposals' && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
                        <div className="p-4 border-b border-slate-200/80 dark:border-slate-800">
                            <h2 className="text-sm font-bold">
                                10. Usulan Purchase Request (PR) ke Procurement (Siap untuk Phase 6)
                            </h2>
                        </div>
                        <div className="divide-y divide-slate-200/60 dark:divide-slate-800">
                            {(reports.purchaseRequests || []).map((pr) => (
                                <div key={pr.id} className="p-4 space-y-2 text-xs">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="font-extrabold text-slate-900 dark:text-white">
                                                {pr.pr_number}
                                            </span>
                                            <span className="ml-2 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold uppercase text-[10px]">
                                                {pr.status} (Menunggu Approval PO)
                                            </span>
                                        </div>
                                        <span className="font-extrabold text-indigo-600">
                                            Estimasi Total: {formatIDR(pr.estimated_total)}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {(pr.items || []).map((pi) => (
                                            <div
                                                key={pi.id}
                                                className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-between"
                                            >
                                                <div>
                                                    <div className="font-bold">
                                                        {pi.item?.item_code} — {pi.item?.item_name}
                                                    </div>
                                                    <div className="text-[10px] text-slate-500">
                                                        Stok Saat Ini: {pi.current_stock} (ROP: {pi.reorder_point})
                                                    </div>
                                                </div>
                                                <div className="text-right font-bold text-indigo-600">
                                                    Order: {pi.requested_qty} {pi.unit}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
