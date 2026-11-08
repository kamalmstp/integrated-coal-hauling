import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import DashboardLayout from '../../../components/templates/DashboardLayout';
import { PackageSearch, Plus, Search, X, Barcode, Layers } from 'lucide-react';

const formatIDR = (val) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(val || 0));

const statusBadge = (status) => {
    const map = {
        out_of_stock: 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300',
        critical_stock: 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300',
        low_stock: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/80 dark:text-yellow-300',
        excess_stock: 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300',
        normal: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300',
    };
    return (
        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${map[status] || map.normal}`}>
            {String(status || 'normal').replace(/_/g, ' ')}
        </span>
    );
};

export default function InventoryItemsIndex({ items, metrics = {}, filters = {}, master = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const [categoryCode, setCategoryCode] = useState(filters.category_code || '');
    const [stockStatus, setStockStatus] = useState(filters.stock_status || '');
    const [showModal, setShowModal] = useState(false);

    const form = useForm({
        site_id: master.sites?.[0]?.id ?? '',
        item_code: '',
        part_number: '',
        barcode: '',
        item_name: '',
        category_id: master.categories?.[0]?.id ?? '',
        brand: '',
        specification: '',
        unit_of_measurement: 'PCS',
        minimum_stock: 5,
        reorder_point: 10,
        maximum_stock: 50,
        default_warehouse_id: master.warehouses?.[0]?.id ?? '',
        default_location_id: '',
        standard_cost: 0,
        is_active: true,
    });

    const handleFilter = (e) => {
        if (e) e.preventDefault();
        router.get(
            '/warehouse/items',
            {
                search: search || undefined,
                category_code: categoryCode || undefined,
                stock_status: stockStatus || undefined,
            },
            { preserveState: true, preserveScroll: true }
        );
    };

    const submitItem = (e) => {
        e.preventDefault();
        form.post('/warehouse/items', {
            onSuccess: () => {
                setShowModal(false);
                form.reset();
            },
        });
    };

    const rows = items?.data || [];

    return (
        <DashboardLayout title="Item Master & Kategori Suku Cadang">
            <Head title="Master Barang & Sparepart - TAP" />

            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                            <PackageSearch className="w-5 h-5 text-indigo-600" />
                            Master Barang, Sparepart, Ban, Pelumas & Perlengkapan
                        </h1>
                        <p className="text-xs text-slate-500 mt-1">
                            10 Kategori Standar Operasional Coal Hauling TAP lengkap dengan Minimum Stock, Reorder Point, Maximum Stock, dan Part Number/Barcode.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Tambah Master Barang
                    </button>
                </div>

                {/* Filters */}
                <form
                    onSubmit={handleFilter}
                    className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 grid grid-cols-1 md:grid-cols-4 gap-3 text-xs"
                >
                    <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari Kode, Nama, Part Number, Barcode..."
                            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                        />
                    </div>
                    <select
                        value={categoryCode}
                        onChange={(e) => setCategoryCode(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    >
                        <option value="">Semua 10 Kategori</option>
                        {(master.categories || []).map((c) => (
                            <option key={c.id} value={c.code}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                    <select
                        value={stockStatus}
                        onChange={(e) => setStockStatus(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    >
                        <option value="">Semua Klasifikasi Stok</option>
                        <option value="out_of_stock">Out of Stock (0)</option>
                        <option value="critical_stock">Critical Stock (&le; Min)</option>
                        <option value="low_stock">Low Stock (&le; Reorder Point)</option>
                        <option value="excess_stock">Excess Stock (&gt; Max)</option>
                        <option value="normal">Normal Stock</option>
                    </select>
                    <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-indigo-600 text-white font-bold"
                    >
                        Terapkan Filter
                    </button>
                </form>

                {/* Table */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                                    <th className="py-3 px-3 font-bold">Kode / Part Number</th>
                                    <th className="py-3 px-3 font-bold">Nama Barang & Spesifikasi</th>
                                    <th className="py-3 px-3 font-bold">Kategori & Brand</th>
                                    <th className="py-3 px-3 font-bold text-right">Min / ROP / Max</th>
                                    <th className="py-3 px-3 font-bold text-right">On Hand / Avail</th>
                                    <th className="py-3 px-3 font-bold text-right">MWA Cost</th>
                                    <th className="py-3 px-3 font-bold">Status Stok</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800">
                                {rows.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                                        <td className="py-3 px-3">
                                            <div className="font-extrabold text-indigo-600 dark:text-indigo-400">
                                                {item.item_code}
                                            </div>
                                            <div className="text-[10px] text-slate-500">PN: {item.part_number || '-'}</div>
                                            {item.barcode && (
                                                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                                                    <Barcode className="w-3 h-3" /> {item.barcode}
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-3 px-3">
                                            <div className="font-bold text-slate-900 dark:text-white">{item.item_name}</div>
                                            <div className="text-[10px] text-slate-500 line-clamp-1">
                                                {item.specification || '-'}
                                            </div>
                                            <div className="text-[10px] text-slate-400 mt-0.5">
                                                Gudang Default: {item.default_warehouse?.name || '-'} ({item.default_location?.location_code || '-'})
                                            </div>
                                        </td>
                                        <td className="py-3 px-3">
                                            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300">
                                                {item.category?.name || item.category_code}
                                            </span>
                                            <div className="text-[10px] text-slate-500 mt-1">Brand: {item.brand || '-'}</div>
                                        </td>
                                        <td className="py-3 px-3 text-right text-slate-600 dark:text-slate-400">
                                            {item.minimum_stock} / <strong className="text-amber-600">{item.reorder_point}</strong> /{' '}
                                            {item.maximum_stock ?? '-'} {item.unit_of_measurement}
                                        </td>
                                        <td className="py-3 px-3 text-right">
                                            <div className="font-extrabold text-slate-900 dark:text-white">
                                                {item.total_on_hand} {item.unit_of_measurement}
                                            </div>
                                            <div className="text-[10px] text-emerald-600">
                                                Avail: {item.total_available} (Res: {item.total_reserved})
                                            </div>
                                        </td>
                                        <td className="py-3 px-3 text-right">
                                            <div className="font-bold text-slate-900 dark:text-white">
                                                {formatIDR(item.moving_average_cost)}
                                            </div>
                                            <div className="text-[10px] text-slate-500">
                                                Val: {formatIDR(item.total_valuation)}
                                            </div>
                                        </td>
                                        <td className="py-3 px-3">{statusBadge(item.stock_status)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal Tambah Master Barang */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden shadow-xl">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Tambah Master Barang Baru</h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={submitItem} className="p-4 space-y-3 text-xs max-h-[80vh] overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                    <label className="block font-semibold mb-1">Kode Item *</label>
                                    <input
                                        type="text"
                                        value={form.data.item_code}
                                        onChange={(e) => form.setData('item_code', e.target.value)}
                                        placeholder="ITM-SPR-005"
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold mb-1">Part Number</label>
                                    <input
                                        type="text"
                                        value={form.data.part_number}
                                        onChange={(e) => form.setData('part_number', e.target.value)}
                                        placeholder="LF9009-OEM"
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold mb-1">Barcode (Opsional)</label>
                                    <input
                                        type="text"
                                        value={form.data.barcode}
                                        onChange={(e) => form.setData('barcode', e.target.value)}
                                        placeholder="899000..."
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold mb-1">Nama Barang *</label>
                                    <input
                                        type="text"
                                        value={form.data.item_name}
                                        onChange={(e) => form.setData('item_name', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold mb-1">Kategori *</label>
                                    <select
                                        value={form.data.category_id}
                                        onChange={(e) => form.setData('category_id', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                        required
                                    >
                                        {(master.categories || []).map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                    <label className="block font-semibold mb-1">Brand / Merek</label>
                                    <input
                                        type="text"
                                        value={form.data.brand}
                                        onChange={(e) => form.setData('brand', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold mb-1">Satuan (UoM) *</label>
                                    <input
                                        type="text"
                                        value={form.data.unit_of_measurement}
                                        onChange={(e) => form.setData('unit_of_measurement', e.target.value)}
                                        placeholder="PCS / SET / LTR / DRUM"
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold mb-1">Harga Standar Awal (IDR)</label>
                                    <input
                                        type="number"
                                        value={form.data.standard_cost}
                                        onChange={(e) => form.setData('standard_cost', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                    <label className="block font-semibold mb-1">Minimum Stock *</label>
                                    <input
                                        type="number"
                                        value={form.data.minimum_stock}
                                        onChange={(e) => form.setData('minimum_stock', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold mb-1">Reorder Point (ROP) *</label>
                                    <input
                                        type="number"
                                        value={form.data.reorder_point}
                                        onChange={(e) => form.setData('reorder_point', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold mb-1">Maximum Stock</label>
                                    <input
                                        type="number"
                                        value={form.data.maximum_stock}
                                        onChange={(e) => form.setData('maximum_stock', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-semibold mb-1">Spesifikasi Teknis</label>
                                <textarea
                                    rows={2}
                                    value={form.data.specification}
                                    onChange={(e) => form.setData('specification', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700"
                                >
                                    Simpan Master Barang
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
