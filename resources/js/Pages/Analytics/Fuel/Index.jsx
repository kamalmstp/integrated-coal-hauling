import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import DashboardLayout from '../../../components/templates/DashboardLayout';
import AnalyticsFilterBar from '../Partials/AnalyticsFilterBar';

const fmtNum = (v, dec = 2) =>
    new Intl.NumberFormat('id-ID', { maximumFractionDigits: dec }).format(Number(v || 0));

const fmtIDR = (v) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(v || 0));

export default function FuelReportIndex({
    report = {},
    filters = {},
    master = {},
}) {
    const [activeTab, setActiveTab] = useState('fuel_per_unit');

    const summary = report.summary || {};
    const tanks = report.tanks || [];
    const receivedTx = report.received_transactions || [];
    const issuedTx = report.issued_transactions || [];
    const fuelPerUnit = report.fuel_per_unit || [];
    const soundings = report.sounding_variances || [];

    return (
        <DashboardLayout title="Fuel Stock, Consumption, Ratio & Sounding Variance Report">
            <Head title="Fuel Report - Phase 11" />

            <div className="space-y-6">
                <AnalyticsFilterBar
                    currentPath="/analytics/fuel"
                    reportType="fuel"
                    filters={filters}
                    master={master}
                />

                {/* Fuel KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                        <span className="text-xs font-semibold text-slate-500">Fuel Stock (Tanks)</span>
                        <p className="text-xl font-extrabold text-indigo-600 mt-2">
                            {fmtNum(summary.fuel_stock_liters)} <span className="text-xs font-normal">L</span>
                        </p>
                        <p className="text-[11px] text-slate-400">Kapasitas: {fmtNum(summary.fuel_capacity_liters, 0)} L</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                        <span className="text-xs font-semibold text-slate-500">Fuel Received</span>
                        <p className="text-xl font-extrabold text-emerald-600 mt-2">
                            {fmtNum(summary.fuel_received_liters)} <span className="text-xs font-normal">L</span>
                        </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                        <span className="text-xs font-semibold text-slate-500">Fuel Issued / Consumed</span>
                        <p className="text-xl font-extrabold text-amber-600 mt-2">
                            {fmtNum(summary.fuel_issued_liters)} <span className="text-xs font-normal">L</span>
                        </p>
                        <p className="text-[11px] text-slate-400">{fmtIDR(summary.fuel_issued_cost_idr)}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                        <span className="text-xs font-semibold text-slate-500">Fuel per Ton</span>
                        <p className="text-xl font-extrabold text-cyan-600 mt-2">
                            {fmtNum(summary.fuel_per_ton, 4)} <span className="text-xs font-normal">L/MT</span>
                        </p>
                        <p className="text-[11px] text-slate-400">Tonase: {fmtNum(summary.verified_tonnage)} MT</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                        <span className="text-xs font-semibold text-slate-500">Fuel Ratio (L/HM & L/KM)</span>
                        <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-2">
                            {fmtNum(summary.fuel_ratio_liter_per_hm)} L/HM
                        </p>
                        <p className="text-[11px] text-slate-400">{fmtNum(summary.fuel_ratio_liter_per_km, 4)} L/KM</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                        <span className="text-xs font-semibold text-slate-500">Sounding Variance</span>
                        <p className="text-xl font-extrabold text-rose-600 mt-2">
                            {fmtNum(summary.total_sounding_variance_liters)} <span className="text-xs font-normal">L</span>
                        </p>
                        <p className="text-[11px] text-slate-400">{summary.sounding_records_count || 0} Sounding</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap gap-1.5 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                    {[
                        { id: 'fuel_per_unit', label: `Fuel per Unit (${fuelPerUnit.length})` },
                        { id: 'tanks_sounding', label: `Fuel Stock & Sounding Variance (${soundings.length})` },
                        { id: 'transactions', label: `Fuel Received (${receivedTx.length}) & Issued (${issuedTx.length})` },
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

                {activeTab === 'fuel_per_unit' && (
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500">
                                <tr>
                                    <th className="px-3 py-2.5">Unit DT</th>
                                    <th className="px-3 py-2.5 text-center">Frekuensi Isi</th>
                                    <th className="px-3 py-2.5 text-right">Solar Aktual (L)</th>
                                    <th className="px-3 py-2.5 text-right">Tonase (MT)</th>
                                    <th className="px-3 py-2.5 text-right">Operating HM</th>
                                    <th className="px-3 py-2.5 text-right">Jarak KM</th>
                                    <th className="px-3 py-2.5 text-right">Fuel / Ton</th>
                                    <th className="px-3 py-2.5 text-right">Fuel / HM</th>
                                    <th className="px-3 py-2.5 text-right">Fuel / KM</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {fuelPerUnit.map((f) => (
                                    <tr key={f.unit_id}>
                                        <td className="px-3 py-2.5 font-bold">
                                            {f.unit_code} <span className="text-[10px] font-normal text-slate-400">({f.brand_model})</span>
                                        </td>
                                        <td className="px-3 py-2.5 text-center">{f.dispensing_count}x</td>
                                        <td className="px-3 py-2.5 text-right font-bold text-amber-600">{fmtNum(f.liters_consumed)} L</td>
                                        <td className="px-3 py-2.5 text-right font-semibold">{fmtNum(f.tonnage)}</td>
                                        <td className="px-3 py-2.5 text-right">{fmtNum(f.operating_hm)}</td>
                                        <td className="px-3 py-2.5 text-right">{fmtNum(f.distance_km)}</td>
                                        <td className="px-3 py-2.5 text-right font-bold text-indigo-600">{fmtNum(f.fuel_per_ton, 4)}</td>
                                        <td className="px-3 py-2.5 text-right font-bold text-emerald-600">{fmtNum(f.fuel_per_hm)}</td>
                                        <td className="px-3 py-2.5 text-right font-mono">{fmtNum(f.fuel_per_km, 4)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'tanks_sounding' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                            <h3 className="text-xs font-bold uppercase text-indigo-600 mb-3">
                                Fuel Stock per Tank ({tanks.length})
                            </h3>
                            <table className="w-full text-left text-xs">
                                <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                                    <tr>
                                        <th className="py-2">Tangki & Site</th>
                                        <th className="py-2 text-right">Kapasitas (L)</th>
                                        <th className="py-2 text-right">Stok Saat Ini (L)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {tanks.map((t) => (
                                        <tr key={t.id}>
                                            <td className="py-2 font-bold">{t.tank_code} — {t.tank_name} ({t.site?.code})</td>
                                            <td className="py-2 text-right">{fmtNum(t.capacity_liters, 0)}</td>
                                            <td className="py-2 text-right font-extrabold text-emerald-600">{fmtNum(t.current_stock_liters)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                            <h3 className="text-xs font-bold uppercase text-rose-600 mb-3">
                                Daily Tank Sounding Variance ({soundings.length})
                            </h3>
                            <table className="w-full text-left text-xs">
                                <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                                    <tr>
                                        <th className="py-2">No. Sounding</th>
                                        <th className="py-2">Tangki</th>
                                        <th className="py-2 text-right">Stok Sistem</th>
                                        <th className="py-2 text-right">Fisik (Sounding)</th>
                                        <th className="py-2 text-right">Varians (L)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {soundings.map((s) => (
                                        <tr key={s.id}>
                                            <td className="py-2 font-bold">{s.sounding_number}</td>
                                            <td className="py-2">{s.tank?.tank_code}</td>
                                            <td className="py-2 text-right">{fmtNum(s.system_stock_liters)}</td>
                                            <td className="py-2 text-right font-semibold">{fmtNum(s.estimated_volume_liters)}</td>
                                            <td className={`py-2 text-right font-bold ${
                                                Number(s.variance_liters) < 0 ? 'text-rose-600' : 'text-emerald-600'
                                            }`}>
                                                {fmtNum(s.variance_liters)} L
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'transactions' && (
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-x-auto">
                        <h3 className="text-xs font-bold uppercase text-amber-600 mb-3">
                            Fuel Issued / Dispensing Transactions ({issuedTx.length})
                        </h3>
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500">
                                <tr>
                                    <th className="px-3 py-2">No. Transaksi</th>
                                    <th className="px-3 py-2">Tanggal</th>
                                    <th className="px-3 py-2">Site & Tangki</th>
                                    <th className="px-3 py-2">Unit DT & Driver</th>
                                    <th className="px-3 py-2 text-right">Volume (Liter)</th>
                                    <th className="px-3 py-2 text-right">Biaya Solar</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {issuedTx.map((tx) => (
                                    <tr key={tx.id}>
                                        <td className="px-3 py-2 font-bold">{tx.transaction_number}</td>
                                        <td className="px-3 py-2">{tx.transaction_date?.substring(0, 10)}</td>
                                        <td className="px-3 py-2">{tx.site?.code} — {tx.tank?.tank_code}</td>
                                        <td className="px-3 py-2 font-semibold">
                                            {tx.unit?.unit_code} ({tx.driver?.employee?.name || '-'})
                                        </td>
                                        <td className="px-3 py-2 text-right font-bold text-amber-600">{fmtNum(tx.liters)} L</td>
                                        <td className="px-3 py-2 text-right font-semibold">{fmtIDR(tx.total_cost)}</td>
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
