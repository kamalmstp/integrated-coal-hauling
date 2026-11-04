import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import DashboardLayout from '../../components/templates/DashboardLayout';
import Card from '../../components/molecules/Card';
import Badge from '../../components/atoms/Badge';
import Button from '../../components/atoms/Button';
import Select from '../../components/atoms/Select';
import {
    TrendingUp,
    Truck,
    Clock,
    Scale,
    AlertCircle,
    CheckCircle2,
    XCircle,
    Target,
    BarChart3,
    ArrowUpRight,
    ArrowDownRight,
    Calendar,
    Users,
} from 'lucide-react';

export default function ProductionDashboard({
    site_id,
    sites = [],
    kpi = {},
    shift_breakdown = [],
    top_units = [],
    top_drivers = [],
    daily_chart = [],
    monthly_chart = [],
    active_dispatches = [],
}) {
    const [selectedSite, setSelectedSite] = useState(site_id || '');

    const handleSiteChange = (e) => {
        const val = e.target.value;
        setSelectedSite(val);
        router.get('/production/dashboard', { site_id: val }, { preserveState: true });
    };

    return (
        <DashboardLayout>
            <Head title="Production Dashboard — Coal Hauling TAP" />

            {/* Header & Site Filter */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="p-2 rounded-lg bg-emerald-600 text-white shadow-sm">
                            <TrendingUp className="w-5 h-5" />
                        </span>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Dashboard Produksi Coal Hauling
                            </h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Monitoring ritase, tonase resmi, pencapaian target, dan performa armada real-time
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="w-64">
                        <Select
                            value={selectedSite}
                            onChange={handleSiteChange}
                            options={[
                                { value: '', label: 'Pilih Site Tambang' },
                                ...sites.map((s) => ({ value: s.id, label: `${s.name} (${s.code})` })),
                            ]}
                        />
                    </div>
                    <Button
                        variant="secondary"
                        onClick={() => router.get('/production/tickets/verification-queue')}
                        className="relative"
                    >
                        <CheckCircle2 className="w-4 h-4 mr-2 text-amber-500" />
                        Antrean Verifikasi
                        {kpi.pending_verification_count > 0 && (
                            <span className="ml-2 px-1.5 py-0.5 text-xs font-semibold rounded-full bg-amber-500 text-white">
                                {kpi.pending_verification_count}
                            </span>
                        )}
                    </Button>
                </div>
            </div>

            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* 1. Tonase Hari Ini */}
                <Card className="p-5 border-l-4 border-l-emerald-500">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Produksi Hari Ini (Verified)
                        </span>
                        <span className="p-2 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                            <Scale className="w-4 h-4" />
                        </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-slate-900 dark:text-white">
                            {Number(kpi.today_tonnage || 0).toLocaleString('id-ID', { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-sm font-semibold text-slate-500">Ton</span>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                        <span className="text-slate-500">Total Ritase: <strong className="text-slate-900 dark:text-white">{kpi.today_ritase || 0} Rit</strong></span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">100% Verified</span>
                    </div>
                </Card>

                {/* 2. Target vs Realisasi Harian */}
                <Card className="p-5 border-l-4 border-l-blue-500">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Target Harian ({kpi.daily_achieve_pct || 0}%)
                        </span>
                        <span className="p-2 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                            <Target className="w-4 h-4" />
                        </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-slate-900 dark:text-white">
                            {Number(kpi.daily_target_ton || 0).toLocaleString('id-ID')}
                        </span>
                        <span className="text-sm font-semibold text-slate-500">Ton Target</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full mt-3 overflow-hidden">
                        <div
                            className={`h-full rounded-full ${kpi.daily_achieve_pct >= 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                            style={{ width: `${Math.min(kpi.daily_achieve_pct || 0, 100)}%` }}
                        />
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-slate-500">
                        <span>Aktual: {Number(kpi.today_tonnage || 0).toFixed(1)} T</span>
                        <span className={kpi.daily_variance >= 0 ? 'text-emerald-600 font-semibold' : 'text-amber-600 font-semibold'}>
                            {kpi.daily_variance >= 0 ? `+${kpi.daily_variance} T` : `${kpi.daily_variance} T`}
                        </span>
                    </div>
                </Card>

                {/* 3. Akumulasi Bulanan */}
                <Card className="p-5 border-l-4 border-l-purple-500">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Akumulasi Bulan Ini
                        </span>
                        <span className="p-2 rounded-full bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
                            <Calendar className="w-4 h-4" />
                        </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-slate-900 dark:text-white">
                            {Number(kpi.monthly_tonnage || 0).toLocaleString('id-ID', { minimumFractionDigits: 1 })}
                        </span>
                        <span className="text-sm font-semibold text-slate-500">Ton</span>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                        <span className="text-slate-500">Ritase: <strong className="text-slate-900 dark:text-white">{kpi.monthly_ritase || 0} Rit</strong></span>
                        <span className="text-purple-600 dark:text-purple-400 font-semibold">
                            {kpi.monthly_achieve_pct || 0}% Target
                        </span>
                    </div>
                </Card>

                {/* 4. Quality & Workflow Status */}
                <Card className="p-5 border-l-4 border-l-amber-500">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Status Validasi Tiket
                        </span>
                        <span className="p-2 rounded-full bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                            <AlertCircle className="w-4 h-4" />
                        </span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                        <div>
                            <span className="text-xs text-slate-500 block">Pending Verifikasi</span>
                            <span className="text-xl font-bold text-amber-600 dark:text-amber-400">
                                {kpi.pending_verification_count || 0} Tiket
                            </span>
                        </div>
                        <div className="text-right">
                            <span className="text-xs text-slate-500 block">Ditolak (Rejected)</span>
                            <span className="text-xl font-bold text-rose-600 dark:text-rose-400">
                                {kpi.rejected_count || 0} Tiket
                            </span>
                        </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 flex justify-between items-center">
                        <span>External Source: <strong>JSI Checker</strong></span>
                        <span className="text-slate-400">Auto Discrepancy</span>
                    </div>
                </Card>
            </div>

            {/* Shift Breakdown & Visual Timeline */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Produksi Per Shift Hari Ini */}
                <Card className="p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Clock className="w-4 h-4 text-emerald-600" />
                            Produksi Shift Hari Ini
                        </h2>
                        <Badge variant="outline">2 Shift 24 Jam</Badge>
                    </div>

                    <div className="space-y-4">
                        {shift_breakdown.length === 0 ? (
                            <p className="text-sm text-slate-400 text-center py-6">Belum ada tiket terverifikasi hari ini</p>
                        ) : (
                            shift_breakdown.map((s, idx) => (
                                <div key={idx} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{s.shift_name}</span>
                                        <Badge variant={idx === 0 ? 'success' : 'info'}>{s.ritase} Rit</Badge>
                                    </div>
                                    <div className="flex justify-between items-baseline text-xs text-slate-500">
                                        <span>Tonase Resmi:</span>
                                        <span className="text-base font-extrabold text-slate-900 dark:text-white">
                                            {Number(s.total_tonnage).toFixed(2)} Ton
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Active Dispatch Overview */}
                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                            Jadwal Dispatch Aktif Hari Ini
                        </h3>
                        {active_dispatches.length === 0 ? (
                            <p className="text-xs text-slate-400">Tidak ada jadwal dispatch aktif.</p>
                        ) : (
                            <div className="space-y-2">
                                {active_dispatches.map((d) => (
                                    <div key={d.id} className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded bg-slate-100 dark:bg-slate-800">
                                        <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">{d.dispatch_number}</span>
                                        <span className="text-slate-500">{d.shift?.name}</span>
                                        <Badge variant="primary">{d.assignments?.length || 0} DT Ditugaskan</Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </Card>

                {/* Grafik Tren Produksi Harian (14 Hari Terakhir) */}
                <Card className="p-5 lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <BarChart3 className="w-4 h-4 text-blue-600" />
                                Tren Produksi Harian (Tonase Resmi)
                            </h2>
                            <p className="text-xs text-slate-500">Data terverifikasi masuk rekap produksi TAP</p>
                        </div>
                    </div>

                    {daily_chart.length === 0 ? (
                        <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
                            Belum ada riwayat tonase harian.
                        </div>
                    ) : (
                        <div className="space-y-3 pt-2">
                            {daily_chart.map((d, idx) => {
                                const maxTon = Math.max(...daily_chart.map((item) => Number(item.tonnage) || 1));
                                const pct = Math.max((Number(d.tonnage) / maxTon) * 100, 5);
                                return (
                                    <div key={idx} className="flex items-center gap-3 text-xs">
                                        <span className="w-20 font-mono text-slate-500 shrink-0">{d.ticket_date}</span>
                                        <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-6 rounded-md overflow-hidden relative flex items-center">
                                            <div
                                                className="bg-gradient-to-r from-emerald-500 to-teal-600 h-full rounded-md transition-all duration-500"
                                                style={{ width: `${pct}%` }}
                                            />
                                            <span className="absolute right-3 font-semibold text-slate-700 dark:text-slate-200">
                                                {Number(d.tonnage).toLocaleString('id-ID')} Ton ({d.ritase} Rit)
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </Card>
            </div>

            {/* Top 10 Units & Top 10 Drivers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top 10 Armada Hauling */}
                <Card className="p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Truck className="w-4 h-4 text-indigo-600" />
                            Top 10 Armada Berdasarkan Tonase (Bulan Ini)
                        </h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
                                <tr>
                                    <th className="py-2.5 px-3">#</th>
                                    <th className="py-2.5 px-3">No. Lambung</th>
                                    <th className="py-2.5 px-3">Tipe</th>
                                    <th className="py-2.5 px-3 text-center">Ritase</th>
                                    <th className="py-2.5 px-3 text-right">Total Tonase</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {top_units.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="py-4 text-center text-slate-400">Belum ada data armada</td>
                                    </tr>
                                ) : (
                                    top_units.map((u, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                            <td className="py-2.5 px-3 font-bold text-slate-400">{idx + 1}</td>
                                            <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                                {u.unit_code}
                                            </td>
                                            <td className="py-2.5 px-3 text-slate-500">
                                                {u.unit_type === 'dump_truck_10' ? 'DT 10 Roda' : u.unit_type === 'dump_truck_12' ? 'DT 12 Roda' : u.unit_type}
                                            </td>
                                            <td className="py-2.5 px-3 text-center font-semibold">{u.total_ritase}</td>
                                            <td className="py-2.5 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                                                {Number(u.total_tonnage).toFixed(2)} T
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Top 10 Driver Hauling */}
                <Card className="p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Users className="w-4 h-4 text-purple-600" />
                            Top 10 Driver Berdasarkan Tonase (Bulan Ini)
                        </h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
                                <tr>
                                    <th className="py-2.5 px-3">#</th>
                                    <th className="py-2.5 px-3">Nama Driver</th>
                                    <th className="py-2.5 px-3">Status MCU</th>
                                    <th className="py-2.5 px-3 text-center">Ritase</th>
                                    <th className="py-2.5 px-3 text-right">Total Tonase</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {top_drivers.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="py-4 text-center text-slate-400">Belum ada data driver</td>
                                    </tr>
                                ) : (
                                    top_drivers.map((d, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                            <td className="py-2.5 px-3 font-bold text-slate-400">{idx + 1}</td>
                                            <td className="py-2.5 px-3">
                                                <div className="font-semibold text-slate-900 dark:text-white">{d.driver_name}</div>
                                                <div className="text-[10px] text-slate-400">{d.driver_code}</div>
                                            </td>
                                            <td className="py-2.5 px-3">
                                                <Badge variant={d.mcu_status === 'fit' ? 'success' : 'warning'}>
                                                    {d.mcu_status === 'fit' ? 'Fit Medis' : 'Fit Bersyarat'}
                                                </Badge>
                                            </td>
                                            <td className="py-2.5 px-3 text-center font-semibold">{d.total_ritase}</td>
                                            <td className="py-2.5 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                                                {Number(d.total_tonnage).toFixed(2)} T
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    );
}
