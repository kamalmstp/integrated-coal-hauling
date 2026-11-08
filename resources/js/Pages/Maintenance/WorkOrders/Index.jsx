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
    Search,
    Truck,
    Clock,
    AlertTriangle,
    CheckCircle2,
    Users,
    DollarSign,
    FileText,
    Eye,
    ChevronRight,
    UserCheck,
    CheckSquare,
    Package,
    ShieldAlert,
} from 'lucide-react';

export default function WorkOrderIndex({
    workOrders = { data: [], links: [] },
    metrics = {},
    filters = {},
    master = {},
}) {
    const [search, setSearch] = useState(filters.search || '');
    const [siteId, setSiteId] = useState(filters.site_id || '');
    const [unitId, setUnitId] = useState(filters.unit_id || '');
    const [status, setStatus] = useState(filters.status || '');
    const [priority, setPriority] = useState(filters.priority || '');
    const [jobType, setJobType] = useState(filters.job_type || '');

    // Modals
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isStatusOpen, setIsStatusOpen] = useState(false);
    const [isAssignOpen, setIsAssignOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isTaskOpen, setIsTaskOpen] = useState(false);
    const [selectedWo, setSelectedWo] = useState(null);
    const [woDetail, setWoDetail] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(false);

    // Form: Create Work Order
    const createForm = useForm({
        site_id: master.sites?.[0]?.id || '',
        unit_id: master.units?.[0]?.id || '',
        job_type: 'corrective_maintenance',
        priority: 'high',
        breakdown_time: new Date().toISOString().slice(0, 16),
        target_completion_date: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
        hm_at_service: '',
        km_at_service: '',
        defect_summary: '',
        initial_complaint: '',
        diagnosis: '',
        assigned_mechanic_id: master.mechanics?.[0]?.id || '',
        supervisor_id: master.mechanics?.[0]?.id || '',
        estimated_cost: '',
    });

    // Form: Status Update
    const statusForm = useForm({
        status: 'in_progress',
        diagnosis: '',
        root_cause: '',
        completion_time: '',
        downtime_minutes: '',
    });

    // Form: Assign Mechanic
    const assignForm = useForm({
        mechanic_id: master.mechanics?.[0]?.id || '',
        assignment_role: 'lead_mechanic',
        shift: 'shift_1',
        instructions: '',
    });

    // Form: Add Task
    const taskForm = useForm({
        task_description: '',
        estimated_minutes: 60,
    });

    const handleFilter = (e) => {
        e.preventDefault();
        router.get('/maintenance/work-orders', {
            site_id: siteId || undefined,
            unit_id: unitId || undefined,
            status: status || undefined,
            priority: priority || undefined,
            job_type: jobType || undefined,
            search: search || undefined,
        }, { preserveState: true });
    };

    const handleReset = () => {
        setSearch('');
        setSiteId('');
        setUnitId('');
        setStatus('');
        setPriority('');
        setJobType('');
        router.get('/maintenance/work-orders');
    };

    const openDetailModal = async (wo) => {
        setSelectedWo(wo);
        setIsDetailOpen(true);
        setLoadingDetail(true);
        try {
            const res = await fetch(`/maintenance/work-orders/${wo.id}`);
            const data = await res.json();
            setWoDetail(data);
        } catch (err) {
            console.error('Failed to fetch WO details', err);
        } finally {
            setLoadingDetail(false);
        }
    };

    const openStatusModal = (wo) => {
        setSelectedWo(wo);
        statusForm.setData({
            status: wo.status === 'open' ? 'in_progress' : (wo.status === 'in_progress' ? 'completed' : wo.status),
            diagnosis: wo.diagnosis || '',
            root_cause: wo.root_cause || '',
            completion_time: wo.completion_time ? wo.completion_time.slice(0, 16) : new Date().toISOString().slice(0, 16),
            downtime_minutes: wo.downtime_minutes || '',
        });
        setIsStatusOpen(true);
    };

    const openAssignModal = (wo) => {
        setSelectedWo(wo);
        assignForm.setData({
            mechanic_id: master.mechanics?.[0]?.id || '',
            assignment_role: 'assistant_mechanic',
            shift: 'shift_1',
            instructions: '',
        });
        setIsAssignOpen(true);
    };

    const openTaskModal = (wo) => {
        setSelectedWo(wo);
        taskForm.setData({
            task_description: '',
            estimated_minutes: 60,
        });
        setIsTaskOpen(true);
    };

    const submitCreate = (e) => {
        e.preventDefault();
        createForm.post('/maintenance/work-orders', {
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
            },
        });
    };

    const submitStatus = (e) => {
        e.preventDefault();
        statusForm.post(`/maintenance/work-orders/${selectedWo.id}/status`, {
            onSuccess: () => {
                setIsStatusOpen(false);
            },
        });
    };

    const submitAssign = (e) => {
        e.preventDefault();
        assignForm.post(`/maintenance/work-orders/${selectedWo.id}/assign-mechanic`, {
            onSuccess: () => {
                setIsAssignOpen(false);
                assignForm.reset();
            },
        });
    };

    const submitTask = (e) => {
        e.preventDefault();
        taskForm.post(`/maintenance/work-orders/${selectedWo.id}/tasks`, {
            onSuccess: () => {
                setIsTaskOpen(false);
                taskForm.reset();
                if (isDetailOpen && selectedWo) {
                    openDetailModal(selectedWo);
                }
            },
        });
    };

    const toggleTask = (taskId) => {
        router.post(`/maintenance/work-orders/tasks/${taskId}/toggle`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                if (selectedWo) {
                    openDetailModal(selectedWo);
                }
            },
        });
    };

    const getStatusBadge = (st) => {
        const map = {
            draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
            open: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
            submitted: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
            approved: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
            assigned: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
            in_progress: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
            waiting_sparepart: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
            waiting_inspection: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
            completed: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
            closed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
            cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
        };
        return <span className={`px-2.5 py-1 text-xs font-semibold rounded-full uppercase tracking-wider ${map[st] || 'bg-gray-100 text-gray-700'}`}>{st?.replace('_', ' ')}</span>;
    };

    const getPriorityBadge = (p) => {
        const map = {
            critical: 'bg-red-500 text-white animate-pulse',
            high: 'bg-orange-500 text-white',
            medium: 'bg-yellow-500 text-gray-900',
            low: 'bg-blue-500 text-white',
        };
        return <span className={`px-2 py-0.5 text-xs font-bold rounded ${map[p] || 'bg-gray-500 text-white'}`}>{p?.toUpperCase()}</span>;
    };

    const getJobTypeLabel = (jt) => {
        const map = {
            preventive_maintenance: 'Preventive (PM)',
            corrective_maintenance: 'Corrective (CM)',
            emergency_repair: 'Emergency Repair',
            inspection: 'Inspection',
            tire_maintenance: 'Tire Service',
            electrical_repair: 'Electrical Repair',
            general_repair: 'General Repair',
        };
        return map[jt] || jt;
    };

    return (
        <DashboardLayout>
            <Head title="Work Order Management — TAP Maintenance" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                            <Wrench className="w-7 h-7 text-amber-500" />
                            Work Order Management
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Pusat kendali operasional workshop: penugasan mekanik, progres pengerjaan, pergantian sparepart, dan histori reparasi unit.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            onClick={() => setIsCreateOpen(true)}
                            className="bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-2 shadow-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Buat Work Order Baru
                        </Button>
                    </div>
                </div>

                {/* Metrics Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                    <Card className="p-3 text-center border-l-4 border-l-blue-500">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total WO</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{metrics.total || 0}</p>
                    </Card>
                    <Card className="p-3 text-center border-l-4 border-l-cyan-500">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Open / Assigned</p>
                        <p className="text-xl font-bold text-cyan-600 dark:text-cyan-400 mt-1">{metrics.open || 0}</p>
                    </Card>
                    <Card className="p-3 text-center border-l-4 border-l-amber-500">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">In Progress</p>
                        <p className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">{metrics.in_progress || 0}</p>
                    </Card>
                    <Card className="p-3 text-center border-l-4 border-l-orange-500">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Waiting Part</p>
                        <p className="text-xl font-bold text-orange-600 dark:text-orange-400 mt-1">{metrics.waiting_spareparts || 0}</p>
                    </Card>
                    <Card className="p-3 text-center border-l-4 border-l-purple-500">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Waiting Inspect</p>
                        <p className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-1">{metrics.waiting_inspection || 0}</p>
                    </Card>
                    <Card className="p-3 text-center border-l-4 border-l-green-500">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Completed / Closed</p>
                        <p className="text-xl font-bold text-green-600 dark:text-green-400 mt-1">{(metrics.completed || 0) + (metrics.closed || 0)}</p>
                    </Card>
                    <Card className="p-3 text-center border-l-4 border-l-red-500">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Downtime</p>
                        <p className="text-xl font-bold text-red-600 dark:text-red-400 mt-1">{metrics.total_downtime_hours || 0}h</p>
                    </Card>
                </div>

                {/* Filter Bar */}
                <Card className="p-4">
                    <form onSubmit={handleFilter} className="grid grid-cols-1 md:grid-cols-6 gap-3">
                        <div className="relative md:col-span-2">
                            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari WO#, Unit, Gejala, Diagnosa..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            />
                        </div>

                        <div>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full py-2 px-3 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            >
                                <option value="">Semua Status</option>
                                <option value="open">Open</option>
                                <option value="assigned">Assigned</option>
                                <option value="in_progress">In Progress</option>
                                <option value="waiting_sparepart">Waiting Sparepart</option>
                                <option value="waiting_inspection">Waiting Inspection</option>
                                <option value="completed">Completed</option>
                                <option value="closed">Closed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>

                        <div>
                            <select
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                                className="w-full py-2 px-3 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            >
                                <option value="">Semua Prioritas</option>
                                <option value="critical">Critical</option>
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                            </select>
                        </div>

                        <div>
                            <select
                                value={jobType}
                                onChange={(e) => setJobType(e.target.value)}
                                className="w-full py-2 px-3 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            >
                                <option value="">Semua Jenis Pekerjaan</option>
                                <option value="preventive_maintenance">Preventive Maintenance</option>
                                <option value="corrective_maintenance">Corrective Maintenance</option>
                                <option value="emergency_repair">Emergency Repair</option>
                                <option value="inspection">Inspection</option>
                                <option value="tire_maintenance">Tire Maintenance</option>
                                <option value="electrical_repair">Electrical Repair</option>
                                <option value="general_repair">General Repair</option>
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

                {/* Table */}
                <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    <th className="py-3 px-4">WO Number</th>
                                    <th className="py-3 px-4">Unit</th>
                                    <th className="py-3 px-4">Tipe & Prioritas</th>
                                    <th className="py-3 px-4">Keluhan & Diagnosa</th>
                                    <th className="py-3 px-4">Lead Mekanik</th>
                                    <th className="py-3 px-4">Status & RFU</th>
                                    <th className="py-3 px-4">Downtime</th>
                                    <th className="py-3 px-4 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                                {workOrders.data?.length > 0 ? (
                                    workOrders.data.map((wo) => (
                                        <tr key={wo.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition">
                                            <td className="py-3 px-4 whitespace-nowrap">
                                                <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                                                    <FileText className="w-4 h-4 text-amber-500" />
                                                    {wo.wo_number}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    {wo.breakdown_time ? new Date(wo.breakdown_time).toLocaleDateString('id-ID') : '-'}
                                                </div>
                                                {wo.job_card && (
                                                    <span className="inline-block mt-0.5 text-[10px] font-mono bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-1.5 py-0.5 rounded">
                                                        JC: {wo.job_card.job_card_number}
                                                    </span>
                                                )}
                                            </td>

                                            <td className="py-3 px-4 whitespace-nowrap">
                                                <div className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                                                    <Truck className="w-4 h-4 text-blue-500" />
                                                    {wo.unit?.unit_code || '-'}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    {wo.unit?.registration_number} • {wo.unit?.unit_type}
                                                </div>
                                                <div className="text-[11px] text-gray-400">
                                                    HM: {wo.hm_at_service || wo.unit?.last_hm || 0}
                                                </div>
                                            </td>

                                            <td className="py-3 px-4 whitespace-nowrap">
                                                <div className="text-xs font-medium text-gray-800 dark:text-gray-200">
                                                    {getJobTypeLabel(wo.job_type)}
                                                </div>
                                                <div className="mt-1">
                                                    {getPriorityBadge(wo.priority)}
                                                </div>
                                            </td>

                                            <td className="py-3 px-4 max-w-xs">
                                                <div className="text-xs font-medium text-gray-900 dark:text-white line-clamp-1">
                                                    {wo.defect_summary || wo.initial_complaint || 'Tidak ada keterangan'}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 italic mt-0.5">
                                                    Diag: {wo.diagnosis || 'Belum ada diagnosa'}
                                                </div>
                                            </td>

                                            <td className="py-3 px-4 whitespace-nowrap">
                                                <div className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                                                    {wo.mechanic?.name || 'Belum ditugaskan'}
                                                </div>
                                                {wo.assignments?.length > 1 && (
                                                    <div className="text-[11px] text-cyan-600 dark:text-cyan-400 flex items-center gap-1">
                                                        <Users className="w-3 h-3" />
                                                        +{wo.assignments.length - 1} asisten
                                                    </div>
                                                )}
                                            </td>

                                            <td className="py-3 px-4 whitespace-nowrap">
                                                <div>{getStatusBadge(wo.status)}</div>
                                                <div className="mt-1 text-[11px]">
                                                    {wo.rfu_status === 'approved_rfu' ? (
                                                        <span className="text-green-600 dark:text-green-400 font-bold flex items-center gap-1">
                                                            <CheckCircle2 className="w-3 h-3" /> RFU Disetujui
                                                        </span>
                                                    ) : wo.rfu_status === 'waiting_inspection' ? (
                                                        <span className="text-purple-600 dark:text-purple-400 font-medium">
                                                            Menunggu Inspeksi
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400">{wo.rfu_status?.replace('_', ' ')}</span>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="py-3 px-4 whitespace-nowrap text-xs">
                                                <div className="font-mono font-medium text-gray-800 dark:text-gray-200">
                                                    {wo.downtime_minutes ? `${Math.round(wo.downtime_minutes / 60 * 10) / 10} jam` : '-'}
                                                </div>
                                                <div className="text-[11px] text-gray-400">
                                                    Rp {Number(wo.actual_cost || 0).toLocaleString('id-ID')}
                                                </div>
                                            </td>

                                            <td className="py-3 px-4 whitespace-nowrap text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Button
                                                        onClick={() => openDetailModal(wo)}
                                                        variant="ghost"
                                                        className="p-1 text-gray-600 hover:text-blue-600"
                                                        title="Detail Work Order"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Button>

                                                    <Button
                                                        onClick={() => openStatusModal(wo)}
                                                        variant="ghost"
                                                        className="p-1 text-amber-600 hover:text-amber-700"
                                                        title="Update Status / Selesaikan"
                                                    >
                                                        <Clock className="w-4 h-4" />
                                                    </Button>

                                                    <Button
                                                        onClick={() => openAssignModal(wo)}
                                                        variant="ghost"
                                                        className="p-1 text-cyan-600 hover:text-cyan-700"
                                                        title="Tugaskan Mekanik"
                                                    >
                                                        <Users className="w-4 h-4" />
                                                    </Button>

                                                    <Button
                                                        onClick={() => openTaskModal(wo)}
                                                        variant="ghost"
                                                        className="p-1 text-emerald-600 hover:text-emerald-700"
                                                        title="Tambah Task Checklist"
                                                    >
                                                        <CheckSquare className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="py-8 text-center text-gray-500 dark:text-gray-400">
                                            Tidak ada Work Order yang sesuai filter pencarian.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {workOrders.links && (
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                            <Pagination links={workOrders.links} />
                        </div>
                    )}
                </Card>

                {/* MODAL: CREATE WORK ORDER */}
                <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Buat Work Order Baru" maxWidth="max-w-3xl">
                    <form onSubmit={submitCreate} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                        <option key={u.id} value={u.id}>{u.unit_code} - {u.unit_type} ({u.status})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1">Jenis Pekerjaan (Job Type) *</label>
                                <select
                                    value={createForm.data.job_type}
                                    onChange={(e) => createForm.setData('job_type', e.target.value)}
                                    className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                    required
                                >
                                    <option value="corrective_maintenance">Corrective Maintenance (CM)</option>
                                    <option value="preventive_maintenance">Preventive Maintenance (PM)</option>
                                    <option value="emergency_repair">Emergency Breakdown Repair</option>
                                    <option value="tire_maintenance">Tire Maintenance</option>
                                    <option value="electrical_repair">Electrical Repair</option>
                                    <option value="inspection">Periodic Inspection</option>
                                    <option value="general_repair">General Repair & Fabrication</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1">Tingkat Prioritas *</label>
                                <select
                                    value={createForm.data.priority}
                                    onChange={(e) => createForm.setData('priority', e.target.value)}
                                    className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                    required
                                >
                                    <option value="critical">CRITICAL (Unit Stop / Bahaya Keselamatan)</option>
                                    <option value="high">HIGH (Segera Ditangani)</option>
                                    <option value="medium">MEDIUM (Normal Workshop Queue)</option>
                                    <option value="low">LOW (Minor Maintenance)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1">Waktu Masuk Breakdown / Servis *</label>
                                <input
                                    type="datetime-local"
                                    value={createForm.data.breakdown_time}
                                    onChange={(e) => createForm.setData('breakdown_time', e.target.value)}
                                    className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1">Target Selesai (Target Completion)</label>
                                <input
                                    type="datetime-local"
                                    value={createForm.data.target_completion_date}
                                    onChange={(e) => createForm.setData('target_completion_date', e.target.value)}
                                    className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1">HM Saat Masuk Workshop</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    placeholder="Contoh: 1250.5"
                                    value={createForm.data.hm_at_service}
                                    onChange={(e) => createForm.setData('hm_at_service', e.target.value)}
                                    className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1">KM Saat Masuk Workshop</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    placeholder="Contoh: 24500"
                                    value={createForm.data.km_at_service}
                                    onChange={(e) => createForm.setData('km_at_service', e.target.value)}
                                    className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1">Lead Mekanik</label>
                                <select
                                    value={createForm.data.assigned_mechanic_id}
                                    onChange={(e) => createForm.setData('assigned_mechanic_id', e.target.value)}
                                    className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                >
                                    <option value="">Pilih Lead Mekanik...</option>
                                    {master.mechanics?.map((m) => (
                                        <option key={m.id} value={m.id}>{m.name} ({m.employee_code})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1">Supervisor Pengawas</label>
                                <select
                                    value={createForm.data.supervisor_id}
                                    onChange={(e) => createForm.setData('supervisor_id', e.target.value)}
                                    className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                >
                                    <option value="">Pilih Supervisor Workshop...</option>
                                    {master.mechanics?.map((m) => (
                                        <option key={m.id} value={m.id}>{m.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1">Ringkasan Kerusakan (Defect Summary) *</label>
                            <input
                                type="text"
                                placeholder="Contoh: Bunyi gemuruh pada rem belakang kanan dan pedal rem ambles"
                                value={createForm.data.defect_summary}
                                onChange={(e) => createForm.setData('defect_summary', e.target.value)}
                                className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1">Keluhan Awal Operator/Driver</label>
                                <textarea
                                    rows="2"
                                    placeholder="Keluhan yang dilaporkan saat awal kejadian..."
                                    value={createForm.data.initial_complaint}
                                    onChange={(e) => createForm.setData('initial_complaint', e.target.value)}
                                    className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1">Diagnosa Awal Mekanik</label>
                                <textarea
                                    rows="2"
                                    placeholder="Hasil pemeriksaan awal mekanik workshop..."
                                    value={createForm.data.diagnosis}
                                    onChange={(e) => createForm.setData('diagnosis', e.target.value)}
                                    className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={createForm.processing} className="bg-amber-600 hover:bg-amber-700 text-white">
                                {createForm.processing ? 'Menyimpan...' : 'Buat Work Order & Job Card'}
                            </Button>
                        </div>
                    </form>
                </Modal>

                {/* MODAL: UPDATE STATUS */}
                <Modal isOpen={isStatusOpen} onClose={() => setIsStatusOpen(false)} title={`Update Status WO: ${selectedWo?.wo_number}`} maxWidth="max-w-lg">
                    <form onSubmit={submitStatus} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1">Pilih Status Baru *</label>
                            <select
                                value={statusForm.data.status}
                                onChange={(e) => statusForm.setData('status', e.target.value)}
                                className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                required
                            >
                                <option value="in_progress">In Progress (Sedang Dikerjakan)</option>
                                <option value="waiting_sparepart">Waiting Sparepart (Menunggu Part)</option>
                                <option value="waiting_inspection">Waiting Inspection (Selesai Servis, Siap QA)</option>
                                <option value="completed">Completed (Pekerjaan Workshop Selesai)</option>
                                <option value="closed">Closed (Ditutup Resmi)</option>
                                <option value="cancelled">Cancelled (Dibatalkan)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1">Diagnosa Akhir / Temuan</label>
                            <textarea
                                rows="2"
                                value={statusForm.data.diagnosis}
                                onChange={(e) => statusForm.setData('diagnosis', e.target.value)}
                                placeholder="Penyebab kerusakan yang terverifikasi..."
                                className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1">Root Cause (Akar Masalah)</label>
                            <textarea
                                rows="2"
                                value={statusForm.data.root_cause}
                                onChange={(e) => statusForm.setData('root_cause', e.target.value)}
                                placeholder="Analisis akar masalah (misal: keausan normal, jalan berlumpur, human error)..."
                                className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1">Waktu Selesai</label>
                                <input
                                    type="datetime-local"
                                    value={statusForm.data.completion_time}
                                    onChange={(e) => statusForm.setData('completion_time', e.target.value)}
                                    className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1">Total Downtime (Menit)</label>
                                <input
                                    type="number"
                                    value={statusForm.data.downtime_minutes}
                                    onChange={(e) => statusForm.setData('downtime_minutes', e.target.value)}
                                    placeholder="Otomatis dihitung jika kosong"
                                    className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                            <Button type="button" variant="outline" onClick={() => setIsStatusOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={statusForm.processing} className="bg-amber-600 hover:bg-amber-700 text-white">
                                {statusForm.processing ? 'Menyimpan...' : 'Perbarui Status'}
                            </Button>
                        </div>
                    </form>
                </Modal>

                {/* MODAL: ASSIGN MECHANIC */}
                <Modal isOpen={isAssignOpen} onClose={() => setIsAssignOpen(false)} title={`Tugaskan Mekanik: ${selectedWo?.wo_number}`} maxWidth="max-w-md">
                    <form onSubmit={submitAssign} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1">Pilih Mekanik *</label>
                            <select
                                value={assignForm.data.mechanic_id}
                                onChange={(e) => assignForm.setData('mechanic_id', e.target.value)}
                                className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                required
                            >
                                {master.mechanics?.map((m) => (
                                    <option key={m.id} value={m.id}>{m.name} ({m.employee_code})</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1">Peran Penugasan *</label>
                                <select
                                    value={assignForm.data.assignment_role}
                                    onChange={(e) => assignForm.setData('assignment_role', e.target.value)}
                                    className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                    required
                                >
                                    <option value="lead_mechanic">Lead Mekanik</option>
                                    <option value="assistant_mechanic">Assistant Mekanik</option>
                                    <option value="tire_man">Tire Man</option>
                                    <option value="auto_electrician">Auto Electrician</option>
                                    <option value="welder">Welder / Fabricator</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1">Shift Kerja *</label>
                                <select
                                    value={assignForm.data.shift}
                                    onChange={(e) => assignForm.setData('shift', e.target.value)}
                                    className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                    required
                                >
                                    <option value="shift_1">Shift 1 (Siang)</option>
                                    <option value="shift_2">Shift 2 (Malam)</option>
                                    <option value="long_shift">Long Shift</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1">Instruksi Khusus</label>
                            <textarea
                                rows="2"
                                value={assignForm.data.instructions}
                                onChange={(e) => assignForm.setData('instructions', e.target.value)}
                                placeholder="Petunjuk pengerjaan atau instruksi keselamatan..."
                                className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                            <Button type="button" variant="outline" onClick={() => setIsAssignOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={assignForm.processing} className="bg-cyan-600 hover:bg-cyan-700 text-white">
                                {assignForm.processing ? 'Menugaskan...' : 'Simpan Penugasan'}
                            </Button>
                        </div>
                    </form>
                </Modal>

                {/* MODAL: ADD TASK */}
                <Modal isOpen={isTaskOpen} onClose={() => setIsTaskOpen(false)} title={`Tambah Task Checklist: ${selectedWo?.wo_number}`} maxWidth="max-w-md">
                    <form onSubmit={submitTask} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1">Deskripsi Item Pekerjaan *</label>
                            <textarea
                                rows="2"
                                value={taskForm.data.task_description}
                                onChange={(e) => taskForm.setData('task_description', e.target.value)}
                                placeholder="Contoh: Bleeding sistem hidrolik steering dan cek kebocoran fitting"
                                className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1">Estimasi Durasi (Menit)</label>
                            <input
                                type="number"
                                value={taskForm.data.estimated_minutes}
                                onChange={(e) => taskForm.setData('estimated_minutes', e.target.value)}
                                className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                            <Button type="button" variant="outline" onClick={() => setIsTaskOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={taskForm.processing} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                {taskForm.processing ? 'Menyimpan...' : 'Tambah Task'}
                            </Button>
                        </div>
                    </form>
                </Modal>

                {/* MODAL: DETAIL WORK ORDER */}
                <Modal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} title={`Detail Work Order: ${selectedWo?.wo_number}`} maxWidth="max-w-4xl">
                    {loadingDetail ? (
                        <div className="py-12 text-center text-gray-500">Memuat rincian Work Order...</div>
                    ) : woDetail ? (
                        <div className="space-y-6">
                            {/* Summary header */}
                            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Unit Alat Berat</p>
                                    <p className="font-bold text-gray-900 dark:text-white text-base">{woDetail.unit?.unit_code} - {woDetail.unit?.unit_type}</p>
                                    <p className="text-xs text-gray-400">Nopol: {woDetail.unit?.registration_number}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Tipe & Status</p>
                                    <p className="font-semibold text-gray-900 dark:text-white">{getJobTypeLabel(woDetail.job_type)}</p>
                                    <div className="mt-1">{getStatusBadge(woDetail.status)}</div>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">HM & KM Servis</p>
                                    <p className="font-mono text-gray-900 dark:text-white font-semibold">HM: {woDetail.hm_at_service || '-'} | KM: {woDetail.km_at_service || '-'}</p>
                                    <p className="text-xs text-gray-400">Downtime: {woDetail.downtime_minutes ? `${Math.round(woDetail.downtime_minutes / 60 * 10) / 10} jam` : '-'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Total Biaya Aktual</p>
                                    <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                                        Rp {Number(woDetail.actual_cost || 0).toLocaleString('id-ID')}
                                    </p>
                                    <p className="text-xs text-gray-400">Estimasi: Rp {Number(woDetail.estimated_cost || 0).toLocaleString('id-ID')}</p>
                                </div>
                            </div>

                            {/* Complaint & Diagnosis */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                                    <p className="text-xs font-semibold text-gray-500 uppercase">Keluhan Awal & Ringkasan</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">{woDetail.defect_summary}</p>
                                    <p className="text-xs text-gray-500 mt-1 italic">{woDetail.initial_complaint || 'Tidak ada catatan tambahan'}</p>
                                </div>

                                <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                                    <p className="text-xs font-semibold text-gray-500 uppercase">Diagnosa & Akar Masalah (Root Cause)</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">Diagnosa: {woDetail.diagnosis || '-'}</p>
                                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">Root Cause: {woDetail.root_cause || '-'}</p>
                                </div>
                            </div>

                            {/* Tasks checklist */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                                        <CheckSquare className="w-4 h-4 text-emerald-500" />
                                        Task Checklist Pekerjaan ({woDetail.tasks?.length || 0})
                                    </h4>
                                    <Button onClick={() => openTaskModal(woDetail)} variant="ghost" className="text-xs text-emerald-600">
                                        + Tambah Task
                                    </Button>
                                </div>
                                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden divide-y divide-gray-200 dark:divide-gray-700 text-xs">
                                    {woDetail.tasks?.length > 0 ? (
                                        woDetail.tasks.map((task) => (
                                            <div key={task.id} className="p-2.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={task.status === 'completed'}
                                                        onChange={() => toggleTask(task.id)}
                                                        className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                                                    />
                                                    <span className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                                                        {task.task_description}
                                                    </span>
                                                </div>
                                                <div className="text-gray-400 font-mono">
                                                    {task.estimated_minutes} min • {task.completed_by?.name || (task.status === 'completed' ? 'Done' : 'Pending')}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-3 text-center text-gray-400 italic">Belum ada checklist pengerjaan.</div>
                                    )}
                                </div>
                            </div>

                            {/* Assigned Mechanics */}
                            <div>
                                <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5 mb-2">
                                    <Users className="w-4 h-4 text-cyan-500" />
                                    Mekanik yang Ditugaskan
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                    {woDetail.assignments?.map((a) => (
                                        <div key={a.id} className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-xs flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/30">
                                            <div>
                                                <p className="font-bold text-gray-900 dark:text-white">{a.mechanic?.name}</p>
                                                <p className="text-[11px] text-gray-400">{a.assignment_role?.replace('_', ' ')} • {a.shift}</p>
                                            </div>
                                            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300">
                                                {a.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Spareparts */}
                            <div>
                                <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5 mb-2">
                                    <Package className="w-4 h-4 text-orange-500" />
                                    Permintaan Sparepart Terkait ({woDetail.sparepart_requests?.length || 0})
                                </h4>
                                {woDetail.sparepart_requests?.length > 0 ? (
                                    <div className="space-y-2">
                                        {woDetail.sparepart_requests.map((sr) => (
                                            <div key={sr.id} className="p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs bg-gray-50 dark:bg-gray-800">
                                                <div className="flex justify-between items-center font-semibold text-gray-900 dark:text-white">
                                                    <span>{sr.request_number}</span>
                                                    <span className="font-mono text-emerald-600">Rp {Number(sr.total_cost || 0).toLocaleString('id-ID')}</span>
                                                </div>
                                                <div className="text-gray-500 dark:text-gray-400 mt-1">
                                                    Item: {sr.items?.map((item) => `${item.part_name} (${item.quantity} ${item.unit})`).join(', ')}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-3 text-center text-xs text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg italic">
                                        Belum ada sparepart yang diminta untuk WO ini.
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end pt-3 border-t border-gray-200 dark:border-gray-700">
                                <Button onClick={() => setIsDetailOpen(false)} variant="outline">
                                    Tutup
                                </Button>
                            </div>
                        </div>
                    ) : null}
                </Modal>
            </div>
        </DashboardLayout>
    );
}
