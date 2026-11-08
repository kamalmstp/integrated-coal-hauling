import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import DashboardLayout from '../../../components/templates/DashboardLayout';
import Card from '../../../components/molecules/Card';
import Button from '../../../components/atoms/Button';
import Pagination from '../../../components/molecules/Pagination';
import {
    Activity,
    AlertTriangle,
    Clock,
    DollarSign,
    Filter,
    RefreshCw,
    Search,
    Truck,
    Wrench,
    FileText,
    TrendingDown,
    Zap,
    Info,
    Calendar,
} from 'lucide-react';

export default function CorrectiveMaintenanceIndex({
    orders = { data: [], links: [] },
    unitAnalytics = [],
    kpis = {},
    filters = {},
    master = {},
}) {
    const [siteId, setSiteId] = useState(filters.site_id || '');
    const [unitId, setUnitId] = useState(filters.unit_id || '');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');

    const handleFilter = (e) => {
        e.preventDefault();
        router.get('/maintenance/corrective', {
            site_id: siteId || undefined,
            unit_id: unitId || undefined,
            date_from: dateFrom || undefined,
            date_to: dateTo || undefined,
        }, { preserveState: true });
    };

    const handleReset = () => {
        setSiteId('');
        setUnitId('');
        setDateFrom('');
        setDateTo('');
        router.get('/maintenance/corrective');
    };

    return (
        <DashboardLayout>
            <Head title="Corrective Maintenance & Reliability — TAP Maintenance" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                            <Activity className="w-7 h-7 text-red-500" />
                            Corrective Maintenance (CM) & Reliability Analytics
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Analisis keandalan armada, investigasi akar masalah kerusakan (Root Cause Analysis), dan metrik MTTR, MTBF, breakdown frequency, serta downtime hours.
                        </p>
                    </div>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    <Card className="p-3 border-l-4 border-l-red-500 text-center">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Total Kerusakan (CM)</p>
                        <p className="text-2xl font-black text-red-600 dark:text-red-400 mt-1">{kpis.total_breakdowns || 0}</p>
                        <p className="text-[10px] text-gray-400">Kasus breakdown</p>
                    </Card>

                    <Card className="p-3 border-l-4 border-l-amber-500 text-center">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Total Downtime</p>
                        <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{kpis.total_downtime_hours || 0} h</p>
                        <p className="text-[10px] text-gray-400">Jam perbaikan unit</p>
                    </Card>

                    <Card className="p-3 border-l-4 border-l-blue-500 text-center">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">MTTR (Mean Time to Repair)</p>
                        <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">{kpis.mttr || 0} h</p>
                        <p className="text-[10px] text-gray-400">Downtime ÷ Frekuensi</p>
                    </Card>

                    <Card className="p-3 border-l-4 border-l-purple-500 text-center">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">MTBF (Between Failures)</p>
                        <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
                            {kpis.mtbf !== null ? `${kpis.mtbf} h` : 'N/A'}
                        </p>
                        <p className="text-[10px] text-gray-400">Operating Hours ÷ Frekuensi</p>
                    </Card>

                    <Card className="p-3 border-l-4 border-l-cyan-500 text-center">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Total Operating Hours</p>
                        <p className="text-2xl font-black text-cyan-600 dark:text-cyan-400 mt-1">{kpis.total_operating_hours || 0} h</p>
                        <p className="text-[10px] text-gray-400">Berdasarkan HM aktual</p>
                    </Card>

                    <Card className="p-3 border-l-4 border-l-emerald-500 text-center">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Total Biaya CM</p>
                        <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                            Rp {((kpis.total_cm_cost || 0) / 1000000).toFixed(1)}M
                        </p>
                        <p className="text-[10px] text-gray-400">Juta rupiah</p>
                    </Card>
                </div>

                {/* Formula explainer alert */}
                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-300 flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                        <strong>Definisi & Formula Metrik Keandalan TAP:</strong>
                        <ul className="list-disc list-inside mt-0.5 space-y-0.5 text-[11px]">
                            <li><strong>MTTR (Mean Time To Repair):</strong> Total Jam Downtime / Jumlah Kejadian Breakdown. Mengukur kecepatan dan efektivitas tim mekanik menyelesaikan masalah.</li>
                            <li><strong>MTBF (Mean Time Between Failures):</strong> Total Jam Operasi (OH) / Jumlah Kejadian Breakdown. Menghitung rata-rata jam kerja unit sebelum mengalami kerusakan berikutnya (hanya dihitung bila data jam operasi valid).</li>
                        </ul>
                    </div>
                </div>

                {/* Filters */}
                <Card className="p-4">
                    <form onSubmit={handleFilter} className="grid grid-cols-1 md:grid-cols-5 gap-3">
                        <div>
                            <select
                                value={siteId}
                                onChange={(e) => setSiteId(e.target.value)}
                                className="w-full py-2 px-3 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            >
                                <option value="">Semua Site / Project</option>
                                {master.sites?.map((s) => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <select
                                value={unitId}
                                onChange={(e) => setUnitId(e.target.value)}
                                className="w-full py-2 px-3 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            >
                                <option value="">Semua Unit</option>
                                {master.units?.map((u) => (
                                    <option key={u.id} value={u.id}>{u.unit_code} - {u.unit_type}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="w-full py-2 px-3 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            />
                        </div>

                        <div>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="w-full py-2 px-3 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            />
                        </div>

                        <div className="flex gap-2">
                            <Button type="submit" className="flex-1 bg-gray-900 hover:bg-gray-800 text-white text-sm">
                                <Filter className="w-3.5 h-3.5 mr-1" /> Filter
                            </Button>
                            <Button type="button" onClick={handleReset} variant="outline" className="px-3 text-gray-600">
                                <RefreshCw className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                    </form>
                </Card>

                {/* Unit-by-Unit Reliability Table */}
                <Card className="overflow-hidden">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Truck className="w-4 h-4 text-amber-500" />
                            Tabel Keandalan Per Unit (Unit Breakdown & Cost Ranking)
                        </h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    <th className="py-3 px-4">Nomor Unit</th>
                                    <th className="py-3 px-4">Tipe & Status</th>
                                    <th className="py-3 px-4 text-center">Frekuensi Breakdown</th>
                                    <th className="py-3 px-4 text-center">Downtime (Jam)</th>
                                    <th className="py-3 px-4 text-center">MTTR (Jam)</th>
                                    <th className="py-3 px-4 text-center">Operating Hours (OH)</th>
                                    <th className="py-3 px-4 text-center">MTBF (Jam)</th>
                                    <th className="py-3 px-4 text-right">Total Biaya CM</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                                {unitAnalytics?.length > 0 ? (
                                    unitAnalytics.map((u) => (
                                        <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition">
                                            <td className="py-3 px-4 font-bold text-gray-900 dark:text-white">
                                                {u.unit_code}
                                                <div className="text-xs text-gray-400 font-normal">{u.registration_number}</div>
                                            </td>
                                            <td className="py-3 px-4 text-xs text-gray-600 dark:text-gray-300">
                                                {u.unit_type}
                                                <div>
                                                    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold mt-0.5 ${u.status === 'breakdown' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                        {u.status}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-center font-bold text-red-600 dark:text-red-400">
                                                {u.breakdown_count}x
                                            </td>
                                            <td className="py-3 px-4 text-center font-mono">
                                                {u.downtime_hours} h
                                            </td>
                                            <td className="py-3 px-4 text-center font-mono font-bold text-blue-600 dark:text-blue-400">
                                                {u.mttr} h
                                            </td>
                                            <td className="py-3 px-4 text-center font-mono text-cyan-600 dark:text-cyan-400">
                                                {u.operating_hours} h
                                            </td>
                                            <td className="py-3 px-4 text-center font-mono font-bold text-purple-600 dark:text-purple-400">
                                                {u.mtbf !== null ? `${u.mtbf} h` : '-'}
                                            </td>
                                            <td className="py-3 px-4 text-right font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                                                Rp {Number(u.cm_cost || 0).toLocaleString('id-ID')}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="py-8 text-center text-gray-500 dark:text-gray-400">
                                            Tidak ada data keandalan untuk periode ini.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Corrective Maintenance Orders List */}
                <Card className="overflow-hidden">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Wrench className="w-4 h-4 text-blue-500" />
                            Daftar Surat Perintah Kerja Corrective Maintenance (CM)
                        </h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    <th className="py-3 px-4">WO Number</th>
                                    <th className="py-3 px-4">Unit</th>
                                    <th className="py-3 px-4">Waktu Breakdown</th>
                                    <th className="py-3 px-4">Keluhan & Root Cause</th>
                                    <th className="py-3 px-4">Mekanik</th>
                                    <th className="py-3 px-4">Downtime</th>
                                    <th className="py-3 px-4 text-right">Biaya Aktual</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                                {orders.data?.length > 0 ? (
                                    orders.data.map((wo) => (
                                        <tr key={wo.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition">
                                            <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">
                                                <div className="flex items-center gap-1.5">
                                                    <FileText className="w-3.5 h-3.5 text-amber-500" />
                                                    {wo.wo_number}
                                                </div>
                                                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                                                    {wo.status}
                                                </span>
                                            </td>

                                            <td className="py-3 px-4 font-bold text-gray-900 dark:text-white">
                                                {wo.unit?.unit_code}
                                                <div className="text-xs text-gray-400 font-normal">{wo.unit?.registration_number}</div>
                                            </td>

                                            <td className="py-3 px-4 text-xs text-gray-600 dark:text-gray-400">
                                                {wo.breakdown_time ? new Date(wo.breakdown_time).toLocaleString('id-ID') : '-'}
                                            </td>

                                            <td className="py-3 px-4 max-w-xs text-xs">
                                                <p className="font-medium text-gray-900 dark:text-white line-clamp-1">{wo.defect_summary}</p>
                                                <p className="text-amber-600 dark:text-amber-400 italic line-clamp-1">Root Cause: {wo.root_cause || '-'}</p>
                                            </td>

                                            <td className="py-3 px-4 text-xs font-semibold text-gray-800 dark:text-gray-200">
                                                {wo.mechanic?.name || '-'}
                                            </td>

                                            <td className="py-3 px-4 font-mono text-xs">
                                                {wo.downtime_minutes ? `${Math.round(wo.downtime_minutes / 60 * 10) / 10} h` : '-'}
                                            </td>

                                            <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                                                Rp {Number(wo.actual_cost || 0).toLocaleString('id-ID')}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="py-8 text-center text-gray-500 dark:text-gray-400">
                                            Tidak ada riwayat perbaikan CM yang sesuai kriteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {orders.links && (
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                            <Pagination links={orders.links} />
                        </div>
                    )}
                </Card>
            </div>
        </DashboardLayout>
    );
}
