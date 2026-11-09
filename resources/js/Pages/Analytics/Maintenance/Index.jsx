import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import DashboardLayout from '../../../components/templates/DashboardLayout';
import AnalyticsFilterBar from '../Partials/AnalyticsFilterBar';

const fmtNum = (v, dec = 2) =>
    new Intl.NumberFormat('id-ID', { maximumFractionDigits: dec }).format(Number(v || 0));

const fmtIDR = (v) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(v || 0));

export default function MaintenanceReportIndex({
    report = {},
    filters = {},
    master = {},
}) {
    const [activeTab, setActiveTab] = useState('work_orders');

    const summary = report.summary || {};
    const pmSchedules = report.pm_schedules || [];
    const workOrders = report.work_orders || [];
    const costByType = report.cost_by_type || [];
    const sparepartUsage = report.sparepart_usage || [];
    const breakdownAnalysis = report.breakdown_analysis || [];

    return (
        <DashboardLayout title="Maintenance, PM Compliance, MTTR/MTBF & Cost Report">
            <Head title="Maintenance Report - Phase 11" />

            <div className="space-y-6">
                <AnalyticsFilterBar
                    currentPath="/analytics/maintenance"
                    reportType="maintenance"
                    filters={filters}
                    master={master}
                    statusOptions={[
                        { value: '', label: 'Semua Status WO' },
                        { value: 'completed', label: 'Completed' },
                        { value: 'in_progress', label: 'In Progress' },
                        { value: 'open', label: 'Open / Submitted' },
                    ]}
                />

                {/* Maintenance KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                        <span className="text-xs font-semibold text-slate-500">PM Compliance</span>
                        <p className="text-2xl font-extrabold text-emerald-600 mt-2">
                            {fmtNum(summary.pm_compliance_percent)}%
                        </p>
                        <p className="text-[11px] text-slate-400">
                            {summary.compliant_pm_schedules || 0} / {summary.total_pm_schedules || 0} Jadwal PM
                        </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                        <span className="text-xs font-semibold text-slate-500">Work Order (PM / CM)</span>
                        <p className="text-2xl font-extrabold text-indigo-600 mt-2">
                            {summary.total_work_orders || 0}
                        </p>
                        <p className="text-[11px] text-slate-400">
                            PM: {summary.pm_work_orders_count || 0} • CM: {summary.cm_work_orders_count || 0}
                        </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                        <span className="text-xs font-semibold text-slate-500">MTTR (Mean Time To Repair)</span>
                        <p className="text-2xl font-extrabold text-amber-600 mt-2">
                            {fmtNum(summary.mttr_hours)} <span className="text-xs font-normal">Jam</span>
                        </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                        <span className="text-xs font-semibold text-slate-500">MTBF (Mean Time Between Failures)</span>
                        <p className="text-2xl font-extrabold text-cyan-600 mt-2">
                            {fmtNum(summary.mtbf_hours)} <span className="text-xs font-normal">HM</span>
                        </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                        <span className="text-xs font-semibold text-slate-500">Total Maintenance Cost</span>
                        <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-2">
                            {fmtIDR(summary.total_maintenance_cost_idr)}
                        </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                        <span className="text-xs font-semibold text-slate-500">Sparepart Usage Value</span>
                        <p className="text-lg font-extrabold text-rose-600 mt-2">
                            {fmtIDR(summary.total_sparepart_usage_cost_idr)}
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap gap-1.5 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                    {[
                        { id: 'work_orders', label: `Work Order & CM Summary (${workOrders.length})` },
                        { id: 'pm_compliance', label: `PM Compliance (${pmSchedules.length})` },
                        { id: 'cost_sparepart', label: 'Maintenance Cost & Sparepart Usage' },
                        { id: 'breakdown_analysis', label: `Breakdown Analysis (${breakdownAnalysis.length})` },
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

                {activeTab === 'work_orders' && (
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500">
                                <tr>
                                    <th className="px-3 py-2.5">No. Work Order</th>
                                    <th className="px-3 py-2.5">Site & Unit</th>
                                    <th className="px-3 py-2.5">Job Type</th>
                                    <th className="px-3 py-2.5">Mekanik</th>
                                    <th className="px-3 py-2.5 text-right">Downtime (Menit)</th>
                                    <th className="px-3 py-2.5 text-right">Biaya Aktual</th>
                                    <th className="px-3 py-2.5">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {workOrders.map((wo) => (
                                    <tr key={wo.id}>
                                        <td className="px-3 py-2.5 font-bold">{wo.wo_number}</td>
                                        <td className="px-3 py-2.5 font-semibold">{wo.site?.code} — {wo.unit?.unit_code}</td>
                                        <td className="px-3 py-2.5 uppercase font-semibold text-indigo-600">{wo.job_type}</td>
                                        <td className="px-3 py-2.5">{wo.mechanic?.name || '-'}</td>
                                        <td className="px-3 py-2.5 text-right">{wo.downtime_minutes || 0}</td>
                                        <td className="px-3 py-2.5 text-right font-bold">{fmtIDR(wo.actual_cost)}</td>
                                        <td className="px-3 py-2.5">
                                            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold uppercase">
                                                {wo.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'pm_compliance' && (
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500">
                                <tr>
                                    <th className="px-3 py-2.5">Unit DT</th>
                                    <th className="px-3 py-2.5">Site</th>
                                    <th className="px-3 py-2.5">Service Type</th>
                                    <th className="px-3 py-2.5 text-right">Last Service HM</th>
                                    <th className="px-3 py-2.5 text-right">Next Due HM</th>
                                    <th className="px-3 py-2.5">Status Jadwal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {pmSchedules.map((pm) => (
                                    <tr key={pm.id}>
                                        <td className="px-3 py-2.5 font-bold">{pm.unit?.unit_code}</td>
                                        <td className="px-3 py-2.5">{pm.site?.code}</td>
                                        <td className="px-3 py-2.5 font-semibold text-indigo-600">{pm.service_type}</td>
                                        <td className="px-3 py-2.5 text-right">{fmtNum(pm.last_service_hm)}</td>
                                        <td className="px-3 py-2.5 text-right font-bold">{fmtNum(pm.next_due_hm)}</td>
                                        <td className="px-3 py-2.5">
                                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                                                pm.status === 'overdue' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                                            }`}>
                                                {pm.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'cost_sparepart' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                            <h3 className="text-xs font-bold uppercase text-indigo-600 mb-3">
                                Maintenance Cost by Category
                            </h3>
                            <table className="w-full text-left text-xs">
                                <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                                    <tr>
                                        <th className="py-2">Kategori Biaya</th>
                                        <th className="py-2 text-center">Transaksi</th>
                                        <th className="py-2 text-right">Estimasi</th>
                                        <th className="py-2 text-right">Aktual</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {costByType.map((c) => (
                                        <tr key={c.cost_type}>
                                            <td className="py-2 font-bold uppercase">{c.cost_type}</td>
                                            <td className="py-2 text-center">{c.count}</td>
                                            <td className="py-2 text-right">{fmtIDR(c.estimated_amount)}</td>
                                            <td className="py-2 text-right font-bold text-indigo-600">{fmtIDR(c.actual_amount)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                            <h3 className="text-xs font-bold uppercase text-emerald-600 mb-3">
                                Sparepart Usage Requests ({sparepartUsage.length})
                            </h3>
                            <div className="overflow-x-auto max-h-72">
                                <table className="w-full text-left text-xs">
                                    <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                                        <tr>
                                            <th className="py-2">No. Request</th>
                                            <th className="py-2">Unit / WO</th>
                                            <th className="py-2">Status</th>
                                            <th className="py-2 text-right">Total Nilai</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {sparepartUsage.map((sp) => (
                                            <tr key={sp.id}>
                                                <td className="py-2 font-bold">{sp.request_number}</td>
                                                <td className="py-2">{sp.work_order?.unit?.unit_code} ({sp.work_order?.wo_number})</td>
                                                <td className="py-2 uppercase font-semibold">{sp.status}</td>
                                                <td className="py-2 text-right font-bold">{fmtIDR(sp.total_cost)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'breakdown_analysis' && (
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                        <h3 className="text-xs font-bold uppercase text-rose-600 mb-3">
                            Breakdown Analysis by Damage Category
                        </h3>
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500">
                                <tr>
                                    <th className="px-3 py-2">Kategori Kerusakan</th>
                                    <th className="px-3 py-2 text-center">Jumlah Kejadian</th>
                                    <th className="px-3 py-2 text-center">Kejadian Kritis</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {breakdownAnalysis.map((ba) => (
                                    <tr key={ba.damage_category}>
                                        <td className="px-3 py-2 font-bold uppercase">{ba.damage_category}</td>
                                        <td className="px-3 py-2 text-center font-semibold">{ba.incident_count}</td>
                                        <td className="px-3 py-2 text-center font-bold text-rose-600">{ba.critical_count}</td>
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
