import React from 'react';
import { Settings, Moon, Sun, Monitor, Bell, Shield, Database, Sparkles } from 'lucide-react';
import DashboardLayout from '../../components/templates/DashboardLayout';
import ToggleSwitch from '../../components/atoms/ToggleSwitch';
import Button from '../../components/atoms/Button';
import { useThemeStore } from '../../stores/useThemeStore';
import { useAlertStore } from '../../stores/useAlertStore';

export default function SettingsIndex() {
    const { theme, setTheme, toggleTheme } = useThemeStore();
    const { addAlert } = useAlertStore();

    const handleSavePreferences = () => {
        addAlert({
            type: 'success',
            title: 'Pengaturan Disimpan',
            message: 'Preferensi tema dan tampilan berhasil disimpan ke penyimpanan lokal.',
        });
    };

    return (
        <DashboardLayout title="Pengaturan Sistem" breadcrumbs={['Pengaturan']}>
            <div className="max-w-4xl space-y-6">
                {/* Theme Customization Card */}
                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                    <div className="flex items-center gap-3 pb-4 mb-5 border-b border-slate-100 dark:border-slate-800">
                        <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                            <Moon className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                Tampilan Antarmuka (Theme Mode)
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Pilih antara mode terang (Light mode) dan mode gelap (Dark mode) dengan Zustand state management.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Light Mode Box */}
                        <div
                            onClick={() => setTheme('light')}
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                theme === 'light'
                                    ? 'border-indigo-600 bg-indigo-50/30 dark:bg-indigo-950/30'
                                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                            }`}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Sun className="w-4 h-4 text-amber-500" />
                                    <span className="text-sm font-bold text-slate-900 dark:text-white">Mode Terang (Light)</span>
                                </div>
                                {theme === 'light' && (
                                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                                )}
                            </div>
                            <div className="h-16 rounded-lg bg-slate-100 border border-slate-200 p-2 flex flex-col justify-between">
                                <div className="w-12 h-2 rounded bg-slate-300" />
                                <div className="flex gap-1.5">
                                    <div className="w-6 h-6 rounded bg-indigo-500" />
                                    <div className="flex-1 h-6 rounded bg-white" />
                                </div>
                            </div>
                        </div>

                        {/* Dark Mode Box */}
                        <div
                            onClick={() => setTheme('dark')}
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                theme === 'dark'
                                    ? 'border-indigo-600 bg-indigo-950/30'
                                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                            }`}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Moon className="w-4 h-4 text-indigo-400" />
                                    <span className="text-sm font-bold text-slate-900 dark:text-white">Mode Gelap (Dark)</span>
                                </div>
                                {theme === 'dark' && (
                                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                                )}
                            </div>
                            <div className="h-16 rounded-lg bg-slate-950 border border-slate-800 p-2 flex flex-col justify-between">
                                <div className="w-12 h-2 rounded bg-slate-700" />
                                <div className="flex gap-1.5">
                                    <div className="w-6 h-6 rounded bg-indigo-600" />
                                    <div className="flex-1 h-6 rounded bg-slate-900" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                        <ToggleSwitch
                            checked={theme === 'dark'}
                            onChange={toggleTheme}
                            label="Aktifkan Mode Gelap Sekarang"
                        />
                        <Button variant="primary" size="sm" onClick={handleSavePreferences}>
                            Simpan Perubahan
                        </Button>
                    </div>
                </div>

                {/* System Architecture Details */}
                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-indigo-500" />
                        Spesifikasi Stack Proyek
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                            <p className="text-slate-400 uppercase font-semibold text-[10px]">Framework Backend</p>
                            <p className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">Laravel 12 + PHP 8.4</p>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                            <p className="text-slate-400 uppercase font-semibold text-[10px]">Database Engine</p>
                            <p className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">MySQL 8.0</p>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                            <p className="text-slate-400 uppercase font-semibold text-[10px]">Frontend UI & Bridge</p>
                            <p className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">React 19 JSX + Inertia.js v3</p>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                            <p className="text-slate-400 uppercase font-semibold text-[10px]">Styling & State Management</p>
                            <p className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">Tailwind CSS v4 + Zustand v5</p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
