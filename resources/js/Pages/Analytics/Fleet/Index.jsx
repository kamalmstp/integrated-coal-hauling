import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import DashboardLayout from '../../../components/templates/DashboardLayout';
import AnalyticsFilterBar from '../Partials/AnalyticsFilterBar';

const fmtNum = (v, dec = 2) =>
    new Intl.NumberFormat('id-ID', { maximumFractionDigits: dec }).format(Number(v || 0));

export default function FleetReportIndex({
    report = {},
    filters = {},
    master = {},
}) {
    const [activeTab, setActiveTab] = useState('performance');

    const summary = report.summary || {};
    const unitPerf = report.unit_performance || [];
    const history = report.unit_history || {};

    return (
        <DashboardLayout title="Fleet Availability, Utilization & Performance Report">
            <Head title="Fleet Report (PA/MA/UA) - Phase 11" />

            <div className="space-y-6">
                <AnalyticsFilterBar
                    currentPath="/analytics/fleet"
                    reportType="fleet"
                    filters={filters}
                    master={master}
                    statusOptions={[
                        { value: '', label: 'Semua Status Unit' },
                        { value: 'available', label: 'Available / RFU' },
                        { value: 'operating', label: 'Operating' },
                        { value: 'breakdown', label: 'Breakdown' },
                        { value: 'maintenance', label: 'Maintenance' },
                    ]}
                />

                {/* Fleet KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                        <span className="text-xs font-semibold text-slate-500">Fleet Availability (PA)</span>
                        <p className="text-2xl font-extrabold text-emerald-600 mt-2">
                            {fmtNum(summary.avg_pa_percent)}%
                        </p>
                        <p className="text-[11px] text-slate-400">MA: {fmtNum(summary.avg_ma_percent)}%</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                        <span className="text-xs font-semibold text-slate-500">Utilization (UA)</span>
                        <p className="text-2xl font-extrabold text-indigo-600 mt-2">
                            {fmtNum(summary.avg_ua_percent)}%
                        </p>
                        <p className="text-[11px] text-slate-400">Use of Availability</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                        <span className="text-xs font-semibold text-slate-500">Operating Hours</span>
                        <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
                            {fmtNum(summary.total_operating_hours)} <span className="text-xs font-normal">HM</span>
                        </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                        <span className="text-xs font-semibold text-slate-500">Downtime Hours</span>
                        <p className="text-2xl font-extrabold text-rose-600 mt-2">
                            {fmtNum(summary.total_downtime_hours)} <span className="text-xs font-normal">Jam</span>
                        </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                        <span className="text-xs font-semibold text-slate-500">Breakdown Frequency</span>
                        <p className="text-2xl font-extrabold text-amber-600 mt-2">
                            {summary.total_breakdown_frequency || 0} <span className="text-xs font-normal">Kali</span>
                        </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                        <span className="text-xs font-semibold text-slate-500">Available / Total Unit</span>
                        <p className="text-2xl font-extrabold text-cyan-600 mt-2">
                            {summary.available_units || 0} / {summary.total_units || 0}
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap gap-1.5 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                    {[
                        { id: 'performance', label: `Unit Performance & Availability (${unitPerf.length})` },
                        { id: 'history', label: 'Unit History (HM/KM & Breakdown Logs)' },
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

                {activeTab === 'performance' && (
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500">
                                <tr>
                                    <th className="px-3 py-2.5">Unit Code & Model</th>
                                    <th className="px-3 py-2.5">Site</th>
                                    <th className="px-3 py-2.5">Status</th>
                                    <th className="px-3 py-2.5 text-right">Operating (HM)</th>
                                    <th className="px-3 py-2.5 text-right">Downtime (Jam)</th>
                                    <th className="px-3 py-2.5 text-right">PA (%)</th>
                                    <th className="px-3 py-2.5 text-right">MA (%)</th>
                                    <th className="px-3 py-2.5 text-right">UA (%)</th>
                                    <th className="px-3 py-2.5 text-center">BD Freq</th>
                                    <th className="px-3 py-2.5 text-right">Tonase (MT)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {unitPerf.map((u) => (
                                    <tr key={u.unit_id}>
                                        <td className="px-3 py-2.5">
                                            <div className="font-bold text-slate-900 dark:text-white">{u.unit_code}</div>
                                            <div className="text-[10px] text-slate-400">{u.brand_model}</div>
                                        </td>
                                        <td className="px-3 py-2.5 font-semibold">{u.site_code}</td>
                                        <td className="px-3 py-2.5">
                                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                                                ['breakdown', 'maintenance'].includes(u.status)
                                                    ? 'bg-rose-100 text-rose-800'
                                                    : 'bg-emerald-100 text-emerald-800'
                                            }`}>
                                                {u.status}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2.5 text-right font-semibold">{fmtNum(u.operating_hours)}</td>
                                        <td className="px-3 py-2.5 text-right text-rose-600 font-semibold">{fmtNum(u.downtime_hours)}</td>
                                        <td className="px-3 py-2.5 text-right font-bold text-emerald-600">{fmtNum(u.pa_percent)}%</td>
                                        <td className="px-3 py-2.5 text-right font-bold text-indigo-600">{fmtNum(u.ma_percent)}%</td>
                                        <td className="px-3 py-2.5 text-right font-bold text-cyan-600">{fmtNum(u.ua_percent)}%</td>
                                        <td className="px-3 py-2.5 text-center font-bold text-amber-600">{u.breakdown_frequency}</td>
                                        <td className="px-3 py-2.5 text-right font-bold">{fmtNum(u.tonnage)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                            <h3 className="text-xs font-bold uppercase text-indigo-600 mb-3">
                                Unit HM/KM History ({(history.hm_km_logs || []).length})
                            </h3>
                            <div className="overflow-x-auto max-h-80">
                                <table className="w-full text-left text-xs">
                                    <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                                        <tr>
                                            <th className="py-2">Tanggal</th>
                                            <th className="py-2">Unit</th>
                                            <th className="py-2 text-right">&Delta; HM</th>
                                            <th className="py-2 text-right">&Delta; KM</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {(history.hm_km_logs || []).map((l) => (
                                            <tr key={l.id}>
                                                <td className="py-2 font-mono">{l.log_date?.substring(0, 10)}</td>
                                                <td className="py-2 font-bold">{l.unit?.unit_code}</td>
                                                <td className="py-2 text-right text-emerald-600 font-bold">+{fmtNum(l.diff_hm)}</td>
                                                <td className="py-2 text-right text-indigo-600 font-bold">+{fmtNum(l.diff_km)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                            <h3 className="text-xs font-bold uppercase text-rose-600 mb-3">
                                Unit Breakdown Incident History ({(history.breakdown_reports || []).length})
                            </h3>
                            <div className="overflow-x-auto max-h-80">
                                <table className="w-full text-left text-xs">
                                    <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                                        <tr>
                                            <th className="py-2">No. Laporan</th>
                                            <th className="py-2">Unit</th>
                                            <th className="py-2">Kategori Kerusakan</th>
                                            <th className="py-2">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {(history.breakdown_reports || []).map((b) => (
                                            <tr key={b.id}>
                                                <td className="py-2 font-bold">{b.report_number}</td>
                                                <td className="py-2 font-semibold">{b.unit?.unit_code}</td>
                                                <td className="py-2">{b.damage_category}</td>
                                                <td className="py-2 uppercase font-bold text-rose-600">{b.status}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
