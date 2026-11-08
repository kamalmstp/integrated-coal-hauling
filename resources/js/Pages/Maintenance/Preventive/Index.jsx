import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import DashboardLayout from '../../../components/templates/DashboardLayout';
import Card from '../../../components/molecules/Card';
import Button from '../../../components/atoms/Button';
import Modal from '../../../components/molecules/Modal';
import Pagination from '../../../components/molecules/Pagination';
import {
    Calendar,
    Clock,
    Plus,
    Filter,
    RefreshCw,
    Search,
    Truck,
    Wrench,
    CheckCircle2,
    AlertTriangle,
    ShieldAlert,
    Gauge,
    Layers,
    FileText,
    History,
    Activity,
} from 'lucide-react';

export default function PreventiveMaintenanceIndex({
    schedules = { data: [], links: [] },
    metrics = {},
    pmHistory = [],
    filters = {},
    master = {},
}) {
    const [siteId, setSiteId] = useState(filters.site_id || '');
    const [unitId, setUnitId] = useState(filters.unit_id || '');
    const [status, setStatus] = useState(filters.status || '');
    const [serviceType, setServiceType] = useState(filters.service_type || '');

    // Modals
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isGenerateWoOpen, setIsGenerateWoOpen] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState(null);

    // Form: Create PM Schedule
    const createForm = useForm({
        site_id: master.sites?.[0]?.id || '',
        unit_id: master.units?.[0]?.id || '',
        service_type: 'PM 250',
        schedule_basis: 'hm',
        interval_value: 250,
        next_due_hm: '',
        next_due_date: '',
        notes: '',
    });

    // Form: Generate PM Work Order
    const generateWoForm = useForm({
        assigned_mechanic_id: master.mechanics?.[0]?.id || '',
        target_completion_date: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
        estimated_cost: 3500000,
    });

    const handleFilter = (e) => {
        e.preventDefault();
        router.get('/maintenance/preventive', {
            site_id: siteId || undefined,
            unit_id: unitId || undefined,
            status: status || undefined,
            service_type: serviceType || undefined,
        }, { preserveState: true });
    };

    const handleReset = () => {
        setSiteId('');
        setUnitId('');
        setStatus('');
        setServiceType('');
        router.get('/maintenance/preventive');
    };

    const openGenerateModal = (sched) => {
        setSelectedSchedule(sched);
        generateWoForm.setData({
            assigned_mechanic_id: master.mechanics?.[0]?.id || '',
            target_completion_date: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
            estimated_cost: sched.service_type === 'PM 1000' || sched.service_type === 'PM 2000' ? 8500000 : 3500000,
        });
        setIsGenerateWoOpen(true);
    };

    const submitCreate = (e) => {
        e.preventDefault();
        createForm.post('/maintenance/preventive/schedules', {
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
            },
        });
    };

    const submitGenerateWo = (e) => {
        e.preventDefault();
        generateWoForm.post(`/maintenance/preventive/schedules/${selectedSchedule.id}/generate-wo`, {
            onSuccess: () => {
                setIsGenerateWoOpen(false);
            },
        });
    };

    const getStatusBadge = (st) => {
        const map = {
            normal: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
            due_soon: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 animate-pulse',
            overdue: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 font-bold',
            in_service: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
        };
        const labels = {
            normal: 'Normal (Aman)',
            due_soon: 'Due Soon (Mendekati)',
            overdue: 'OVERDUE (Terlewat)',
            in_service: 'In Service (Servis Berjalan)',
        };
        return (
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full uppercase tracking-wider ${map[st] || 'bg-gray-100 text-gray-700'}`}>
                {labels[st] || st}
            </span>
        );
    };

    return (
        <DashboardLayout>
            <Head title="Preventive Maintenance — TAP Fleet & Workshop" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                            <Calendar className="w-7 h-7 text-emerald-500" />
                            Preventive Maintenance (PM) Management
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Pengendalian jadwal perawatan berkala (PM 250, 500, 1000, 2000), peringatan interval HM/KM, dan otomatisasi penerbitan Work Order PM.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            onClick={() => setIsCreateOpen(true)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 shadow-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Buat Jadwal PM Baru
                        </Button>
                    </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    <Card className="p-3 text-center border-l-4 border-l-blue-500">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Jadwal PM</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{metrics.total_schedules || 0}</p>
                    </Card>
                    <Card className="p-3 text-center border-l-4 border-l-emerald-500">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Status Normal</p>
                        <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{metrics.normal || 0}</p>
                    </Card>
                    <Card className="p-3 text-center border-l-4 border-l-amber-500">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Due Soon (Mendekati)</p>
                        <p className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">{metrics.due_soon || 0}</p>
                    </Card>
                    <Card className="p-3 text-center border-l-4 border-l-red-500">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">OVERDUE</p>
                        <p className="text-xl font-bold text-red-600 dark:text-red-400 mt-1">{metrics.overdue || 0}</p>
                    </Card>
                    <Card className="p-3 text-center border-l-4 border-l-cyan-500">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">In Service (Workshop)</p>
                        <p className="text-xl font-bold text-cyan-600 dark:text-cyan-400 mt-1">{metrics.in_service || 0}</p>
                    </Card>
                    <Card className="p-3 text-center border-l-4 border-l-purple-500">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">PM Completion Rate</p>
                        <p className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-1">{metrics.pm_completion_rate || 0}%</p>
                        <p className="text-[10px] text-gray-400">{metrics.completed_pm || 0} / {metrics.total_pm || 0} WO</p>
                    </Card>
                </div>

                {/* Filter Bar */}
                <Card className="p-4">
                    <form onSubmit={handleFilter} className="grid grid-cols-1 md:grid-cols-5 gap-3">
                        <div>
                            <select
                                value={siteId}
                                onChange={(e) => setSiteId(e.target.value)}
                                className="w-full py-2 px-3 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            >
                                <option value="">Semua Site / Project</option>
                                {master.sites?.map((s) => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <select
                                value={unitId}
                                onChange={(e) => setUnitId(e.target.value)}
                                className="w-full py-2 px-3 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            >
                                <option value="">Semua Unit</option>
                                {master.units?.map((u) => (
                                    <option key={u.id} value={u.id}>{u.unit_code} - {u.unit_type}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <select
                                value={serviceType}
                                onChange={(e) => setServiceType(e.target.value)}
                                className="w-full py-2 px-3 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            >
                                <option value="">Semua Service Type</option>
                                <option value="PM 250">PM 250 (Servis Ringan)</option>
                                <option value="PM 500">PM 500 (Servis Menengah)</option>
                                <option value="PM 1000">PM 1000 (Servis Besar)</option>
                                <option value="PM 2000">PM 2000 (General Overhaul / Major)</option>
                            </select>
                        </div>

                        <div>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full py-2 px-3 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            >
                                <option value="">Semua Status PM</option>
                                <option value="normal">Normal (Aman)</option>
                                <option value="due_soon">Due Soon (&lt;= 40 HM)</option>
                                <option value="overdue">OVERDUE (Lewat Batas)</option>
                                <option value="in_service">In Service (Sedang Servis)</option>
                            </select>
                        </div>

                        <div className="flex gap-2">
                            <Button type="submit" className="flex-1 bg-gray-900 hover:bg-gray-800 text-white text-sm">
                                <Filter className="w-3.5 h-3.5 mr-1" /> Filter
                            </Button>
                            <Button type="button" onClick={handleReset} variant="outline" className="px-3 text-gray-600">
                                <RefreshCw className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                    </form>
                </Card>

                {/* Schedules Table */}
                <Card className="overflow-hidden">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Layers className="w-4 h-4 text-emerald-500" />
                            Daftar Jadwal Preventive Maintenance Unit
                        </h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    <th className="py-3 px-4">Unit Alat Berat</th>
                                    <th className="py-3 px-4">Site / Project</th>
                                    <th className="py-3 px-4">Service Type</th>
                                    <th className="py-3 px-4">Basis & Interval</th>
                                    <th className="py-3 px-4">HM Aktual vs Target</th>
                                    <th className="py-3 px-4">Sisa Jam (Remaining)</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4 text-center">Aksi Work Order</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                                {schedules.data?.length > 0 ? (
                                    schedules.data.map((sched) => {
                                        const currentHm = parseFloat(sched.unit?.last_hm || 0);
                                        const targetHm = parseFloat(sched.next_due_hm || 0);
                                        const remaining = targetHm - currentHm;

                                        return (
                                            <tr key={sched.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition">
                                                <td className="py-3 px-4 whitespace-nowrap">
                                                    <div className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                                                        <Truck className="w-4 h-4 text-blue-500" />
                                                        {sched.unit?.unit_code || '-'}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        {sched.unit?.unit_type} • Status: {sched.unit?.status}
                                                    </div>
                                                </td>

                                                <td className="py-3 px-4 whitespace-nowrap text-xs text-gray-700 dark:text-gray-300">
                                                    {sched.site?.name}
                                                </td>

                                                <td className="py-3 px-4 whitespace-nowrap">
                                                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                                        {sched.service_type}
                                                    </span>
                                                </td>

                                                <td className="py-3 px-4 whitespace-nowrap text-xs font-mono">
                                                    {sched.interval_value} {sched.schedule_basis?.toUpperCase()}
                                                </td>

                                                <td className="py-3 px-4 whitespace-nowrap text-xs">
                                                    <div className="font-mono text-gray-900 dark:text-white">
                                                        Aktual: <span className="font-bold">{currentHm} HM</span>
                                                    </div>
                                                    <div className="font-mono text-gray-500 text-[11px]">
                                                        Target: {targetHm} HM
                                                    </div>
                                                </td>

                                                <td className="py-3 px-4 whitespace-nowrap text-xs">
                                                    {sched.schedule_basis === 'hm' ? (
                                                        <span className={`font-mono font-bold ${remaining <= 0 ? 'text-red-600 dark:text-red-400' : remaining <= 40 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                                            {remaining <= 0 ? `LEWAT ${Math.abs(remaining).toFixed(1)} HM` : `${remaining.toFixed(1)} HM lagi`}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-500">{sched.next_due_date || '-'}</span>
                                                    )}
                                                </td>

                                                <td className="py-3 px-4 whitespace-nowrap">
                                                    {getStatusBadge(sched.status)}
                                                </td>

                                                <td className="py-3 px-4 whitespace-nowrap text-center">
                                                    {sched.status === 'in_service' ? (
                                                        <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold flex items-center justify-center gap-1">
                                                            <Wrench className="w-3.5 h-3.5" /> Servis Berjalan
                                                        </span>
                                                    ) : (
                                                        <Button
                                                            onClick={() => openGenerateModal(sched)}
                                                            className={`text-xs px-2.5 py-1 ${sched.status === 'overdue' ? 'bg-red-600 hover:bg-red-700 text-white' : sched.status === 'due_soon' ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'bg-gray-800 hover:bg-gray-900 text-white'}`}
                                                        >
                                                            <Wrench className="w-3 h-3 mr-1" /> Terbitkan SPK WO
                                                        </Button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="py-8 text-center text-gray-500 dark:text-gray-400">
                                            Tidak ada jadwal PM yang sesuai filter.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {schedules.links && (
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                            <Pagination links={schedules.links} />
                        </div>
                    )}
                </Card>

                {/* Recent Completed PM History */}
                <Card className="p-4">
                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
                        <History className="w-4 h-4 text-blue-500" />
                        Histori Penyelesaian Servis PM Terbaru
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {pmHistory?.length > 0 ? (
                            pmHistory.map((item) => (
                                <div key={item.id} className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40 text-xs">
                                    <div className="flex justify-between items-center font-bold text-gray-900 dark:text-white">
                                        <span>{item.wo_number}</span>
                                        <span className="text-green-600 font-mono">SELESAI</span>
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-300 mt-1">
                                        Unit: <span className="font-semibold">{item.unit?.unit_code}</span> ({item.unit?.registration_number})
                                    </p>
                                    <p className="text-gray-500 mt-0.5">
                                        Mekanik: {item.mechanic?.name || '-'} • HM: {item.hm_at_service || '-'}
                                    </p>
                                    <p className="text-gray-400 mt-0.5 text-[11px]">
                                        Selesai: {item.completion_time ? new Date(item.completion_time).toLocaleDateString('id-ID') : '-'}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <p className="text-xs text-gray-400 italic col-span-3">Belum ada catatan servis PM selesai.</p>
                        )}
                    </div>
                </Card>

                {/* MODAL: CREATE PM SCHEDULE */}
                <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Buat Jadwal Preventive Maintenance Baru" maxWidth="max-w-lg">
                    <form onSubmit={submitCreate} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1">Site / Project *</label>
                            <select
                                value={createForm.data.site_id}
                                onChange={(e) => createForm.setData('site_id', e.target.value)}
                                className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                required
                            >
                                {master.sites?.map((s) => (
                                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1">Unit Alat Berat / DT *</label>
                            <select
                                value={createForm.data.unit_id}
                                onChange={(e) => createForm.setData('unit_id', e.target.value)}
                                className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                required
                            >
                                {master.units?.map((u) => (
                                    <option key={u.id} value={u.id}>{u.unit_code} - {u.unit_type} (HM: {u.last_hm || 0})</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1">Service Type *</label>
                                <select
                                    value={createForm.data.service_type}
                                    onChange={(e) => {
                                        const st = e.target.value;
                                        createForm.setData((data) => ({
                                            ...data,
                                            service_type: st,
                                            interval_value: st === 'PM 250' ? 250 : st === 'PM 500' ? 500 : st === 'PM 1000' ? 1000 : 2000,
                                        }));
                                    }}
                                    className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                    required
                                >
                                    <option value="PM 250">PM 250</option>
                                    <option value="PM 500">PM 500</option>
                                    <option value="PM 1000">PM 1000</option>
                                    <option value="PM 2000">PM 2000</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1">Basis Jadwal *</label>
                                <select
                                    value={createForm.data.schedule_basis}
                                    onChange={(e) => createForm.setData('schedule_basis', e.target.value)}
                                    className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                    required
                                >
                                    <option value="hm">Hour Meter (HM)</option>
                                    <option value="km">Kilometer (KM)</option>
                                    <option value="calendar">Kalender / Tanggal</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1">Interval Nilai *</label>
                                <input
                                    type="number"
                                    value={createForm.data.interval_value}
                                    onChange={(e) => createForm.setData('interval_value', parseInt(e.target.value))}
                                    className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1">Target Jatuh Tempo (HM)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    placeholder="Contoh: 1500.0"
                                    value={createForm.data.next_due_hm}
                                    onChange={(e) => createForm.setData('next_due_hm', e.target.value)}
                                    className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1">Catatan</label>
                            <textarea
                                rows="2"
                                value={createForm.data.notes}
                                onChange={(e) => createForm.setData('notes', e.target.value)}
                                placeholder="Keterangan tambahan service..."
                                className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={createForm.processing} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                {createForm.processing ? 'Menyimpan...' : 'Simpan Jadwal PM'}
                            </Button>
                        </div>
                    </form>
                </Modal>

                {/* MODAL: GENERATE PM WORK ORDER */}
                <Modal isOpen={isGenerateWoOpen} onClose={() => setIsGenerateWoOpen(false)} title={`Terbitkan SPK PM: ${selectedSchedule?.unit?.unit_code} (${selectedSchedule?.service_type})`} maxWidth="max-w-md">
                    <form onSubmit={submitGenerateWo} className="space-y-4">
                        <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-xs text-blue-800 dark:text-blue-300">
                            Sistem akan secara otomatis menerbitkan Work Order dan Job Card dengan <strong>8 item checklist standar PM</strong> (ganti oli mesin, filter oli, filter bahan bakar, filter udara, grease chassis, coolant radiator, cek brake lining, dll).
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1">Lead Mekanik Pelaksana *</label>
                            <select
                                value={generateWoForm.data.assigned_mechanic_id}
                                onChange={(e) => generateWoForm.setData('assigned_mechanic_id', e.target.value)}
                                className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                required
                            >
                                {master.mechanics?.map((m) => (
                                    <option key={m.id} value={m.id}>{m.name} ({m.employee_code})</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1">Target Selesai</label>
                            <input
                                type="datetime-local"
                                value={generateWoForm.data.target_completion_date}
                                onChange={(e) => generateWoForm.setData('target_completion_date', e.target.value)}
                                className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1">Estimasi Biaya Servis (Rp)</label>
                            <input
                                type="number"
                                value={generateWoForm.data.estimated_cost}
                                onChange={(e) => generateWoForm.setData('estimated_cost', e.target.value)}
                                className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                            <Button type="button" variant="outline" onClick={() => setIsGenerateWoOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={generateWoForm.processing} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                {generateWoForm.processing ? 'Menerbitkan...' : 'Terbitkan Work Order PM'}
                            </Button>
                        </div>
                    </form>
                </Modal>
            </div>
        </DashboardLayout>
    );
}
