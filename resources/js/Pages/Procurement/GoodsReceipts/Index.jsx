import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import DashboardLayout from '@/components/templates/DashboardLayout';

export default function GoodsReceiptsIndex({ receipts, openPos, metrics, filters, master }) {
    const [showCreateModal, setShowCreateModal] = useState(false);

    const form = useForm({
        purchase_order_id: '',
        site_id: '',
        warehouse_id: '',
        receipt_date: new Date().toISOString().slice(0, 10),
        delivery_note_number: '',
        received_by: '',
        inspected_by: '',
        confirm_over_delivery: false,
        remarks: '',
        items: [],
    });

    const formatIDR = (val) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(val || 0));

    const handleSelectPo = (poId) => {
        const po = (openPos || []).find((p) => String(p.id) === String(poId));
        if (!po) {
            form.setData({ ...form.data, purchase_order_id: poId, items: [] });
            return;
        }
        const mappedItems = (po.items || []).map((item) => {
            const outstanding = Math.max(0, Number(item.quantity_ordered) - Number(item.quantity_received));
            return {
                purchase_order_item_id: item.id,
                item_name: item.item_name,
                unit: item.unit,
                qty_ordered: Number(item.quantity_ordered),
                qty_outstanding: outstanding,
                warehouse_location_id: '',
                qty_delivered: outstanding,
                qty_accepted: outstanding,
                qty_damaged: 0,
                qty_rejected: 0,
                condition_notes: 'Good Condition',
            };
        });
        form.setData({
            ...form.data,
            purchase_order_id: po.id,
            site_id: po.site_id,
            warehouse_id: po.warehouse_id || '',
            items: mappedItems,
        });
    };

    const updateGrnItem = (index, field, value) => {
        const next = [...form.data.items];
        next[index][field] = value;
        form.setData('items', next);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        form.post('/procurement/goods-receipts', {
            onSuccess: () => {
                setShowCreateModal(false);
                form.reset();
            },
        });
    };

    const handleConfirmOverDelivery = (grnId) => {
        router.post(`/procurement/goods-receipts/${grnId}/confirm-over-delivery`);
    };

    const applyFilter = (key, val) => {
        router.get('/procurement/goods-receipts', { ...filters, [key]: val }, { preserveState: true, replace: true });
    };

    return (
        <DashboardLayout title="Goods Receipt (GRN) & Warehouse Integration">
            <Head title="Goods Receipts - Procurement Management" />

            <div className="space-y-6">
                {/* Navigation Pills */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                        <Link href="/procurement/dashboard" className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            Dashboard
                        </Link>
                        <Link href="/procurement/purchase-requests" className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            1. Purchase Requests
                        </Link>
                        <Link href="/procurement/rfqs" className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            2. RFQ & Comparison
                        </Link>
                        <Link href="/procurement/purchase-orders" className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            3. Purchase Orders
                        </Link>
                        <Link href="/procurement/goods-receipts" className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white">
                            4. Goods Receipt (GRN)
                        </Link>
                        <Link href="/procurement/invoices" className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            5. Vendor Invoices (3-Way Match)
                        </Link>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowCreateModal(true)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-sm transition"
                    >
                        + Catat Penerimaan Barang (GRN)
                    </button>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <div className="text-[11px] font-bold uppercase text-slate-400">Total Dokumen GRN</div>
                        <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{metrics?.total_grn || 0}</div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <div className="text-[11px] font-bold uppercase text-emerald-500">Full Receiving</div>
                        <div className="text-2xl font-black text-emerald-600 mt-1">{metrics?.full_receiving || 0}</div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <div className="text-[11px] font-bold uppercase text-amber-500">Partial / Under Delivery</div>
                        <div className="text-2xl font-black text-amber-600 mt-1">{metrics?.partial_receiving || 0}</div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <div className="text-[11px] font-bold uppercase text-rose-500">Over-Delivery Review</div>
                        <div className="text-2xl font-black text-rose-600 mt-1">{metrics?.over_delivery_review || 0}</div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <div className="text-[11px] font-bold uppercase text-indigo-500">Nilai Masuk Gudang (Confirmed)</div>
                        <div className="text-lg font-black text-indigo-600 mt-1">{formatIDR(metrics?.total_received_value)}</div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap gap-3 items-center">
                    <select
                        value={filters?.site_id || ''}
                        onChange={(e) => applyFilter('site_id', e.target.value)}
                        className="rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-xs"
                    >
                        <option value="">Semua Site</option>
                        {(master?.sites || []).map((s) => (
                            <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                        ))}
                    </select>
                    <select
                        value={filters?.receipt_type || ''}
                        onChange={(e) => applyFilter('receipt_type', e.target.value)}
                        className="rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-xs"
                    >
                        <option value="">Semua Tipe Penerimaan</option>
                        <option value="full_receiving">Full Receiving</option>
                        <option value="partial_receiving">Partial Receiving</option>
                        <option value="under_delivery">Under Delivery</option>
                        <option value="over_delivery_review">Over Delivery Review</option>
                        <option value="rejected_delivery">Rejected Delivery</option>
                    </select>
                    <select
                        value={filters?.status || ''}
                        onChange={(e) => applyFilter('status', e.target.value)}
                        className="rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-xs"
                    >
                        <option value="">Semua Status</option>
                        <option value="confirmed">Confirmed (Added to Stock)</option>
                        <option value="pending_over_delivery_review">Pending Over-Delivery Review</option>
                        <option value="rejected">Rejected (No Stock Added)</option>
                    </select>
                </div>

                {/* Goods Receipts Table */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase text-[10px]">
                                <tr>
                                    <th className="py-3 px-4 text-left">Nomor GRN & Tanggal</th>
                                    <th className="py-3 px-4 text-left">Referensi PO & Vendor</th>
                                    <th className="py-3 px-4 text-left">Site & Gudang Tujuan</th>
                                    <th className="py-3 px-4 text-left">Tipe & Detail QC Barang</th>
                                    <th className="py-3 px-4 text-right">Nilai Diterima (Good)</th>
                                    <th className="py-3 px-4 text-left">Integrasi Stok Gudang</th>
                                    <th className="py-3 px-4 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {(receipts?.data || []).map((grn) => (
                                    <tr key={grn.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                                        <td className="py-3.5 px-4">
                                            <div className="font-black text-slate-900 dark:text-white">{grn.grn_number}</div>
                                            <div className="text-[11px] text-slate-500">
                                                Tgl: {grn.receipt_date?.slice(0, 10)} • SJ: {grn.delivery_note_number || '-'}
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <div className="font-bold text-indigo-600 dark:text-indigo-400">
                                                {grn.purchase_order?.po_number}
                                            </div>
                                            <div className="text-[11px] text-slate-600 dark:text-slate-400">
                                                {grn.vendor?.name}
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <div className="font-semibold text-slate-800 dark:text-slate-200">
                                                {grn.warehouse?.name} ({grn.warehouse?.code})
                                            </div>
                                            <div className="text-[11px] text-slate-500">{grn.site?.name}</div>
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 mb-1">
                                                {grn.receipt_type?.replace(/_/g, ' ')}
                                            </span>
                                            <div className="space-y-0.5 text-[11px]">
                                                {(grn.items || []).map((it) => (
                                                    <div key={it.id} className="text-slate-600 dark:text-slate-400">
                                                        • <span className="font-semibold">{it.po_item?.item_name || it.inventory_item?.item_name}</span>:{' '}
                                                        <span className="text-emerald-600 font-bold">Good {Number(it.qty_accepted)}</span>
                                                        {Number(it.qty_damaged) > 0 && (
                                                            <span className="text-rose-600 ml-1">| Rusak {Number(it.qty_damaged)}</span>
                                                        )}
                                                        {Number(it.qty_rejected) > 0 && (
                                                            <span className="text-amber-600 ml-1">| Ditolak {Number(it.qty_rejected)}</span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-4 text-right font-black text-slate-900 dark:text-white">
                                            {formatIDR(grn.total_received_value)}
                                        </td>
                                        <td className="py-3.5 px-4">
                                            {grn.status === 'confirmed' && grn.inventory_transaction ? (
                                                <div>
                                                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-black">
                                                        STOCK IN: {grn.inventory_transaction.document_number}
                                                    </span>
                                                    <div className="text-[10px] text-slate-500 mt-0.5">
                                                        Hanya barang Good/Accepted masuk stok
                                                    </div>
                                                </div>
                                            ) : grn.status === 'pending_over_delivery_review' ? (
                                                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-black">
                                                    HOLD: Menunggu Review Over-Delivery
                                                </span>
                                            ) : (
                                                <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-black">
                                                    TIDAK MASUK STOK ({grn.status})
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3.5 px-4 text-center">
                                            {grn.status === 'pending_over_delivery_review' ? (
                                                <button
                                                    type="button"
                                                    onClick={() => handleConfirmOverDelivery(grn.id)}
                                                    className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold"
                                                >
                                                    Setujui Over-Delivery & Posting Stok
                                                </button>
                                            ) : (
                                                <span className="text-[11px] text-slate-400">Selesai</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal Create Goods Receipt */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
                    <form
                        onSubmit={handleSubmit}
                        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-4xl w-full p-6 space-y-4 shadow-xl my-8"
                    >
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                            <div>
                                <h3 className="text-base font-black text-slate-900 dark:text-white">
                                    Pencatatan Goods Receipt (GRN) terhadap Purchase Order
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Barang rusak (Damaged) atau ditolak (Rejected) tidak akan menambah stok gudang.
                                </p>
                            </div>
                            <button type="button" onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">
                                ✕
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                            <div>
                                <label className="font-bold text-slate-700 dark:text-slate-300">Pilih Purchase Order (Approved)</label>
                                <select
                                    required
                                    value={form.data.purchase_order_id}
                                    onChange={(e) => handleSelectPo(e.target.value)}
                                    className="w-full mt-1 rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-xs"
                                >
                                    <option value="">-- Pilih PO --</option>
                                    {(openPos || []).map((po) => (
                                        <option key={po.id} value={po.id}>
                                            {po.po_number} - {po.vendor?.name} ({po.site?.code})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="font-bold text-slate-700 dark:text-slate-300">Gudang Penerima</label>
                                <select
                                    required
                                    value={form.data.warehouse_id}
                                    onChange={(e) => form.setData('warehouse_id', e.target.value)}
                                    className="w-full mt-1 rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-xs"
                                >
                                    <option value="">-- Pilih Gudang --</option>
                                    {(master?.warehouses || []).map((w) => (
                                        <option key={w.id} value={w.id}>{w.name} ({w.code})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="font-bold text-slate-700 dark:text-slate-300">Tanggal Penerimaan</label>
                                <input
                                    type="date"
                                    required
                                    value={form.data.receipt_date}
                                    onChange={(e) => form.setData('receipt_date', e.target.value)}
                                    className="w-full mt-1 rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-xs"
                                />
                            </div>
                            <div>
                                <label className="font-bold text-slate-700 dark:text-slate-300">Nomor Surat Jalan Vendor</label>
                                <input
                                    type="text"
                                    placeholder="SJ-VENDOR-001"
                                    value={form.data.delivery_note_number}
                                    onChange={(e) => form.setData('delivery_note_number', e.target.value)}
                                    className="w-full mt-1 rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-xs"
                                />
                            </div>
                            <div>
                                <label className="font-bold text-slate-700 dark:text-slate-300">Storeman Penerima</label>
                                <select
                                    value={form.data.received_by}
                                    onChange={(e) => form.setData('received_by', e.target.value)}
                                    className="w-full mt-1 rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-xs"
                                >
                                    <option value="">-- Pilih Karyawan --</option>
                                    {(master?.employees || []).map((emp) => (
                                        <option key={emp.id} value={emp.id}>{emp.name} ({emp.employee_code})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-center pt-5">
                                <label className="inline-flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.data.confirm_over_delivery}
                                        onChange={(e) => form.setData('confirm_over_delivery', e.target.checked)}
                                        className="rounded border-slate-300"
                                    />
                                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                                        Langsung Setujui jika Over-Delivery
                                    </span>
                                </label>
                            </div>
                        </div>

                        {/* Items Inspection Table */}
                        {form.data.items.length > 0 && (
                            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                                <table className="w-full text-xs">
                                    <thead className="bg-slate-100 dark:bg-slate-800 text-[10px] uppercase">
                                        <tr>
                                            <th className="p-2 text-left">Item PO</th>
                                            <th className="p-2 text-right">Sisa PO</th>
                                            <th className="p-2 text-right">Qty Dikirim</th>
                                            <th className="p-2 text-right text-emerald-700">Qty Good (Accepted)</th>
                                            <th className="p-2 text-right text-rose-600">Qty Rusak</th>
                                            <th className="p-2 text-right text-amber-600">Qty Ditolak</th>
                                            <th className="p-2 text-left">Catatan Kondisi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                        {form.data.items.map((it, idx) => (
                                            <tr key={it.purchase_order_item_id}>
                                                <td className="p-2 font-bold">{it.item_name}</td>
                                                <td className="p-2 text-right font-semibold">{it.qty_outstanding} {it.unit}</td>
                                                <td className="p-2">
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={it.qty_delivered}
                                                        onChange={(e) => updateGrnItem(idx, 'qty_delivered', e.target.value)}
                                                        className="w-20 rounded border-slate-300 dark:bg-slate-800 text-xs text-right"
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={it.qty_accepted}
                                                        onChange={(e) => updateGrnItem(idx, 'qty_accepted', e.target.value)}
                                                        className="w-20 rounded border-emerald-400 dark:bg-slate-800 text-xs text-right font-bold text-emerald-700"
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={it.qty_damaged}
                                                        onChange={(e) => updateGrnItem(idx, 'qty_damaged', e.target.value)}
                                                        className="w-16 rounded border-rose-300 dark:bg-slate-800 text-xs text-right text-rose-600"
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={it.qty_rejected}
                                                        onChange={(e) => updateGrnItem(idx, 'qty_rejected', e.target.value)}
                                                        className="w-16 rounded border-amber-300 dark:bg-slate-800 text-xs text-right text-amber-600"
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <input
                                                        type="text"
                                                        value={it.condition_notes}
                                                        onChange={(e) => updateGrnItem(idx, 'condition_notes', e.target.value)}
                                                        className="w-full rounded border-slate-300 dark:bg-slate-800 text-xs"
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                            <button
                                type="button"
                                onClick={() => setShowCreateModal(false)}
                                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={form.processing}
                                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black"
                            >
                                Simpan GRN & Sinkronisasi Stok Gudang
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </DashboardLayout>
    );
}
