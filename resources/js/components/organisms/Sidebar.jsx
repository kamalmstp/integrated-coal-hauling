import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    Building2,
    Users,
    Truck,
    UserCheck,
    MapPin,
    Clock,
    Briefcase,
    Shield,
    FileText,
    Settings,
    ChevronLeft,
    Sparkles,
    ShieldCheck,
    Layers,
    X,
    CalendarCheck,
    Route as RouteIcon,
    Ticket,
    CheckCircle2,
    UploadCloud,
    BarChart3,
    Target,
    Scale,
    TrendingUp,
    Wrench,
    ClipboardCheck,
    Gauge,
    Activity,
} from 'lucide-react';
import { useSidebarStore } from '../../stores/useSidebarStore';

export default function Sidebar() {
    const { url } = usePage();
    const { isCollapsed, toggleCollapse, isMobileOpen, closeMobile } = useSidebarStore();

    const menuGroups = [
        {
            title: 'Menu Utama',
            items: [
                {
                    name: 'Overview Eksekutif',
                    href: '/dashboard',
                    icon: LayoutDashboard,
                    active: url === '/dashboard' || url === '/',
                },
                {
                    name: 'Dashboard Produksi',
                    href: '/production/dashboard',
                    icon: TrendingUp,
                    badge: 'Phase 2',
                    badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
                    active: url.startsWith('/production/dashboard'),
                },
            ],
        },
        {
            title: 'Manajemen Produksi Hauling',
            items: [
                {
                    name: 'Daily Dispatch',
                    href: '/production/dispatch',
                    icon: CalendarCheck,
                    badge: 'Jadwal',
                    badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
                    active: url.startsWith('/production/dispatch'),
                },
                {
                    name: 'Loading & Hauling',
                    href: '/production/hauling',
                    icon: RouteIcon,
                    active: url.startsWith('/production/hauling'),
                },
                {
                    name: 'Tiket Dumping',
                    href: '/production/tickets',
                    icon: Ticket,
                    badge: 'Tiket',
                    badgeColor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
                    active: url.startsWith('/production/tickets') && !url.includes('verification-queue'),
                },
                {
                    name: 'Verifikasi Tiket',
                    href: '/production/tickets/verification-queue',
                    icon: CheckCircle2,
                    badge: 'Workflow',
                    badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
                    active: url.includes('/production/tickets/verification-queue'),
                },
                {
                    name: 'Bulk Import Tiket',
                    href: '/production/import',
                    icon: UploadCloud,
                    active: url.startsWith('/production/import'),
                },
                {
                    name: 'Rekap Produksi',
                    href: '/production/recap',
                    icon: BarChart3,
                    badge: 'Official',
                    badgeColor: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
                    active: url.startsWith('/production/recap'),
                },
                {
                    name: 'Target Produksi',
                    href: '/production/targets',
                    icon: Target,
                    active: url.startsWith('/production/targets'),
                },
                {
                    name: 'Rekonsiliasi JSI',
                    href: '/production/reconciliation',
                    icon: Scale,
                    badge: 'TAP vs JSI',
                    badgeColor: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
                    active: url.startsWith('/production/reconciliation'),
                },
            ],
        },
        {
            title: 'Manajemen Fleet & Alat Berat',
            items: [
                {
                    name: 'Unit Registry & Status',
                    href: '/fleet/registry',
                    icon: Truck,
                    badge: 'Phase 3',
                    badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
                    active: url.startsWith('/fleet/registry'),
                },
                {
                    name: 'Digital P2H',
                    href: '/fleet/p2h',
                    icon: ClipboardCheck,
                    badge: 'K3LH',
                    badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
                    active: url.startsWith('/fleet/p2h'),
                },
                {
                    name: 'Monitoring HM/KM',
                    href: '/fleet/hm-km',
                    icon: Gauge,
                    badge: 'PM Service',
                    badgeColor: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300',
                    active: url.startsWith('/fleet/hm-km'),
                },
                {
                    name: 'Work Order Perbaikan',
                    href: '/fleet/work-orders',
                    icon: Wrench,
                    badge: 'Maintenance',
                    badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
                    active: url.startsWith('/fleet/work-orders'),
                },
                {
                    name: 'Fleet KPI (PA/MA/UA)',
                    href: '/fleet/kpi',
                    icon: Activity,
                    badge: 'Availability',
                    badgeColor: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
                    active: url.startsWith('/fleet/kpi'),
                },
            ],
        },
        {
            title: 'Organisasi & Struktur',
            items: [
                {
                    name: 'Organisasi & Site',
                    href: '/organization',
                    icon: Building2,
                    badge: 'Site/Dept',
                    badgeColor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
                    active: url.startsWith('/organization'),
                },
            ],
        },
        {
            title: 'Master Operasional Hauling',
            items: [
                {
                    name: 'Armada & Unit Hauling',
                    href: '/master/units',
                    icon: Truck,
                    badge: 'Fleets',
                    badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
                    active: url.startsWith('/master/units'),
                },
                {
                    name: 'Driver & SIMPER',
                    href: '/master/drivers',
                    icon: UserCheck,
                    badge: 'K3LH',
                    badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
                    active: url.startsWith('/master/drivers'),
                },
                {
                    name: 'Lokasi & Rute Hauling',
                    href: '/master/locations',
                    icon: MapPin,
                    active: url.startsWith('/master/locations'),
                },
                {
                    name: 'Shift Kerja',
                    href: '/master/shifts',
                    icon: Clock,
                    active: url.startsWith('/master/shifts'),
                },
                {
                    name: 'Material Tambang',
                    href: '/master/materials',
                    icon: Layers,
                    active: url.startsWith('/master/materials'),
                },
            ],
        },
        {
            title: 'Mitra & Klien',
            items: [
                {
                    name: 'Vendor & Rental',
                    href: '/master/vendors',
                    icon: Briefcase,
                    active: url.startsWith('/master/vendors'),
                },
                {
                    name: 'Klien / Pemilik IUP',
                    href: '/master/customers',
                    icon: Building2,
                    active: url.startsWith('/master/customers'),
                },
            ],
        },
        {
            title: 'Kepegawaian & Akses',
            items: [
                {
                    name: 'Data Karyawan',
                    href: '/master/employees',
                    icon: Users,
                    active: url.startsWith('/master/employees'),
                },
                {
                    name: 'Pengguna Sistem',
                    href: '/users',
                    icon: Users,
                    active: url.startsWith('/users'),
                },
                {
                    name: 'Role & Permission',
                    href: '/security/roles',
                    icon: ShieldCheck,
                    active: url.startsWith('/security/roles'),
                },
                {
                    name: 'Log Aktivitas',
                    href: '/security/activity-logs',
                    icon: FileText,
                    active: url.startsWith('/security/activity-logs'),
                },
            ],
        },
        {
            title: 'Pengaturan',
            items: [
                {
                    name: 'Konfigurasi Sistem',
                    href: '/settings/configuration',
                    icon: Settings,
                    active: url.startsWith('/settings/configuration'),
                },
            ],
        },
    ];

    const sidebarContent = (
        <div className="flex flex-col h-full justify-between">
            {/* Top Brand & Links */}
            <div className="overflow-y-auto flex-1 custom-scrollbar">
                {/* Brand Header */}
                <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 flex items-center justify-between h-16 px-4 border-b border-slate-200/80 dark:border-slate-800">
                    <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-amber-500/20 shrink-0">
                            <Truck className="w-5 h-5" />
                        </div>
                        {!isCollapsed && (
                            <div className="flex flex-col">
                                <span className="font-extrabold text-sm text-slate-900 dark:text-white tracking-tight leading-none">
                                    TEKNINDO ADHYA PANE
                                </span>
                                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold tracking-wider uppercase mt-0.5">
                                    Coal Hauling System
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

                {/* Navigation Menu Groups */}
                <nav className="p-3 space-y-4">
                    {menuGroups.map((group, groupIdx) => (
                        <div key={groupIdx} className="space-y-1">
                            {!isCollapsed && (
                                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                    {group.title}
                                </div>
                            )}

                            {group.items.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={closeMobile}
                                        className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all group relative ${
                                            item.active
                                                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200 dark:shadow-none'
                                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                                        }`}
                                        title={isCollapsed ? item.name : undefined}
                                    >
                                        <Icon className={`w-4 h-4 shrink-0 ${item.active ? 'text-white' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
                                        {!isCollapsed && <span className="flex-1 truncate">{item.name}</span>}
                                        {!isCollapsed && item.badge && (
                                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${item.badgeColor || 'bg-slate-100 text-slate-700'}`}>
                                                {item.badge}
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    ))}
                </nav>
            </div>

            {/* Bottom Collapse Button */}
            <div className="p-3 border-t border-slate-200/80 dark:border-slate-800 space-y-2 shrink-0 bg-white dark:bg-slate-900">
                {!isCollapsed && (
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/40 flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                            <Shield className="w-3.5 h-3.5" />
                        </div>
                        <div className="text-[11px] leading-tight">
                            <p className="font-semibold text-slate-800 dark:text-slate-200">Phase 1 Foundation</p>
                            <p className="text-slate-400 text-[9px]">Master Data & RBAC</p>
                        </div>
                    </div>
                )}

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
