import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import DashboardLayout from '../../../components/templates/DashboardLayout';
import { BookOpen, ArrowDownRight, ArrowUpRight, Calculator, Warehouse } from 'lucide-react';

const formatIDR = (val) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(val || 0));

export default function StockCardIndex({
    selectedItem = null,
    balances = [],
    ledgerEntries = [],
    summary = {},
    filters = {},
    master = {},
}) {
    const [itemId, setItemId] = useState(filters.inventory_item_id || (master.items?.[0]?.id ?? ''));
    const [siteId, setSiteId] = useState(filters.site_id || '');
    const [warehouseId, setWarehouseId] = useState(filters.warehouse_id || '');

    const applyFilter = (newItem, newSite, newWh) => {
        router.get(
            '/warehouse/stock-card',
            {
                inventory_item_id: newItem || undefined,
                site_id: newSite || undefined,
                warehouse_id: newWh || undefined,
            },
            { preserveState: true, preserveScroll: true }
        );
    };

    return (
        <DashboardLayout title="Kartu Stok (Stock Card) & Valuasi Moving Weighted Average">
            <Head title="Stock Card & MWA Valuation - TAP" />

            <div className="space-y-6">
                {/* Header & Item Selector */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-indigo-600" />
                            Kartu Stok Barang (Stock Card) & Valuasi MWA
                        </h1>
                        <p className="text-xs text-slate-500 mt-1">
                            Histori lengkap Opening Balance, Stock In, Stock Out, Running Balance, Referensi Dokumen, User, Gudang, dan perhitungan Moving Weighted Average.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 text-xs">
                        <select
                            value={itemId}
                            onChange={(e) => {
                                setItemId(e.target.value);
                                applyFilter(e.target.value, siteId, warehouseId);
                            }}
                            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-900 dark:text-white"
                        >
                            {(master.items || []).map((i) => (
                                <option key={i.id} value={i.id}>
                                    {i.item_code} — {i.item_name}
                                </option>
                            ))}
                        </select>

                        <select
                            value={siteId}
                            onChange={(e) => {
                                setSiteId(e.target.value);
                                applyFilter(itemId, e.target.value, warehouseId);
                            }}
                            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                        >
                            <option value="">Semua Site</option>
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
                                applyFilter(itemId, siteId, e.target.value);
                            }}
                            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                        >
                            <option value="">Semua Gudang</option>
                            {(master.warehouses || []).map((w) => (
                                <option key={w.id} value={w.id}>
                                    {w.code} — {w.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Formula Banner */}
                <div className="bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/60 p-4 rounded-2xl flex items-start gap-3">
                    <Calculator className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                    <div className="text-xs text-slate-700 dark:text-slate-300">
                        <strong className="text-slate-900 dark:text-white">
                            Metode Valuasi Resmi: Moving Weighted Average (MWA)
                        </strong>
                        <p className="mt-0.5 text-[11px]">
                            Formula Harga Rata-Rata Bergerak: <code>New Avg Cost = ((Old Qty × Old Avg Cost) + (Qty In × Purchase Cost)) / (Old Qty + Qty In)</code>. Setiap pengeluaran (Stock Out) menggunakan nilai MWA berjalan pada saat transaksi.
                        </p>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                        <span className="text-[11px] text-slate-500">Opening Balance</span>
                        <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                            {summary.opening_balance || 0} {selectedItem?.unit_of_measurement}
                        </p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                        <span className="text-[11px] text-emerald-600 font-bold">Total Stock In (+)</span>
                        <p className="text-xl font-extrabold text-emerald-600 mt-1">
                            +{summary.total_in || 0} {selectedItem?.unit_of_measurement}
                        </p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                        <span className="text-[11px] text-rose-600 font-bold">Total Stock Out (-)</span>
                        <p className="text-xl font-extrabold text-rose-600 mt-1">
                            -{summary.total_out || 0} {selectedItem?.unit_of_measurement}
                        </p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                        <span className="text-[11px] text-indigo-600 font-bold">Closing On Hand</span>
                        <p className="text-xl font-extrabold text-indigo-600 mt-1">
                            {summary.closing_balance || 0} {selectedItem?.unit_of_measurement}
                        </p>
                        <span className="text-[10px] text-slate-400">
                            Avail: {summary.available_qty || 0} (Res: {summary.reserved_qty || 0})
                        </span>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                        <span className="text-[11px] text-slate-500">MWA Cost / Total Valuasi</span>
                        <p className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
                            {formatIDR(summary.moving_average_cost)}
                        </p>
                        <span className="text-[10px] text-indigo-600 font-bold">
                            Total: {formatIDR(summary.total_valuation)}
                        </span>
                    </div>
                </div>

                {/* Stock Card Ledger Table */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
                    <div className="p-4 border-b border-slate-200/80 dark:border-slate-800">
                        <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                            Histori Pergerakan Barang (Immutable Stock Card Ledger) — {selectedItem?.item_code}{' '}
                            {selectedItem?.item_name}
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                                    <th className="py-3 px-3 font-bold">Tanggal & Jam</th>
                                    <th className="py-3 px-3 font-bold">No. Transaksi & Referensi</th>
                                    <th className="py-3 px-3 font-bold">Gudang / Rack</th>
                                    <th className="py-3 px-3 font-bold text-right">Opening</th>
                                    <th className="py-3 px-3 font-bold text-right">Stock In</th>
                                    <th className="py-3 px-3 font-bold text-right">Stock Out</th>
                                    <th className="py-3 px-3 font-bold text-right">Running Bal</th>
                                    <th className="py-3 px-3 font-bold text-right">Harga / MWA Cost</th>
                                    <th className="py-3 px-3 font-bold text-right">Running Valuation</th>
                                    <th className="py-3 px-3 font-bold">User</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800">
                                {ledgerEntries.map((row) => (
                                    <tr key={row.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                                        <td className="py-2.5 px-3 whitespace-nowrap text-slate-600 dark:text-slate-400">
                                            {String(row.transaction_datetime || '').slice(0, 16).replace('T', ' ')}
                                        </td>
                                        <td className="py-2.5 px-3">
                                            <div className="font-bold text-slate-900 dark:text-white">
                                                {row.transaction?.document_number}
                                            </div>
                                            <div className="text-[10px] text-slate-500">
                                                {row.transaction_type} • Ref: {row.reference_document || '-'}
                                            </div>
                                        </td>
                                        <td className="py-2.5 px-3">
                                            <div className="font-semibold text-slate-800 dark:text-slate-200">
                                                {row.warehouse?.code}
                                            </div>
                                            <div className="text-[10px] text-slate-500">
                                                {row.location?.location_code || '-'} ({row.site?.code})
                                            </div>
                                        </td>
                                        <td className="py-2.5 px-3 text-right font-mono">{row.opening_balance_qty}</td>
                                        <td className="py-2.5 px-3 text-right font-bold text-emerald-600">
                                            {Number(row.qty_in) > 0 ? `+${row.qty_in}` : '-'}
                                        </td>
                                        <td className="py-2.5 px-3 text-right font-bold text-rose-600">
                                            {Number(row.qty_out) > 0 ? `-${row.qty_out}` : '-'}
                                        </td>
                                        <td className="py-2.5 px-3 text-right font-extrabold text-indigo-600 dark:text-indigo-400">
                                            {row.running_balance_qty} {row.unit}
                                        </td>
                                        <td className="py-2.5 px-3 text-right">
                                            <div className="font-bold text-slate-800 dark:text-slate-200">
                                                MWA: {formatIDR(row.moving_average_cost)}
                                            </div>
                                            <div className="text-[10px] text-slate-400">
                                                Tx Unit: {formatIDR(row.unit_cost)}
                                            </div>
                                        </td>
                                        <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-white">
                                            {formatIDR(row.running_valuation)}
                                        </td>
                                        <td className="py-2.5 px-3 text-[11px] text-slate-500">
                                            {row.creator?.name || 'System'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
