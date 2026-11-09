import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/components/templates/DashboardLayout';

export default function FuelAnalyticsIndex({
    summary,
    consumptionPerUnit,
    consumptionPerShift,
    consumptionPerMonth,
    siteParameters,
    filters,
    master,
}) {
    const formatNumber = (val, digits = 2) =>
        Number(val || 0).toLocaleString('id-ID', { minimumFractionDigits: digits, maximumFractionDigits: digits });

    const formatIDR = (val) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(val || 0));

    const applyFilter = (key, val) => {
        router.get('/fuel/analytics', { ...filters, [key]: val }, { preserveState: true, replace: true });
    };

    return (
        <DashboardLayout title="Fuel Consumption Analysis & Production Ratio Integration">
            <Head title="Fuel Consumption Analysis - TAP Fuel Management" />

            <div className="space-y-6">
                {/* Navigation & Filter Bar */}
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
                        <Link href="/fuel/dispensing" className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            3. Fuel Dispensing & Digital Ticket
                        </Link>
                        <Link href="/fuel/analytics" className="px-3.5 py-2 rounded-xl bg-amber-600 text-white">
                            4. Analisis Konsumsi & Rasio BBM
                        </Link>
                    </div>

                    <div className="flex flex-wrap gap-2">
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
                            value={filters?.unit_id || ''}
                            onChange={(e) => applyFilter('unit_id', e.target.value)}
                            className="rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-xs"
                        >
                            <option value="">Semua Unit Hauling</option>
                            {(master?.units || []).map((u) => (
                                <option key={u.id} value={u.id}>{u.unit_code}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Formula Governance Notice */}
                <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 text-xs flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <div className="font-black text-amber-900 dark:text-amber-200 uppercase">
                            Pemisahan Konsumsi Aktual vs Konsumsi Estimasi (Standar TAP)
                        </div>
                        <div className="text-amber-800 dark:text-amber-300 mt-0.5">
                            • <strong>Actual Fuel Consumption</strong> dihitung murni dari transaksi pengisian dispenser solar (Bukan dari tonase dumping).
                            <br />• <strong>Estimated Fuel Consumption</strong> dihitung dari Tiket Produksi Verified: <code className="font-black">Tonase × Jarak ({summary?.default_haul_distance_km} KM) × {summary?.estimation_factor}</code>
                        </div>
                    </div>
                </div>

                {/* Top Analytical KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <div className="text-[10px] font-black uppercase text-amber-600">Actual Fuel Consumption</div>
                        <div className="text-xl font-black text-amber-600 mt-1">{formatNumber(summary?.actual_fuel_liters)} L</div>
                        <div className="text-[10px] text-slate-400">Dari Fuel Dispensing</div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <div className="text-[10px] font-black uppercase text-indigo-600">Estimated Fuel Consumption</div>
                        <div className="text-xl font-black text-indigo-600 mt-1">{formatNumber(summary?.estimated_fuel_liters)} L</div>
                        <div className="text-[10px] text-slate-400">Tonase × Jarak × {summary?.estimation_factor}</div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <div className="text-[10px] font-black uppercase text-emerald-600">Liter per Ton (Fuel Ratio)</div>
                        <div className="text-xl font-black text-emerald-600 mt-1">{formatNumber(summary?.liter_per_ton, 4)} L/Ton</div>
                        <div className="text-[10px] text-slate-400">Produksi: {formatNumber(summary?.verified_tonnage)} Ton</div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <div className="text-[10px] font-black uppercase text-cyan-600">Liter per HM & KM</div>
                        <div className="text-lg font-black text-slate-900 dark:text-white mt-1">
                            {formatNumber(summary?.liter_per_hm, 2)} L/HM
                        </div>
                        <div className="text-[10px] text-slate-500">{formatNumber(summary?.liter_per_km, 2)} L/KM</div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <div className="text-[10px] font-black uppercase text-purple-600">Biaya BBM / Ton</div>
                        <div className="text-lg font-black text-slate-900 dark:text-white mt-1">{formatIDR(summary?.fuel_cost_per_ton)}</div>
                        <div className="text-[10px] text-slate-500">Total: {formatIDR(summary?.total_fuel_cost)}</div>
                    </div>
                </div>

                {/* Consumption per Unit */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white mb-3">
                        1. Analisis Konsumsi BBM per Unit (Actual vs Estimated, L/Ton, L/HM, L/KM)
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead className="bg-slate-50 dark:bg-slate-800 text-[10px] uppercase text-slate-500">
                                <tr>
                                    <th className="p-2.5 text-left">Unit</th>
                                    <th className="p-2.5 text-right">Tonase Verified</th>
                                    <th className="p-2.5 text-right">Actual Fuel (L)</th>
                                    <th className="p-2.5 text-right">Estimated Fuel (L)</th>
                                    <th className="p-2.5 text-right">Selisih (Act - Est)</th>
                                    <th className="p-2.5 text-right">HM Operasi</th>
                                    <th className="p-2.5 text-right">Jarak Tempuh (KM)</th>
                                    <th className="p-2.5 text-right">Liter / Ton</th>
                                    <th className="p-2.5 text-right">Liter / HM</th>
                                    <th className="p-2.5 text-right">Liter / KM</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {(consumptionPerUnit || []).map((u) => (
                                    <tr key={u.unit_id}>
                                        <td className="p-2.5 font-black text-slate-900 dark:text-white">
                                            {u.unit_code} <span className="text-[10px] font-normal text-slate-500">{u.brand_model}</span>
                                        </td>
                                        <td className="p-2.5 text-right font-semibold">{formatNumber(u.verified_tonnage)} T</td>
                                        <td className="p-2.5 text-right font-black text-amber-600">{formatNumber(u.actual_fuel_liters)} L</td>
                                        <td className="p-2.5 text-right font-semibold text-indigo-600">{formatNumber(u.estimated_fuel_liters)} L</td>
                                        <td className="p-2.5 text-right font-bold">
                                            <span className={u.variance_liters > 0 ? 'text-rose-600' : 'text-emerald-600'}>
                                                {u.variance_liters > 0 ? '+' : ''}{formatNumber(u.variance_liters)} L
                                            </span>
                                        </td>
                                        <td className="p-2.5 text-right">{formatNumber(u.operating_hm)} HM</td>
                                        <td className="p-2.5 text-right">{formatNumber(u.distance_km)} KM</td>
                                        <td className="p-2.5 text-right font-bold">{formatNumber(u.liter_per_ton, 4)}</td>
                                        <td className="p-2.5 text-right">{formatNumber(u.liter_per_hm, 2)}</td>
                                        <td className="p-2.5 text-right">{formatNumber(u.liter_per_km, 2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Consumption per Shift & per Month */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                        <h3 className="text-sm font-black text-slate-900 dark:text-white mb-3">
                            2. Konsumsi BBM per Shift Operasional
                        </h3>
                        <table className="w-full text-xs">
                            <thead className="bg-slate-50 dark:bg-slate-800 text-[10px] uppercase text-slate-500">
                                <tr>
                                    <th className="p-2.5 text-left">Shift</th>
                                    <th className="p-2.5 text-right">Tonase</th>
                                    <th className="p-2.5 text-right">Actual (L)</th>
                                    <th className="p-2.5 text-right">Estimated (L)</th>
                                    <th className="p-2.5 text-right">L / Ton</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {(consumptionPerShift || []).map((sh) => (
                                    <tr key={sh.shift_id}>
                                        <td className="p-2.5 font-bold">{sh.shift_name}</td>
                                        <td className="p-2.5 text-right">{formatNumber(sh.verified_tonnage)} T</td>
                                        <td className="p-2.5 text-right font-black text-amber-600">{formatNumber(sh.actual_fuel_liters)} L</td>
                                        <td className="p-2.5 text-right text-indigo-600">{formatNumber(sh.estimated_fuel_liters)} L</td>
                                        <td className="p-2.5 text-right font-bold">{formatNumber(sh.liter_per_ton, 4)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                        <h3 className="text-sm font-black text-slate-900 dark:text-white mb-3">
                            3. Konsumsi BBM per Bulan (Monthly Recap)
                        </h3>
                        <table className="w-full text-xs">
                            <thead className="bg-slate-50 dark:bg-slate-800 text-[10px] uppercase text-slate-500">
                                <tr>
                                    <th className="p-2.5 text-left">Periode Bulan</th>
                                    <th className="p-2.5 text-right">Tonase</th>
                                    <th className="p-2.5 text-right">Actual (L)</th>
                                    <th className="p-2.5 text-right">Estimated (L)</th>
                                    <th className="p-2.5 text-right">Biaya Solar</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {(consumptionPerMonth || []).map((m) => (
                                    <tr key={m.month}>
                                        <td className="p-2.5 font-black">{m.month}</td>
                                        <td className="p-2.5 text-right">{formatNumber(m.verified_tonnage)} T</td>
                                        <td className="p-2.5 text-right font-black text-amber-600">{formatNumber(m.actual_fuel_liters)} L</td>
                                        <td className="p-2.5 text-right text-indigo-600">{formatNumber(m.estimated_fuel_liters)} L</td>
                                        <td className="p-2.5 text-right font-bold">{formatIDR(m.total_fuel_cost)}</td>
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
