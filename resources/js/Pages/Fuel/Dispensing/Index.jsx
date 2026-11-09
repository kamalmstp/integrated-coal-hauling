import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import DashboardLayout from '@/components/templates/DashboardLayout';

export default function FuelDispensingIndex({ transactions, metrics, filters, master }) {
    const [showDispenseModal, setShowDispenseModal] = useState(false);

    const form = useForm({
        site_id: master?.sites?.[0]?.id || '',
        shift_id: master?.shifts?.[0]?.id || '',
        source_tank_id: master?.tanks?.[0]?.id || '',
        unit_id: master?.units?.[0]?.id || '',
        driver_id: master?.drivers?.[0]?.id || '',
        fuelman_id: master?.employees?.[0]?.id || '',
        dumping_ticket_id: '',
        reference_ticket_number: '',
        transaction_date: new Date().toISOString().slice(0, 10),
        transaction_time: new Date().toTimeString().slice(0, 8),
        current_hm: '',
        current_km: '',
        liters: 220,
        flowmeter_start: '',
        flowmeter_end: '',
        remarks: 'Pengisian solar operasional unit hauling',
    });

    const formatNumber = (val, digits = 2) =>
        Number(val || 0).toLocaleString('id-ID', { minimumFractionDigits: digits, maximumFractionDigits: digits });

    const formatIDR = (val) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(val || 0));

    const handleSelectUnit = (unitId) => {
        const u = (master?.units || []).find((x) => String(x.id) === String(unitId));
        form.setData({
            ...form.data,
            unit_id: unitId,
            site_id: u?.site_id || form.data.site_id,
            current_hm: u ? Number(u.last_hm) + 5 : '',
            current_km: u ? Number(u.last_km) + 64 : '',
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        form.post('/fuel/dispensing', {
            onSuccess: () => setShowDispenseModal(false),
        });
    };

    return (
        <DashboardLayout title="Fuel Dispensing per Unit & Digital Fuel Ticket">
            <Head title="Fuel Dispensing - TAP Fuel Management" />

            <div className="space-y-6">
                {/* Navigation & Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                        <Link href="/fuel/dashboard" className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            Dashboard BBM
                        </Link>
                        <Link href="/fuel/inventory" className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            1. Fuel Inventory & Tangki
                        </Link>
                        <Link href="/fuel/soundings" className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            2. Daily Sounding & Rekonsiliasi
                        </Link>
                        <Link href="/fuel/dispensing" className="px-3.5 py-2 rounded-xl bg-amber-600 text-white">
                            3. Fuel Dispensing & Digital Ticket
                        </Link>
                        <Link href="/fuel/analytics" className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            4. Analisis Konsumsi & Rasio BBM
                        </Link>
                    </div>

                    <button
                        type="button"
                        onClick={() => setShowDispenseModal(true)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-sm"
                    >
                        + Input Pengisian Solar Unit (Digital Ticket)
                    </button>
                </div>

                {/* KPI Summary */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <div className="text-[10px] font-black uppercase text-slate-400">Total Transaksi Dispensing</div>
                        <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{metrics?.total_transactions || 0}</div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <div className="text-[10px] font-black uppercase text-amber-500">Total Solar Dikeluarkan</div>
                        <div className="text-xl font-black text-amber-600 mt-1">{formatNumber(metrics?.total_liters_dispensed, 2)} L</div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <div className="text-[10px] font-black uppercase text-indigo-500">Rata-Rata Pengisian / Unit</div>
                        <div className="text-xl font-black text-indigo-600 mt-1">{formatNumber(metrics?.average_liters_per_fill, 1)} L</div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <div className="text-[10px] font-black uppercase text-emerald-500">Total Nilai Solar Terpakai</div>
                        <div className="text-lg font-black text-slate-900 dark:text-white mt-1">{formatIDR(metrics?.total_fuel_cost)}</div>
                    </div>
                </div>

                {/* Dispensing Transactions Table */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead className="bg-slate-50 dark:bg-slate-800 text-[10px] uppercase text-slate-500">
                                <tr>
                                    <th className="py-3 px-4 text-left">No. Transaksi & Digital Ticket</th>
                                    <th className="py-3 px-4 text-left">Waktu & Site</th>
                                    <th className="py-3 px-4 text-left">Unit & Driver</th>
                                    <th className="py-3 px-4 text-left">Sumber Tangki & Fuelman</th>
                                    <th className="py-3 px-4 text-right">HM / KM Unit</th>
                                    <th className="py-3 px-4 text-right">Volume (Liter)</th>
                                    <th className="py-3 px-4 text-left">Ref. Tiket Produksi</th>
                                    <th className="py-3 px-4 text-center">Tiket Digital</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {(transactions?.data || []).map((tx) => (
                                    <tr key={tx.id}>
                                        <td className="py-3 px-4">
                                            <div className="font-black text-slate-900 dark:text-white">{tx.transaction_number}</div>
                                            <div className="text-[11px] font-bold text-indigo-600">{tx.digital_ticket_code}</div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="font-semibold">{tx.transaction_date?.slice(0, 10)} • {tx.transaction_time}</div>
                                            <div className="text-[10px] text-slate-500">{tx.site?.name} ({tx.shift?.name || 'Shift 1'})</div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="font-black text-slate-900 dark:text-white">{tx.unit?.unit_code}</div>
                                            <div className="text-[11px] text-slate-500">{tx.driver?.employee?.name || '-'}</div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="font-bold text-slate-800 dark:text-slate-200">{tx.source_tank?.tank_number}</div>
                                            <div className="text-[10px] text-slate-500">Fuelman: {tx.fuelman?.name || '-'}</div>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="font-semibold">HM: {tx.current_hm} (+{tx.hm_delta})</div>
                                            <div className="text-[10px] text-slate-500">KM: {tx.current_km} (+{tx.km_delta})</div>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="font-black text-amber-600 text-sm">{formatNumber(tx.liters)} L</div>
                                            <div className="text-[10px] text-slate-500">{formatIDR(tx.total_cost)}</div>
                                        </td>
                                        <td className="py-3 px-4">
                                            {tx.dumping_ticket ? (
                                                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                                                    {tx.dumping_ticket.ticket_number} ({tx.dumping_ticket.tonnage} T)
                                                </span>
                                            ) : (
                                                <span className="text-slate-400">{tx.reference_ticket_number || '-'}</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <Link
                                                href={`/fuel/dispensing/${tx.id}/ticket`}
                                                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold"
                                            >
                                                Cetak Tiket
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal Dispense Fuel */}
            {showDispenseModal && (
                <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <form
                        onSubmit={handleSubmit}
                        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full p-6 space-y-4 shadow-xl text-xs"
                    >
                        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
                            <div>
                                <h3 className="text-sm font-black">Input Pengisian Solar per Unit (Digital Fuel Ticket)</h3>
                                <p className="text-[11px] text-slate-500">
                                    Validasi ketat: Pengisian tidak dapat melebihi stok tangki tersedia.
                                </p>
                            </div>
                            <button type="button" onClick={() => setShowDispenseModal(false)}>✕</button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="font-bold">Unit Dump Truck / Support</label>
                                <select
                                    required
                                    value={form.data.unit_id}
                                    onChange={(e) => handleSelectUnit(e.target.value)}
                                    className="w-full mt-1 rounded-xl border-slate-300 dark:bg-slate-800 text-xs"
                                >
                                    {(master?.units || []).map((u) => (
                                        <option key={u.id} value={u.id}>
                                            {u.unit_code} - {u.brand} {u.model} (HM: {u.last_hm})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="font-bold">Sumber Tangki / Bowser</label>
                                <select
                                    required
                                    value={form.data.source_tank_id}
                                    onChange={(e) => form.setData('source_tank_id', e.target.value)}
                                    className="w-full mt-1 rounded-xl border-slate-300 dark:bg-slate-800 text-xs"
                                >
                                    {(master?.tanks || []).map((t) => (
                                        <option key={t.id} value={t.id}>
                                            {t.tank_number} ({formatNumber(t.current_stock_liters)} L)
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="font-bold">Driver</label>
                                <select
                                    value={form.data.driver_id}
                                    onChange={(e) => form.setData('driver_id', e.target.value)}
                                    className="w-full mt-1 rounded-xl border-slate-300 dark:bg-slate-800 text-xs"
                                >
                                    <option value="">-- Pilih Driver --</option>
                                    {(master?.drivers || []).map((d) => (
                                        <option key={d.id} value={d.id}>{d.employee?.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="font-bold">Petugas Fuelman</label>
                                <select
                                    value={form.data.fuelman_id}
                                    onChange={(e) => form.setData('fuelman_id', e.target.value)}
                                    className="w-full mt-1 rounded-xl border-slate-300 dark:bg-slate-800 text-xs"
                                >
                                    <option value="">-- Pilih Fuelman --</option>
                                    {(master?.employees || []).map((emp) => (
                                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="font-bold">HM Saat Pengisian</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={form.data.current_hm}
                                    onChange={(e) => form.setData('current_hm', e.target.value)}
                                    className="w-full mt-1 rounded-xl border-slate-300 dark:bg-slate-800 text-xs"
                                />
                            </div>
                            <div>
                                <label className="font-bold">KM Saat Pengisian</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={form.data.current_km}
                                    onChange={(e) => form.setData('current_km', e.target.value)}
                                    className="w-full mt-1 rounded-xl border-slate-300 dark:bg-slate-800 text-xs"
                                />
                            </div>
                            <div>
                                <label className="font-bold">Volume Solar Diisi (Liter)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={form.data.liters}
                                    onChange={(e) => form.setData('liters', e.target.value)}
                                    className="w-full mt-1 rounded-xl border-slate-300 dark:bg-slate-800 text-xs font-black text-amber-600"
                                />
                            </div>
                            <div>
                                <label className="font-bold">Referensi Tiket Produksi (Opsional)</label>
                                <select
                                    value={form.data.dumping_ticket_id}
                                    onChange={(e) => form.setData('dumping_ticket_id', e.target.value)}
                                    className="w-full mt-1 rounded-xl border-slate-300 dark:bg-slate-800 text-xs"
                                >
                                    <option value="">-- Tanpa Tiket Referensi --</option>
                                    {(master?.tickets || []).map((tk) => (
                                        <option key={tk.id} value={tk.id}>
                                            {tk.ticket_number} ({tk.tonnage} Ton)
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                            <button type="button" onClick={() => setShowDispenseModal(false)} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold">
                                Batal
                            </button>
                            <button type="submit" disabled={form.processing} className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-black">
                                Terbitkan Digital Fuel Ticket & Potong Stok
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </DashboardLayout>
    );
}
