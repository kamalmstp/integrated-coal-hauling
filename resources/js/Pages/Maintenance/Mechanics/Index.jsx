import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import DashboardLayout from '../../../components/templates/DashboardLayout';
import Card from '../../../components/molecules/Card';
import Button from '../../../components/atoms/Button';
import Modal from '../../../components/molecules/Modal';
import {
    Users,
    Smartphone,
    Clock,
    CheckCircle2,
    Search,
    Filter,
    RefreshCw,
    Wrench,
    Award,
    Activity,
    Phone,
    MapPin,
    Briefcase,
    Calendar,
    ArrowUpRight,
} from 'lucide-react';

export default function MechanicIndex({
    mechanics = [],
    metrics = {},
    recentLogs = [],
    filters = {},
    master = {},
}) {
    const [search, setSearch] = useState(filters.search || '');
    const [siteId, setSiteId] = useState(filters.site_id || '');

    const handleFilter = (e) => {
        e.preventDefault();
        router.get('/maintenance/mechanics', {
            site_id: siteId || undefined,
            search: search || undefined,
        }, { preserveState: true });
    };

    const handleReset = () => {
        setSearch('');
        setSiteId('');
        router.get('/maintenance/mechanics');
    };

    return (
        <DashboardLayout>
            <Head title="Mechanic Management & Work Log — TAP Workshop" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                            <Users className="w-7 h-7 text-cyan-500" />
                            Mechanic Management & Daily Work Logs
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Pengelolaan personel mekanik workshop, pembagian penugasan, pemantauan jam kerja nyata, dan integrasi biaya labor.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link
                            href="/maintenance/mechanic-portal"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-lg font-semibold text-sm shadow-md transition"
                        >
                            <Smartphone className="w-4 h-4" />
                            Buka Mobile HP Mechanic Portal
                            <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>

                {/* Banner Mobile Portal */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-900/20 via-blue-900/10 to-transparent border border-cyan-300 dark:border-cyan-800 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-600 dark:text-cyan-400">
                            <Smartphone className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                                Antarmuka Mobile Ponsel Khusus Mekanik Lapangan & Workshop
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                Mekanik dapat langsung mengakses HP di lapangan untuk input diagnosa, durasi pengerjaan, foto perbaikan, dan submit status WO secara cepat tanpa repot.
                            </p>
                        </div>
                    </div>
                    <Link
                        href="/maintenance/mechanic-portal"
                        className="px-3.5 py-1.5 text-xs font-bold text-cyan-700 dark:text-cyan-300 bg-cyan-100 dark:bg-cyan-950/60 rounded-lg hover:bg-cyan-200 transition flex items-center gap-1.5 whitespace-nowrap"
                    >
                        Pelajari / Uji Tampilan Mobile &rarr;
                    </Link>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Card className="p-4 border-l-4 border-l-cyan-500">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Total Personel Mekanik</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{metrics.total_mechanics || 0}</p>
                        <p className="text-xs text-gray-400 mt-0.5">Departemen Plant & Workshop</p>
                    </Card>

                    <Card className="p-4 border-l-4 border-l-amber-500">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Mekanik Aktif Menangani WO</p>
                        <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{metrics.active_mechanics || 0}</p>
                        <p className="text-xs text-gray-400 mt-0.5">Sedang dalam penugasan aktif</p>
                    </Card>

                    <Card className="p-4 border-l-4 border-l-green-500">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Mekanik Standby / Siap Tugas</p>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{metrics.idle_mechanics || 0}</p>
                        <p className="text-xs text-gray-400 mt-0.5">Tersedia untuk assignment baru</p>
                    </Card>

                    <Card className="p-4 border-l-4 border-l-blue-500">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Total Akumulasi Jam Kerja</p>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{metrics.total_working_hours || 0} Jam</p>
                        <p className="text-xs text-gray-400 mt-0.5">Tercatat dalam work log resmi</p>
                    </Card>
                </div>

                {/* Filter */}
                <Card className="p-4">
                    <form onSubmit={handleFilter} className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div className="relative md:col-span-2">
                            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari nama mekanik, NIK/ID, no telepon..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            />
                        </div>

                        <div>
                            <select
                                value={siteId}
                                onChange={(e) => setSiteId(e.target.value)}
                                className="w-full py-2 px-3 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            >
                                <option value="">Semua Site / Basecamp</option>
                                {master.sites?.map((s) => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
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

                {/* Mechanics Roster Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {mechanics.length > 0 ? (
                        mechanics.map((mech) => (
                            <Card key={mech.id} className="p-4 hover:shadow-md transition">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 flex items-center justify-center font-bold text-lg">
                                            {mech.name.slice(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 dark:text-white text-base">{mech.name}</h4>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{mech.employee_code}</p>
                                        </div>
                                    </div>

                                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${mech.active_jobs > 0 ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' : 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'}`}>
                                        {mech.active_jobs > 0 ? `${mech.active_jobs} Aktif` : 'Standby'}
                                    </span>
                                </div>

                                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 text-xs space-y-1.5">
                                    <div className="flex items-center text-gray-600 dark:text-gray-300 gap-2">
                                        <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                                        <span>{mech.position_title}</span>
                                    </div>
                                    <div className="flex items-center text-gray-600 dark:text-gray-300 gap-2">
                                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                        <span>{mech.site_name}</span>
                                    </div>
                                    <div className="flex items-center text-gray-600 dark:text-gray-300 gap-2">
                                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                                        <span>{mech.phone || '0812-XXXX-XXXX'}</span>
                                    </div>
                                </div>

                                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 grid grid-cols-2 gap-2 text-center text-xs">
                                    <div className="bg-gray-50 dark:bg-gray-800/60 p-2 rounded-lg">
                                        <p className="text-gray-400">Total Jam Kerja</p>
                                        <p className="font-bold text-gray-900 dark:text-white text-sm font-mono mt-0.5">{mech.total_working_hours} h</p>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-800/60 p-2 rounded-lg">
                                        <p className="text-gray-400">WO Terselesaikan</p>
                                        <p className="font-bold text-emerald-600 dark:text-emerald-400 text-sm font-mono mt-0.5">{mech.completed_jobs} WO</p>
                                    </div>
                                </div>

                                <div className="mt-3">
                                    <Link
                                        href={`/maintenance/mechanic-portal?mechanic_id=${mech.id}`}
                                        className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-cyan-50 dark:hover:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 rounded-lg text-xs font-semibold transition"
                                    >
                                        <Smartphone className="w-3.5 h-3.5" /> Buka Log & Tugas Mekanik Ini
                                    </Link>
                                </div>
                            </Card>
                        ))
                    ) : (
                        <div className="col-span-3 py-8 text-center text-gray-500">
                            Tidak ditemukan mekanik yang sesuai filter pencarian.
                        </div>
                    )}
                </div>

                {/* Recent Work Logs Table */}
                <Card className="overflow-hidden">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Clock className="w-4 h-4 text-cyan-500" />
                            Log Jam Kerja Mekanik Terbaru (Work Logs)
                        </h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    <th className="py-3 px-4">Tanggal & Jam</th>
                                    <th className="py-3 px-4">Mekanik</th>
                                    <th className="py-3 px-4">Work Order & Unit</th>
                                    <th className="py-3 px-4">Tindakan / Action Taken</th>
                                    <th className="py-3 px-4 text-center">Durasi Kerja</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                                {recentLogs?.length > 0 ? (
                                    recentLogs.map((log) => (
                                        <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition">
                                            <td className="py-3 px-4 whitespace-nowrap text-xs text-gray-600 dark:text-gray-400 font-mono">
                                                {log.log_date} ({log.start_time?.slice(0, 5)} - {log.end_time?.slice(0, 5)})
                                            </td>

                                            <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">
                                                {log.mechanic?.name || '-'}
                                                <div className="text-[11px] text-gray-400 font-normal">{log.mechanic?.employee_code}</div>
                                            </td>

                                            <td className="py-3 px-4 text-xs">
                                                <span className="font-bold text-amber-600">{log.work_order?.wo_number}</span>
                                                <div className="text-gray-500">Unit: {log.work_order?.unit?.unit_code}</div>
                                            </td>

                                            <td className="py-3 px-4 max-w-md text-xs">
                                                <p className="text-gray-900 dark:text-white font-medium">{log.action_taken}</p>
                                                <p className="text-gray-500 dark:text-gray-400 italic text-[11px] mt-0.5">Diagnosa: {log.diagnosis || '-'}</p>
                                            </td>

                                            <td className="py-3 px-4 text-center font-bold text-cyan-600 dark:text-cyan-400 font-mono text-sm">
                                                {log.duration_hours} h
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="py-8 text-center text-gray-500 dark:text-gray-400">
                                            Belum ada log pengerjaan mekanik yang tercatat.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    );
}
