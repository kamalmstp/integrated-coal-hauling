import React, { useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import { Menu, Sun, Moon, Bell, MapPin, ChevronDown } from 'lucide-react';
import { useSidebarStore } from '../../stores/useSidebarStore';
import { useThemeStore } from '../../stores/useThemeStore';
import UserProfileDropdown from '../molecules/UserProfileDropdown';

export default function Navbar({ title = 'Dashboard', breadcrumbs = [] }) {
    const { toggleMobile } = useSidebarStore();
    const { theme, toggleTheme } = useThemeStore();
    const { auth } = usePage().props;
    const [isSiteDropdownOpen, setIsSiteDropdownOpen] = useState(false);

    const activeSite = auth?.active_site;
    const accessibleSites = auth?.accessible_sites || [];
    const canSwitchSite = accessibleSites.length > 1;

    const handleSwitchSite = (siteId) => {
        setIsSiteDropdownOpen(false);
        if (siteId !== activeSite?.id) {
            router.post('/switch-site', { site_id: siteId });
        }
    };

    return (
        <header className="sticky top-0 z-20 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
            <div className="flex items-center justify-between h-full px-4 sm:px-6">
                {/* Left section: Mobile menu & Page Title */}
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={toggleMobile}
                        className="md:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
                    >
                        <Menu className="w-5 h-5" />
                    </button>

                    <div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
                            <span>Beranda</span>
                            {breadcrumbs.map((crumb, idx) => (
                                <React.Fragment key={idx}>
                                    <span>/</span>
                                    <span className="text-slate-600 dark:text-slate-400">{crumb}</span>
                                </React.Fragment>
                            ))}
                        </div>
                        <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                            {title}
                        </h1>
                    </div>
                </div>

                {/* Right section: Site Selector, Theme toggle, notifications, and user dropdown */}
                <div className="flex items-center gap-2 sm:gap-3">
                    
                    {/* Site Switcher / Active Site Pill */}
                    {activeSite && (
                        <div className="relative">
                            {canSwitchSite ? (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => setIsSiteDropdownOpen(!isSiteDropdownOpen)}
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-semibold transition-all cursor-pointer"
                                        title="Beralih Site Operasional"
                                    >
                                        <MapPin className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                                        <span className="max-w-[140px] truncate sm:max-w-none">{activeSite.name}</span>
                                        <ChevronDown className="w-3.5 h-3.5 text-amber-500" />
                                    </button>

                                    {isSiteDropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50 py-1.5 z-50 text-xs">
                                            <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800">
                                                <p className="font-bold text-slate-400 text-[10px] uppercase tracking-wider">
                                                    Pilih Site Operasional
                                                </p>
                                            </div>
                                            <div className="py-1 max-h-48 overflow-y-auto">
                                                {accessibleSites.map((site) => (
                                                    <button
                                                        key={site.id}
                                                        type="button"
                                                        onClick={() => handleSwitchSite(site.id)}
                                                        className={`w-full flex items-center justify-between px-3.5 py-2 text-left transition-colors cursor-pointer ${
                                                            site.id === activeSite.id
                                                                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold'
                                                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                                                        }`}
                                                    >
                                                        <span className="truncate">{site.name}</span>
                                                        <span className="text-[10px] font-mono text-slate-400">{site.code}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 text-xs font-semibold">
                                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                    <span className="max-w-[120px] truncate sm:max-w-none">{activeSite.name}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Dark/Light mode toggle button */}
                    <button
                        type="button"
                        onClick={toggleTheme}
                        className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
                    >
                        {theme === 'dark' ? (
                            <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-180 duration-300" />
                        ) : (
                            <Moon className="w-4 h-4 text-slate-600 animate-in spin-in-180 duration-300" />
                        )}
                    </button>

                    {/* Notification Bell Badge */}
                    <div className="relative">
                        <button
                            type="button"
                            className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Pemberitahuan"
                        >
                            <Bell className="w-4 h-4" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white dark:ring-slate-900" />
                        </button>
                    </div>

                    <div className="h-5 w-px bg-slate-200 dark:bg-slate-800" />

                    {/* User Profile Dropdown */}
                    <UserProfileDropdown />
                </div>
            </div>
        </header>
    );
}
