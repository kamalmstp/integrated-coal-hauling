import React from 'react';
import { Link } from '@inertiajs/react';
import {
    Truck,
    UserCheck,
    Users,
    Target,
    ArrowRight,
    TrendingUp,
    ShieldCheck,
    CheckCircle2,
    Calendar,
    Wrench,
    AlertTriangle,
    Layers,
    Building2,
    MapPin,
    Clock,
    Briefcase,
} from 'lucide-react';
import DashboardLayout from '../../components/templates/DashboardLayout';
import DashboardMetrics from '../../components/organisms/DashboardMetrics';
import QuickActionPanel from '../../components/organisms/QuickActionPanel';
import Avatar from '../../components/atoms/Avatar';
import Badge from '../../components/atoms/Badge';
import Button from '../../components/atoms/Button';

export default function DashboardIndex({
    metrics = [],
    recentUnits = [],
    recentDrivers = [],
    chartData = [],
    unitStatusCounts = {},
    driverStatusCounts = {},
}) {
    const getUnitStatusBadge = (status) => {
        switch (status) {
            case 'operating':
                return <Badge variant="success" size="sm" dot>Operating</Badge>;
            case 'standby':
                return <Badge variant="primary" size="sm" dot>Standby</Badge>;
            case 'maintenance':
                return <Badge variant="warning" size="sm" dot>Maintenance</Badge>;
            case 'breakdown':
            default:
                return <Badge variant="danger" size="sm" dot>Breakdown</Badge>;
        }
    };

    const getDriverMcuBadge = (mcu) => {
        switch (mcu) {
            case 'fit':
                return <Badge variant="success" size="sm">MCU Fit</Badge>;
            case 'fit_with_note':
                return <Badge variant="warning" size="sm">Fit Bersyarat</Badge>;
            case 'unfit':
            default:
                return <Badge variant="danger" size="sm">Unfit</Badge>;
        }
    };

    const modules = [
        { name: 'Organisasi & Site', href: '/organization', icon: Building2, count: '2 Site, 5 Dept', color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950' },
        { name: 'Armada & Unit', href: '/master/units', icon: Truck, count: `${unitStatusCounts.total || 0} Unit Terdaftar`, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950' },
        { name: 'Driver & SIMPER', href: '/master/drivers', icon: UserCheck, count: `${driverStatusCounts.total || 0} Driver K3LH`, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950' },
        { name: 'Lokasi & Rute', href: '/master/locations', icon: MapPin, count: 'Pit to Jetty KM 0-49', color: 'text-purple-600 bg-purple-50 dark:bg-purple-950' },
        { name: 'Shift Operasional', href: '/master/shifts', icon: Clock, count: 'Shift 1, 2 & Long Shift', color: 'text-blue-600 bg-blue-50 dark:bg-blue-950' },
        { name: 'Mitra & Vendor', href: '/master/vendors', icon: Briefcase, count: 'Spareparts, Fuel, Tyre', color: 'text-rose-600 bg-rose-50 dark:bg-rose-950' },
    ];

    return (
        <DashboardLayout title="Panel Dashboard Operasional" breadcrumbs={['Ringkasan Operasional']}>
            {/* Top Welcome Banner */}
            <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-600 via-amber-700 to-indigo-900 text-white shadow-xl shadow-amber-600/10">
                <div className="relative z-10 max-w-3xl">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-amber-100 backdrop-blur-md mb-3">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        TAP Integrated Coal Hauling Management System — Phase 1 Foundation
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                        PT TEKNINDO ADHYA PANE
                    </h2>
                    <p className="mt-2 text-sm sm:text-base text-amber-100 leading-relaxed">
                        Pusat kendali master data operasional pengangkutan batubara terpadu:
                        Organisasi, Armada Unit Hauling, Driver & SIMPER K3LH, Lokasi Pit-to-Port, dan Role-Based Access Control.
                    </p>
                    <div className="mt-5 flex flex-wrap items-center gap-3">
                        <Link href="/master/units">
                            <Button
                                variant="secondary"
                                icon={Truck}
                                className="!bg-white !text-slate-900 hover:!bg-amber-50 font-bold shadow-md"
                            >
                                Kelola Armada Hauling
                            </Button>
                        </Link>
                        <Link href="/master/drivers">
                            <Button
                                variant="outline"
                                icon={UserCheck}
                                className="!border-white/40 !text-white hover:!bg-white/10"
                            >
                                Kesiapan Driver & MCU
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Decorative background shapes */}
                <div className="absolute -right-12 -bottom-16 w-80 h-80 rounded-full bg-white/10 blur-2xl pointer-events-none" />
                <div className="absolute right-32 -top-12 w-64 h-64 rounded-full bg-amber-400/20 blur-3xl pointer-events-none" />
            </div>

            {/* Quick Master Data Navigation Shortcuts */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {modules.map((m, idx) => {
                    const Icon = m.icon;
                    return (
                        <Link
                            key={idx}
                            href={m.href}
                            className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-indigo-500 hover:shadow-md transition-all group"
                        >
                            <div className={`p-2 rounded-xl w-fit ${m.color} mb-2.5`}>
                                <Icon className="w-4 h-4" />
                            </div>
                            <h4 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">
                                {m.name}
                            </h4>
                            <p className="text-[10px] text-slate-400 truncate mt-0.5">{m.count}</p>
                        </Link>
                    );
                })}
            </div>

            {/* Key Operational Metrics */}
            <DashboardMetrics metrics={metrics} />

            {/* Operational Health Gauges */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Fleet Availability Gauge */}
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                                <Truck className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                    Physical Availability (PA) Armada
                                </h3>
                                <p className="text-[11px] text-slate-400">Status kesiapan operasional seluruh armada dump truck</p>
                            </div>
                        </div>
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                            {unitStatusCounts.operating || 0} Operating
                        </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 pt-2 text-center text-xs">
                        <div className="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900">
                            <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold block">OPERATING</span>
                            <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">{unitStatusCounts.operating || 0}</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900">
                            <span className="text-[10px] text-indigo-700 dark:text-indigo-300 font-bold block">STANDBY</span>
                            <span className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400">{unitStatusCounts.standby || 0}</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900">
                            <span className="text-[10px] text-amber-700 dark:text-amber-300 font-bold block">SERVICE</span>
                            <span className="text-lg font-extrabold text-amber-600 dark:text-amber-400">{unitStatusCounts.maintenance || 0}</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900">
                            <span className="text-[10px] text-rose-700 dark:text-rose-300 font-bold block">BREAKDOWN</span>
                            <span className="text-lg font-extrabold text-rose-600 dark:text-rose-400">{unitStatusCounts.breakdown || 0}</span>
                        </div>
                    </div>
                </div>

                {/* Driver K3LH Safety & MCU Gauge */}
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                                <ShieldCheck className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                    Kepatuhan K3LH & Status MCU Driver
                                </h3>
                                <p className="text-[11px] text-slate-400">Hasil medical check-up dan izin mengemudi SIMPER</p>
                            </div>
                        </div>
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                            {driverStatusCounts.fit || 0} Laik Kerja
                        </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2.5 pt-2 text-center text-xs">
                        <div className="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900">
                            <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold block">FIT OPERASI</span>
                            <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">{driverStatusCounts.fit || 0}</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900">
                            <span className="text-[10px] text-amber-700 dark:text-amber-300 font-bold block">BERSYARAT</span>
                            <span className="text-lg font-extrabold text-amber-600 dark:text-amber-400">{driverStatusCounts.fit_with_note || 0}</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900">
                            <span className="text-[10px] text-rose-700 dark:text-rose-300 font-bold block">UNFIT (STOP)</span>
                            <span className="text-lg font-extrabold text-rose-600 dark:text-rose-400">{driverStatusCounts.unfit || 0}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Action Panel for Laravel Notify & Confirm testing */}
            <QuickActionPanel />

            {/* Split Content: Recent Units & Recent Drivers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Units */}
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Truck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Armada Hauling Terbaru</h3>
                        </div>
                        <Link href="/master/units" className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
                            Lihat Semua Unit &rarr;
                        </Link>
                    </div>

                    <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                        {recentUnits.map((unit) => (
                            <div key={unit.id} className="py-2.5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-mono font-bold text-indigo-600 dark:text-indigo-400">
                                        {unit.unit_code.substring(0, 2)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-white font-mono">{unit.unit_code}</p>
                                        <p className="text-[11px] text-slate-400">{unit.brand} {unit.model} ({unit.registration_number})</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    {getUnitStatusBadge(unit.status)}
                                    <p className="text-[10px] font-mono text-slate-400 mt-1">{Number(unit.last_hm).toLocaleString()} HM</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Drivers */}
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Status Driver & K3LH</h3>
                        </div>
                        <Link href="/master/drivers" className="text-xs text-emerald-600 hover:underline flex items-center gap-1">
                            Lihat Semua Driver &rarr;
                        </Link>
                    </div>

                    <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                        {recentDrivers.map((driver) => (
                            <div key={driver.id} className="py-2.5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Avatar name={driver.employee?.name || 'Driver'} size="sm" />
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-white">{driver.employee?.name || '-'}</p>
                                        <p className="text-[11px] font-mono text-amber-600 dark:text-amber-400">{driver.driver_code} | SIM {driver.sim_type}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    {getDriverMcuBadge(driver.mcu_status)}
                                    <p className="text-[10px] font-mono text-slate-400 mt-1">{driver.simper_number}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
