import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import DashboardLayout from '../../../components/templates/DashboardLayout';
import AnalyticsFilterBar from '../Partials/AnalyticsFilterBar';

const fmtNum = (v, dec = 2) =>
    new Intl.NumberFormat('id-ID', { maximumFractionDigits: dec }).format(Number(v || 0));

const fmtIDR = (v) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(v || 0));

export default function WarehouseProcurementReportIndex({
    report = {},
    filters = {},
    master = {},
}) {
    const [activeTab, setActiveTab] = useState('stock_balance');

    const summary = report.summary || {};
    const balances = report.stock_balances || [];
    const minStock = report.minimum_stock_items || [];
    const movements = report.stock_movements || [];
    const purchaseOrders = report.purchase_orders || [];
    const outstandingPos = report.purchase_outstanding || [];
    const vendorPerf = report.vendor_performance || [];

    return (
        <DashboardLayout title="Warehouse Stock Valuation & Procurement Analytics Report">
            <Head title="Warehouse & Procurement Report - Phase 11" />

            <div className="space-y-6">
                <AnalyticsFilterBar
                    currentPath="/analytics/warehouse-procurement"
                    reportType="warehouse_procurement"
                    filters={filters}
                    master={master}
                    statusOptions={[
                        { value: '', label: 'Semua Status PO' },
                        { value: 'approved', label: 'Approved' },
                        { value: 'completed', label: 'Completed' },
                        { value: 'pending_approval', label: 'Pending Approval' },
                    ]}
                />

                {/* KPI Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                        <span className="text-xs font-semibold text-slate-500">Stock Valuation (MWA)</span>
                        <p className="text-lg font-extrabold text-indigo-600 mt-2">
                            {fmtIDR(summary.stock_valuation_idr)}
                        </p>
                        <p className="text-[11px] text-slate-400">On Hand: {fmtNum(summary.total_on_hand_qty, 0)} Qty</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                        <span className="text-xs font-semibold text-slate-500">Minimum Stock Alert</span>
                        <p className="text-2xl font-extrabold text-rose-600 mt-2">
                            {summary.minimum_stock_alert_count || 0} <span className="text-xs font-normal">SKU</span>
                        </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                        <span className="text-xs font-semibold text-slate-500">Stock Movement (IN / OUT)</span>
                        <p className="text-lg font-extrabold text-emerald-600 mt-2">
                            +{summary.stock_in_transactions_count || 0} / -{summary.stock_out_transactions_count || 0}
                        </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                        <span className="text-xs font-semibold text-slate-500">Purchase Summary (PO)</span>
                        <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-2">
                            {fmtIDR(summary.total_po_value_idr)}
                        </p>
                        <p className="text-[11px] text-slate-400">
                            PR: {summary.total_pr_count || 0} • PO: {summary.total_po_count || 0}
                        </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                        <span className="text-xs font-semibold text-slate-500">Purchase Outstanding</span>
                        <p className="text-lg font-extrabold text-amber-600 mt-2">
                            {fmtIDR(summary.purchase_outstanding_value_idr)}
                        </p>
                        <p className="text-[11px] text-slate-400">{summary.purchase_outstanding_count || 0} PO Open</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                        <span className="text-xs font-semibold text-slate-500">Invoiced Value</span>
                        <p className="text-lg font-extrabold text-cyan-600 mt-2">
                            {fmtIDR(summary.total_invoiced_value_idr)}
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap gap-1.5 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                    {[
                        { id: 'stock_balance', label: `Stock Balance & Valuation (${balances.length})` },
                        { id: 'min_stock', label: `Minimum Stock Alert (${minStock.length})` },
                        { id: 'movement', label: `Stock Movement (${movements.length})` },
                        { id: 'procurement', label: `Purchase Summary, Outstanding & Vendor (${purchaseOrders.length})` },
                    ].map((t) => (
                        <button
                            key={t.id}
                            type="button"
                            onClick={() => setActiveTab(t.id)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                                activeTab === t.id
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                            }`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                {activeTab === 'stock_balance' && (
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500">
                                <tr>
                                    <th className="px-3 py-2.5">Gudang & Site</th>
                                    <th className="px-3 py-2.5">Kode & Nama Barang</th>
                                    <th className="px-3 py-2.5">Kategori</th>
                                    <th className="px-3 py-2.5 text-right">On Hand</th>
                                    <th className="px-3 py-2.5 text-right">Available</th>
                                    <th className="px-3 py-2.5 text-right">Avg Unit Cost</th>
                                    <th className="px-3 py-2.5 text-right">Total Valuation</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {balances.map((b) => (
                                    <tr key={b.id}>
                                        <td className="px-3 py-2.5 font-semibold">{b.warehouse?.code} ({b.site?.code})</td>
                                        <td className="px-3 py-2.5">
                                            <div className="font-bold">{b.item?.name}</div>
                                            <div className="text-[10px] text-slate-400">{b.item?.item_code}</div>
                                        </td>
                                        <td className="px-3 py-2.5 uppercase">{b.item?.category}</td>
                                        <td className="px-3 py-2.5 text-right font-bold">{fmtNum(b.on_hand_qty)}</td>
                                        <td className="px-3 py-2.5 text-right text-emerald-600 font-semibold">{fmtNum(b.available_qty)}</td>
                                        <td className="px-3 py-2.5 text-right">{fmtIDR(b.average_unit_cost)}</td>
                                        <td className="px-3 py-2.5 text-right font-bold text-indigo-600">{fmtIDR(b.total_value)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'min_stock' && (
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500">
                                <tr>
                                    <th className="px-3 py-2.5">Gudang</th>
                                    <th className="px-3 py-2.5">Item</th>
                                    <th className="px-3 py-2.5 text-right">On Hand Qty</th>
                                    <th className="px-3 py-2.5 text-right">Minimum Stock</th>
                                    <th className="px-3 py-2.5 text-right">Reorder Point</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {minStock.map((b) => (
                                    <tr key={b.id}>
                                        <td className="px-3 py-2.5 font-semibold">{b.warehouse?.code}</td>
                                        <td className="px-3 py-2.5 font-bold text-rose-600">{b.item?.item_code} — {b.item?.name}</td>
                                        <td className="px-3 py-2.5 text-right font-extrabold text-rose-600">{fmtNum(b.on_hand_qty)}</td>
                                        <td className="px-3 py-2.5 text-right">{fmtNum(b.item?.minimum_stock)}</td>
                                        <td className="px-3 py-2.5 text-right">{fmtNum(b.item?.reorder_point)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'movement' && (
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500">
                                <tr>
                                    <th className="px-3 py-2.5">No. Dokumen</th>
                                    <th className="px-3 py-2.5">Tanggal</th>
                                    <th className="px-3 py-2.5">Gudang</th>
                                    <th className="px-3 py-2.5">Arah & Tipe</th>
                                    <th className="px-3 py-2.5 text-right">Nilai Transaksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {movements.map((m) => (
                                    <tr key={m.id}>
                                        <td className="px-3 py-2.5 font-bold">{m.document_number}</td>
                                        <td className="px-3 py-2.5">{m.transaction_date?.substring(0, 10)}</td>
                                        <td className="px-3 py-2.5">{m.warehouse?.code}</td>
                                        <td className="px-3 py-2.5">
                                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                                                m.direction === 'IN' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                            }`}>
                                                {m.direction} — {m.transaction_type}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2.5 text-right font-bold">{fmtIDR(m.total_amount)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'procurement' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                            <h3 className="text-xs font-bold uppercase text-indigo-600 mb-3">
                                Vendor Performance ({vendorPerf.length})
                            </h3>
                            <table className="w-full text-left text-xs">
                                <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                                    <tr>
                                        <th className="py-2">Vendor</th>
                                        <th className="py-2 text-center">PO Count</th>
                                        <th className="py-2 text-right">Total Nilai PO</th>
                                        <th className="py-2 text-right">Rating</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {vendorPerf.map((v) => (
                                        <tr key={v.vendor_id}>
                                            <td className="py-2 font-bold">{v.vendor_code} — {v.vendor_name}</td>
                                            <td className="py-2 text-center">{v.po_count}</td>
                                            <td className="py-2 text-right font-bold text-indigo-600">{fmtIDR(v.total_po_value_idr)}</td>
                                            <td className="py-2 text-right font-semibold text-amber-600">{v.rating} / 5.0</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                            <h3 className="text-xs font-bold uppercase text-amber-600 mb-3">
                                Purchase Outstanding ({outstandingPos.length} PO)
                            </h3>
                            <table className="w-full text-left text-xs">
                                <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                                    <tr>
                                        <th className="py-2">No. PO</th>
                                        <th className="py-2">Vendor</th>
                                        <th className="py-2">Status</th>
                                        <th className="py-2 text-right">Grand Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {outstandingPos.map((po) => (
                                        <tr key={po.id}>
                                            <td className="py-2 font-bold">{po.po_number}</td>
                                            <td className="py-2">{po.vendor?.name}</td>
                                            <td className="py-2 uppercase font-semibold text-amber-600">{po.status}</td>
                                            <td className="py-2 text-right font-bold">{fmtIDR(po.grand_total)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
