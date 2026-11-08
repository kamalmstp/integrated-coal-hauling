import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import DashboardLayout from '../../../components/templates/DashboardLayout';
import Card from '../../../components/molecules/Card';
import Button from '../../../components/atoms/Button';
import Modal from '../../../components/molecules/Modal';
import Pagination from '../../../components/molecules/Pagination';
import {
    ClipboardList,
    Plus,
    Filter,
    RefreshCw,
    Search,
    Truck,
    User,
    CheckCircle2,
    XCircle,
    CheckSquare,
    AlertTriangle,
    Eye,
} from 'lucide-react';

export default function MaintenanceRequestsIndex({
    requests = { data: [], links: [] },
    metrics = {},
    filters = {},
    master = {},
}) {
    const [search, setSearch] = useState(filters.search || '');
    const [siteId, setSiteId] = useState(filters.site_id || '');
    const [unitId, setUnitId] = useState(filters.unit_id || '');
    const [status, setStatus] = useState(filters.status || '');
    const [priority, setPriority] = useState(filters.priority || '');

    // Modals
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isApproveOpen, setIsApproveOpen] = useState(false);
    const [isRejectOpen, setIsRejectOpen] = useState(false);
    const [isConvertWoOpen, setIsConvertWoOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);

    // Form Create
    const createForm = useForm({
        site_id: master.sites?.[0]?.id || '',
        unit_id: master.units?.[0]?.id || '',
        requested_by: master.employees?.[0]?.id || '',
        requester_name: '',
        damage_category: 'engine',
        work_description: '',
        priority: 'medium',
        request_date: new Date().toISOString().split('T')[0],
        attachment_path: '',
    });

    // Form Approval
    const approveForm = useForm({
        approval_notes: 'Disetujui untuk diterbitkan SPK Work Order perbaikan.',
    });

    // Form Reject
    const rejectForm = useForm({
        approval_notes: '',
    });

    // Form Convert to WO
    const convertForm = useForm({
        job_type: 'corrective_maintenance',
        assigned_mechanic_id: master.employees?.[0]?.id || '',
        supervisor_id: master.employees?.[0]?.id || '',
        target_completion_date: '',
        estimated_cost: 2000000,
    });

    const handleFilter = (e) => {
        e?.preventDefault();
        router.get('/maintenance/requests', {
            site_id: siteId,
            unit_id: unitId,
            status,
            priority,
            search,
        }, { preserveState: true, preserveScroll: true });
    };

    const handleReset = () => {
        setSearch('');
        setSiteId('');
        setUnitId('');
        setStatus('');
        setPriority('');
        router.get('/maintenance/requests');
    };

    const submitCreate = (e) => {
        e.preventDefault();
        createForm.post('/maintenance/requests', {
            onSuccess: () => {
                createForm.reset();
                setIsCreateOpen(false);
            },
        });
    };

    const openApprove = (req) => {
        setSelectedRequest(req);
        setIsApproveOpen(true);
    };

    const submitApprove = (e) => {
        e.preventDefault();
        approveForm.put(`/maintenance/requests/${selectedRequest.id}/approve`, {
            onSuccess: () => {
                setIsApproveOpen(false);
            },
        });
    };

    const openReject = (req) => {
        setSelectedRequest(req);
        setIsRejectOpen(true);
    };

    const submitReject = (e) => {
        e.preventDefault();
        rejectForm.put(`/maintenance/requests/${selectedRequest.id}/reject`, {
            onSuccess: () => {
                setIsRejectOpen(false);
            },
        });
    };

    const openConvert = (req) => {
        setSelectedRequest(req);
        convertForm.setData({
            job_type: req.priority === 'critical' ? 'emergency_repair' : 'corrective_maintenance',
            assigned_mechanic_id: master.employees?.[0]?.id || '',
            supervisor_id: master.employees?.[0]?.id || '',
            target_completion_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
            estimated_cost: 2500000,
        });
        setIsConvertWoOpen(true);
    };

    const submitConvert = (e) => {
        e.preventDefault();
        convertForm.post(`/maintenance/requests/${selectedRequest.id}/convert-wo`, {
            onSuccess: () => {
                setIsConvertWoOpen(false);
            },
        });
    };

    const getStatusBadge = (st) => {
        switch (st) {
            case 'submitted':
                return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">Submitted</span>;
            case 'under_review':
                return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">Under Review</span>;
            case 'approved':
                return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">Approved</span>;
            case 'converted_to_wo':
                return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">Converted to WO</span>;
            case 'rejected':
                return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">Rejected</span>;
            default:
                return <span>{st}</span>;
        }
    };

    return (
        <DashboardLayout>
            <Head title="Maintenance Requests (Permohonan Servis & Perbaikan) - TAP" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div>
                        <div className="flex items-center space-x-3">
                            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                                <ClipboardList className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                                    Maintenance Request (Permohonan Servis/Perbaikan)
                                </h1>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Pengajuan kebutuhan perbaikan resmi dari lapangan, alur persetujuan, dan konversi ke SPK Work Order
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3 w-full sm:w-auto">
                        <Button
                            variant="secondary"
                            onClick={() => router.get('/maintenance/requests')}
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
                            <span>Ajukan Request Baru</span>
                        </Button>
                    </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-4">
                    <Card className="p-4 bg-white dark:bg-slate-800 border-l-4 border-l-slate-500">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Request</p>
                        <div className="flex items-baseline justify-between mt-2">
                            <span className="text-2xl font-black text-slate-900 dark:text-white">{metrics.total || 0}</span>
                            <span className="text-xs text-slate-400">Pengajuan</span>
                        </div>
                    </Card>

                    <Card className="p-4 bg-white dark:bg-slate-800 border-l-4 border-l-blue-500">
                        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Submitted</p>
                        <div className="flex items-baseline justify-between mt-2">
                            <span className="text-2xl font-black text-blue-600">{metrics.submitted || 0}</span>
                            <span className="text-xs text-blue-500">Baru</span>
                        </div>
                    </Card>

                    <Card className="p-4 bg-white dark:bg-slate-800 border-l-4 border-l-amber-500">
                        <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Under Review</p>
                        <div className="flex items-baseline justify-between mt-2">
                            <span className="text-2xl font-black text-amber-600">{metrics.under_review || 0}</span>
                            <span className="text-xs text-amber-500">Evaluasi</span>
                        </div>
                    </Card>

                    <Card className="p-4 bg-white dark:bg-slate-800 border-l-4 border-l-emerald-500">
                        <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Approved</p>
                        <div className="flex items-baseline justify-between mt-2">
                            <span className="text-2xl font-black text-emerald-600">{metrics.approved || 0}</span>
                            <span className="text-xs text-emerald-500">Disetujui</span>
                        </div>
                    </Card>

                    <Card className="p-4 bg-white dark:bg-slate-800 border-l-4 border-l-purple-500">
                        <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider">Jadi WO</p>
                        <div className="flex items-baseline justify-between mt-2">
                            <span className="text-2xl font-black text-purple-600">{metrics.converted || 0}</span>
                            <span className="text-xs text-purple-500">Terbit SPK</span>
                        </div>
                    </Card>

                    <Card className="p-4 bg-white dark:bg-slate-800 border-l-4 border-l-rose-500">
                        <p className="text-xs font-semibold text-rose-600 uppercase tracking-wider">Rejected</p>
                        <div className="flex items-baseline justify-between mt-2">
                            <span className="text-2xl font-black text-rose-600">{metrics.rejected || 0}</span>
                            <span className="text-xs text-rose-500">Ditolak</span>
                        </div>
                    </Card>
                </div>

                {/* Filter Bar */}
                <Card className="p-5 bg-white dark:bg-slate-800">
                    <form onSubmit={handleFilter} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Cari Request</label>
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="No. MR / Unit / Pelapor..."
                                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Site Proyek</label>
                            <select
                                value={siteId}
                                onChange={(e) => setSiteId(e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            >
                                <option value="">Semua Site</option>
                                {master.sites?.map((s) => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Status Request</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            >
                                <option value="">Semua Status</option>
                                <option value="submitted">Submitted (Baru)</option>
                                <option value="approved">Approved (Disetujui)</option>
                                <option value="converted_to_wo">Converted to WO</option>
                                <option value="rejected">Rejected (Ditolak)</option>
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
                                <option value="critical">Critical</option>
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
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

                {/* Table */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                                    <th className="py-3.5 px-4">No. Request & Tanggal</th>
                                    <th className="py-3.5 px-4">Armada & Site</th>
                                    <th className="py-3.5 px-4">Pelapor</th>
                                    <th className="py-3.5 px-4">Deskripsi Permohonan</th>
                                    <th className="py-3.5 px-4">Prioritas</th>
                                    <th className="py-3.5 px-4">Status & SPK</th>
                                    <th className="py-3.5 px-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {requests.data?.length > 0 ? (
                                    requests.data.map((req) => (
                                        <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                            <td className="py-3.5 px-4">
                                                <span className="font-mono font-bold text-slate-900 dark:text-white block">
                                                    {req.request_number}
                                                </span>
                                                <span className="text-xs text-slate-500">
                                                    {req.request_date}
                                                </span>
                                            </td>

                                            <td className="py-3.5 px-4">
                                                <div className="font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                                                    <Truck className="w-4 h-4 text-emerald-600" />
                                                    <span>{req.unit?.unit_code}</span>
                                                </div>
                                                <span className="text-xs text-slate-400">
                                                    {req.site?.name}
                                                </span>
                                            </td>

                                            <td className="py-3.5 px-4">
                                                <div className="text-slate-900 dark:text-white font-medium text-xs flex items-center space-x-1">
                                                    <User className="w-3.5 h-3.5 text-blue-500" />
                                                    <span>{req.requester_name}</span>
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-4 max-w-xs">
                                                <span className="font-semibold text-slate-900 dark:text-white text-xs block capitalize">
                                                    {req.damage_category?.replace('_', ' ')}
                                                </span>
                                                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2" title={req.work_description}>
                                                    {req.work_description}
                                                </p>
                                            </td>

                                            <td className="py-3.5 px-4">
                                                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                                                    req.priority === 'critical' ? 'bg-rose-100 text-rose-800' :
                                                    req.priority === 'high' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                                                }`}>
                                                    {req.priority}
                                                </span>
                                            </td>

                                            <td className="py-3.5 px-4">
                                                <div className="space-y-1">
                                                    <div>{getStatusBadge(req.status)}</div>
                                                    {req.work_order && (
                                                        <span className="inline-flex items-center text-[11px] font-mono font-bold text-emerald-600">
                                                            SPK: {req.work_order.wo_number}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-4 text-right">
                                                <div className="flex items-center justify-end space-x-1">
                                                    {req.status === 'submitted' && (
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                variant="primary"
                                                                onClick={() => openApprove(req)}
                                                                title="Setujui Request"
                                                            >
                                                                Setujui
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="danger"
                                                                onClick={() => openReject(req)}
                                                                title="Tolak Request"
                                                            >
                                                                Tolak
                                                            </Button>
                                                        </>
                                                    )}

                                                    {req.status === 'approved' && !req.work_order && (
                                                        <Button
                                                            size="sm"
                                                            variant="primary"
                                                            onClick={() => openConvert(req)}
                                                            title="Terbitkan Work Order"
                                                        >
                                                            Terbitkan WO
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="py-12 text-center text-slate-400">
                                            Tidak ada data Maintenance Request pada filter yang dipilih.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                        <span className="text-xs text-slate-500">
                            Menampilkan {requests.data?.length || 0} dari {requests.total || 0} Maintenance Request
                        </span>
                        <Pagination links={requests.links} />
                    </div>
                </div>
            </div>

            {/* Modal Create Maintenance Request */}
            <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Formulir Maintenance Request (Pengajuan Servis)" maxWidth="max-w-2xl">
                <form onSubmit={submitCreate} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Armada Unit *</label>
                            <select
                                required
                                value={createForm.data.unit_id}
                                onChange={(e) => createForm.setData('unit_id', e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            >
                                {master.units?.map((u) => (
                                    <option key={u.id} value={u.id}>{u.unit_code} ({u.unit_type})</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Site Proyek *</label>
                            <select
                                required
                                value={createForm.data.site_id}
                                onChange={(e) => createForm.setData('site_id', e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            >
                                {master.sites?.map((s) => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Pemohon *</label>
                            <input
                                type="text"
                                required
                                placeholder="Contoh: Supervisor Pit Alpha"
                                value={createForm.data.requester_name}
                                onChange={(e) => createForm.setData('requester_name', e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Tanggal Request *</label>
                            <input
                                type="date"
                                required
                                value={createForm.data.request_date}
                                onChange={(e) => createForm.setData('request_date', e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Kategori Bagian *</label>
                            <select
                                required
                                value={createForm.data.damage_category}
                                onChange={(e) => createForm.setData('damage_category', e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            >
                                <option value="engine">Engine (Mesin)</option>
                                <option value="transmission">Transmission (Transmisi)</option>
                                <option value="hydraulic">Hydraulic (Hidrolik)</option>
                                <option value="brake">Brake (Pengereman)</option>
                                <option value="steering">Steering (Kemudi)</option>
                                <option value="electrical">Electrical (Kelistrikan)</option>
                                <option value="tire">Tire (Ban/Roda)</option>
                                <option value="suspension">Suspension</option>
                                <option value="cooling_system">Cooling System</option>
                                <option value="body">Body Vessel</option>
                                <option value="other">Lainnya</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Prioritas *</label>
                            <select
                                required
                                value={createForm.data.priority}
                                onChange={(e) => createForm.setData('priority', e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
                            >
                                <option value="critical">Critical</option>
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                            </select>
                        </div>

                        <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Deskripsi Pekerjaan / Kebutuhan Perbaikan *</label>
                            <textarea
                                rows="3"
                                required
                                placeholder="Uraikan pekerjaan servis atau perbaikan yang dibutuhkan secara spesifik..."
                                value={createForm.data.work_description}
                                onChange={(e) => createForm.setData('work_description', e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            ></textarea>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <Button type="button" variant="secondary" onClick={() => setIsCreateOpen(false)}>
                            Batal
                        </Button>
                        <Button type="submit" variant="primary" disabled={createForm.processing}>
                            {createForm.processing ? 'Menyimpan...' : 'Ajukan Request'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Modal Approve */}
            {selectedRequest && (
                <Modal isOpen={isApproveOpen} onClose={() => setIsApproveOpen(false)} title={`Persetujuan Maintenance Request: ${selectedRequest.request_number}`} maxWidth="max-w-md">
                    <form onSubmit={submitApprove} className="space-y-4">
                        <p className="text-xs text-slate-600 dark:text-slate-300">
                            Konfirmasi persetujuan pengajuan perbaikan untuk armada <strong>{selectedRequest.unit?.unit_code}</strong>:
                        </p>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Catatan Persetujuan</label>
                            <textarea
                                rows="3"
                                required
                                value={approveForm.data.approval_notes}
                                onChange={(e) => approveForm.setData('approval_notes', e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            ></textarea>
                        </div>
                        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                            <Button type="button" variant="secondary" onClick={() => setIsApproveOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit" variant="primary" disabled={approveForm.processing}>
                                {approveForm.processing ? 'Menyetujui...' : 'Setujui Request'}
                            </Button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Modal Reject */}
            {selectedRequest && (
                <Modal isOpen={isRejectOpen} onClose={() => setIsRejectOpen(false)} title={`Tolak Maintenance Request: ${selectedRequest.request_number}`} maxWidth="max-w-md">
                    <form onSubmit={submitReject} className="space-y-4">
                        <p className="text-xs text-slate-600 dark:text-slate-300">
                            Tuliskan alasan penolakan Maintenance Request:
                        </p>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Alasan Penolakan *</label>
                            <textarea
                                rows="3"
                                required
                                placeholder="Contoh: Jadwal pemakaian unit sedang tinggi, perbaikan ditunda hingga servis PM berikutnya..."
                                value={rejectForm.data.approval_notes}
                                onChange={(e) => rejectForm.setData('approval_notes', e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            ></textarea>
                        </div>
                        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                            <Button type="button" variant="secondary" onClick={() => setIsRejectOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit" variant="danger" disabled={rejectForm.processing}>
                                {rejectForm.processing ? 'Menolak...' : 'Tolak Request'}
                            </Button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Modal Convert to Work Order */}
            {selectedRequest && (
                <Modal isOpen={isConvertWoOpen} onClose={() => setIsConvertWoOpen(false)} title={`Terbitkan Work Order dari: ${selectedRequest.request_number}`} maxWidth="max-w-lg">
                    <form onSubmit={submitConvert} className="space-y-4">
                        <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl space-y-1 text-xs">
                            <span className="text-slate-500 block">Armada:</span>
                            <span className="font-bold text-slate-900 dark:text-white text-sm">{selectedRequest.unit?.unit_code}</span>
                            <span className="text-slate-500 block mt-2">Deskripsi:</span>
                            <span className="text-slate-800 dark:text-slate-200">{selectedRequest.work_description}</span>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Jenis Pekerjaan *</label>
                            <select
                                required
                                value={convertForm.data.job_type}
                                onChange={(e) => convertForm.setData('job_type', e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
                            >
                                <option value="corrective_maintenance">Corrective Maintenance (CM)</option>
                                <option value="emergency_repair">Emergency Repair</option>
                                <option value="tire_maintenance">Tire Maintenance</option>
                                <option value="electrical_repair">Electrical Repair</option>
                                <option value="general_repair">General Repair</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Tugaskan Lead Mekanik PIC *</label>
                            <select
                                required
                                value={convertForm.data.assigned_mechanic_id}
                                onChange={(e) => convertForm.setData('assigned_mechanic_id', e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            >
                                {master.employees?.map((emp) => (
                                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.employee_code})</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Selesai</label>
                                <input
                                    type="date"
                                    value={convertForm.data.target_completion_date}
                                    onChange={(e) => convertForm.setData('target_completion_date', e.target.value)}
                                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Estimasi Biaya (Rp)</label>
                                <input
                                    type="number"
                                    value={convertForm.data.estimated_cost}
                                    onChange={(e) => convertForm.setData('estimated_cost', e.target.value)}
                                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                            <Button type="button" variant="secondary" onClick={() => setIsConvertWoOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit" variant="primary" disabled={convertForm.processing}>
                                {convertForm.processing ? 'Menerbitkan...' : 'Terbitkan Work Order & Job Card'}
                            </Button>
                        </div>
                    </form>
                </Modal>
            )}
        </DashboardLayout>
    );
}
