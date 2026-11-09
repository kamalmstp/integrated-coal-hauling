import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '../../../components/templates/DashboardLayout';
import AnalyticsFilterBar from '../Partials/AnalyticsFilterBar';
import {
    Building2,
    Truck,
    CheckCircle2,
    AlertOctagon,
    TrendingUp,
    Target,
    Layers,
    Fuel,
    ArrowUpRight,
    Eye,
    Clock,
} from 'lucide-react';

const fmtNum = (v, dec = 2) =>
    new Intl.NumberFormat('id-ID', { maximumFractionDigits: dec }).format(Number(v || 0));

const fmtIDR = (v) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(v || 0));

export default function ExecutiveDashboardIndex({
    report = {},
    filters = {},
    master = {},
    exportJobs = [],
}) {
    const [drillDownTab, setDrillDownTab] = useState('production_tickets');

    const kpis = report.kpis || {};
    const periodComp = report.period_comparison || {};
    const siteComp = report.site_comparison || [];
    const dailyTrend = report.daily_trend || [];
    const drillDown = report.drill_down || {};

    const maxTrendTon = Math.max(1, ...dailyTrend.map((d) => Number(d.tonnage || 0)));

    return (
        <DashboardLayout title="Executive Analytics & Reporting Center">
            <Head title="Executive Dashboard & Analytics - Phase 11" />

            <div className="space-y-6">
                {/* Banner */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded-md bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                            Phase 11 — Centralized Reporting & Management Analytics
                        </span>
                        <span className="px-2.5 py-0.5 text-[11px] font-semibold rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            100% Real Transaction Data • Zero Dummy Numbers
                        </span>
                    </div>
                    <h1 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                        TAP Executive Command & Operational Analytics Dashboard
                    </h1>
                    <p className="text-xs text-slate-500">
                        Periode Aktif: <strong>{filters.date_from}</strong> s/d <strong>{filters.date_to}</strong> ({filters.days_span} hari) — setiap angka dan grafik terhubung langsung ke transaksi sumber.
                    </p>
                </div>

                {/* Unified 7-Filter Bar + Export Controls */}
                <AnalyticsFilterBar
                    currentPath="/analytics/dashboard"
                    reportType="executive"
                    filters={filters}
                    master={master}
                />

                {/* 9 Required Executive KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-9 gap-3">
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                            <span>Total Site</span>
                            <Building2 className="w-4 h-4 text-indigo-500" />
                        </div>
                        <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
                            {kpis.total_sites || 0}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">Site Aktif</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                            <span>Total Unit</span>
                            <Truck className="w-4 h-4 text-blue-500" />
                        </div>
                        <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
                            {kpis.total_units || 0}
                        </p>
                        <Link href="/analytics/fleet" className="text-[10px] text-indigo-600 font-bold hover:underline mt-1 inline-block">
                            Lihat Fleet &rarr;
                        </Link>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                            <span>Available Unit</span>
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        </div>
                        <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
                            {kpis.available_units || 0}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">Ready for Operation</p>
                    </div>

                    <div
                        onClick={() => setDrillDownTab('breakdown_units_list')}
                        className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 cursor-pointer hover:border-rose-400 transition"
                    >
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                            <span>Breakdown Unit</span>
                            <AlertOctagon className="w-4 h-4 text-rose-500" />
                        </div>
                        <p className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-2">
                            {kpis.breakdown_units || 0}
                        </p>
                        <p className="text-[10px] text-rose-500 font-semibold mt-1">Klik Drill-Down &darr;</p>
                    </div>

                    <div
                        onClick={() => setDrillDownTab('production_tickets')}
                        className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 cursor-pointer hover:border-indigo-400 transition"
                    >
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                            <span>Prod. Today</span>
                            <TrendingUp className="w-4 h-4 text-indigo-500" />
                        </div>
                        <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-2">
                            {fmtNum(kpis.total_production_today)} <span className="text-xs font-normal">MT</span>
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">{kpis.ritase_today || 0} Ritase ({filters.date_to})</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                            <span>Monthly Prod.</span>
                            <TrendingUp className="w-4 h-4 text-emerald-500" />
                        </div>
                        <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
                            {fmtNum(kpis.monthly_production)} <span className="text-xs font-normal">MT</span>
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">Periode: {fmtNum(kpis.period_production_tonnage)} MT</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                            <span>Target vs Actual</span>
                            <Target className="w-4 h-4 text-amber-500" />
                        </div>
                        <p className="text-xl font-extrabold text-amber-600 dark:text-amber-400 mt-2">
                            {fmtNum(kpis.target_vs_actual_percent, 1)}%
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">Target: {fmtNum(kpis.target_tonnage)} MT</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                            <span>Total Ritase</span>
                            <Layers className="w-4 h-4 text-cyan-500" />
                        </div>
                        <p className="text-2xl font-extrabold text-cyan-600 dark:text-cyan-400 mt-2">
                            {fmtNum(kpis.total_ritase, 0)}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">Tiket Terverifikasi</p>
                    </div>

                    <div
                        onClick={() => setDrillDownTab('fuel_dispensing')}
                        className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 cursor-pointer hover:border-amber-400 transition"
                    >
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                            <span>Fuel Consump.</span>
                            <Fuel className="w-4 h-4 text-amber-500" />
                        </div>
                        <p className="text-xl font-extrabold text-amber-600 dark:text-amber-400 mt-2">
                            {fmtNum(kpis.fuel_consumption_liters, 0)} <span className="text-xs font-normal">L</span>
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">Rasio: {fmtNum(kpis.fuel_per_ton, 3)} L/Ton</p>
                    </div>
                </div>

                {/* Trend Chart & Period Comparison */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Daily Production & Fuel Trend Chart */}
                    <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                                    Trend Produksi Tonase & Konsumsi BBM Harian (Traceable Trend Chart)
                                </h2>
                                <p className="text-[11px] text-slate-400">
                                    Klik bar tanggal untuk menelusuri tiket produksi sumber.
                                </p>
                            </div>
                            <Link href="/analytics/production" className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1">
                                Buka Production Report <ArrowUpRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>

                        {dailyTrend.length === 0 ? (
                            <p className="text-xs text-slate-400 py-8 text-center">Belum ada transaksi pada rentang tanggal ini.</p>
                        ) : (
                            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-2">
                                {dailyTrend.map((d) => {
                                    const pct = Math.min(100, Math.round((Number(d.tonnage) / maxTrendTon) * 100));
                                    return (
                                        <div key={d.date} className="space-y-1">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                                                    {d.date}
                                                </span>
                                                <span className="text-slate-600 dark:text-slate-400">
                                                    <strong>{fmtNum(d.tonnage)} MT</strong> ({d.ritase} Rit) • Solar: <strong>{fmtNum(d.fuel_liters)} L</strong>
                                                </span>
                                            </div>
                                            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full"
                                                    style={{ width: `${Math.max(4, pct)}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Period Comparison Card */}
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-4">
                        <div>
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                                Period Comparison (Komparasi Periode)
                            </h2>
                            <p className="text-[11px] text-slate-400">
                                Aktif ({periodComp.current_period}) vs Sebelumnya ({periodComp.previous_period})
                            </p>
                        </div>

                        <div className="space-y-3 text-xs">
                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
                                <div>
                                    <span className="text-slate-400 block">Tonase Produksi</span>
                                    <strong className="text-sm text-slate-900 dark:text-white">
                                        {fmtNum(periodComp.tonnage_current)} MT
                                    </strong>
                                    <span className="text-[10px] text-slate-400 block">
                                        Prev: {fmtNum(periodComp.tonnage_previous)} MT
                                    </span>
                                </div>
                                <span className={`px-2 py-1 rounded-lg font-bold ${
                                    Number(periodComp.tonnage_growth_percent) >= 0
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : 'bg-rose-100 text-rose-800'
                                }`}>
                                    {Number(periodComp.tonnage_growth_percent) >= 0 ? '+' : ''}
                                    {fmtNum(periodComp.tonnage_growth_percent, 1)}%
                                </span>
                            </div>

                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
                                <div>
                                    <span className="text-slate-400 block">Total Ritase Hauling</span>
                                    <strong className="text-sm text-slate-900 dark:text-white">
                                        {fmtNum(periodComp.ritase_current, 0)} Rit
                                    </strong>
                                    <span className="text-[10px] text-slate-400 block">
                                        Prev: {fmtNum(periodComp.ritase_previous, 0)} Rit
                                    </span>
                                </div>
                                <span className={`px-2 py-1 rounded-lg font-bold ${
                                    Number(periodComp.ritase_growth_percent) >= 0
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : 'bg-rose-100 text-rose-800'
                                }`}>
                                    {Number(periodComp.ritase_growth_percent) >= 0 ? '+' : ''}
                                    {fmtNum(periodComp.ritase_growth_percent, 1)}%
                                </span>
                            </div>

                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
                                <div>
                                    <span className="text-slate-400 block">Konsumsi BBM Solar</span>
                                    <strong className="text-sm text-amber-600">
                                        {fmtNum(periodComp.fuel_current_liters)} Liter
                                    </strong>
                                    <span className="text-[10px] text-slate-400 block">
                                        Prev: {fmtNum(periodComp.fuel_previous_liters)} Liter
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Site Comparison Matrix */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                            Site Comparison Matrix (Perbandingan Kinerja Antar-Site TAP)
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500">
                                <tr>
                                    <th className="px-4 py-3">Site Operasional</th>
                                    <th className="px-4 py-3 text-center">Total Unit</th>
                                    <th className="px-4 py-3 text-center">Available</th>
                                    <th className="px-4 py-3 text-center">Breakdown</th>
                                    <th className="px-4 py-3 text-right">Ritase</th>
                                    <th className="px-4 py-3 text-right">Tonase (MT)</th>
                                    <th className="px-4 py-3 text-right">Konsumsi Solar (L)</th>
                                    <th className="px-4 py-3 text-right">Rasio (L/Ton)</th>
                                    <th className="px-4 py-3 text-right">Biaya Maintenance</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {siteComp.map((s) => (
                                    <tr key={s.site_id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                                        <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                                            {s.site_code} — {s.site_name}
                                        </td>
                                        <td className="px-4 py-3 text-center font-semibold">{s.total_units}</td>
                                        <td className="px-4 py-3 text-center font-bold text-emerald-600">{s.available_units}</td>
                                        <td className="px-4 py-3 text-center font-bold text-rose-600">{s.breakdown_units}</td>
                                        <td className="px-4 py-3 text-right font-semibold">{fmtNum(s.ritase, 0)}</td>
                                        <td className="px-4 py-3 text-right font-extrabold text-indigo-600">{fmtNum(s.tonnage)}</td>
                                        <td className="px-4 py-3 text-right font-semibold text-amber-600">{fmtNum(s.fuel_consumption_liters)}</td>
                                        <td className="px-4 py-3 text-right font-mono">{fmtNum(s.fuel_per_ton, 4)}</td>
                                        <td className="px-4 py-3 text-right font-semibold">{fmtIDR(s.maintenance_cost_idr)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Source Transaction Drill-Down Inspector */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                        <div className="flex items-center gap-2">
                            <Eye className="w-4 h-4 text-indigo-600" />
                            <div>
                                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                                    Drill-Down Source Transaction Inspector (Penelusuran Data Sumber)
                                </h2>
                                <p className="text-[11px] text-slate-400">
                                    Bukti transaksi langsung dari tabel database untuk memverifikasi angka KPI di atas.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                            {[
                                { id: 'production_tickets', label: `Tiket Produksi (${(drillDown.production_tickets || []).length})` },
                                { id: 'breakdown_units_list', label: `Unit Breakdown (${(drillDown.breakdown_units_list || []).length})` },
                                { id: 'fuel_dispensing', label: `Transaksi Solar (${(drillDown.fuel_dispensing || []).length})` },
                                { id: 'export_jobs', label: `Riwayat Export Job (${exportJobs.length})` },
                            ].map((t) => (
                                <button
                                    key={t.id}
                                    type="button"
                                    onClick={() => setDrillDownTab(t.id)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                                        drillDownTab === t.id
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                                    }`}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {drillDownTab === 'production_tickets' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500">
                                    <tr>
                                        <th className="px-3 py-2">No. Tiket</th>
                                        <th className="px-3 py-2">Tanggal</th>
                                        <th className="px-3 py-2">Site</th>
                                        <th className="px-3 py-2">Unit DT</th>
                                        <th className="px-3 py-2">Driver</th>
                                        <th className="px-3 py-2 text-right">Tonase (MT)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {(drillDown.production_tickets || []).map((t) => (
                                        <tr key={t.id}>
                                            <td className="px-3 py-2 font-bold">{t.ticket_number}</td>
                                            <td className="px-3 py-2">{t.ticket_date?.substring(0, 10)}</td>
                                            <td className="px-3 py-2">{t.site?.code}</td>
                                            <td className="px-3 py-2 font-semibold">{t.unit?.unit_code}</td>
                                            <td className="px-3 py-2">{t.driver?.employee?.name || '-'}</td>
                                            <td className="px-3 py-2 text-right font-bold text-emerald-600">{fmtNum(t.tonnage)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {drillDownTab === 'breakdown_units_list' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500">
                                    <tr>
                                        <th className="px-3 py-2">Kode Unit</th>
                                        <th className="px-3 py-2">Merek / Model</th>
                                        <th className="px-3 py-2">Site</th>
                                        <th className="px-3 py-2">HM / KM Terakhir</th>
                                        <th className="px-3 py-2">Status Aktual</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {(drillDown.breakdown_units_list || []).map((u) => (
                                        <tr key={u.id}>
                                            <td className="px-3 py-2 font-bold">{u.unit_code}</td>
                                            <td className="px-3 py-2">{u.brand} {u.model}</td>
                                            <td className="px-3 py-2">{u.site?.code}</td>
                                            <td className="px-3 py-2">{fmtNum(u.last_hm)} HM / {fmtNum(u.last_km)} KM</td>
                                            <td className="px-3 py-2">
                                                <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[10px] font-bold uppercase">
                                                    {u.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {drillDownTab === 'fuel_dispensing' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500">
                                    <tr>
                                        <th className="px-3 py-2">No. Transaksi</th>
                                        <th className="px-3 py-2">Tanggal</th>
                                        <th className="px-3 py-2">Site</th>
                                        <th className="px-3 py-2">Unit DT</th>
                                        <th className="px-3 py-2">Tangki Sumber</th>
                                        <th className="px-3 py-2 text-right">Volume (Liter)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {(drillDown.fuel_dispensing || []).map((f) => (
                                        <tr key={f.id}>
                                            <td className="px-3 py-2 font-bold">{f.transaction_number}</td>
                                            <td className="px-3 py-2">{f.transaction_date?.substring(0, 10)}</td>
                                            <td className="px-3 py-2">{f.site?.code}</td>
                                            <td className="px-3 py-2 font-semibold">{f.unit?.unit_code}</td>
                                            <td className="px-3 py-2">{f.tank?.tank_code}</td>
                                            <td className="px-3 py-2 text-right font-bold text-amber-600">{fmtNum(f.liters)} L</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {drillDownTab === 'export_jobs' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500">
                                    <tr>
                                        <th className="px-3 py-2">Kode Export</th>
                                        <th className="px-3 py-2">Jenis Laporan</th>
                                        <th className="px-3 py-2">Format</th>
                                        <th className="px-3 py-2">Mode</th>
                                        <th className="px-3 py-2">Jumlah Baris</th>
                                        <th className="px-3 py-2">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {exportJobs.map((job) => (
                                        <tr key={job.id}>
                                            <td className="px-3 py-2 font-bold">{job.export_code}</td>
                                            <td className="px-3 py-2 uppercase">{job.report_type}</td>
                                            <td className="px-3 py-2 uppercase font-semibold">{job.export_format}</td>
                                            <td className="px-3 py-2">
                                                {job.is_background_job ? (
                                                    <span className="inline-flex items-center gap-1 text-indigo-600 font-semibold">
                                                        <Clock className="w-3 h-3" /> Background Queue
                                                    </span>
                                                ) : (
                                                    'Direct Stream'
                                                )}
                                            </td>
                                            <td className="px-3 py-2 font-mono">{job.row_count}</td>
                                            <td className="px-3 py-2">
                                                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
                                                    {job.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
