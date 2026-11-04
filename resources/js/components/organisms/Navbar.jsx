import React from 'react';
import { Menu, Sun, Moon, Bell, Sparkles } from 'lucide-react';
import { useSidebarStore } from '../../stores/useSidebarStore';
import { useThemeStore } from '../../stores/useThemeStore';
import UserProfileDropdown from '../molecules/UserProfileDropdown';

export default function Navbar({ title = 'Dashboard', breadcrumbs = [] }) {
    const { toggleMobile } = useSidebarStore();
    const { theme, toggleTheme } = useThemeStore();

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

                {/* Right section: Theme toggle, notifications, and user dropdown */}
                <div className="flex items-center gap-2 sm:gap-3">
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
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white dark:ring-slate-900" />
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
