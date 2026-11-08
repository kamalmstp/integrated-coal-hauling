import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import DashboardLayout from '../../../components/templates/DashboardLayout';
import {
    Boxes,
    AlertTriangle,
    AlertOctagon,
    CheckCircle2,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    Building2,
    PackageCheck,
    ShoppingCart,
    BookOpen,
    RefreshCw,
    FileText,
    Plus,
    X,
} from 'lucide-react';

const formatIDR = (val) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(val || 0));

const statusBadge = (status) => {
    const map = {
        out_of_stock: 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-300',
        critical_stock: 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300',
        low_stock: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/80 dark:text-yellow-300 border-yellow-300',
        excess_stock: 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border-purple-300',
        normal: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300',
    };
    const labels = {
        out_of_stock: 'OUT OF STOCK',
        critical_stock: 'CRITICAL STOCK',
        low_stock: 'LOW STOCK (<= ROP)',
        excess_stock: 'EXCESS STOCK',
        normal: 'NORMAL',
    };
    return (
        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${map[status] || map.normal}`}>
            {labels[status] || status}
        </span>
    );
};

export default function WarehouseDashboardIndex({
    metrics = {},
    stockAlerts = [],
    valuationByCategory = [],
    recentTransactions = [],
    purchaseRequests = [],
    filters = {},
    master = {},
}) {
    const [siteId, setSiteId] = useState(filters.site_id || '');
    const [warehouseId, setWarehouseId] = useState(filters.warehouse_id || '');
    const [showPrModal, setShowPrModal] = useState(false);

    const prForm = useForm({
        site_id: filters.site_id || (master.sites?.[0]?.id ?? ''),
        warehouse_id: filters.warehouse_id || (master.warehouses?.[0]?.id ?? ''),
        requested_by: master.employees?.[0]?.id ?? '',
        item_ids: stockAlerts
            .filter((a) => ['out_of_stock', 'critical_stock', 'low_stock'].includes(a.status))
            .map((a) => a.item_id),
        notes: 'Usulan Purchase Request otomatis dari Reorder Point Alert Gudang TAP.',
    });

    const applyFilter = (newSite, newWh) => {
        router.get(
            '/warehouse/dashboard',
            { site_id: newSite || undefined, warehouse_id: newWh || undefined },
            { preserveState: true, preserveScroll: true }
        );
    };

    const submitPrProposal = (e) => {
        e.preventDefault();
        prForm.post('/warehouse/purchase-requests', {
            onSuccess: () => setShowPrModal(false),
        });
    };

    return (
        <DashboardLayout title="Dashboard Warehouse & Sparepart Management">
            <Head title="Warehouse & Sparepart Dashboard - TAP" />

            <div className="space-y-6">
                {/* Header & Filter Bar */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 shadow-xs">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 rounded-md">
                                Phase 5 — Warehouse & Sparepart
                            </span>
                            <span className="text-xs text-slate-500">Moving Weighted Average (MWA) Valuation</span>
                        </div>
                        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                            Control Tower Gudang, Suku Cadang, Ban & Pelumas
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Monitoring persediaan multi-site, peringatan stok minimum/reorder point, pemenuhan Work Order, dan valuasi persediaan real-time.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                        <select
                            value={siteId}
                            onChange={(e) => {
                                setSiteId(e.target.value);
                                applyFilter(e.target.value, warehouseId);
                            }}
                            className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                        >
                            <option value="">Semua Site Operasional</option>
                            {(master.sites || []).map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.code} — {s.name}
                                </option>
                            ))}
                        </select>

                        <select
                            value={warehouseId}
                            onChange={(e) => {
                                setWarehouseId(e.target.value);
                                applyFilter(siteId, e.target.value);
                            }}
                            className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                        >
                            <option value="">Semua Gudang (Multi-Warehouse)</option>
                            {(master.warehouses || [])
                                .filter((w) => !siteId || String(w.site_id) === String(siteId))
                                .map((w) => (
                                    <option key={w.id} value={w.id}>
                                        {w.code} — {w.name}
                                    </option>
                                ))}
                        </select>

                        <button
                            type="button"
                            onClick={() => setShowPrModal(true)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                        >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            Ajukan PR dari Reorder Alert
                        </button>
                    </div>
                </div>

                {/* KPI Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500">Total Valuasi Persediaan (MWA)</span>
                            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600">
                                <TrendingUp className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-2">
                            {formatIDR(metrics.total_valuation)}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-1">
                            {metrics.total_sku || 0} Master SKU • {metrics.active_warehouses || 0} Gudang Aktif
                        </p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500">Out of Stock & Critical Alert</span>
                            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600">
                                <AlertOctagon className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="flex items-baseline gap-3 mt-2">
                            <p className="text-2xl font-extrabold text-rose-600">
                                {(metrics.out_of_stock_count || 0) + (metrics.critical_stock_count || 0)}
                            </p>
                            <span className="text-xs text-slate-500">
                                ({metrics.out_of_stock_count || 0} Kosong, {metrics.critical_stock_count || 0} Kritis)
                            </span>
                        </div>
                        <p className="text-[11px] text-amber-600 font-medium mt-1">
                            +{metrics.low_stock_count || 0} Item Low Stock (&le; Reorder Point)
                        </p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500">Antrean Pemenuhan Work Order</span>
                            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600">
                                <PackageCheck className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
                            {metrics.pending_wo_requests || 0}
                        </p>
                        <div className="flex items-center justify-between mt-1 text-[11px]">
                            <span className="text-slate-500">Reserved: {metrics.total_reserved_qty || 0} Unit</span>
                            <Link href="/warehouse/fulfillment" className="text-indigo-600 font-bold hover:underline">
                                Proses Picking &rarr;
                            </Link>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500">Transfer & Opname Adjustment</span>
                            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
                                <RefreshCw className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="flex items-baseline gap-4 mt-2">
                            <div>
                                <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                                    {metrics.pending_transfers || 0}
                                </span>
                                <span className="text-[11px] text-slate-500 ml-1">Transfer Aktif</span>
                            </div>
                            <div>
                                <span className="text-xl font-extrabold text-amber-600">
                                    {metrics.pending_adjustments || 0}
                                </span>
                                <span className="text-[11px] text-slate-500 ml-1">Pending Adjust</span>
                            </div>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                            Excess Stock: {metrics.excess_stock_count || 0} SKU
                        </p>
                    </div>
                </div>

                {/* Stock Alerts & Recommended Purchase Quantity */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
                        <div className="p-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                            <div>
                                <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                                    Minimum Stock, Reorder Point & Rekomendasi Pembelian (PR)
                                </h2>
                                <p className="text-[11px] text-slate-500">
                                    Klasifikasi otomatis: Out of Stock, Critical Stock (&le; Min), Low Stock (&le; ROP), dan Excess Stock (&gt; Max).
                                </p>
                            </div>
                            <Link
                                href="/warehouse/items"
                                className="text-xs font-bold text-indigo-600 hover:underline"
                            >
                                Lihat Semua Item &rarr;
                            </Link>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                                        <th className="py-2.5 px-3 font-bold">Item / Part Number</th>
                                        <th className="py-2.5 px-3 font-bold">Status</th>
                                        <th className="py-2.5 px-3 font-bold text-right">On Hand</th>
                                        <th className="py-2.5 px-3 font-bold text-right">Min / ROP / Max</th>
                                        <th className="py-2.5 px-3 font-bold text-right">Rekomendasi Order</th>
                                        <th className="py-2.5 px-3 font-bold text-right">Est. Nilai PR</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800">
                                    {stockAlerts.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="py-8 text-center text-slate-400">
                                                Seluruh stok barang berada pada level normal.
                                            </td>
                                        </tr>
                                    ) : (
                                        stockAlerts.map((alert) => (
                                            <tr key={alert.item_id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                                                <td className="py-2.5 px-3">
                                                    <div className="font-bold text-slate-900 dark:text-white">
                                                        {alert.item_code} — {alert.item_name}
                                                    </div>
                                                    <div className="text-[10px] text-slate-500">
                                                        PN: {alert.part_number || '-'} • {alert.category} • {alert.default_warehouse_name}
                                                    </div>
                                                </td>
                                                <td className="py-2.5 px-3">{statusBadge(alert.status)}</td>
                                                <td className="py-2.5 px-3 text-right font-extrabold text-slate-900 dark:text-white">
                                                    {alert.on_hand_qty} {alert.unit}
                                                </td>
                                                <td className="py-2.5 px-3 text-right text-slate-500">
                                                    {alert.minimum_stock} / {alert.reorder_point} / {alert.maximum_stock ?? '-'}
                                                </td>
                                                <td className="py-2.5 px-3 text-right font-bold text-indigo-600 dark:text-indigo-400">
                                                    {alert.status === 'excess_stock' ? '-' : `${alert.recommended_order_qty} ${alert.unit}`}
                                                </td>
                                                <td className="py-2.5 px-3 text-right font-semibold text-slate-800 dark:text-slate-200">
                                                    {alert.status === 'excess_stock' ? '-' : formatIDR(alert.estimated_order_value)}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Valuation by Category (10 Required Categories) */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
                        <div className="p-4 border-b border-slate-200/80 dark:border-slate-800">
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Boxes className="w-4 h-4 text-indigo-600" />
                                Valuasi per Kategori Barang (10 Kategori)
                            </h2>
                            <p className="text-[11px] text-slate-500">
                                Distribusi nilai persediaan berdasarkan Moving Weighted Average.
                            </p>
                        </div>
                        <div className="p-4 space-y-2.5 max-h-[380px] overflow-y-auto">
                            {valuationByCategory.map((cat) => (
                                <div
                                    key={cat.code}
                                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/50"
                                >
                                    <div>
                                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{cat.name}</p>
                                        <p className="text-[10px] text-slate-500">
                                            {cat.sku_count} SKU Aktif • Total Qty: {cat.total_qty}
                                        </p>
                                    </div>
                                    <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                                        {formatIDR(cat.total_value)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recent Transactions & Procurement PR Proposals */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
                        <div className="p-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                                Pergerakan Barang Terakhir (Stock In & Stock Out)
                            </h2>
                            <Link href="/warehouse/transactions" className="text-xs font-bold text-indigo-600 hover:underline">
                                Semua Transaksi &rarr;
                            </Link>
                        </div>
                        <div className="divide-y divide-slate-200/60 dark:divide-slate-800">
                            {recentTransactions.map((tx) => (
                                <div key={tx.id} className="p-3.5 flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`p-2 rounded-xl ${
                                                tx.direction === 'IN'
                                                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60'
                                                    : 'bg-rose-50 text-rose-600 dark:bg-rose-950/60'
                                            }`}
                                        >
                                            {tx.direction === 'IN' ? (
                                                <ArrowDownRight className="w-4 h-4" />
                                            ) : (
                                                <ArrowUpRight className="w-4 h-4" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900 dark:text-white">
                                                {tx.document_number}{' '}
                                                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                                    {tx.transaction_type}
                                                </span>
                                            </div>
                                            <div className="text-[10px] text-slate-500">
                                                {tx.warehouse?.name} ({tx.site?.code}) • Ref: {tx.reference_document || '-'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-slate-800 dark:text-slate-200">
                                            {formatIDR(tx.total_amount)}
                                        </div>
                                        <div className="text-[10px] text-slate-400">{tx.transaction_date}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
                        <div className="p-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                            <div>
                                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                                    Integrasi Procurement (Usulan Purchase Request / PR)
                                </h2>
                                <p className="text-[10px] text-slate-500">
                                    Usulan PR dari Reorder Point — Menunggu Approval Procurement (Tidak membuat PO otomatis).
                                </p>
                            </div>
                            <Link href="/warehouse/reports" className="text-xs font-bold text-indigo-600 hover:underline">
                                Lihat Detail PR &rarr;
                            </Link>
                        </div>
                        <div className="divide-y divide-slate-200/60 dark:divide-slate-800">
                            {purchaseRequests.map((pr) => (
                                <div key={pr.id} className="p-3.5 flex items-center justify-between text-xs">
                                    <div>
                                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                            {pr.pr_number}
                                            <span className="px-2 py-0.5 text-[10px] rounded-full bg-amber-100 text-amber-800 font-bold uppercase">
                                                {pr.status}
                                            </span>
                                        </div>
                                        <div className="text-[10px] text-slate-500 mt-0.5">
                                            {pr.warehouse?.name} ({pr.site?.code}) • {pr.items?.length || 0} Item diusulkan
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-extrabold text-indigo-600 dark:text-indigo-400">
                                            {formatIDR(pr.estimated_total)}
                                        </div>
                                        <div className="text-[10px] text-slate-400">{pr.request_date}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Ajukan Purchase Request (PR) */}
            {showPrModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden shadow-xl">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                Ajukan Usulan Purchase Request (PR) dari Reorder Point
                            </h3>
                            <button onClick={() => setShowPrModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={submitPrProposal} className="p-4 space-y-4 text-xs">
                            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-[11px]">
                                <strong>Ketentuan Integrasi Procurement:</strong> Dokumen ini hanya membuat usulan{' '}
                                <strong>Purchase Request (PR)</strong>. Sistem tidak membuat Purchase Order (PO) otomatis tanpa persetujuan manajemen.
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold mb-1">Site</label>
                                    <select
                                        value={prForm.data.site_id}
                                        onChange={(e) => prForm.setData('site_id', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                        required
                                    >
                                        {(master.sites || []).map((s) => (
                                            <option key={s.id} value={s.id}>
                                                {s.code} — {s.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-semibold mb-1">Gudang Tujuan</label>
                                    <select
                                        value={prForm.data.warehouse_id}
                                        onChange={(e) => prForm.setData('warehouse_id', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                        required
                                    >
                                        {(master.warehouses || [])
                                            .filter((w) => String(w.site_id) === String(prForm.data.site_id))
                                            .map((w) => (
                                                <option key={w.id} value={w.id}>
                                                    {w.code} — {w.name}
                                                </option>
                                            ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Catatan Usulan PR</label>
                                <textarea
                                    rows={3}
                                    value={prForm.data.notes}
                                    onChange={(e) => prForm.setData('notes', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowPrModal(false)}
                                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={prForm.processing}
                                    className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700"
                                >
                                    Buat Usulan PR Sekarang
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
