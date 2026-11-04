import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    Users,
    BarChart3,
    Settings,
    ChevronLeft,
    Sparkles,
    Shield,
    X,
} from 'lucide-react';
import { useSidebarStore } from '../../stores/useSidebarStore';

export default function Sidebar() {
    const { url } = usePage();
    const { isCollapsed, toggleCollapse, isMobileOpen, closeMobile } = useSidebarStore();

    const navigation = [
        {
            name: 'Dashboard',
            href: '/dashboard',
            icon: LayoutDashboard,
            active: url.startsWith('/dashboard') || url === '/',
        },
        {
            name: 'Data Pengguna (SSR)',
            href: '/users',
            icon: Users,
            badge: 'SSR',
            badgeColor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
            active: url.startsWith('/users'),
        },
        {
            name: 'Analytics',
            href: '/analytics',
            icon: BarChart3,
            active: url.startsWith('/analytics'),
        },
        {
            name: 'Pengaturan',
            href: '/settings',
            icon: Settings,
            active: url.startsWith('/settings'),
        },
    ];

    const sidebarContent = (
        <div className="flex flex-col h-full justify-between">
            {/* Top Brand & Links */}
            <div>
                {/* Brand Header */}
                <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200/80 dark:border-slate-800">
                    <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        {!isCollapsed && (
                            <div className="flex flex-col">
                                <span className="font-bold text-sm text-slate-900 dark:text-white tracking-tight">
                                    Laravel 12
                                </span>
                                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold tracking-wider uppercase">
                                    Atomic Dashboard
                                </span>
                            </div>
                        )}
                    </Link>

                    {/* Mobile close button */}
                    <button
                        type="button"
                        onClick={closeMobile}
                        className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation Links */}
                <nav className="p-3 space-y-1">
                    <div className={`px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 ${isCollapsed ? 'hidden' : 'block'}`}>
                        Menu Utama
                    </div>

                    {navigation.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={closeMobile}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group relative ${
                                    item.active
                                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200 dark:shadow-none'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                                }`}
                                title={isCollapsed ? item.name : undefined}
                            >
                                <Icon className={`w-4 h-4 shrink-0 ${item.active ? 'text-white' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
                                {!isCollapsed && <span className="flex-1 truncate">{item.name}</span>}
                                {!isCollapsed && item.badge && (
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${item.badgeColor || 'bg-slate-100 text-slate-700'}`}>
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Bottom Section */}
            <div className="p-3 border-t border-slate-200/80 dark:border-slate-800 space-y-2">
                {!isCollapsed && (
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/40 flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                            <Shield className="w-4 h-4" />
                        </div>
                        <div className="text-[11px] leading-tight">
                            <p className="font-semibold text-slate-800 dark:text-slate-200">Zustand + SSR</p>
                            <p className="text-slate-400 text-[10px]">React Atomic Design</p>
                        </div>
                    </div>
                )}

                {/* Desktop Collapse Toggle Button */}
                <button
                    type="button"
                    onClick={toggleCollapse}
                    className="hidden md:flex w-full items-center justify-center p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title={isCollapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
                >
                    <ChevronLeft className={`w-4 h-4 transition-transform duration-200 ${isCollapsed ? 'rotate-180' : ''}`} />
                    {!isCollapsed && <span className="text-xs ml-2">Ciutkan Sidebar</span>}
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside
                className={`hidden md:block fixed top-0 left-0 bottom-0 z-30 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 transition-all duration-300 ease-in-out ${
                    isCollapsed ? 'w-20' : 'w-64'
                }`}
            >
                {sidebarContent}
            </aside>

            {/* Mobile Drawer Backdrop */}
            {isMobileOpen && (
                <div
                    className="md:hidden fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs transition-opacity"
                    onClick={closeMobile}
                />
            )}

            {/* Mobile Sidebar Drawer */}
            <aside
                className={`md:hidden fixed top-0 left-0 bottom-0 z-50 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-300 ease-in-out ${
                    isMobileOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {sidebarContent}
            </aside>
        </>
    );
}
