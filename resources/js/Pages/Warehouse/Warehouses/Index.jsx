import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import DashboardLayout from '../../../components/templates/DashboardLayout';
import { Building2, MapPin, ArrowLeftRight, Plus, Truck, CheckCircle2, X } from 'lucide-react';

const formatIDR = (val) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(val || 0));

export default function WarehouseManagementIndex({ warehouses = [], transfers, filters = {}, master = {} }) {
    const [showWhModal, setShowWhModal] = useState(false);
    const [showLocModal, setShowLocModal] = useState(false);
    const [showTrfModal, setShowTrfModal] = useState(false);

    const whForm = useForm({
        site_id: master.sites?.[0]?.id ?? '',
        code: '',
        name: '',
        warehouse_type: 'main_warehouse',
        location_address: '',
        storeman_id: master.employees?.[0]?.id ?? '',
        capacity: '',
        status: 'active',
    });

    const locForm = useForm({
        warehouse_id: warehouses?.[0]?.id ?? '',
        location_code: '',
        zone_name: '',
        rack_number: '',
        shelf_level: '',
        bin_code: '',
        capacity: '',
    });

    const trfForm = useForm({
        transfer_date: new Date().toISOString().slice(0, 10),
        from_warehouse_id: warehouses?.[0]?.id ?? '',
        to_warehouse_id: warehouses?.[1]?.id ?? '',
        requester_id: master.employees?.[0]?.id ?? '',
        remarks: '',
        items: [{ inventory_item_id: master.items?.[0]?.id ?? '', qty_requested: 2 }],
    });

    const submitWh = (e) => {
        e.preventDefault();
        whForm.post('/warehouse/warehouses', { onSuccess: () => setShowWhModal(false) });
    };

    const submitLoc = (e) => {
        e.preventDefault();
        locForm.post('/warehouse/locations', { onSuccess: () => setShowLocModal(false) });
    };

    const submitTransfer = (e) => {
        e.preventDefault();
        trfForm.post('/warehouse/transfers', { onSuccess: () => setShowTrfModal(false) });
    };

    return (
        <DashboardLayout title="Multi-Warehouse, Rack/Bin & Transfer Antar Gudang">
            <Head title="Multi-Gudang & Transfer - TAP" />

            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-indigo-600" />
                            Multi-Warehouse per Site, Rack/Bin Location & Transfer Resmi
                        </h1>
                        <p className="text-xs text-slate-500 mt-1">
                            Kelola beberapa gudang di setiap site operasional, penugasan Storeman, lokasi penyimpanan Rack/Bin, dan perpindahan barang resmi.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => setShowWhModal(true)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold"
                        >
                            <Plus className="w-3.5 h-3.5" /> Gudang Baru
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowLocModal(true)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
                        >
                            <MapPin className="w-3.5 h-3.5" /> Tambah Rack/Bin
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowTrfModal(true)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
                        >
                            <ArrowLeftRight className="w-3.5 h-3.5" /> Buat Dokumen Transfer
                        </button>
                    </div>
                </div>

                {/* Warehouses Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {warehouses.map((wh) => (
                        <div
                            key={wh.id}
                            className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between space-y-3"
                        >
                            <div>
                                <div className="flex items-center justify-between">
                                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                                        {wh.site?.code} — {wh.code}
                                    </span>
                                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-emerald-100 text-emerald-800">
                                        {wh.status}
                                    </span>
                                </div>
                                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mt-2">{wh.name}</h3>
                                <p className="text-[11px] text-slate-500">{wh.location_address || '-'}</p>
                                <div className="mt-2 text-[11px] text-slate-600 dark:text-slate-400 space-y-0.5">
                                    <div>
                                        <strong>Storeman:</strong> {wh.storeman?.name || 'Belum Ditugaskan'}
                                    </div>
                                    <div>
                                        <strong>Kapasitas:</strong> {wh.capacity || '-'}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-500">{wh.total_sku} SKU Tersimpan</span>
                                    <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
                                        {formatIDR(wh.total_valuation)}
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {(wh.locations || []).map((loc) => (
                                        <span
                                            key={loc.id}
                                            className="px-2 py-0.5 text-[10px] rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono"
                                        >
                                            {loc.location_code}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Inter-Warehouse Stock Transfers */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
                    <div className="p-4 border-b border-slate-200/80 dark:border-slate-800">
                        <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                            Dokumen Transfer Resmi Antar-Gudang (Stock Transfer)
                        </h2>
                        <p className="text-[11px] text-slate-500">
                            Alur resmi: Approved &rarr; Dispatch (Transfer Out dari Gudang Asal) &rarr; Receive (Transfer In di Gudang Tujuan dengan harga MWA).
                        </p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                                    <th className="py-3 px-3 font-bold">No. Dokumen Transfer</th>
                                    <th className="py-3 px-3 font-bold">Gudang Asal &rarr; Tujuan</th>
                                    <th className="py-3 px-3 font-bold">Detail Barang</th>
                                    <th className="py-3 px-3 font-bold text-right">Nilai Transfer</th>
                                    <th className="py-3 px-3 font-bold">Status</th>
                                    <th className="py-3 px-3 font-bold text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800">
                                {(transfers?.data || []).map((trf) => (
                                    <tr key={trf.id}>
                                        <td className="py-3 px-3">
                                            <div className="font-bold text-slate-900 dark:text-white">
                                                {trf.transfer_number}
                                            </div>
                                            <div className="text-[10px] text-slate-500">{trf.transfer_date}</div>
                                        </td>
                                        <td className="py-3 px-3">
                                            <div className="font-semibold text-slate-800 dark:text-slate-200">
                                                {trf.from_warehouse?.name} ({trf.from_site?.code})
                                            </div>
                                            <div className="text-[10px] text-indigo-600 font-bold">
                                                &darr; ke: {trf.to_warehouse?.name} ({trf.to_site?.code})
                                            </div>
                                        </td>
                                        <td className="py-3 px-3">
                                            {(trf.items || []).map((it) => (
                                                <div key={it.id} className="text-[11px]">
                                                    • {it.item?.item_code} ({it.item?.item_name}):{' '}
                                                    <strong>
                                                        {it.qty_requested} {it.unit}
                                                    </strong>
                                                </div>
                                            ))}
                                        </td>
                                        <td className="py-3 px-3 text-right font-bold">
                                            {formatIDR(trf.total_transfer_value)}
                                        </td>
                                        <td className="py-3 px-3">
                                            <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-indigo-100 text-indigo-800">
                                                {trf.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-3 text-right">
                                            {trf.status === 'approved' && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        router.post(`/warehouse/transfers/${trf.id}/dispatch`)
                                                    }
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-600 text-white text-[11px] font-bold"
                                                >
                                                    <Truck className="w-3 h-3" /> Dispatch (Out)
                                                </button>
                                            )}
                                            {trf.status === 'in_transit' && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        router.post(`/warehouse/transfers/${trf.id}/receive`)
                                                    }
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-bold"
                                                >
                                                    <CheckCircle2 className="w-3 h-3" /> Receive (In)
                                                </button>
                                            )}
                                            {trf.status === 'completed' && (
                                                <span className="text-[11px] text-emerald-600 font-bold">Selesai</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal Buat Transfer */}
            {showTrfModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden shadow-xl">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                Buat Dokumen Transfer Antar-Gudang
                            </h3>
                            <button onClick={() => setShowTrfModal(false)} className="text-slate-400">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={submitTransfer} className="p-4 space-y-3 text-xs">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold mb-1">Gudang Asal</label>
                                    <select
                                        value={trfForm.data.from_warehouse_id}
                                        onChange={(e) => trfForm.setData('from_warehouse_id', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                    >
                                        {warehouses.map((w) => (
                                            <option key={w.id} value={w.id}>
                                                {w.code} — {w.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-semibold mb-1">Gudang Tujuan</label>
                                    <select
                                        value={trfForm.data.to_warehouse_id}
                                        onChange={(e) => trfForm.setData('to_warehouse_id', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                    >
                                        {warehouses.map((w) => (
                                            <option key={w.id} value={w.id}>
                                                {w.code} — {w.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold mb-1">Barang</label>
                                    <select
                                        value={trfForm.data.items[0].inventory_item_id}
                                        onChange={(e) =>
                                            trfForm.setData('items', [
                                                { ...trfForm.data.items[0], inventory_item_id: e.target.value },
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
                                    <label className="block font-semibold mb-1">Kuantitas Transfer</label>
                                    <input
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                        value={trfForm.data.items[0].qty_requested}
                                        onChange={(e) =>
                                            trfForm.setData('items', [
                                                { ...trfForm.data.items[0], qty_requested: e.target.value },
                                            ])
                                        }
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowTrfModal(false)}
                                    className="px-4 py-2 rounded-xl border border-slate-200"
                                >
                                    Batal
                                </button>
                                <button type="submit" className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold">
                                    Simpan Dokumen Transfer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Tambah Gudang */}
            {showWhModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden shadow-xl">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Tambah Gudang Baru</h3>
                            <button onClick={() => setShowWhModal(false)} className="text-slate-400">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={submitWh} className="p-4 space-y-3 text-xs">
                            <div>
                                <label className="block font-semibold mb-1">Site</label>
                                <select
                                    value={whForm.data.site_id}
                                    onChange={(e) => whForm.setData('site_id', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                >
                                    {(master.sites || []).map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.code} — {s.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold mb-1">Kode Gudang</label>
                                    <input
                                        type="text"
                                        value={whForm.data.code}
                                        onChange={(e) => whForm.setData('code', e.target.value)}
                                        placeholder="WH-MCM-02"
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold mb-1">Nama Gudang</label>
                                    <input
                                        type="text"
                                        value={whForm.data.name}
                                        onChange={(e) => whForm.setData('name', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowWhModal(false)}
                                    className="px-4 py-2 rounded-xl border border-slate-200"
                                >
                                    Batal
                                </button>
                                <button type="submit" className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold">
                                    Simpan Gudang
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Tambah Lokasi Rack/Bin */}
            {showLocModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden shadow-xl">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Tambah Lokasi Rack / Bin</h3>
                            <button onClick={() => setShowLocModal(false)} className="text-slate-400">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={submitLoc} className="p-4 space-y-3 text-xs">
                            <div>
                                <label className="block font-semibold mb-1">Gudang</label>
                                <select
                                    value={locForm.data.warehouse_id}
                                    onChange={(e) => locForm.setData('warehouse_id', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                >
                                    {warehouses.map((w) => (
                                        <option key={w.id} value={w.id}>
                                            {w.code} — {w.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Kode Lokasi Rack/Bin *</label>
                                <input
                                    type="text"
                                    value={locForm.data.location_code}
                                    onChange={(e) => locForm.setData('location_code', e.target.value)}
                                    placeholder="RACK-A02-B01"
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowLocModal(false)}
                                    className="px-4 py-2 rounded-xl border border-slate-200"
                                >
                                    Batal
                                </button>
                                <button type="submit" className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold">
                                    Simpan Rack/Bin
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
