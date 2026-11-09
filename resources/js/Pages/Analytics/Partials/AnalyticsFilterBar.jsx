import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import {
    BarChart3,
    TrendingUp,
    Truck,
    Wrench,
    Boxes,
    Fuel,
    Download,
    FileText,
    Printer,
    Clock,
    Filter,
    RotateCcw,
} from 'lucide-react';

export default function AnalyticsFilterBar({
    currentPath = '/analytics/dashboard',
    reportType = 'executive',
    filters = {},
    master = {},
    statusOptions = [
        { value: '', label: 'Semua Status' },
        { value: 'verified', label: 'Verified / Approved' },
        { value: 'completed', label: 'Completed' },
        { value: 'open', label: 'Open / Pending' },
    ],
}) {
    const [form, setForm] = useState({
        site_id: filters.site_id || '',
        date_from: filters.date_from || '',
        date_to: filters.date_to || '',
        department_id: filters.department_id || '',
        unit_id: filters.unit_id || '',
        driver_id: filters.driver_id || '',
        shift_id: filters.shift_id || '',
        status: filters.status || '',
    });

    const cleanParams = (stateObj) => {
        const out = {};
        Object.entries(stateObj).forEach(([k, v]) => {
            if (v !== '' && v !== null && v !== undefined) {
                out[k] = v;
            }
        });
        return out;
    };

    const handleApply = (e) => {
        if (e) e.preventDefault();
        router.get(currentPath, cleanParams(form), { preserveState: true });
    };

    const handleReset = () => {
        const resetState = {
            site_id: filters.is_site_locked ? filters.site_id : '',
            date_from: '',
            date_to: '',
            department_id: '',
            unit_id: '',
            driver_id: '',
            shift_id: '',
            status: '',
        };
        setForm(resetState);
        router.get(currentPath, cleanParams(resetState), { preserveState: true });
    };

    const buildExportUrl = (endpoint, extra = {}) => {
        const params = new URLSearchParams({
            ...cleanParams(form),
            report_type: reportType,
            ...extra,
        });
        return `${endpoint}?${params.toString()}`;
    };

    const handleQueueBackgroundExport = (format) => {
        router.post('/analytics/export', {
            ...cleanParams(form),
            report_type: reportType,
            format,
            queue_background: true,
        });
    };

    const navTabs = [
        { href: '/analytics/dashboard', label: '1. Executive Dashboard', icon: BarChart3 },
        { href: '/analytics/production', label: '2. Production Report', icon: TrendingUp },
        { href: '/analytics/fleet', label: '3. Fleet Report', icon: Truck },
        { href: '/analytics/maintenance', label: '4. Maintenance Report', icon: Wrench },
        { href: '/analytics/warehouse-procurement', label: '5. Warehouse & Procurement', icon: Boxes },
        { href: '/analytics/fuel', label: '6. Fuel Report', icon: Fuel },
    ];

    return (
        <div className="space-y-4">
            {/* Report Navigation Pills & Export Actions */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <div className="flex flex-wrap gap-1.5">
                    {navTabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = currentPath === tab.href;
                        return (
                            <Link
                                key={tab.href}
                                href={tab.href}
                                data={cleanParams(form)}
                                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                                    isActive
                                        ? 'bg-indigo-600 text-white shadow-xs'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                            >
                                <Icon className="w-3.5 h-3.5" /> {tab.label}
                            </Link>
                        );
                    })}
                </div>

                {/* Export Controls: Excel, PDF, Printable & Background Queue */}
                <div className="flex flex-wrap items-center gap-2">
                    <a
                        href={buildExportUrl('/analytics/export', { format: 'excel' })}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs"
                    >
                        <Download className="w-3.5 h-3.5" /> Excel Export
                    </a>
                    <a
                        href={buildExportUrl('/analytics/export', { format: 'pdf' })}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs"
                    >
                        <FileText className="w-3.5 h-3.5" /> PDF Export
                    </a>
                    <a
                        href={buildExportUrl('/analytics/print')}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs"
                    >
                        <Printer className="w-3.5 h-3.5" /> Printable Report
                    </a>
                    <button
                        type="button"
                        onClick={() => handleQueueBackgroundExport('excel')}
                        className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-bold inline-flex items-center gap-1.5"
                        title="Jalankan export berukuran besar melalui Background Job Queue"
                    >
                        <Clock className="w-3.5 h-3.5" /> Queue Background Export
                    </button>
                </div>
            </div>

            {/* 7-Dimension Filter Bar */}
            <form
                onSubmit={handleApply}
                className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs"
            >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-2.5 text-xs">
                    {/* 1. Site */}
                    <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                            1. Site {filters.is_site_locked ? '(Locked)' : ''}
                        </label>
                        <select
                            value={form.site_id}
                            disabled={Boolean(filters.is_site_locked)}
                            onChange={(e) => setForm({ ...form, site_id: e.target.value })}
                            className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
                        >
                            {!filters.is_site_locked && <option value="">Semua Site TAP</option>}
                            {(master.sites || []).map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.code} — {s.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* 2a. Date From */}
                    <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                            2a. Dari Tanggal
                        </label>
                        <input
                            type="date"
                            value={form.date_from}
                            onChange={(e) => setForm({ ...form, date_from: e.target.value })}
                            className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                        />
                    </div>

                    {/* 2b. Date To */}
                    <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                            2b. Sampai Tanggal
                        </label>
                        <input
                            type="date"
                            value={form.date_to}
                            onChange={(e) => setForm({ ...form, date_to: e.target.value })}
                            className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                        />
                    </div>

                    {/* 3. Department */}
                    <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                            3. Department
                        </label>
                        <select
                            value={form.department_id}
                            onChange={(e) => setForm({ ...form, department_id: e.target.value })}
                            className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                        >
                            <option value="">Semua Dept</option>
                            {(master.departments || []).map((d) => (
                                <option key={d.id} value={d.id}>
                                    {d.code} — {d.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* 4. Unit */}
                    <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                            4. Unit DT
                        </label>
                        <select
                            value={form.unit_id}
                            onChange={(e) => setForm({ ...form, unit_id: e.target.value })}
                            className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                        >
                            <option value="">Semua Unit</option>
                            {(master.units || []).map((u) => (
                                <option key={u.id} value={u.id}>
                                    {u.unit_code} ({u.brand})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* 5. Driver */}
                    <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                            5. Driver
                        </label>
                        <select
                            value={form.driver_id}
                            onChange={(e) => setForm({ ...form, driver_id: e.target.value })}
                            className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                        >
                            <option value="">Semua Driver</option>
                            {(master.drivers || []).map((d) => (
                                <option key={d.id} value={d.id}>
                                    {d.driver_code} — {d.employee?.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* 6. Shift */}
                    <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                            6. Shift
                        </label>
                        <select
                            value={form.shift_id}
                            onChange={(e) => setForm({ ...form, shift_id: e.target.value })}
                            className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                        >
                            <option value="">Semua Shift</option>
                            {(master.shifts || []).map((sh) => (
                                <option key={sh.id} value={sh.id}>
                                    {sh.code} — {sh.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* 7. Status & Submit */}
                    <div className="flex flex-col justify-between">
                        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                            7. Status & Terapkan
                        </label>
                        <div className="flex items-center gap-1.5">
                            <select
                                value={form.status}
                                onChange={(e) => setForm({ ...form, status: e.target.value })}
                                className="flex-1 px-2 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                            >
                                {statusOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                            <button
                                type="submit"
                                className="px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold inline-flex items-center gap-1"
                                title="Terapkan Filter"
                            >
                                <Filter className="w-3.5 h-3.5" /> Filter
                            </button>
                            <button
                                type="button"
                                onClick={handleReset}
                                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600"
                                title="Reset Filter"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
