import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import DashboardLayout from '../../../components/templates/DashboardLayout';
import Card from '../../../components/molecules/Card';
import Button from '../../../components/atoms/Button';
import Modal from '../../../components/molecules/Modal';
import Pagination from '../../../components/molecules/Pagination';
import {
    Wrench,
    Plus,
    Filter,
    RefreshCw,
    AlertTriangle,
    CheckCircle2,
    Clock,
    Truck,
    User,
    Calendar,
    AlertOctagon,
    ShieldAlert,
    Timer,
    CheckCircle,
} from 'lucide-react';

export default function WorkOrdersIndex({
    workOrders = { data: [], links: [] },
    filters = {},
    metrics = {},
    master = {},
}) {
    const [status, setStatus] = useState(filters.status || '');
    const [priority, setPriority] = useState(filters.priority || '');
    const [unitId, setUnitId] = useState(filters.unit_id || '');

    // Modals
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isStatusOpen, setIsStatusOpen] = useState(false);
    const [selectedWo, setSelectedWo] = useState(null);

    // Form Create WO
    const createForm = useForm({
        unit_id: master.units?.[0]?.id || '',
        source: 'road_breakdown',
        priority: 'high',
        breakdown_time: new Date().toISOString().substring(0, 16),
        defect_summary: '',
        assigned_mechanic_id: master.mechanics?.[0]?.id || '',
    });

    // Form Update Status
    const statusForm = useForm({
        status: 'in_progress',
        action_taken: '',
        assigned_mechanic_id: '',
    });

    const handleFilter = (e) => {
        e?.preventDefault();
        router.get('/fleet/work-orders', {
            status,
            priority,
            unit_id: unitId,
        }, { preserveState: true, preserveScroll: true });
    };

    const handleReset = () => {
        setStatus('');
        setPriority('');
        setUnitId('');
        router.get('/fleet/work-orders');
    };

    const handleOpenStatus = (wo) => {
        setSelectedWo(wo);
        statusForm.setData({
            status: wo.status === 'open' ? 'in_progress' : (wo.status === 'in_progress' ? 'completed' : wo.status),
            action_taken: wo.action_taken || '',
            assigned_mechanic_id: wo.assigned_mechanic_id || master.mechanics?.[0]?.id || '',
        });
        setIsStatusOpen(true);
    };

    const submitCreate = (e) => {
        e.preventDefault();
        createForm.post('/fleet/work-orders', {
            onSuccess: () => {
                createForm.reset();
                setIsCreateOpen(false);
            },
        });
    };

    const submitStatus = (e) => {
        e.preventDefault();
        statusForm.put(`/fleet/work-orders/${selectedWo.id}/status`, {
            onSuccess: () => {
                setIsStatusOpen(false);
            },
        });
    };

    const getPriorityBadge = (p) => {
        switch (p) {
            case 'critical_emergency':
                return <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 uppercase animate-pulse">Critical Emergency</span>;
            case 'high':
                return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 uppercase">High</span>;
            case 'medium':
                return <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 uppercase">Medium</span>;
            case 'low':
                return <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 uppercase">Low</span>;
            default:
                return <span>{p}</span>;
        }
    };

    const getStatusBadge = (st) => {
        switch (st) {
            case 'open':
                return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"><span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-rose-500"></span>OPEN (ANTRE)</span>;
            case 'in_progress':
                return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 animate-pulse"><span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-blue-500"></span>PROSES PERBAIKAN</span>;
            case 'waiting_parts':
                return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"><span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-amber-500"></span>MENUNGGU SPAREPART</span>;
            case 'completed':
                return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"><CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />SELESAI (RESTORED RFU)</span>;
            case 'cancelled':
                return <span className="px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">DIBATALKAN</span>;
            default:
                return <span>{st}</span>;
        }
    };

    const formatSource = (src) => {
        const s = {
            p2h_defect: 'Temuan P2H Digital',
            road_breakdown: 'Breakdown Jalan Hauling',
            scheduled_pm: 'Jadwal PM Berkala',
            inspection: 'Inspeksi K3LH & Mekanik',
        };
        return s[src] || src;
    };

    return (
        <DashboardLayout>
            <Head title="Work Orders & Perbaikan Maintenance - TAP" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div>
                        <div className="flex items-center space-x-3">
                            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                                <Wrench className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                                    Work Order Perbaikan & Maintenance
                                </h1>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Penerbitan surat perintah kerja perbaikan armada, pelacakan downtime, dan pemulihan status armada ke Siap Operasi (RFU)
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3 w-full sm:w-auto">
                        <Button
                            variant="secondary"
                            onClick={() => router.get('/fleet/work-orders')}
                            className="flex items-center space-x-2"
                        >
                            <RefreshCw className="w-4 h-4" />
                            <span>Segarkan</span>
                        </Button>
                        <Button
                            variant="primary"
                            onClick={() => setIsCreateOpen(true)}
                            className="flex items-center space-x-2"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Terbitkan WO Baru</span>
                        </Button>
                    </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                    <Card className="p-4 bg-white dark:bg-slate-800 border-l-4 border-l-slate-500">
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Work Orders</p>
                        <div className="flex items-baseline justify-between mt-2">
                            <span className="text-2xl font-black text-slate-900 dark:text-white">{metrics.total || 0}</span>
                            <span className="text-xs text-slate-400">SPK</span>
                        </div>
                    </Card>

                    <Card className="p-4 bg-white dark:bg-slate-800 border-l-4 border-l-rose-500">
                        <p className="text-xs font-medium text-rose-600 dark:text-rose-400 uppercase tracking-wider">Antre (Open)</p>
                        <div className="flex items-baseline justify-between mt-2">
                            <span className="text-2xl font-black text-rose-600 dark:text-rose-400">{metrics.open || 0}</span>
                            <span className="text-xs text-rose-500">Menunggu</span>
                        </div>
                    </Card>

                    <Card className="p-4 bg-white dark:bg-slate-800 border-l-4 border-l-blue-500">
                        <p className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">In Progress</p>
                        <div className="flex items-baseline justify-between mt-2">
                            <span className="text-2xl font-black text-blue-600 dark:text-blue-400">{metrics.in_progress || 0}</span>
                            <span className="text-xs text-blue-500">Sedang Dikerjakan</span>
                        </div>
                    </Card>

                    <Card className="p-4 bg-white dark:bg-slate-800 border-l-4 border-l-amber-500">
                        <p className="text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wider">Tunggu Part</p>
                        <div className="flex items-baseline justify-between mt-2">
                            <span className="text-2xl font-black text-amber-600 dark:text-amber-400">{metrics.waiting_parts || 0}</span>
                            <span className="text-xs text-amber-500">Sparepart</span>
                        </div>
                    </Card>

                    <Card className="p-4 bg-white dark:bg-slate-800 border-l-4 border-l-emerald-500">
                        <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Selesai (RFU)</p>
                        <div className="flex items-baseline justify-between mt-2">
                            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{metrics.completed || 0}</span>
                            <span className="text-xs text-emerald-600/80">Pulih Siaga</span>
                        </div>
                    </Card>

                    <Card className="p-4 bg-white dark:bg-slate-800 border-l-4 border-l-purple-500">
                        <p className="text-xs font-medium text-purple-600 dark:text-purple-400 uppercase tracking-wider">Akumulasi Downtime</p>
                        <div className="flex items-baseline justify-between mt-2">
                            <span className="text-2xl font-black text-purple-600 dark:text-purple-400">{metrics.total_downtime_hours || 0}</span>
                            <span className="text-xs text-purple-500">Jam Mati</span>
                        </div>
                    </Card>
                </div>

                {/* Filter Bar */}
                <Card className="p-5 bg-white dark:bg-slate-800">
                    <form onSubmit={handleFilter} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Status Work Order</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            >
                                <option value="">Semua Status</option>
                                <option value="open">Open (Antre)</option>
                                <option value="in_progress">In Progress (Perbaikan)</option>
                                <option value="waiting_parts">Waiting Parts</option>
                                <option value="completed">Completed (Selesai RFU)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Prioritas</label>
                            <select
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            >
                                <option value="">Semua Prioritas</option>
                                <option value="critical_emergency">Critical Emergency</option>
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Armada Unit</label>
                            <select
                                value={unitId}
                                onChange={(e) => setUnitId(e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            >
                                <option value="">Semua Unit</option>
                                {master.units?.map((u) => (
                                    <option key={u.id} value={u.id}>{u.unit_code} ({u.status})</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-end space-x-2">
                            <Button type="submit" variant="primary" className="flex-1 flex items-center justify-center space-x-1">
                                <Filter className="w-4 h-4" />
                                <span>Filter</span>
                            </Button>
                            <Button type="button" variant="secondary" onClick={handleReset}>
                                Reset
                            </Button>
                        </div>
                    </form>
                </Card>

                {/* Table Work Orders */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                                    <th className="py-3.5 px-4">No. WO & Waktu Kejadian</th>
                                    <th className="py-3.5 px-4">Armada & Sumber Kerusakan</th>
                                    <th className="py-3.5 px-4">Ringkasan Kerusakan</th>
                                    <th className="py-3.5 px-4">Prioritas</th>
                                    <th className="py-3.5 px-4">Mekanik PIC</th>
                                    <th className="py-3.5 px-4">Downtime (Jam)</th>
                                    <th className="py-3.5 px-4">Status & Progres</th>
                                    <th className="py-3.5 px-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {workOrders.data?.length > 0 ? (
                                    workOrders.data.map((wo) => {
                                        const downtimeHours = wo.downtime_minutes ? (wo.downtime_minutes / 60).toFixed(1) : '-';
                                        return (
                                            <tr key={wo.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                                <td className="py-3.5 px-4">
                                                    <div className="font-mono font-bold text-slate-900 dark:text-white">
                                                        {wo.wo_number}
                                                    </div>
                                                    <div className="text-xs text-slate-500">
                                                        {wo.breakdown_time ? new Date(wo.breakdown_time).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : '-'}
                                                    </div>
                                                </td>

                                                <td className="py-3.5 px-4">
                                                    <div className="font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                                                        <Truck className="w-4 h-4 text-emerald-600" />
                                                        <span>{wo.unit?.unit_code}</span>
                                                    </div>
                                                    <div className="text-xs text-slate-500 dark:text-slate-400">
                                                        {formatSource(wo.source)}
                                                    </div>
                                                </td>

                                                <td className="py-3.5 px-4 max-w-xs">
                                                    <p className="text-xs text-slate-800 dark:text-slate-200 line-clamp-2" title={wo.defect_summary}>
                                                        {wo.defect_summary}
                                                    </p>
                                                    {wo.action_taken && (
                                                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 italic line-clamp-1">
                                                            Tindakan: {wo.action_taken}
                                                        </p>
                                                    )}
                                                </td>

                                                <td className="py-3.5 px-4">
                                                    {getPriorityBadge(wo.priority)}
                                                </td>

                                                <td className="py-3.5 px-4">
                                                    <div className="text-slate-900 dark:text-white text-xs font-medium flex items-center space-x-1">
                                                        <User className="w-3.5 h-3.5 text-blue-500" />
                                                        <span>{wo.mechanic?.name || 'Belum Ditugaskan'}</span>
                                                    </div>
                                                </td>

                                                <td className="py-3.5 px-4">
                                                    <span className="font-mono text-xs font-bold text-purple-600 dark:text-purple-400">
                                                        {downtimeHours !== '-' ? `${downtimeHours} Jam` : 'Berjalan...'}
                                                    </span>
                                                </td>

                                                <td className="py-3.5 px-4">
                                                    {getStatusBadge(wo.status)}
                                                </td>

                                                <td className="py-3.5 px-4 text-right">
                                                    <Button
                                                        size="sm"
                                                        variant={wo.status === 'completed' ? 'secondary' : 'primary'}
                                                        onClick={() => handleOpenStatus(wo)}
                                                        className="inline-flex items-center space-x-1"
                                                    >
                                                        <Wrench className="w-3.5 h-3.5" />
                                                        <span>{wo.status === 'completed' ? 'Detail' : 'Update Status'}</span>
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="py-12 text-center text-slate-400 dark:text-slate-500">
                                            Belum ada data Work Order perbaikan yang sesuai filter.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                            Menampilkan {workOrders.data?.length || 0} dari {workOrders.total || 0} Work Orders
                        </span>
                        <Pagination links={workOrders.links} />
                    </div>
                </div>
            </div>

            {/* Modal Create Work Order */}
            <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Terbitkan Work Order (SPK Perbaikan) Baru" maxWidth="max-w-2xl">
                <form onSubmit={submitCreate} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Armada Unit Mengalami Kendala *</label>
                            <select
                                required
                                value={createForm.data.unit_id}
                                onChange={(e) => createForm.setData('unit_id', e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            >
                                {master.units?.map((u) => (
                                    <option key={u.id} value={u.id}>{u.unit_code} - {u.unit_type} (Status: {u.status})</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Sumber Kejadian *</label>
                            <select
                                required
                                value={createForm.data.source}
                                onChange={(e) => createForm.setData('source', e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            >
                                <option value="road_breakdown">Breakdown Jalan Hauling</option>
                                <option value="p2h_defect">Temuan P2H Digital Driver</option>
                                <option value="scheduled_pm">Jadwal PM Berkala</option>
                                <option value="inspection">Inspeksi Mekanik / K3LH</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Tingkat Prioritas *</label>
                            <select
                                required
                                value={createForm.data.priority}
                                onChange={(e) => createForm.setData('priority', e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            >
                                <option value="critical_emergency">Critical Emergency (Stop Operasi)</option>
                                <option value="high">High (Mendesak)</option>
                                <option value="medium">Medium (Normal)</option>
                                <option value="low">Low (Ringan)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Waktu Mulai Breakdown *</label>
                            <input
                                type="datetime-local"
                                required
                                value={createForm.data.breakdown_time}
                                onChange={(e) => createForm.setData('breakdown_time', e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Mekanik PIC / Penanggung Jawab</label>
                            <select
                                value={createForm.data.assigned_mechanic_id}
                                onChange={(e) => createForm.setData('assigned_mechanic_id', e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            >
                                <option value="">Pilih Mekanik</option>
                                {master.mechanics?.map((m) => (
                                    <option key={m.id} value={m.id}>{m.name} ({m.employee_code})</option>
                                ))}
                            </select>
                        </div>

                        <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Deskripsi Kerusakan / Gejala *</label>
                            <textarea
                                rows="3"
                                required
                                placeholder="Contoh: Mesin overheat di hauling road KM 14, selang radiator bocor, perlu penggantian selang dan coolant..."
                                value={createForm.data.defect_summary}
                                onChange={(e) => createForm.setData('defect_summary', e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            ></textarea>
                        </div>
                    </div>

                    <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-700 dark:text-rose-300">
                        <strong>Catatan:</strong> Penerbitan Work Order ini otomatis mengubah status unit yang dipilih menjadi <strong>BREAKDOWN</strong> dan membatasi penugasan di Daily Dispatch.
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <Button type="button" variant="secondary" onClick={() => setIsCreateOpen(false)}>
                            Batal
                        </Button>
                        <Button type="submit" variant="primary" disabled={createForm.processing}>
                            {createForm.processing ? 'Menerbitkan...' : 'Terbitkan Work Order'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Modal Update Status WO */}
            {selectedWo && (
                <Modal isOpen={isStatusOpen} onClose={() => setIsStatusOpen(false)} title={`Update Status Work Order: ${selectedWo.wo_number}`} maxWidth="max-w-xl">
                    <form onSubmit={submitStatus} className="space-y-4">
                        <div className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl space-y-1 text-xs">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Armada Unit:</span>
                                <span className="font-bold text-slate-900 dark:text-white text-sm">{selectedWo.unit?.unit_code}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Kerusakan:</span>
                                <span className="text-slate-800 dark:text-slate-200">{selectedWo.defect_summary}</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Status Progres *</label>
                            <select
                                required
                                value={statusForm.data.status}
                                onChange={(e) => statusForm.setData('status', e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
                            >
                                <option value="open">Open (Antre Diperiksa)</option>
                                <option value="in_progress">In Progress (Sedang Dikerjakan Mekanik)</option>
                                <option value="waiting_parts">Waiting Parts (Menunggu Ketersediaan Sparepart)</option>
                                <option value="completed">Completed (Perbaikan Selesai - Pulihkan ke RFU!)</option>
                                <option value="cancelled">Cancelled (Dibatalkan)</option>
                            </select>
                        </div>

                        {statusForm.data.status === 'completed' && (
                            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-xl flex items-start space-x-2 text-xs text-emerald-800 dark:text-emerald-200">
                                <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <strong>Pemulihan Status Armada Otomatis:</strong>
                                    <p className="mt-0.5">
                                        Dengan menandai status <strong>COMPLETED</strong>, sistem akan mencatat waktu selesai, menghitung total menit downtime, dan secara otomatis <strong>MENGEMBALIKAN STATUS ARMADA MENJADI STANDBY / RFU (READY FOR USE)</strong> sehingga siap dijadwalkan kembali dalam Daily Dispatch.
                                    </p>
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Mekanik PIC</label>
                            <select
                                value={statusForm.data.assigned_mechanic_id}
                                onChange={(e) => statusForm.setData('assigned_mechanic_id', e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            >
                                <option value="">Pilih Mekanik</option>
                                {master.mechanics?.map((m) => (
                                    <option key={m.id} value={m.id}>{m.name} ({m.employee_code})</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Tindakan Perbaikan yang Dilakukan</label>
                            <textarea
                                rows="3"
                                placeholder="Contoh: Penggantian selang radiator atas, pengisian coolant baru 10 liter, uji running mesin 15 menit temperatur normal..."
                                value={statusForm.data.action_taken}
                                onChange={(e) => statusForm.setData('action_taken', e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            ></textarea>
                        </div>

                        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                            <Button type="button" variant="secondary" onClick={() => setIsStatusOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit" variant="primary" disabled={statusForm.processing}>
                                {statusForm.processing ? 'Menyimpan...' : 'Perbarui Status'}
                            </Button>
                        </div>
                    </form>
                </Modal>
            )}
        </DashboardLayout>
    );
}
