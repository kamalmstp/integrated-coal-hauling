import React, { useEffect } from 'react';
import { Head } from '@inertiajs/react';
import Sidebar from '../organisms/Sidebar';
import Navbar from '../organisms/Navbar';
import AlertContainer from '../organisms/AlertContainer';
import { useSidebarStore } from '../../stores/useSidebarStore';
import { useThemeStore } from '../../stores/useThemeStore';

export default function DashboardLayout({
    children,
    title = 'Dashboard',
    breadcrumbs = [],
}) {
    const { isCollapsed } = useSidebarStore();
    const { initTheme } = useThemeStore();

    useEffect(() => {
        initTheme();
    }, [initTheme]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors duration-200">
            <Head title={title} />

            {/* Notification Toasts and Confirm Modals */}
            <AlertContainer />

            {/* Organism: Sidebar */}
            <Sidebar />

            {/* Main content wrapper */}
            <div
                className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
                    isCollapsed ? 'md:pl-20' : 'md:pl-64'
                }`}
            >
                {/* Organism: Navbar */}
                <Navbar title={title} breadcrumbs={breadcrumbs} />

                {/* Page content view */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
                    {children}
                </main>

                {/* Footer */}
                <footer className="py-4 px-6 border-t border-slate-200/80 dark:border-slate-800 text-center text-xs text-slate-400 dark:text-slate-500">
                    Laravel 12 + Inertia React + Tailwind CSS + Zustand | Atomic Design Architecture
                </footer>
            </div>
        </div>
    );
}
