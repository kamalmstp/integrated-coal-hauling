import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import DashboardLayout from '../../../components/templates/DashboardLayout';
import {
    Users,
    UserCheck,
    Briefcase,
    AlertOctagon,
    CalendarCheck,
    Clock,
    Building2,
    ShieldCheck,
    Smartphone,
    Settings,
    X,
} from 'lucide-react';

export default function HrDashboardIndex({
    metrics = {},
    employeeBySite = [],
    employeeByDepartment = [],
    expiringContracts = [],
    simperExpiring = [],
    mcuExpiring = [],
    siteSettings = [],
    sites = [],
    filters = {},
}) {
    const [siteId, setSiteId] = useState(filters.site_id || '');
    const [selectedSetting, setSelectedSetting] = useState(null);

    const settingForm = useForm({
        check_in_grace_minutes: 15,
        earliest_check_in_minutes_before: 90,
        max_overtime_hours_per_day: 4,
        contract_reminder_days: 30,
        document_reminder_days: 30,
        require_gps_on_mobile: true,
    });

    const handleFilterSite = (val) => {
        setSiteId(val);
        router.get('/hr/dashboard', { site_id: val || undefined }, { preserveState: true });
    };

    const openEditSetting = (setting) => {
        setSelectedSetting(setting);
        settingForm.setData({
            check_in_grace_minutes: setting.check_in_grace_minutes,
            earliest_check_in_minutes_before: setting.earliest_check_in_minutes_before,
            max_overtime_hours_per_day: setting.max_overtime_hours_per_day,
            contract_reminder_days: setting.contract_reminder_days,
            document_reminder_days: setting.document_reminder_days,
            require_gps_on_mobile: Boolean(setting.require_gps_on_mobile),
        });
    };

    const submitSetting = (e) => {
        e.preventDefault();
        if (!selectedSetting) return;
        settingForm.put(`/hr/site-settings/${selectedSetting.id}`, {
            onSuccess: () => setSelectedSetting(null),
        });
    };

    const attSummary = metrics.attendance_summary || {};
    const otSummary = metrics.overtime_summary || {};

    return (
        <DashboardLayout title="HR & Employee Management Dashboard">
            <Head title="HR & SDM Dashboard - Phase 8" />

            <div className="space-y-6">
                {/* Header & Site Filter */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded-md bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                                Phase 8 — HR & Employee Management
                            </span>
                            <span className="px-2.5 py-0.5 text-[11px] font-semibold rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                Multi-Site Integrated
                            </span>
                        </div>
                        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                            Executive HR, Contract, Driver & Attendance Control Center
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Monitoring kekuatan SDM tambang, masa berlaku PKWT/SIMPER/MCU, rekap presensi HP & lembur operasional TAP.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                        <select
                            value={siteId}
                            onChange={(e) => handleFilterSite(e.target.value)}
                            className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium"
                        >
                            <option value="">Semua Site Operasional TAP</option>
                            {sites.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.code} — {s.name}
                                </option>
                            ))}
                        </select>

                        <Link
                            href="/hr/employees"
                            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition"
                        >
                            Kelola Karyawan & Kontrak
                        </Link>
                        <Link
                            href="/hr/attendance"
                            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition"
                        >
                            Presensi & Cuti
                        </Link>
                    </div>
                </div>

                {/* Top 5 KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500">Total Employee</span>
                            <Users className="w-4 h-4 text-indigo-500" />
                        </div>
                        <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
                            {metrics.total_employees || 0}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1">
                            Nonaktif / Resign: {metrics.inactive_employees || 0}
                        </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500">Active Employee</span>
                            <UserCheck className="w-4 h-4 text-emerald-500" />
                        </div>
                        <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
                            {metrics.active_employees || 0}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1">
                            Hadir Hari Ini: {attSummary.today_present || 0} personel
                        </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500">Contract Expiring</span>
                            <Briefcase className="w-4 h-4 text-amber-500" />
                        </div>
                        <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-2">
                            {metrics.expiring_contracts_count || 0}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1">
                            Reminder PKWT &le; 30 hari
                        </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500">SIMPER Expiring</span>
                            <AlertOctagon className="w-4 h-4 text-rose-500" />
                        </div>
                        <p className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-2">
                            {metrics.simper_expiring_count || 0}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1">
                            Wajib perpanjangan K3LH
                        </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500">MCU Expiring</span>
                            <ShieldCheck className="w-4 h-4 text-purple-500" />
                        </div>
                        <p className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 mt-2">
                            {metrics.mcu_expiring_count || 0}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1">
                            Medical Check Up Driver
                        </p>
                    </div>
                </div>

                {/* Attendance Summary & Overtime Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <CalendarCheck className="w-4 h-4 text-indigo-600" />
                                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                                    Attendance Summary (Bulan Berjalan)
                                </h2>
                            </div>
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-cyan-50 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300 flex items-center gap-1">
                                <Smartphone className="w-3 h-3" /> Mobile HP: {attSummary.mobile_hp_count || 0}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40">
                                <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-medium">Hadir Tepat Waktu</span>
                                <p className="text-xl font-extrabold text-emerald-700 dark:text-emerald-300 mt-1">
                                    {attSummary.present_count || 0}
                                </p>
                            </div>
                            <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40">
                                <span className="text-[11px] text-amber-700 dark:text-amber-300 font-medium">Terlambat (Late)</span>
                                <p className="text-xl font-extrabold text-amber-700 dark:text-amber-300 mt-1">
                                    {attSummary.late_count || 0}
                                </p>
                            </div>
                            <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40">
                                <span className="text-[11px] text-blue-700 dark:text-blue-300 font-medium">Cuti / Sakit / Izin</span>
                                <p className="text-xl font-extrabold text-blue-700 dark:text-blue-300 mt-1">
                                    {attSummary.on_leave_count || 0}
                                </p>
                            </div>
                            <div className="p-3 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/40">
                                <span className="text-[11px] text-rose-700 dark:text-rose-300 font-medium">Alpha / Mangkir</span>
                                <p className="text-xl font-extrabold text-rose-700 dark:text-rose-300 mt-1">
                                    {attSummary.absent_count || 0}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-amber-600" />
                                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                                    Overtime & Leave Approval Summary
                                </h2>
                            </div>
                            <Link href="/hr/attendance" className="text-xs font-bold text-indigo-600 hover:underline">
                                Detail Lembur &rarr;
                            </Link>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                                <span className="text-[11px] text-slate-500">Total Jam Lembur</span>
                                <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                                    {otSummary.total_overtime_hours || 0} <span className="text-xs font-normal">Jam</span>
                                </p>
                            </div>
                            <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30">
                                <span className="text-[11px] text-emerald-700 dark:text-emerald-300">Lembur Disetujui</span>
                                <p className="text-xl font-extrabold text-emerald-700 dark:text-emerald-300 mt-1">
                                    {otSummary.approved_overtime_hours || 0} <span className="text-xs font-normal">Jam</span>
                                </p>
                            </div>
                            <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30">
                                <span className="text-[11px] text-indigo-700 dark:text-indigo-300">Frekuensi SPL</span>
                                <p className="text-xl font-extrabold text-indigo-700 dark:text-indigo-300 mt-1">
                                    {otSummary.overtime_events_count || 0} <span className="text-xs font-normal">Sesi</span>
                                </p>
                            </div>
                            <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30">
                                <span className="text-[11px] text-amber-700 dark:text-amber-300">Cuti Pending</span>
                                <p className="text-xl font-extrabold text-amber-700 dark:text-amber-300 mt-1">
                                    {otSummary.pending_leaves_count || 0}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Employee by Site & Employee by Department */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                        <div className="flex items-center gap-2 mb-4">
                            <Building2 className="w-4 h-4 text-indigo-600" />
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                                Distribusi Karyawan per Site (Employee by Site)
                            </h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                                        <th className="py-2">Site</th>
                                        <th className="py-2 text-center">Total SDM</th>
                                        <th className="py-2 text-center">Aktif</th>
                                        <th className="py-2 text-center">Driver Hauling</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {employeeBySite.map((s) => (
                                        <tr key={s.site_id}>
                                            <td className="py-2.5 font-semibold text-slate-800 dark:text-slate-200">
                                                {s.site_code} — {s.site_name}
                                            </td>
                                            <td className="py-2.5 text-center font-bold">{s.total_employees}</td>
                                            <td className="py-2.5 text-center text-emerald-600 font-bold">{s.active_employees}</td>
                                            <td className="py-2.5 text-center text-amber-600 font-bold">{s.active_drivers}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                        <div className="flex items-center gap-2 mb-4">
                            <Briefcase className="w-4 h-4 text-emerald-600" />
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                                Distribusi Karyawan per Departemen (Employee by Department)
                            </h2>
                        </div>
                        <div className="overflow-x-auto max-h-60">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                                        <th className="py-2">Departemen</th>
                                        <th className="py-2">Site</th>
                                        <th className="py-2 text-right">Personel Aktif</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {employeeByDepartment.map((d) => (
                                        <tr key={d.department_id}>
                                            <td className="py-2 font-semibold text-slate-800 dark:text-slate-200">
                                                {d.department_code} — {d.department_name}
                                            </td>
                                            <td className="py-2 text-slate-500">{d.site_name}</td>
                                            <td className="py-2 text-right font-bold text-indigo-600">{d.active_count}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Early Warning Alerts: Contract Expiring, SIMPER Expiring, MCU Expiring */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Contract Expiring */}
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600">
                                Reminder Kontrak PKWT ({expiringContracts.length})
                            </h3>
                            <Link href="/hr/employees" className="text-[11px] font-bold text-indigo-600 hover:underline">
                                Perpanjang &rarr;
                            </Link>
                        </div>
                        <div className="space-y-2.5">
                            {expiringContracts.length === 0 ? (
                                <p className="text-xs text-slate-400">Tidak ada kontrak kerja yang berakhir dalam 30 hari.</p>
                            ) : (
                                expiringContracts.map((c) => (
                                    <div key={c.id} className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-xs">
                                        <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                                            <span>{c.employee?.name}</span>
                                            <span className="px-2 py-0.5 rounded-md bg-amber-200/80 text-amber-900 text-[10px]">
                                                {c.days_remaining} hari lagi
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-slate-500 mt-0.5">
                                            {c.contract_number} • Berakhir: {c.end_date?.substring(0, 10)}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* SIMPER Expiring */}
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-600">
                                SIMPER Expiring ({simperExpiring.length})
                            </h3>
                            <Link href="/hr/drivers" className="text-[11px] font-bold text-indigo-600 hover:underline">
                                Kelola SIMPER &rarr;
                            </Link>
                        </div>
                        <div className="space-y-2.5">
                            {simperExpiring.length === 0 ? (
                                <p className="text-xs text-slate-400">Seluruh SIMPER driver aktif dalam masa berlaku aman.</p>
                            ) : (
                                simperExpiring.map((d) => (
                                    <div key={d.id} className="p-3 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 text-xs">
                                        <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                                            <span>{d.employee?.name} ({d.driver_code})</span>
                                            <span className="px-2 py-0.5 rounded-md bg-rose-200/80 text-rose-900 text-[10px]">
                                                {d.days_remaining} hari
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-slate-500 mt-0.5">
                                            SIMPER: {d.simper_number} • Exp: {d.simper_expiry?.substring(0, 10)}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* MCU Expiring */}
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-purple-600">
                                MCU Expiring ({mcuExpiring.length})
                            </h3>
                            <Link href="/hr/drivers" className="text-[11px] font-bold text-indigo-600 hover:underline">
                                Jadwalkan MCU &rarr;
                            </Link>
                        </div>
                        <div className="space-y-2.5">
                            {mcuExpiring.length === 0 ? (
                                <p className="text-xs text-slate-400">Seluruh Medical Check Up driver masih berlaku.</p>
                            ) : (
                                mcuExpiring.map((d) => (
                                    <div key={d.id} className="p-3 rounded-xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-900/40 text-xs">
                                        <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                                            <span>{d.employee?.name} ({d.driver_code})</span>
                                            <span className="px-2 py-0.5 rounded-md bg-purple-200/80 text-purple-900 text-[10px]">
                                                {d.days_remaining} hari
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-slate-500 mt-0.5">
                                            Status MCU: {d.mcu_status?.toUpperCase()} • Exp: {d.mcu_expiry?.substring(0, 10)}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Per-Site HR Time Validation & Reminder Configuration */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Settings className="w-4 h-4 text-slate-600" />
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                                Konfigurasi Validasi Waktu Presensi HP, Lembur & Reminder per Site
                            </h2>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                                    <th className="py-2">Site</th>
                                    <th className="py-2">Toleransi Keterlambatan</th>
                                    <th className="py-2">Batas Awal Check-In</th>
                                    <th className="py-2">Maks Lembur Harian</th>
                                    <th className="py-2">Reminder Kontrak/Dokumen</th>
                                    <th className="py-2">GPS HP Wajib</th>
                                    <th className="py-2 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {siteSettings.map((st) => (
                                    <tr key={st.id}>
                                        <td className="py-2.5 font-bold text-slate-800 dark:text-slate-200">
                                            {st.site?.code} — {st.site?.name}
                                        </td>
                                        <td className="py-2.5">{st.check_in_grace_minutes} menit</td>
                                        <td className="py-2.5">{st.earliest_check_in_minutes_before} menit sebelum shift</td>
                                        <td className="py-2.5 font-semibold text-amber-600">{st.max_overtime_hours_per_day} jam/hari</td>
                                        <td className="py-2.5">{st.contract_reminder_days} hari</td>
                                        <td className="py-2.5">
                                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${st.require_gps_on_mobile ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                                                {st.require_gps_on_mobile ? 'WAJIB GPS' : 'OPSIONAL'}
                                            </span>
                                        </td>
                                        <td className="py-2.5 text-right">
                                            <button
                                                type="button"
                                                onClick={() => openEditSetting(st)}
                                                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold"
                                            >
                                                Konfigurasi
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal Edit Site Setting */}
            {selectedSetting && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                Konfigurasi HR Site: {selectedSetting.site?.name}
                            </h3>
                            <button type="button" onClick={() => setSelectedSetting(null)}>
                                <X className="w-4 h-4 text-slate-400" />
                            </button>
                        </div>

                        <form onSubmit={submitSetting} className="space-y-3 text-xs">
                            <div>
                                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Toleransi Terlambat Check-In (Menit)
                                </label>
                                <input
                                    type="number"
                                    value={settingForm.data.check_in_grace_minutes}
                                    onChange={(e) => settingForm.setData('check_in_grace_minutes', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Batas Paling Awal Check-In Sebelum Shift (Menit)
                                </label>
                                <input
                                    type="number"
                                    value={settingForm.data.earliest_check_in_minutes_before}
                                    onChange={(e) => settingForm.setData('earliest_check_in_minutes_before', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Maksimum Jam Lembur Harian (Jam)
                                </label>
                                <input
                                    type="number"
                                    step="0.5"
                                    value={settingForm.data.max_overtime_hours_per_day}
                                    onChange={(e) => settingForm.setData('max_overtime_hours_per_day', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                        Reminder Kontrak (Hari)
                                    </label>
                                    <input
                                        type="number"
                                        value={settingForm.data.contract_reminder_days}
                                        onChange={(e) => settingForm.setData('contract_reminder_days', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                        Reminder SIMPER/MCU (Hari)
                                    </label>
                                    <input
                                        type="number"
                                        value={settingForm.data.document_reminder_days}
                                        onChange={(e) => settingForm.setData('document_reminder_days', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-2 pt-1">
                                <input
                                    type="checkbox"
                                    id="gps_req"
                                    checked={settingForm.data.require_gps_on_mobile}
                                    onChange={(e) => settingForm.setData('require_gps_on_mobile', e.target.checked)}
                                />
                                <label htmlFor="gps_req" className="font-semibold text-slate-700 dark:text-slate-300">
                                    Wajibkan Koordinat GPS saat Check-In via HP
                                </label>
                            </div>

                            <div className="flex justify-end gap-2 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setSelectedSetting(null)}
                                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={settingForm.processing}
                                    className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold"
                                >
                                    Simpan Parameter
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
