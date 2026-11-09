import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import DashboardLayout from '../../../components/templates/DashboardLayout';
import {
    CalendarCheck,
    Smartphone,
    Clock,
    FileSpreadsheet,
    CheckCircle2,
    Plus,
    X,
} from 'lucide-react';

export default function HrAttendanceIndex({
    attendances = [],
    shiftAssignments = [],
    corrections = [],
    leaveRequests = [],
    employees = [],
    shifts = [],
    units = [],
    sites = [],
    filters = {},
}) {
    const [activeTab, setActiveTab] = useState('attendances');
    const [siteId, setSiteId] = useState(filters.site_id || '');

    const [showMobileModal, setShowMobileModal] = useState(false);
    const [showRosterModal, setShowRosterModal] = useState(false);
    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const [correctionTarget, setCorrectionTarget] = useState(null);

    const todayStr = new Date().toISOString().substring(0, 10);

    const attForm = useForm({
        site_id: employees[0]?.site_id || sites[0]?.id || '',
        employee_id: employees[0]?.id || '',
        shift_id: shifts[0]?.id || '',
        attendance_date: todayStr,
        status: 'present',
        check_in_at: `${todayStr} 06:50:00`,
        check_out_at: `${todayStr} 19:00:00`,
        overtime_hours: 0,
        overtime_reason: '',
        input_source: 'mobile_hp',
        device_info: 'TAP Mobile Check-In PWA (Android)',
        gps_latitude: -3.45721,
        gps_longitude: 115.63218,
        enforce_shift_window: true,
        remarks: 'Check-In/Out Mobile HP sesuai konfigurasi waktu site',
    });

    const rosterForm = useForm({
        site_id: employees[0]?.site_id || sites[0]?.id || '',
        employee_id: employees[0]?.id || '',
        shift_id: shifts[0]?.id || '',
        roster_date: todayStr,
        work_status: 'scheduled',
        assigned_unit_id: '',
        notes: 'Jadwal Shift Operasional Hauling',
    });

    const leaveForm = useForm({
        site_id: employees[0]?.site_id || sites[0]?.id || '',
        employee_id: employees[0]?.id || '',
        leave_type: 'annual_leave',
        start_date: todayStr,
        end_date: todayStr,
        reason: '',
    });

    const corForm = useForm({
        requested_check_in_at: '',
        requested_check_out_at: '',
        requested_overtime_hours: 0,
        reason: '',
    });

    const applyFilter = (newSite) => {
        router.get('/hr/attendance', { site_id: newSite || undefined }, { preserveState: true });
    };

    const submitAttendance = (e) => {
        e.preventDefault();
        attForm.post('/hr/attendance', {
            onSuccess: () => setShowMobileModal(false),
        });
    };

    const submitRoster = (e) => {
        e.preventDefault();
        rosterForm.post('/hr/shift-assignments', {
            onSuccess: () => setShowRosterModal(false),
        });
    };

    const submitLeave = (e) => {
        e.preventDefault();
        leaveForm.post('/hr/leaves', {
            onSuccess: () => setShowLeaveModal(false),
        });
    };

    const submitCorrection = (e) => {
        e.preventDefault();
        if (!correctionTarget) return;
        corForm.post(`/hr/attendance/${correctionTarget.id}/corrections`, {
            onSuccess: () => setCorrectionTarget(null),
        });
    };

    return (
        <DashboardLayout title="Attendance, Shift Roster, Overtime & Leave Management">
            <Head title="Presensi HP, Shift, Lembur & Cuti - Phase 8" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                    <div>
                        <span className="px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded-md bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300">
                            Mobile HP Support & Site Time Validation
                        </span>
                        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                            Presensi Check-In/Out, Jadwal Shift, Lembur, Cuti & Koreksi Kehadiran
                        </h1>
                        <p className="text-xs text-slate-500">
                            Dilengkapi validasi jam shift & batas lembur harian berdasarkan konfigurasi site serta input langsung via HP.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setShowMobileModal(true)}
                            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5"
                        >
                            <Smartphone className="w-4 h-4" /> Check-In / Out (HP & Web)
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowRosterModal(true)}
                            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5"
                        >
                            <Plus className="w-4 h-4" /> Shift Assignment
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowLeaveModal(true)}
                            className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5"
                        >
                            <FileSpreadsheet className="w-4 h-4" /> Ajukan Cuti / Izin
                        </button>
                    </div>
                </div>

                {/* Tabs & Site Filter */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                    <div className="flex flex-wrap gap-1.5">
                        {[
                            { id: 'attendances', label: `Presensi & Lembur (${attendances.length})` },
                            { id: 'roster', label: `Shift Assignment (${shiftAssignments.length})` },
                            { id: 'leaves', label: `Pengajuan Cuti & Approval (${leaveRequests.length})` },
                            { id: 'corrections', label: `Koreksi Presensi (${corrections.length})` },
                        ].map((t) => (
                            <button
                                key={t.id}
                                type="button"
                                onClick={() => setActiveTab(t.id)}
                                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                                    activeTab === t.id
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                                }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>

                    <select
                        value={siteId}
                        onChange={(e) => {
                            setSiteId(e.target.value);
                            applyFilter(e.target.value);
                        }}
                        className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    >
                        <option value="">Semua Site</option>
                        {sites.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.code} — {s.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Tab 1: Attendances */}
                {activeTab === 'attendances' && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500">
                                    <tr>
                                        <th className="px-4 py-3">No. Presensi & Tanggal</th>
                                        <th className="px-4 py-3">Karyawan & Site</th>
                                        <th className="px-4 py-3">Shift & Jam Kerja</th>
                                        <th className="px-4 py-3">Status & Keterlambatan</th>
                                        <th className="px-4 py-3">Lembur (SPL)</th>
                                        <th className="px-4 py-3">Sumber Input</th>
                                        <th className="px-4 py-3 text-right">Koreksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {attendances.map((a) => (
                                        <tr key={a.id}>
                                            <td className="px-4 py-3">
                                                <div className="font-bold">{a.attendance_number}</div>
                                                <div className="text-[11px] text-slate-400">{a.attendance_date?.substring(0, 10)}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="font-semibold">{a.employee?.name}</div>
                                                <div className="text-[11px] text-indigo-600">{a.site?.code} • {a.employee?.department?.name}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="font-semibold">{a.shift?.name || 'Regular Shift'}</div>
                                                <div className="text-[11px] text-slate-500">
                                                    In: {a.check_in_at ? a.check_in_at.substring(11, 16) : '-'} | Out: {a.check_out_at ? a.check_out_at.substring(11, 16) : '-'} ({a.work_duration_hours} jam)
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                                                    a.status === 'present'
                                                        ? 'bg-emerald-100 text-emerald-800'
                                                        : a.status === 'late'
                                                        ? 'bg-amber-100 text-amber-800'
                                                        : 'bg-blue-100 text-blue-800'
                                                }`}>
                                                    {a.status}
                                                </span>
                                                {a.late_minutes > 0 && (
                                                    <div className="text-[10px] text-amber-600 font-semibold mt-0.5">
                                                        Terlambat {a.late_minutes} menit
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {Number(a.overtime_hours) > 0 ? (
                                                    <span className="font-bold text-indigo-600">
                                                        +{a.overtime_hours} Jam ({a.overtime_status})
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold">
                                                    {a.input_source === 'mobile_hp' ? '📱 Mobile HP' : '💻 Web Portal'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setCorrectionTarget(a);
                                                        corForm.setData({
                                                            requested_check_in_at: a.check_in_at ? a.check_in_at.substring(0, 19) : `${a.attendance_date?.substring(0, 10)} 06:55:00`,
                                                            requested_check_out_at: a.check_out_at ? a.check_out_at.substring(0, 19) : `${a.attendance_date?.substring(0, 10)} 19:00:00`,
                                                            requested_overtime_hours: a.overtime_hours || 0,
                                                            reason: '',
                                                        });
                                                    }}
                                                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-semibold"
                                                >
                                                    Ajukan Koreksi
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Tab 2: Shift Assignments */}
                {activeTab === 'roster' && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500">
                                    <tr>
                                        <th className="px-4 py-3">Kode Roster & Tanggal</th>
                                        <th className="px-4 py-3">Karyawan & Site</th>
                                        <th className="px-4 py-3">Shift Kerja</th>
                                        <th className="px-4 py-3">Unit Assignment</th>
                                        <th className="px-4 py-3">Status Roster</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {shiftAssignments.map((r) => (
                                        <tr key={r.id}>
                                            <td className="px-4 py-3">
                                                <div className="font-bold">{r.assignment_code}</div>
                                                <div className="text-[11px] text-slate-400">{r.roster_date?.substring(0, 10)}</div>
                                            </td>
                                            <td className="px-4 py-3 font-semibold">
                                                {r.employee?.name} ({r.site?.code})
                                            </td>
                                            <td className="px-4 py-3">
                                                {r.shift?.name} ({r.shift?.start_time?.substring(0, 5)} - {r.shift?.end_time?.substring(0, 5)})
                                            </td>
                                            <td className="px-4 py-3">
                                                {r.assigned_unit?.unit_code || '-'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
                                                    {r.work_status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Tab 3: Leave Requests & Approval */}
                {activeTab === 'leaves' && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500">
                                    <tr>
                                        <th className="px-4 py-3">No. Cuti & Tipe</th>
                                        <th className="px-4 py-3">Karyawan & Site</th>
                                        <th className="px-4 py-3">Periode & Durasi</th>
                                        <th className="px-4 py-3">Alasan</th>
                                        <th className="px-4 py-3">Status Approval</th>
                                        <th className="px-4 py-3 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {leaveRequests.map((lv) => (
                                        <tr key={lv.id}>
                                            <td className="px-4 py-3">
                                                <div className="font-bold">{lv.leave_number}</div>
                                                <div className="text-[11px] uppercase text-indigo-600 font-semibold">
                                                    {lv.leave_type?.replace('_', ' ')}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 font-semibold">
                                                {lv.employee?.name} ({lv.site?.code})
                                            </td>
                                            <td className="px-4 py-3">
                                                {lv.start_date?.substring(0, 10)} s/d {lv.end_date?.substring(0, 10)} ({lv.total_days} hari)
                                            </td>
                                            <td className="px-4 py-3 text-slate-500">{lv.reason}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                                                    lv.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                                }`}>
                                                    {lv.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {lv.status === 'pending_approval' && (
                                                    <button
                                                        type="button"
                                                        onClick={() => router.post(`/hr/leaves/${lv.id}/approve`)}
                                                        className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-bold inline-flex items-center gap-1"
                                                    >
                                                        <CheckCircle2 className="w-3 h-3" /> Setujui Cuti
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Tab 4: Attendance Corrections */}
                {activeTab === 'corrections' && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500">
                                    <tr>
                                        <th className="px-4 py-3">No. Koreksi</th>
                                        <th className="px-4 py-3">Karyawan</th>
                                        <th className="px-4 py-3">Usulan Check-In / Out</th>
                                        <th className="px-4 py-3">Alasan Koreksi</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3 text-right">Approval</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {corrections.map((c) => (
                                        <tr key={c.id}>
                                            <td className="px-4 py-3 font-bold">{c.correction_number}</td>
                                            <td className="px-4 py-3 font-semibold">{c.employee?.name}</td>
                                            <td className="px-4 py-3">
                                                In: {c.requested_check_in_at?.substring(0, 16)} | Out: {c.requested_check_out_at?.substring(0, 16)}
                                            </td>
                                            <td className="px-4 py-3 text-slate-500">{c.reason}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                                                    c.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                                }`}>
                                                    {c.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {c.status === 'pending' && (
                                                    <button
                                                        type="button"
                                                        onClick={() => router.post(`/hr/attendance-corrections/${c.id}/approve`)}
                                                        className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-bold"
                                                    >
                                                        Approve Koreksi
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Mobile HP Check-In / Check-Out */}
            {showMobileModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                <Smartphone className="w-4 h-4 text-emerald-600" /> Input Presensi (Mobile HP & Site Validated)
                            </h3>
                            <button type="button" onClick={() => setShowMobileModal(false)}>
                                <X className="w-4 h-4 text-slate-400" />
                            </button>
                        </div>
                        <form onSubmit={submitAttendance} className="space-y-3 text-xs">
                            <div>
                                <label className="block font-semibold mb-1">Karyawan *</label>
                                <select
                                    value={attForm.data.employee_id}
                                    onChange={(e) => {
                                        const emp = employees.find((x) => Number(x.id) === Number(e.target.value));
                                        attForm.setData({
                                            ...attForm.data,
                                            employee_id: e.target.value,
                                            site_id: emp ? emp.site_id : attForm.data.site_id,
                                        });
                                    }}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                    required
                                >
                                    {employees.map((e) => (
                                        <option key={e.id} value={e.id}>{e.employee_code} — {e.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold mb-1">Tanggal Presensi *</label>
                                    <input
                                        type="date"
                                        value={attForm.data.attendance_date}
                                        onChange={(e) => attForm.setData('attendance_date', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold mb-1">Sumber Input *</label>
                                    <select
                                        value={attForm.data.input_source}
                                        onChange={(e) => attForm.setData('input_source', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                    >
                                        <option value="mobile_hp">Mobile HP (PWA)</option>
                                        <option value="web_portal">Web Portal HR</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold mb-1">Waktu Check-In</label>
                                    <input
                                        type="text"
                                        value={attForm.data.check_in_at}
                                        onChange={(e) => attForm.setData('check_in_at', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold mb-1">Waktu Check-Out</label>
                                    <input
                                        type="text"
                                        value={attForm.data.check_out_at}
                                        onChange={(e) => attForm.setData('check_out_at', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Jam Lembur (Overtime Hours)</label>
                                <input
                                    type="number"
                                    step="0.5"
                                    value={attForm.data.overtime_hours}
                                    onChange={(e) => attForm.setData('overtime_hours', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-3">
                                <button type="button" onClick={() => setShowMobileModal(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold">
                                    Batal
                                </button>
                                <button type="submit" disabled={attForm.processing} className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold">
                                    Simpan Presensi
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Shift Assignment */}
            {showRosterModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                Buat Jadwal Shift (Shift Assignment)
                            </h3>
                            <button type="button" onClick={() => setShowRosterModal(false)}>
                                <X className="w-4 h-4 text-slate-400" />
                            </button>
                        </div>
                        <form onSubmit={submitRoster} className="space-y-3 text-xs">
                            <div>
                                <label className="block font-semibold mb-1">Karyawan *</label>
                                <select
                                    value={rosterForm.data.employee_id}
                                    onChange={(e) => {
                                        const emp = employees.find((x) => Number(x.id) === Number(e.target.value));
                                        rosterForm.setData({
                                            ...rosterForm.data,
                                            employee_id: e.target.value,
                                            site_id: emp ? emp.site_id : rosterForm.data.site_id,
                                        });
                                    }}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                    required
                                >
                                    {employees.map((e) => (
                                        <option key={e.id} value={e.id}>{e.employee_code} — {e.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Shift Kerja *</label>
                                <select
                                    value={rosterForm.data.shift_id}
                                    onChange={(e) => rosterForm.setData('shift_id', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                    required
                                >
                                    {shifts.map((s) => (
                                        <option key={s.id} value={s.id}>{s.name} ({s.start_time?.substring(0, 5)} - {s.end_time?.substring(0, 5)})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Tanggal Roster *</label>
                                <input
                                    type="date"
                                    value={rosterForm.data.roster_date}
                                    onChange={(e) => rosterForm.setData('roster_date', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-3">
                                <button type="button" onClick={() => setShowRosterModal(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold">
                                    Batal
                                </button>
                                <button type="submit" disabled={rosterForm.processing} className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold">
                                    Simpan Shift
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Ajukan Cuti */}
            {showLeaveModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                Pengajuan Cuti / Izin Karyawan
                            </h3>
                            <button type="button" onClick={() => setShowLeaveModal(false)}>
                                <X className="w-4 h-4 text-slate-400" />
                            </button>
                        </div>
                        <form onSubmit={submitLeave} className="space-y-3 text-xs">
                            <div>
                                <label className="block font-semibold mb-1">Karyawan *</label>
                                <select
                                    value={leaveForm.data.employee_id}
                                    onChange={(e) => {
                                        const emp = employees.find((x) => Number(x.id) === Number(e.target.value));
                                        leaveForm.setData({
                                            ...leaveForm.data,
                                            employee_id: e.target.value,
                                            site_id: emp ? emp.site_id : leaveForm.data.site_id,
                                        });
                                    }}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                    required
                                >
                                    {employees.map((e) => (
                                        <option key={e.id} value={e.id}>{e.employee_code} — {e.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Jenis Cuti *</label>
                                <select
                                    value={leaveForm.data.leave_type}
                                    onChange={(e) => leaveForm.setData('leave_type', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                >
                                    <option value="annual_leave">Cuti Tahunan (Annual Leave)</option>
                                    <option value="roster_break">Cuti Roster Lapangan (Field Break)</option>
                                    <option value="sick_leave">Izin Sakit (Sick Leave)</option>
                                    <option value="emergency_permit">Izin Darurat Keluarga</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold mb-1">Mulai *</label>
                                    <input
                                        type="date"
                                        value={leaveForm.data.start_date}
                                        onChange={(e) => leaveForm.setData('start_date', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold mb-1">Sampai *</label>
                                    <input
                                        type="date"
                                        value={leaveForm.data.end_date}
                                        onChange={(e) => leaveForm.setData('end_date', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Alasan Cuti *</label>
                                <input
                                    type="text"
                                    value={leaveForm.data.reason}
                                    onChange={(e) => leaveForm.setData('reason', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-3">
                                <button type="button" onClick={() => setShowLeaveModal(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold">
                                    Batal
                                </button>
                                <button type="submit" disabled={leaveForm.processing} className="px-4 py-2 rounded-xl bg-amber-600 text-white font-bold">
                                    Kirim Pengajuan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Koreksi Presensi */}
            {correctionTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                Pengajuan Koreksi Presensi: {correctionTarget.attendance_number}
                            </h3>
                            <button type="button" onClick={() => setCorrectionTarget(null)}>
                                <X className="w-4 h-4 text-slate-400" />
                            </button>
                        </div>
                        <form onSubmit={submitCorrection} className="space-y-3 text-xs">
                            <div>
                                <label className="block font-semibold mb-1">Usulan Waktu Check-In *</label>
                                <input
                                    type="text"
                                    value={corForm.data.requested_check_in_at}
                                    onChange={(e) => corForm.setData('requested_check_in_at', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Usulan Waktu Check-Out *</label>
                                <input
                                    type="text"
                                    value={corForm.data.requested_check_out_at}
                                    onChange={(e) => corForm.setData('requested_check_out_at', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Alasan Koreksi *</label>
                                <input
                                    type="text"
                                    value={corForm.data.reason}
                                    onChange={(e) => corForm.setData('reason', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-3">
                                <button type="button" onClick={() => setCorrectionTarget(null)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold">
                                    Batal
                                </button>
                                <button type="submit" disabled={corForm.processing} className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold">
                                    Kirim Koreksi
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
