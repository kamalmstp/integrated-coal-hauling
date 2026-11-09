import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import DashboardLayout from '../../../components/templates/DashboardLayout';
import AnalyticsFilterBar from '../Partials/AnalyticsFilterBar';
import {
    TrendingUp,
    Layers,
    Target,
    Truck,
    UserCheck,
    Clock,
    MapPin,
} from 'lucide-react';

const fmtNum = (v, dec = 2) =>
    new Intl.NumberFormat('id-ID', { maximumFractionDigits: dec }).format(Number(v || 0));

export default function ProductionReportIndex({
    report = {},
    filters = {},
    master = {},
}) {
    const [activeTab, setActiveTab] = useState('period');

    const summary = report.summary || {};
    const daily = report.daily_production || [];
    const weekly = report.weekly_production || [];
    const monthly = report.monthly_production || [];
    const unitProd = report.unit_productivity || [];
    const driverProd = report.driver_productivity || [];
    const shiftProd = report.shift_productivity || [];
    const loadingPoints = report.loading_point_summary || [];
    const dumpingPoints = report.dumping_point_summary || [];
    const sourceTickets = report.source_tickets || [];

    return (
        <DashboardLayout title="Production Analytics & Hauling Performance Report">
            <Head title="Production Report - Phase 11" />

            <div className="space-y-6">
                <AnalyticsFilterBar
                    currentPath="/analytics/production"
                    reportType="production"
                    filters={filters}
                    master={master}
                    statusOptions={[
                        { value: 'verified', label: 'Verified Production' },
                        { value: 'pending_verification', label: 'Pending Verification' },
                        { value: 'rejected', label: 'Rejected' },
                        { value: 'all', label: 'Semua Status Tiket' },
                    ]}
                />

                {/* Production KPI Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                        <span className="text-xs font-semibold text-slate-500">Total Tonase Aktual</span>
                        <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-2">
                            {fmtNum(summary.total_tonnage)} <span className="text-xs font-normal">MT</span>
                        </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                        <span className="text-xs font-semibold text-slate-500">Total Ritase</span>
                        <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
                            {fmtNum(summary.total_ritase, 0)} <span className="text-xs font-normal">Rit</span>
                        </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                        <span className="text-xs font-semibold text-slate-500">Rata-Rata Muatan / Rit</span>
                        <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
                            {fmtNum(summary.avg_ton_per_ritase)} <span className="text-xs font-normal">MT/Rit</span>
                        </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                        <span className="text-xs font-semibold text-slate-500">Target Tonase</span>
                        <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-2">
                            {fmtNum(summary.target_tonnage)} <span className="text-xs font-normal">MT</span>
                        </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                        <span className="text-xs font-semibold text-slate-500">Target vs Actual</span>
                        <p className="text-2xl font-extrabold text-cyan-600 dark:text-cyan-400 mt-2">
                            {fmtNum(summary.achievement_percent, 1)}%
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                            Varians: {Number(summary.variance_tonnage) >= 0 ? '+' : ''}{fmtNum(summary.variance_tonnage)} MT
                        </p>
                    </div>
                </div>

                {/* Section Tabs */}
                <div className="flex flex-wrap gap-1.5 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                    {[
                        { id: 'period', label: 'Daily / Weekly / Monthly Production' },
                        { id: 'unit_driver', label: 'Unit & Driver Productivity' },
                        { id: 'shift_location', label: 'Shift, Loading & Dumping Point' },
                        { id: 'tickets', label: `Source Dumping Tickets (${sourceTickets.length})` },
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

                {activeTab === 'period' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Daily Production */}
                        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-3">
                                Daily Production ({daily.length} Hari)
                            </h3>
                            <div className="overflow-x-auto max-h-80">
                                <table className="w-full text-left text-xs">
                                    <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                                        <tr>
                                            <th className="py-2">Tanggal</th>
                                            <th className="py-2 text-right">Ritase</th>
                                            <th className="py-2 text-right">Tonase (MT)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {daily.map((d) => (
                                            <tr key={d.date}>
                                                <td className="py-2 font-mono">{d.date}</td>
                                                <td className="py-2 text-right font-semibold">{d.ritase}</td>
                                                <td className="py-2 text-right font-bold text-indigo-600">{fmtNum(d.tonnage)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Weekly Production */}
                        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-3">
                                Weekly Production ({weekly.length} Minggu)
                            </h3>
                            <div className="overflow-x-auto max-h-80">
                                <table className="w-full text-left text-xs">
                                    <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                                        <tr>
                                            <th className="py-2">Minggu</th>
                                            <th className="py-2 text-right">Ritase</th>
                                            <th className="py-2 text-right">Tonase (MT)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {weekly.map((w) => (
                                            <tr key={w.week}>
                                                <td className="py-2">
                                                    <div className="font-bold">{w.week}</div>
                                                    <div className="text-[10px] text-slate-400">{w.start_date} s/d {w.end_date}</div>
                                                </td>
                                                <td className="py-2 text-right font-semibold">{w.ritase}</td>
                                                <td className="py-2 text-right font-bold text-emerald-600">{fmtNum(w.tonnage)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Monthly Production */}
                        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-3">
                                Monthly Production ({monthly.length} Bulan)
                            </h3>
                            <div className="overflow-x-auto max-h-80">
                                <table className="w-full text-left text-xs">
                                    <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                                        <tr>
                                            <th className="py-2">Bulan</th>
                                            <th className="py-2 text-right">Ritase</th>
                                            <th className="py-2 text-right">Tonase (MT)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {monthly.map((m) => (
                                            <tr key={m.month}>
                                                <td className="py-2 font-bold">{m.month}</td>
                                                <td className="py-2 text-right font-semibold">{m.ritase}</td>
                                                <td className="py-2 text-right font-bold text-amber-600">{fmtNum(m.tonnage)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'unit_driver' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Unit Productivity */}
                        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                            <div className="flex items-center gap-2 mb-3">
                                <Truck className="w-4 h-4 text-indigo-600" />
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                    Unit Productivity (Produktivitas per Unit DT)
                                </h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500">
                                        <tr>
                                            <th className="px-3 py-2">Unit DT</th>
                                            <th className="px-3 py-2 text-right">Ritase</th>
                                            <th className="px-3 py-2 text-right">Tonase (MT)</th>
                                            <th className="px-3 py-2 text-right">Operating HM</th>
                                            <th className="px-3 py-2 text-right">Ton / HM</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {unitProd.map((u) => (
                                            <tr key={u.unit_id}>
                                                <td className="px-3 py-2 font-bold">{u.unit_code} <span className="text-[10px] font-normal text-slate-400">({u.brand_model})</span></td>
                                                <td className="px-3 py-2 text-right">{u.ritase}</td>
                                                <td className="px-3 py-2 text-right font-bold text-indigo-600">{fmtNum(u.tonnage)}</td>
                                                <td className="px-3 py-2 text-right">{fmtNum(u.operating_hm)}</td>
                                                <td className="px-3 py-2 text-right font-semibold text-emerald-600">{fmtNum(u.ton_per_hm)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Driver Productivity */}
                        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                            <div className="flex items-center gap-2 mb-3">
                                <UserCheck className="w-4 h-4 text-emerald-600" />
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                    Driver Productivity (Produktivitas per Driver)
                                </h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500">
                                        <tr>
                                            <th className="px-3 py-2">Driver</th>
                                            <th className="px-3 py-2 text-right">Ritase</th>
                                            <th className="px-3 py-2 text-right">Tonase (MT)</th>
                                            <th className="px-3 py-2 text-right">Avg MT/Rit</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {driverProd.map((d) => (
                                            <tr key={d.driver_id}>
                                                <td className="px-3 py-2">
                                                    <div className="font-bold">{d.driver_name}</div>
                                                    <div className="text-[10px] text-slate-400">{d.driver_code}</div>
                                                </td>
                                                <td className="px-3 py-2 text-right">{d.ritase}</td>
                                                <td className="px-3 py-2 text-right font-bold text-emerald-600">{fmtNum(d.tonnage)}</td>
                                                <td className="px-3 py-2 text-right">{fmtNum(d.avg_ton_per_rit)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'shift_location' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Shift Productivity */}
                        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                            <div className="flex items-center gap-2 mb-3">
                                <Clock className="w-4 h-4 text-indigo-600" />
                                <h3 className="text-xs font-bold uppercase text-slate-800 dark:text-slate-200">
                                    Shift Productivity
                                </h3>
                            </div>
                            <table className="w-full text-left text-xs">
                                <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                                    <tr>
                                        <th className="py-2">Shift</th>
                                        <th className="py-2 text-right">Ritase</th>
                                        <th className="py-2 text-right">Tonase</th>
                                        <th className="py-2 text-right">Porsi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {shiftProd.map((s) => (
                                        <tr key={s.shift_id}>
                                            <td className="py-2 font-bold">{s.shift_name}</td>
                                            <td className="py-2 text-right">{s.ritase}</td>
                                            <td className="py-2 text-right font-bold text-indigo-600">{fmtNum(s.tonnage)}</td>
                                            <td className="py-2 text-right">{fmtNum(s.share_percent, 1)}%</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Loading Point */}
                        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                            <div className="flex items-center gap-2 mb-3">
                                <MapPin className="w-4 h-4 text-emerald-600" />
                                <h3 className="text-xs font-bold uppercase text-slate-800 dark:text-slate-200">
                                    Loading Point (PIT / ROM)
                                </h3>
                            </div>
                            <table className="w-full text-left text-xs">
                                <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                                    <tr>
                                        <th className="py-2">Lokasi Loading</th>
                                        <th className="py-2 text-right">Ritase</th>
                                        <th className="py-2 text-right">Tonase</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {loadingPoints.map((lp) => (
                                        <tr key={lp.location_id}>
                                            <td className="py-2 font-semibold">{lp.location_code} — {lp.location_name}</td>
                                            <td className="py-2 text-right">{lp.ritase}</td>
                                            <td className="py-2 text-right font-bold text-emerald-600">{fmtNum(lp.tonnage)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Dumping Point */}
                        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                            <div className="flex items-center gap-2 mb-3">
                                <MapPin className="w-4 h-4 text-amber-600" />
                                <h3 className="text-xs font-bold uppercase text-slate-800 dark:text-slate-200">
                                    Dumping Point (Stockpile / Jetty)
                                </h3>
                            </div>
                            <table className="w-full text-left text-xs">
                                <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                                    <tr>
                                        <th className="py-2">Lokasi Dumping</th>
                                        <th className="py-2 text-right">Ritase</th>
                                        <th className="py-2 text-right">Tonase</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {dumpingPoints.map((dp) => (
                                        <tr key={dp.location_id}>
                                            <td className="py-2 font-semibold">{dp.location_code} — {dp.location_name}</td>
                                            <td className="py-2 text-right">{dp.ritase}</td>
                                            <td className="py-2 text-right font-bold text-amber-600">{fmtNum(dp.tonnage)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'tickets' && (
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500">
                                <tr>
                                    <th className="px-3 py-2">No. Tiket</th>
                                    <th className="px-3 py-2">Tanggal</th>
                                    <th className="px-3 py-2">Site</th>
                                    <th className="px-3 py-2">Unit</th>
                                    <th className="px-3 py-2">Driver</th>
                                    <th className="px-3 py-2">Shift</th>
                                    <th className="px-3 py-2">Loading &rarr; Dumping</th>
                                    <th className="px-3 py-2 text-right">Tonase (MT)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {sourceTickets.map((t) => (
                                    <tr key={t.id}>
                                        <td className="px-3 py-2 font-bold">{t.ticket_number}</td>
                                        <td className="px-3 py-2">{t.ticket_date?.substring(0, 10)}</td>
                                        <td className="px-3 py-2">{t.site?.code}</td>
                                        <td className="px-3 py-2 font-semibold">{t.unit?.unit_code}</td>
                                        <td className="px-3 py-2">{t.driver?.employee?.name}</td>
                                        <td className="px-3 py-2">{t.shift?.name}</td>
                                        <td className="px-3 py-2 text-slate-500">
                                            {t.loading_point?.code} &rarr; {t.dumping_point?.code}
                                        </td>
                                        <td className="px-3 py-2 text-right font-bold text-indigo-600">{fmtNum(t.tonnage)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
