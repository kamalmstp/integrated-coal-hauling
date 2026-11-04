import React from 'react';
import { Link } from '@inertiajs/react';
import {
    Users,
    ArrowRight,
    TrendingUp,
    ShieldCheck,
    CheckCircle2,
    Calendar,
} from 'lucide-react';
import DashboardLayout from '../../components/templates/DashboardLayout';
import DashboardMetrics from '../../components/organisms/DashboardMetrics';
import QuickActionPanel from '../../components/organisms/QuickActionPanel';
import Avatar from '../../components/atoms/Avatar';
import Badge from '../../components/atoms/Badge';
import Button from '../../components/atoms/Button';

export default function DashboardIndex({
    metrics = [],
    recentUsers = [],
    chartData = [],
    counts = {},
}) {
    const getRoleBadge = (role) => {
        switch (role) {
            case 'admin':
                return <Badge variant="purple" size="sm">Admin</Badge>;
            case 'manager':
                return <Badge variant="primary" size="sm">Manager</Badge>;
            case 'editor':
                return <Badge variant="warning" size="sm">Editor</Badge>;
            default:
                return <Badge variant="default" size="sm">User</Badge>;
        }
    };

    return (
        <DashboardLayout title="Panel Dashboard" breadcrumbs={['Ringkasan']}>
            {/* Top Welcome Banner */}
            <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-800 text-white shadow-xl shadow-indigo-600/10">
                <div className="relative z-10 max-w-2xl">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-indigo-100 backdrop-blur-md mb-3">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Laravel 12 + Inertia React 19 + Zustand Ready
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                        Selamat Datang di Panel Dashboard
                    </h2>
                    <p className="mt-2 text-sm sm:text-base text-indigo-100 leading-relaxed">
                        Aplikasi telah dikonfigurasi menggunakan React Atomic Design, Zustand State Management,
                        Tailwind CSS Dark Mode, Laravel Notify Alert/Confirm, dan Server-Side Processing (SSR).
                    </p>
                    <div className="mt-6 flex flex-wrap items-center gap-3">
                        <Link href="/users">
                            <Button
                                variant="secondary"
                                icon={Users}
                                className="!bg-white !text-indigo-900 hover:!bg-indigo-50 font-semibold shadow-md"
                            >
                                Kelola Data Pengguna (SSR)
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Decorative background shapes */}
                <div className="absolute -right-12 -bottom-16 w-80 h-80 rounded-full bg-white/10 blur-2xl pointer-events-none" />
                <div className="absolute right-32 -top-12 w-64 h-64 rounded-full bg-indigo-400/20 blur-3xl pointer-events-none" />
            </div>

            {/* Organism: Dashboard Metrics */}
            <DashboardMetrics metrics={metrics} />

            {/* Organism: Quick Action Panel for Laravel Notify & Confirm testing */}
            <QuickActionPanel />

            {/* Split Content: Growth Visualization & Recent Users */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Visual Data Chart / Growth */}
                <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                                <TrendingUp className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                    Pertumbuhan Pengguna Terdaftar
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Visualisasi pendaftaran 6 bulan terakhir
                                </p>
                            </div>
                        </div>
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full">
                            +42% Kenaikan
                        </span>
                    </div>

                    {/* CSS Bar Chart Simulation */}
                    <div className="h-48 flex items-end justify-between gap-4 pt-6 px-2">
                        {chartData.map((item, idx) => {
                            const maxVal = Math.max(...chartData.map((d) => d.users), 50);
                            const heightPct = Math.round((item.users / maxVal) * 100);

                            return (
                                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                                    <div className="relative w-full flex items-end justify-center h-36">
                                        {/* Value tooltip on hover */}
                                        <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-1.5 py-0.5 rounded shadow">
                                            {item.users}
                                        </div>
                                        <div
                                            style={{ height: `${heightPct}%` }}
                                            className="w-full max-w-[36px] bg-gradient-to-t from-indigo-600 to-indigo-400 dark:from-indigo-500 dark:to-indigo-300 rounded-t-lg transition-all duration-500 group-hover:brightness-110"
                                        />
                                    </div>
                                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                                        {item.month}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Recent Users List */}
                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                Pengguna Baru
                            </h3>
                            <Link
                                href="/users"
                                className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                            >
                                <span>Lihat Semua</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>

                        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                            {recentUsers.map((user) => (
                                <div key={user.id} className="py-3 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <Avatar src={user.avatar} name={user.name} size="sm" />
                                        <div className="min-w-0">
                                            <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                                                {user.name}
                                            </p>
                                            <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                                                {user.email}
                                            </p>
                                        </div>
                                    </div>
                                    <div>{getRoleBadge(user.role)}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
                        <Link href="/users">
                            <Button variant="ghost" size="sm" className="w-full text-xs">
                                Kelola Database MySQL & SSR &rarr;
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
