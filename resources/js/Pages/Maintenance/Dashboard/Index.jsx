import React, { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import DashboardLayout from '../../../components/templates/DashboardLayout';
import Card from '../../../components/molecules/Card';
import Button from '../../../components/atoms/Button';
import {
    Wrench,
    AlertOctagon,
    Clock,
    Truck,
    TrendingUp,
    CheckCircle2,
    DollarSign,
    CalendarClock,
    Filter,
    RefreshCw,
    ShieldAlert,
    Activity,
    ChevronRight,
    PackageCheck,
    Coins,
    CheckSquare,
    AlertTriangle,
} from 'lucide-react';

export default function MaintenanceDashboardIndex({
    metrics = {},
    topBreakdownUnits = [],
    recentWorkOrders = [],
    filters = {},
    master = {},
}) {
    const [siteId, setSiteId] = useState(filters.site_id || '');
    const [unitId, setUnitId] = useState(filters.unit_id || '');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const [status, setStatus] = useState(filters.status || '');
    const [jobType, setJobType] = useState(filters.job_type || '');
    const [priority, setPriority] = useState(filters.priority || '');

    const handleFilter = (e) => {
        e?.preventDefault();
        router.get('/maintenance/dashboard', {
            site_id: siteId,
            unit_id: unitId,
            date_from: dateFrom,
            date_to: dateTo,
            status,
            job_type: jobType,
            priority,
        }, { preserveState: true, preserveScroll: true });
    };

    const handleReset = () => {
        setSiteId('');
        setUnitId('');
        setDateFrom('');
        setDateTo('');
        setStatus('');
        setJobType('');
        setPriority('');
        router.get('/maintenance/dashboard');
    };

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);
    };

    const getStatusBadge = (st) => {
        switch (st) {
            case 'open':
            case 'submitted':
            case 'assigned':
                return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">Antre ({st})</span>;
            case 'in_progress':
                return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 animate-pulse">In Progress</span>;
            case 'waiting_sparepart':
                return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">Tunggu Part</span>;
            case 'waiting_inspection':
                return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">Uji QC / RFU</span>;
            case 'completed':
            case 'closed':
                return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">Selesai (RFU)</span>;
            default:
                return <span className="px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-800">{st}</span>;
        }
    };

    return (
        <DashboardLayout>
            <Head title="Maintenance & Workshop Dashboard - TAP" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div>
                        <div className="flex items-center space-x-3">
                            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                                <Wrench className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                                    Maintenance & Workshop Management Dashboard
                                </h1>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Pusat kendali bengkel, pelacakan breakdown, jadwal servis PM/CM, penugasan mekanik, dan otorisasi RFU
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3 w-full sm:w-auto">
                        <Link href="/maintenance/breakdowns">
                            <Button variant="danger" className="flex items-center space-x-1.5">
                                <AlertOctagon className="w-4 h-4" />
                                <span>Lapor Kerusakan</span>
                            </Button>
                        </Link>
                        <Link href="/maintenance/work-orders">
                            <Button variant="primary" className="flex items-center space-x-1.5">
                                <CheckSquare className="w-4 h-4" />
                                <span>Buat SPK / WO Baru</span>
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* KPI Metrics Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                    <Card className="p-4 bg-white dark:bg-slate-800 border-l-4 border-l-rose-500">
                        <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">Unit Breakdown</p>
                        <div className="flex items-baseline justify-between mt-2">
                            <span className="text-2xl font-black text-rose-600 dark:text-rose-400">{metrics.breakdown_units || 0}</span>
                            <span className="text-xs text-rose-500">Armada</span>
                        </div>
                    </Card>

                    <Card className="p-4 bg-white dark:bg-slate-800 border-l-4 border-l-amber-500">
                        <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Under Maintenance</p>
                        <div className="flex items-baseline justify-between mt-2">
                            <span className="text-2xl font-black text-amber-600 dark:text-amber-400">{metrics.under_maintenance || 0}</span>
                            <span className="text-xs text-amber-500">Di Workshop</span>
                        </div>
                    </Card>

                    <Card className="p-4 bg-white dark:bg-slate-800 border-l-4 border-l-purple-500">
                        <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Tunggu Part / QC</p>
                        <div className="flex items-baseline justify-between mt-2">
                            <span className="text-2xl font-black text-purple-600 dark:text-purple-400">
                                {(metrics.waiting_spareparts || 0) + (metrics.waiting_inspection || 0)}
                            </span>
                            <span className="text-xs text-purple-500">Part: {metrics.waiting_spareparts || 0} | QC: {metrics.waiting_inspection || 0}</span>
                        </div>
                    </Card>

                    <Card className="p-4 bg-white dark:bg-slate-800 border-l-4 border-l-blue-500">
                        <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Total WO Berjalan</p>
                        <div className="flex items-baseline justify-between mt-2">
                            <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                                {(metrics.open_wo || 0) + (metrics.in_progress_wo || 0)}
                            </span>
                            <span className="text-xs text-blue-500">SPK Aktif</span>
                        </div>
                    </Card>

                    <Card className="p-4 bg-white dark:bg-slate-800 border-l-4 border-l-cyan-500">
                        <p className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">Jadwal PM Alert</p>
                        <div className="flex items-baseline justify-between mt-2">
                            <span className="text-2xl font-black text-cyan-600 dark:text-cyan-400">
                                {(metrics.pm_due_soon || 0) + (metrics.pm_overdue || 0)}
                            </span>
                            <span className="text-xs text-cyan-500">Lewat: {metrics.pm_overdue || 0}</span>
                        </div>
                    </Card>

                    <Card className="p-4 bg-white dark:bg-slate-800 border-l-4 border-l-emerald-500">
                        <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Downtime Total</p>
                        <div className="flex items-baseline justify-between mt-2">
                            <span className="text-2xl font-black text-slate-900 dark:text-white">{metrics.downtime_hours || 0}</span>
                            <span className="text-xs text-slate-400">Jam Mati</span>
                        </div>
                    </Card>
                </div>

                {/* Filter Bar */}
                <Card className="p-5 bg-white dark:bg-slate-800">
                    <form onSubmit={handleFilter} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Site Proyek</label>
                            <select
                                value={siteId}
                                onChange={(e) => setSiteId(e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            >
                                <option value="">Semua Site</option>
                                {master.sites?.map((s) => (
                                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Pilih Unit</label>
                            <select
                                value={unitId}
                                onChange={(e) => setUnitId(e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            >
                                <option value="">Semua Unit</option>
                                {master.units?.map((u) => (
                                    <option key={u.id} value={u.id}>{u.unit_code} ({u.status})</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Jenis Pekerjaan</label>
                            <select
                                value={jobType}
                                onChange={(e) => setJobType(e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            >
                                <option value="">Semua Jenis</option>
                                <option value="preventive_maintenance">Preventive Maintenance (PM)</option>
                                <option value="corrective_maintenance">Corrective Maintenance (CM)</option>
                                <option value="emergency_repair">Emergency Repair</option>
                                <option value="tire_maintenance">Tire Maintenance</option>
                                <option value="electrical_repair">Electrical Repair</option>
                                <option value="general_repair">General Repair</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Prioritas</label>
                            <select
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            >
                                <option value="">Semua Prioritas</option>
                                <option value="critical_emergency">Critical Emergency</option>
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Status WO</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            >
                                <option value="">Semua Status</option>
                                <option value="open">Open (Antre)</option>
                                <option value="in_progress">In Progress</option>
                                <option value="waiting_sparepart">Waiting Sparepart</option>
                                <option value="waiting_inspection">Waiting Inspection (QC)</option>
                                <option value="completed">Completed (RFU)</option>
                            </select>
                        </div>

                        <div className="flex items-end space-x-2">
                            <Button type="submit" variant="primary" className="flex-1 flex items-center justify-center space-x-1">
                                <Filter className="w-4 h-4" />
                                <span>Filter</span>
                            </Button>
                            <Button type="button" variant="secondary" onClick={handleReset}>
                                Reset
                            </Button>
                        </div>
                    </form>
                </Card>

                {/* Cost Tracking & Highlights Strip */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="p-6 bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-md">
                        <div className="flex justify-between items-start">
                            <div>
                                <span className="text-xs uppercase font-bold tracking-wider text-amber-100">
                                    Total Biaya Maintenance (Aktual)
                                </span>
                                <h3 className="text-3xl font-black mt-2">
                                    {formatCurrency(metrics.actual_cost)}
                                </h3>
                                <p className="text-xs text-amber-100 mt-1">
                                    Estimasi Awal: {formatCurrency(metrics.estimated_cost)}
                                </p>
                            </div>
                            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                                <Coins className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-white/20 flex justify-between text-xs text-amber-100">
                            <span>Suku Cadang: {formatCurrency(metrics.sparepart_cost)}</span>
                            <span>Upah Mekanik: {formatCurrency(metrics.labor_cost)}</span>
                        </div>
                    </Card>

                    <Card className="p-6 bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md">
                        <div className="flex justify-between items-start">
                            <div>
                                <span className="text-xs uppercase font-bold tracking-wider text-blue-100">
                                    Efektivitas Servis PM (Completion Rate)
                                </span>
                                <h3 className="text-3xl font-black mt-2">
                                    {metrics.completed_wo > 0 && metrics.total_wo > 0 ? Math.round(((metrics.completed_wo / metrics.total_wo) * 100) * 10) / 10 : 100}%
                                </h3>
                                <p className="text-xs text-blue-100 mt-1">
                                    {metrics.completed_wo || 0} dari {metrics.total_wo || 0} SPK Terselesaikan
                                </p>
                            </div>
                            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                                <CheckCircle2 className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-white/20 flex justify-between text-xs text-blue-100">
                            <span>Jadwal Normal: {metrics.pm_normal || 0}</span>
                            <span>Jadwal Lewat: {metrics.pm_overdue || 0}</span>
                        </div>
                    </Card>

                    <Card className="p-6 bg-gradient-to-br from-rose-600 to-rose-700 text-white shadow-md">
                        <div className="flex justify-between items-start">
                            <div>
                                <span className="text-xs uppercase font-bold tracking-wider text-rose-100">
                                    Armada Kritis & Kunci Operasi
                                </span>
                                <h3 className="text-3xl font-black mt-2">
                                    {metrics.breakdown_units || 0} Unit
                                </h3>
                                <p className="text-xs text-rose-100 mt-1">
                                    Terkunci dari Daily Dispatch demi Keselamatan Tambang
                                </p>
                            </div>
                            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                                <ShieldAlert className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-white/20 flex justify-between text-xs text-rose-100">
                            <span>Menunggu Part: {metrics.waiting_spareparts || 0}</span>
                            <span>Menunggu QC: {metrics.waiting_inspection || 0}</span>
                        </div>
                    </Card>
                </div>

                {/* 2-Column Section: Top Breakdown Units & Recent Work Orders */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top 10 Breakdown Units */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 space-y-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center space-x-2">
                                    <AlertOctagon className="w-5 h-5 text-rose-600" />
                                    <span>Top Unit Berdasarkan Frekuensi Kerusakan</span>
                                </h3>
                                <p className="text-xs text-slate-500">Evaluasi keandalan dan prioritas overhaul armada</p>
                            </div>
                            <Link href="/maintenance/corrective" className="text-xs font-semibold text-blue-600 hover:underline flex items-center">
                                <span>Analisis CM</span>
                                <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                            </Link>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 font-semibold text-slate-600 dark:text-slate-300">
                                        <th className="py-2.5 px-3">Armada Unit</th>
                                        <th className="py-2.5 px-3">Tipe</th>
                                        <th className="py-2.5 px-3">Status</th>
                                        <th className="py-2.5 px-3 text-center">Frekuensi Breakdown</th>
                                        <th className="py-2.5 px-3 text-right">Total Downtime</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {topBreakdownUnits.length > 0 ? (
                                        topBreakdownUnits.map((u, idx) => (
                                            <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                                <td className="py-2.5 px-3">
                                                    <span className="font-bold text-slate-900 dark:text-white block">{u.unit_code}</span>
                                                    <span className="text-[11px] text-slate-400 font-mono">{u.registration_number}</span>
                                                </td>
                                                <td className="py-2.5 px-3 capitalize text-slate-600 dark:text-slate-300">
                                                    {u.unit_type?.replace('_', ' ')}
                                                </td>
                                                <td className="py-2.5 px-3">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                                        u.status === 'breakdown' ? 'bg-rose-100 text-rose-800' :
                                                        u.status === 'maintenance' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                                                    }`}>
                                                        {u.status}
                                                    </span>
                                                </td>
                                                <td className="py-2.5 px-3 text-center font-bold font-mono text-rose-600">
                                                    {u.breakdown_count} Kali
                                                </td>
                                                <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-700 dark:text-slate-200">
                                                    {u.downtime_hours} Jam
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="py-6 text-center text-slate-400">Belum ada riwayat kerusakan unit pada periode ini.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Recent Work Orders */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 space-y-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center space-x-2">
                                    <Clock className="w-5 h-5 text-blue-600" />
                                    <span>Work Order Workshop Terkini</span>
                                </h3>
                                <p className="text-xs text-slate-500">Aktivitas perbaikan dan servis yang sedang berjalan</p>
                            </div>
                            <Link href="/maintenance/work-orders" className="text-xs font-semibold text-blue-600 hover:underline flex items-center">
                                <span>Lihat Semua SPK</span>
                                <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                            </Link>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 font-semibold text-slate-600 dark:text-slate-300">
                                        <th className="py-2.5 px-3">No. WO & Unit</th>
                                        <th className="py-2.5 px-3">Jenis Pekerjaan</th>
                                        <th className="py-2.5 px-3">Mekanik PIC</th>
                                        <th className="py-2.5 px-3 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {recentWorkOrders.length > 0 ? (
                                        recentWorkOrders.map((wo) => (
                                            <tr key={wo.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                                <td className="py-2.5 px-3">
                                                    <span className="font-mono font-bold text-slate-900 dark:text-white block">{wo.wo_number}</span>
                                                    <span className="text-[11px] text-emerald-600 font-bold">{wo.unit?.unit_code}</span>
                                                </td>
                                                <td className="py-2.5 px-3 capitalize text-slate-600 dark:text-slate-300">
                                                    {wo.job_type?.replace(/_/g, ' ')}
                                                </td>
                                                <td className="py-2.5 px-3 text-slate-700 dark:text-slate-200">
                                                    {wo.mechanic?.name || 'Belum Ditugaskan'}
                                                </td>
                                                <td className="py-2.5 px-3 text-right">
                                                    {getStatusBadge(wo.status)}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="py-6 text-center text-slate-400">Belum ada Work Order tercatat.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
