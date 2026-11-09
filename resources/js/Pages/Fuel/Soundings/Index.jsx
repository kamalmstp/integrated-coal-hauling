import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import DashboardLayout from '@/components/templates/DashboardLayout';

export default function FuelSoundingsIndex({ tanks, soundings, reconciliations, adjustments, filters, master }) {
    const [activeModal, setActiveModal] = useState(null); // 'sounding' | 'reconciliation' | 'adjustment'

    const soundingForm = useForm({
        site_id: tanks?.[0]?.site_id || master?.sites?.[0]?.id || '',
        fuel_tank_id: tanks?.[0]?.id || '',
        sounding_date: new Date().toISOString().slice(0, 10),
        sounding_time: '18:00:00',
        measurement_cm: 150.0,
        water_level_cm: 0,
        temperature_celsius: 30.0,
        remarks: 'Sounding fisik harian tongkat ukur terkalibrasi',
    });

    const reconForm = useForm({
        site_id: tanks?.[0]?.site_id || master?.sites?.[0]?.id || '',
        fuel_tank_id: tanks?.[0]?.id || '',
        reconciliation_date: new Date().toISOString().slice(0, 10),
        investigation_findings: 'Pemeriksaan meteran dispenser dan pipa tangki selesai.',
        corrective_action: 'Kalibrasi rutin sesuai toleransi.',
    });

    const adjustForm = useForm({
        site_id: tanks?.[0]?.site_id || master?.sites?.[0]?.id || '',
        fuel_tank_id: tanks?.[0]?.id || '',
        adjustment_date: new Date().toISOString().slice(0, 10),
        adjustment_type: 'sounding_correction',
        adjustment_liters: 0,
        reason: 'Penyesuaian resmi hasil rekonsiliasi sounding fisik tangki.',
        investigation_notes: 'Disetujui Kepala Teknik / Fuel Supervisor',
    });

    const formatNumber = (val, digits = 2) =>
        Number(val || 0).toLocaleString('id-ID', { minimumFractionDigits: digits, maximumFractionDigits: digits });

    const selectedTank = (tanks || []).find((t) => String(t.id) === String(soundingForm.data.fuel_tank_id));

    // Client-side preview of calibrated volume from strapping chart (strictly matching backend interpolation)
    const previewCalibratedVolume = () => {
        if (!selectedTank || !selectedTank.calibrations?.length) return 0;
        const h = Number(soundingForm.data.measurement_cm || 0);
        const cals = selectedTank.calibrations;
        const lower = [...cals].filter((c) => Number(c.height_cm) <= h).pop() || cals[0];
        const upper = cals.find((c) => Number(c.height_cm) >= h) || cals[cals.length - 1];
        const h1 = Number(lower.height_cm);
        const v1 = Number(lower.volume_liters);
        const h2 = Number(upper.height_cm);
        const v2 = Number(upper.volume_liters);
        if (Math.abs(h2 - h1) < 0.001) return v1;
        return v1 + ((h - h1) / (h2 - h1)) * (v2 - v1);
    };

    return (
        <DashboardLayout title="Daily Tank Sounding, Calibration & Fuel Reconciliation">
            <Head title="Daily Tank Sounding & Reconciliation - TAP Fuel" />

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
                        <Link href="/fuel/soundings" className="px-3.5 py-2 rounded-xl bg-amber-600 text-white">
                            2. Daily Sounding & Rekonsiliasi
                        </Link>
                        <Link href="/fuel/dispensing" className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            3. Fuel Dispensing & Digital Ticket
                        </Link>
                        <Link href="/fuel/analytics" className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            4. Analisis Konsumsi & Rasio BBM
                        </Link>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => setActiveModal('sounding')}
                            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black"
                        >
                            + Input Daily Tank Sounding
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveModal('reconciliation')}
                            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black"
                        >
                            ✓ Jalankan Rekonsiliasi BBM
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveModal('adjustment')}
                            className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black"
                        >
                            ⚙ Prosedur Adjustment Resmi
                        </button>
                    </div>
                </div>

                {/* Daily Tank Sounding Records */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                    <div className="mb-3">
                        <h3 className="text-sm font-black text-slate-900 dark:text-white">
                            Pencatatan Daily Tank Sounding (Konversi Tabel Kalibrasi Tervalidasi)
                        </h3>
                        <p className="text-xs text-slate-500">
                            Tinggi sounding (cm) dikonversi menggunakan Strapping Table tangki ke Volume Estimasi (Liter) dan dibandingkan terhadap Stok Sistem.
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead className="bg-slate-50 dark:bg-slate-800 text-[10px] uppercase text-slate-500">
                                <tr>
                                    <th className="p-2.5 text-left">No. Sounding & Waktu</th>
                                    <th className="p-2.5 text-left">Tangki & Site</th>
                                    <th className="p-2.5 text-right">Tinggi Ukur (cm)</th>
                                    <th className="p-2.5 text-left">Metode & Tabel Konversi</th>
                                    <th className="p-2.5 text-right">Volume Fisik (Liter)</th>
                                    <th className="p-2.5 text-right">Stok Sistem (Liter)</th>
                                    <th className="p-2.5 text-right">Selisih (Variance)</th>
                                    <th className="p-2.5 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {(soundings?.data || []).map((snd) => (
                                    <tr key={snd.id}>
                                        <td className="p-2.5">
                                            <div className="font-black text-slate-900 dark:text-white">{snd.sounding_number}</div>
                                            <div className="text-[10px] text-slate-500">
                                                {snd.sounding_date?.slice(0, 10)} • {snd.sounding_time}
                                            </div>
                                        </td>
                                        <td className="p-2.5">
                                            <div className="font-bold">{snd.tank?.tank_number}</div>
                                            <div className="text-[10px] text-slate-500">{snd.site?.name}</div>
                                        </td>
                                        <td className="p-2.5 text-right font-black text-indigo-600">{snd.measurement_cm} cm</td>
                                        <td className="p-2.5 text-[11px] text-slate-600 dark:text-slate-400">
                                            <span className="font-semibold uppercase">{snd.calibration_method?.replace('_', ' ')}</span>
                                            {snd.conversion_snapshot && (
                                                <div className="text-[10px] text-slate-400">
                                                    Range: {snd.conversion_snapshot.lower_point_cm}cm ({snd.conversion_snapshot.lower_point_liters}L) – {snd.conversion_snapshot.upper_point_cm}cm ({snd.conversion_snapshot.upper_point_liters}L)
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-2.5 text-right font-black text-emerald-600">{formatNumber(snd.estimated_volume_liters)} L</td>
                                        <td className="p-2.5 text-right font-semibold">{formatNumber(snd.system_stock_liters)} L</td>
                                        <td className="p-2.5 text-right font-bold">
                                            <span className={Number(snd.variance_liters) < 0 ? 'text-rose-600' : 'text-emerald-600'}>
                                                {Number(snd.variance_liters) > 0 ? '+' : ''}{formatNumber(snd.variance_liters)} L ({snd.variance_percent}%)
                                            </span>
                                        </td>
                                        <td className="p-2.5 text-center">
                                            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-slate-100 dark:bg-slate-800">
                                                {snd.reconciliation_status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Fuel Reconciliation Table */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white mb-3">
                        Rekonsiliasi BBM (Opening + Received - Issued ± Transfer ± Adjustment vs Physical Sounding)
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead className="bg-slate-50 dark:bg-slate-800 text-[10px] uppercase text-slate-500">
                                <tr>
                                    <th className="p-2.5 text-left">No. Rekon & Tgl</th>
                                    <th className="p-2.5 text-left">Tangki</th>
                                    <th className="p-2.5 text-right">Opening</th>
                                    <th className="p-2.5 text-right">Received</th>
                                    <th className="p-2.5 text-right">Issued</th>
                                    <th className="p-2.5 text-right">Transfer Net</th>
                                    <th className="p-2.5 text-right">Adjustment</th>
                                    <th className="p-2.5 text-right">System Closing</th>
                                    <th className="p-2.5 text-right">Physical Sounding</th>
                                    <th className="p-2.5 text-right">Selisih</th>
                                    <th className="p-2.5 text-left">Investigasi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {(reconciliations || []).map((rec) => (
                                    <tr key={rec.id}>
                                        <td className="p-2.5">
                                            <div className="font-black">{rec.reconciliation_number}</div>
                                            <div className="text-[10px] text-slate-500">{rec.reconciliation_date?.slice(0, 10)}</div>
                                        </td>
                                        <td className="p-2.5 font-bold">{rec.tank?.tank_number}</td>
                                        <td className="p-2.5 text-right">{formatNumber(rec.opening_stock_liters, 0)} L</td>
                                        <td className="p-2.5 text-right text-emerald-600">+{formatNumber(rec.fuel_received_liters, 0)} L</td>
                                        <td className="p-2.5 text-right text-amber-600">-{formatNumber(rec.fuel_issued_liters, 0)} L</td>
                                        <td className="p-2.5 text-right">
                                            {formatNumber(Number(rec.transfer_in_liters) - Number(rec.transfer_out_liters), 0)} L
                                        </td>
                                        <td className="p-2.5 text-right">{formatNumber(rec.adjustment_liters, 0)} L</td>
                                        <td className="p-2.5 text-right font-black">{formatNumber(rec.system_closing_stock_liters)} L</td>
                                        <td className="p-2.5 text-right font-black text-indigo-600">{formatNumber(rec.physical_sounding_liters)} L</td>
                                        <td className="p-2.5 text-right font-bold text-rose-600">{formatNumber(rec.variance_liters)} L</td>
                                        <td className="p-2.5 text-[11px] text-slate-500 max-w-xs truncate">{rec.investigation_findings}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal Input Daily Sounding */}
            {activeModal === 'sounding' && (
                <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            soundingForm.post('/fuel/soundings', { onSuccess: () => setActiveModal(null) });
                        }}
                        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 space-y-4 shadow-xl text-xs"
                    >
                        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
                            <h3 className="text-sm font-black">Input Daily Tank Sounding (Tinggi Tongkat Ukur cm)</h3>
                            <button type="button" onClick={() => setActiveModal(null)}>✕</button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="col-span-2">
                                <label className="font-bold">Pilih Tangki Penyimpanan</label>
                                <select
                                    value={soundingForm.data.fuel_tank_id}
                                    onChange={(e) => {
                                        const t = (tanks || []).find((x) => String(x.id) === String(e.target.value));
                                        soundingForm.setData({
                                            ...soundingForm.data,
                                            fuel_tank_id: e.target.value,
                                            site_id: t?.site_id || soundingForm.data.site_id,
                                        });
                                    }}
                                    className="w-full mt-1 rounded-xl border-slate-300 dark:bg-slate-800 text-xs"
                                >
                                    {(tanks || []).map((t) => (
                                        <option key={t.id} value={t.id}>
                                            {t.tank_number} - {t.tank_name} (Max {t.max_height_cm} cm)
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="font-bold">Tinggi Sounding (cm)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    required
                                    value={soundingForm.data.measurement_cm}
                                    onChange={(e) => soundingForm.setData('measurement_cm', e.target.value)}
                                    className="w-full mt-1 rounded-xl border-slate-300 dark:bg-slate-800 text-xs font-black text-indigo-600"
                                />
                            </div>
                            <div>
                                <label className="font-bold">Estimasi Volume Kalibrasi (L)</label>
                                <div className="mt-1 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 font-black text-emerald-700">
                                    {formatNumber(previewCalibratedVolume())} Liter
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                            <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold">
                                Batal
                            </button>
                            <button type="submit" className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-black">
                                Simpan Sounding & Konversi
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Modal Reconciliation */}
            {activeModal === 'reconciliation' && (
                <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            reconForm.post('/fuel/reconciliations', { onSuccess: () => setActiveModal(null) });
                        }}
                        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 space-y-4 shadow-xl text-xs"
                    >
                        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
                            <h3 className="text-sm font-black">Jalankan Rekonsiliasi BBM Harian</h3>
                            <button type="button" onClick={() => setActiveModal(null)}>✕</button>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="font-bold">Pilih Tangki</label>
                                <select
                                    value={reconForm.data.fuel_tank_id}
                                    onChange={(e) => reconForm.setData('fuel_tank_id', e.target.value)}
                                    className="w-full mt-1 rounded-xl border-slate-300 dark:bg-slate-800 text-xs"
                                >
                                    {(tanks || []).map((t) => (
                                        <option key={t.id} value={t.id}>{t.tank_number} - {t.tank_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="font-bold">Temuan Investigasi</label>
                                <input
                                    type="text"
                                    value={reconForm.data.investigation_findings}
                                    onChange={(e) => reconForm.setData('investigation_findings', e.target.value)}
                                    className="w-full mt-1 rounded-xl border-slate-300 dark:bg-slate-800 text-xs"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                            <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold">
                                Batal
                            </button>
                            <button type="submit" className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-black">
                                Simpan Rekonsiliasi
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Modal Official Adjustment */}
            {activeModal === 'adjustment' && (
                <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            adjustForm.post('/fuel/adjustments', { onSuccess: () => setActiveModal(null) });
                        }}
                        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 space-y-4 shadow-xl text-xs"
                    >
                        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
                            <h3 className="text-sm font-black">Prosedur Adjustment Stok Solar Resmi</h3>
                            <button type="button" onClick={() => setActiveModal(null)}>✕</button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="col-span-2">
                                <label className="font-bold">Tangki</label>
                                <select
                                    value={adjustForm.data.fuel_tank_id}
                                    onChange={(e) => adjustForm.setData('fuel_tank_id', e.target.value)}
                                    className="w-full mt-1 rounded-xl border-slate-300 dark:bg-slate-800 text-xs"
                                >
                                    {(tanks || []).map((t) => (
                                        <option key={t.id} value={t.id}>{t.tank_number} (Stok: {formatNumber(t.current_stock_liters)} L)</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="font-bold">Tipe Adjustment</label>
                                <select
                                    value={adjustForm.data.adjustment_type}
                                    onChange={(e) => adjustForm.setData('adjustment_type', e.target.value)}
                                    className="w-full mt-1 rounded-xl border-slate-300 dark:bg-slate-800 text-xs"
                                >
                                    <option value="sounding_correction">Sounding Correction</option>
                                    <option value="gain">Stock Gain (+)</option>
                                    <option value="loss">Stock Loss / Shrinkage (-)</option>
                                    <option value="evaporation">Evaporation</option>
                                </select>
                            </div>
                            <div>
                                <label className="font-bold">Volume Adjustment (+/- Liter)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={adjustForm.data.adjustment_liters}
                                    onChange={(e) => adjustForm.setData('adjustment_liters', e.target.value)}
                                    className="w-full mt-1 rounded-xl border-slate-300 dark:bg-slate-800 text-xs font-black"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="font-bold">Alasan Resmi & Berita Acara</label>
                                <input
                                    type="text"
                                    required
                                    value={adjustForm.data.reason}
                                    onChange={(e) => adjustForm.setData('reason', e.target.value)}
                                    className="w-full mt-1 rounded-xl border-slate-300 dark:bg-slate-800 text-xs"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                            <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold">
                                Batal
                            </button>
                            <button type="submit" className="px-4 py-2 rounded-xl bg-amber-600 text-white font-black">
                                Setujui & Posting Adjustment
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </DashboardLayout>
    );
}
