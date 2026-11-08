import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import DashboardLayout from '../../../components/templates/DashboardLayout';
import { ArrowDownRight, ArrowUpRight, ArrowLeftRight, Plus, X } from 'lucide-react';

const formatIDR = (val) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(val || 0));

export default function InventoryTransactionsIndex({ transactions, metrics = {}, filters = {}, master = {} }) {
    const [showInModal, setShowInModal] = useState(false);
    const [showOutModal, setShowOutModal] = useState(false);

    const firstSite = master.sites?.[0]?.id ?? '';
    const firstWh = (master.warehouses || []).find((w) => String(w.site_id) === String(firstSite))?.id ?? '';

    const inForm = useForm({
        transaction_date: new Date().toISOString().slice(0, 10),
        transaction_type: 'purchase_receiving',
        site_id: firstSite,
        warehouse_id: firstWh,
        reference_document: '',
        requester_id: master.employees?.[0]?.id ?? '',
        storeman_id: master.employees?.[0]?.id ?? '',
        remarks: '',
        items: [{ inventory_item_id: master.items?.[0]?.id ?? '', quantity: 10, unit_cost: 425000 }],
    });

    const outForm = useForm({
        transaction_date: new Date().toISOString().slice(0, 10),
        transaction_type: 'maintenance_issue',
        site_id: firstSite,
        warehouse_id: firstWh,
        reference_document: '',
        unit_id: master.units?.[0]?.id ?? '',
        work_order_id: master.workOrders?.[0]?.id ?? '',
        requester_id: master.employees?.[0]?.id ?? '',
        storeman_id: master.employees?.[0]?.id ?? '',
        remarks: '',
        items: [{ inventory_item_id: master.items?.[0]?.id ?? '', quantity: 2 }],
    });

    const submitIn = (e) => {
        e.preventDefault();
        inForm.post('/warehouse/transactions/stock-in', { onSuccess: () => setShowInModal(false) });
    };

    const submitOut = (e) => {
        e.preventDefault();
        outForm.post('/warehouse/transactions/stock-out', { onSuccess: () => setShowOutModal(false) });
    };

    const rows = transactions?.data || [];

    return (
        <DashboardLayout title="Inventory Transactions (Stock In & Stock Out)">
            <Head title="Transaksi Gudang Stock In & Out - TAP" />

            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                            <ArrowLeftRight className="w-5 h-5 text-indigo-600" />
                            Transaksi Persediaan: Stock In & Stock Out
                        </h1>
                        <p className="text-xs text-slate-500 mt-1">
                            Pencatatan resmi Goods Receipt, Opening Balance, Purchase Receiving, Return from Maintenance, Maintenance Issue, Operational Issue, dan Transfer.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => setShowInModal(true)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                        >
                            <ArrowDownRight className="w-4 h-4" /> Input Stock In
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowOutModal(true)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
                        >
                            <ArrowUpRight className="w-4 h-4" /> Input Stock Out
                        </button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                        <span className="text-xs text-slate-500">Total Transaksi</span>
                        <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                            {metrics.total_transactions || 0}
                        </p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                        <span className="text-xs text-emerald-600 font-bold">Total Nilai Stock In ({metrics.stock_in_count || 0})</span>
                        <p className="text-xl font-extrabold text-emerald-600 mt-1">
                            {formatIDR(metrics.total_in_value)}
                        </p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                        <span className="text-xs text-rose-600 font-bold">Total Nilai Stock Out ({metrics.stock_out_count || 0})</span>
                        <p className="text-xl font-extrabold text-rose-600 mt-1">
                            {formatIDR(metrics.total_out_value)}
                        </p>
                    </div>
                </div>

                {/* Transactions Table */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                                    <th className="py-3 px-3 font-bold">No. Dokumen & Tanggal</th>
                                    <th className="py-3 px-3 font-bold">Tipe & Arah</th>
                                    <th className="py-3 px-3 font-bold">Site & Gudang</th>
                                    <th className="py-3 px-3 font-bold">Referensi / Unit / WO</th>
                                    <th className="py-3 px-3 font-bold">Item & Kuantitas</th>
                                    <th className="py-3 px-3 font-bold text-right">Total Nilai (MWA)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800">
                                {rows.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                                        <td className="py-3 px-3">
                                            <div className="font-extrabold text-slate-900 dark:text-white">
                                                {tx.document_number}
                                            </div>
                                            <div className="text-[10px] text-slate-500">{tx.transaction_date}</div>
                                        </td>
                                        <td className="py-3 px-3">
                                            <span
                                                className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                                                    tx.direction === 'IN'
                                                        ? 'bg-emerald-100 text-emerald-800'
                                                        : 'bg-rose-100 text-rose-800'
                                                }`}
                                            >
                                                {tx.direction} — {tx.transaction_type}
                                            </span>
                                        </td>
                                        <td className="py-3 px-3">
                                            <div className="font-semibold text-slate-800 dark:text-slate-200">
                                                {tx.warehouse?.name}
                                            </div>
                                            <div className="text-[10px] text-slate-500">
                                                Site: {tx.site?.code} • Storeman: {tx.storeman?.name || '-'}
                                            </div>
                                        </td>
                                        <td className="py-3 px-3">
                                            <div className="font-semibold text-indigo-600">
                                                {tx.reference_document || '-'}
                                            </div>
                                            {tx.unit && (
                                                <div className="text-[10px] text-slate-500">
                                                    Unit: {tx.unit.unit_code} {tx.work_order ? `(${tx.work_order.wo_number})` : ''}
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-3 px-3">
                                            {(tx.items || []).map((line) => (
                                                <div key={line.id} className="text-[11px]">
                                                    • {line.item?.item_code} ({line.item?.item_name}):{' '}
                                                    <strong>
                                                        {tx.direction === 'IN' ? `+${line.qty_in}` : `-${line.qty_out}`}{' '}
                                                        {line.unit}
                                                    </strong>{' '}
                                                    @ {formatIDR(line.moving_average_cost)}
                                                </div>
                                            ))}
                                        </td>
                                        <td className="py-3 px-3 text-right font-extrabold text-slate-900 dark:text-white">
                                            {formatIDR(tx.total_amount)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal Stock In */}
            {showInModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden shadow-xl">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Catat Transaksi Stock In</h3>
                            <button onClick={() => setShowInModal(false)} className="text-slate-400">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={submitIn} className="p-4 space-y-3 text-xs">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold mb-1">Tipe Stock In</label>
                                    <select
                                        value={inForm.data.transaction_type}
                                        onChange={(e) => inForm.setData('transaction_type', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                    >
                                        {(master.stockInTypes || []).map((t) => (
                                            <option key={t} value={t}>
                                                {t}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-semibold mb-1">Gudang</label>
                                    <select
                                        value={inForm.data.warehouse_id}
                                        onChange={(e) => {
                                            const wh = (master.warehouses || []).find(
                                                (w) => String(w.id) === String(e.target.value)
                                            );
                                            inForm.setData({
                                                ...inForm.data,
                                                warehouse_id: e.target.value,
                                                site_id: wh ? wh.site_id : inForm.data.site_id,
                                            });
                                        }}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                    >
                                        {(master.warehouses || []).map((w) => (
                                            <option key={w.id} value={w.id}>
                                                {w.code} — {w.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="col-span-1">
                                    <label className="block font-semibold mb-1">Item</label>
                                    <select
                                        value={inForm.data.items[0].inventory_item_id}
                                        onChange={(e) =>
                                            inForm.setData('items', [
                                                { ...inForm.data.items[0], inventory_item_id: e.target.value },
                                            ])
                                        }
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                    >
                                        {(master.items || []).map((i) => (
                                            <option key={i.id} value={i.id}>
                                                {i.item_code} — {i.item_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-semibold mb-1">Qty Masuk</label>
                                    <input
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                        value={inForm.data.items[0].quantity}
                                        onChange={(e) =>
                                            inForm.setData('items', [
                                                { ...inForm.data.items[0], quantity: e.target.value },
                                            ])
                                        }
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold mb-1">Harga Beli/Unit</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={inForm.data.items[0].unit_cost}
                                        onChange={(e) =>
                                            inForm.setData('items', [
                                                { ...inForm.data.items[0], unit_cost: e.target.value },
                                            ])
                                        }
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Dokumen Referensi (PO / DO /BA)</label>
                                <input
                                    type="text"
                                    value={inForm.data.reference_document}
                                    onChange={(e) => inForm.setData('reference_document', e.target.value)}
                                    placeholder="PO-TAP-2026-..."
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowInModal(false)}
                                    className="px-4 py-2 rounded-xl border border-slate-200"
                                >
                                    Batal
                                </button>
                                <button type="submit" className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold">
                                    Simpan Stock In
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Stock Out */}
            {showOutModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden shadow-xl">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Catat Transaksi Stock Out</h3>
                            <button onClick={() => setShowOutModal(false)} className="text-slate-400">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={submitOut} className="p-4 space-y-3 text-xs">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold mb-1">Tipe Stock Out</label>
                                    <select
                                        value={outForm.data.transaction_type}
                                        onChange={(e) => outForm.setData('transaction_type', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                    >
                                        {(master.stockOutTypes || []).map((t) => (
                                            <option key={t} value={t}>
                                                {t}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-semibold mb-1">Gudang</label>
                                    <select
                                        value={outForm.data.warehouse_id}
                                        onChange={(e) => {
                                            const wh = (master.warehouses || []).find(
                                                (w) => String(w.id) === String(e.target.value)
                                            );
                                            outForm.setData({
                                                ...outForm.data,
                                                warehouse_id: e.target.value,
                                                site_id: wh ? wh.site_id : outForm.data.site_id,
                                            });
                                        }}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                    >
                                        {(master.warehouses || []).map((w) => (
                                            <option key={w.id} value={w.id}>
                                                {w.code} — {w.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold mb-1">Item</label>
                                    <select
                                        value={outForm.data.items[0].inventory_item_id}
                                        onChange={(e) =>
                                            outForm.setData('items', [
                                                { ...outForm.data.items[0], inventory_item_id: e.target.value },
                                            ])
                                        }
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                    >
                                        {(master.items || []).map((i) => (
                                            <option key={i.id} value={i.id}>
                                                {i.item_code} — {i.item_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-semibold mb-1">Qty Keluar</label>
                                    <input
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                        value={outForm.data.items[0].quantity}
                                        onChange={(e) =>
                                            outForm.setData('items', [
                                                { ...outForm.data.items[0], quantity: e.target.value },
                                            ])
                                        }
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowOutModal(false)}
                                    className="px-4 py-2 rounded-xl border border-slate-200"
                                >
                                    Batal
                                </button>
                                <button type="submit" className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold">
                                    Simpan Stock Out
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
