import React from 'react';
import { BarChart3, TrendingUp, Users, ArrowUpRight, Cpu, Layers } from 'lucide-react';
import DashboardLayout from '../../components/templates/DashboardLayout';

export default function AnalyticsIndex() {
    const atomicLevels = [
        {
            level: 'Atoms',
            color: 'bg-emerald-500',
            description: 'Elemen UI paling mendasar yang tidak dapat dipecah lagi.',
            items: ['Button', 'Input', 'Select', 'Badge', 'Label', 'Spinner', 'ToggleSwitch', 'Avatar'],
        },
        {
            level: 'Molecules',
            color: 'bg-indigo-500',
            description: 'Gabungan beberapa atom yang berfungsi bersama untuk tujuan spesifik.',
            items: ['SearchBar', 'FormField', 'StatCard', 'PaginationControls', 'NotificationToast', 'ConfirmModal', 'FilterDropdown', 'UserProfileDropdown'],
        },
        {
            level: 'Organisms',
            color: 'bg-purple-500',
            description: 'Komponen kompleks yang membentuk bagian utuh dari antarmuka.',
            items: ['Sidebar', 'Navbar', 'DataTable', 'AlertContainer', 'DashboardMetrics', 'QuickActionPanel'],
        },
        {
            level: 'Templates',
            color: 'bg-amber-500',
            description: 'Tata letak yang menggabungkan organisme ke dalam struktur halaman.',
            items: ['DashboardLayout'],
        },
        {
            level: 'Pages',
            color: 'bg-rose-500',
            description: 'Halaman konkret yang diisi dengan data aktual dari server Laravel.',
            items: ['Dashboard/Index', 'Users/Index (SSR)', 'Analytics/Index', 'Settings/Index'],
        },
    ];

    return (
        <DashboardLayout title="Arsitektur & Analytics" breadcrumbs={['Analytics']}>
            <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                    <div className="flex items-center gap-3 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
                        <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                            <Layers className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                Arsitektur React Atomic Design
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Struktur folder dan komponen modular yang terorganisir dari unit terkecil hingga halaman utuh.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {atomicLevels.map((atomic, idx) => (
                            <div
                                key={idx}
                                className="p-4 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`w-3 h-3 rounded-full ${atomic.color}`} />
                                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                                            {atomic.level}
                                        </h4>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                                        {atomic.description}
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
                                    {atomic.items.map((item, itemIdx) => (
                                        <span
                                            key={itemIdx}
                                            className="text-[10px] font-medium px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                                        >
                                            {item}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
