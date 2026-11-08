import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import DashboardLayout from '../../../components/templates/DashboardLayout';
import Card from '../../../components/molecules/Card';
import Button from '../../../components/atoms/Button';
import Modal from '../../../components/molecules/Modal';
import Pagination from '../../../components/molecules/Pagination';
import {
    AlertOctagon,
    Plus,
    Filter,
    RefreshCw,
    Search,
    Truck,
    User,
    Clock,
    MapPin,
    AlertTriangle,
    CheckCircle2,
    Wrench,
    FileText,
    ArrowRightCircle,
    Eye,
    ShieldAlert,
} from 'lucide-react';

export default function BreakdownIndex({
    reports = { data: [], links: [] },
    metrics = {},
    filters = {},
    master = {},
}) {
    const [search, setSearch] = useState(filters.search || '');
    const [siteId, setSiteId] = useState(filters.site_id || '');
    const [unitId, setUnitId] = useState(filters.unit_id || '');
    const [priority, setPriority] = useState(filters.priority || '');
    const [status, setStatus] = useState(filters.status || '');
    const [category, setCategory] = useState(filters.damage_category || '');

    // Modals
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [isConvertWoOpen, setIsConvertWoOpen] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);

    // Form Create Breakdown
    const createForm = useForm({
        site_id: master.sites?.[0]?.id || '',
        unit_id: master.units?.[0]?.id || '',
        reporter_type: 'driver',
        reporter_id: master.employees?.[0]?.id || '',
        reporter_name: '',
        breakdown_date: new Date().toISOString().split('T')[0],
        breakdown_time: new Date().toTimeString().split(' ')[0].substring(0, 5),
        current_hm: master.units?.[0]?.last_hm || 0,
        current_km: master.units?.[0]?.last_km || 0,
        location_name: '',
        location_id: master.locations?.[0]?.id || '',
        damage_category: 'engine',
        damage_description: '',
        priority: 'high',
        photo_path: '',
        video_path: '',
    });

    // Form Review
    const reviewForm = useForm({
        review_notes: '',
        status: 'reviewed',
    });

    // Form Convert to Work Order
    const convertWoForm = useForm({
        job_type: 'emergency_repair',
        assigned_mechanic_id: master.employees?.[0]?.id || '',
        target_completion_date: '',
        estimated_cost: 2500000,
    });

    const handleFilter = (e) => {
        e?.preventDefault();
        router.get('/maintenance/breakdowns', {
            site_id: siteId,
            unit_id: unitId,
            priority,
            status,
            damage_category: category,
            search,
        }, { preserveState: true, preserveScroll: true });
    };

    const handleReset = () => {
        setSearch('');
        setSiteId('');
        setUnitId('');
        setPriority('');
        setStatus('');
        setCategory('');
        router.get('/maintenance/breakdowns');
    };

    const handleUnitSelect = (id) => {
        const u = master.units?.find((item) => item.id == id);
        createForm.setData({
            ...createForm.data,
            unit_id: id,
            current_hm: u?.last_hm || 0,
            current_km: u?.last_km || 0,
            site_id: u?.site_id || createForm.data.site_id,
        });
    };

    const submitCreate = (e) => {
        e.preventDefault();
        createForm.post('/maintenance/breakdowns', {
            onSuccess: () => {
                createForm.reset();
                setIsCreateOpen(false);
            },
        });
    };

    const openReview = (rep) => {
        setSelectedReport(rep);
        reviewForm.setData({
            review_notes: rep.review_notes || '',
            status: rep.status === 'submitted' ? 'reviewed' : rep.status,
        });
        setIsReviewOpen(true);
    };

    const submitReview = (e) => {
        e.preventDefault();
        reviewForm.put(`/maintenance/breakdowns/${selectedReport.id}/review`, {
            onSuccess: () => {
                setIsReviewOpen(false);
            },
        });
    };

    const convertToRequest = (rep) => {
        if (confirm(`Konversi laporan ${rep.report_number} menjadi Maintenance Request formal?`)) {
            router.post(`/maintenance/breakdowns/${rep.id}/convert-request`);
        }
    };

    const openConvertWo = (rep) => {
        setSelectedReport(rep);
        convertWoForm.setData({
            job_type: rep.priority === 'critical' ? 'emergency_repair' : 'corrective_maintenance',
            assigned_mechanic_id: master.employees?.[0]?.id || '',
            target_completion_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
            estimated_cost: 3000000,
        });
        setIsConvertWoOpen(true);
    };

    const submitConvertWo = (e) => {
        e.preventDefault();
        convertWoForm.post(`/maintenance/breakdowns/${selectedReport.id}/convert-wo`, {
            onSuccess: () => {
                setIsConvertWoOpen(false);
            },
        });
    };

    const getPriorityBadge = (p) => {
        switch (p) {
            case 'critical':
                return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-black bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 animate-pulse uppercase"><span className="w-1.5 h-1.5 mr-1 rounded-full bg-rose-600"></span>Critical (Kritis)</span>;
            case 'high':
                return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 uppercase">High</span>;
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
            case 'submitted':
                return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">Baru Dilaporkan</span>;
            case 'reviewed':
                return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">Telah Direview</span>;
            case 'converted_to_request':
                return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">Menjadi Request</span>;
            case 'converted_to_wo':
                return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">Sudah Jadi SPK/WO</span>;
            case 'rejected':
                return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">Ditolak</span>;
            default:
                return <span>{st}</span>;
        }
    };

    return (
        <DashboardLayout>
            <Head title="Laporan Kerusakan Armada (Breakdown Management) - TAP" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div>
                        <div className="flex items-center space-x-3">
                            <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
                                <AlertOctagon className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                                    Laporan Kerusakan Unit (Breakdown Management)
                                </h1>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Pencatatan insiden mogok di jalan hauling, front loading, pit, atau stockpile dari driver, foreman, dan mekanik
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3 w-full sm:w-auto">
                        <Button
                            variant="secondary"
                            onClick={() => router.get('/maintenance/breakdowns')}
                            className="flex items-center space-x-2"
                        >
                            <RefreshCw className="w-4 h-4" />
                            <span>Segarkan</span>
                        </Button>
                        <Button
                            variant="danger"
                            onClick={() => setIsCreateOpen(true)}
                            className="flex items-center space-x-2"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Buat Laporan Kerusakan</span>
                        </Button>
                    </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                    <Card className="p-4 bg-white dark:bg-slate-800 border-l-4 border-l-slate-500">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Laporan</p>
                        <div className="flex items-baseline justify-between mt-2">
                            <span className="text-2xl font-black text-slate-900 dark:text-white">{metrics.total || 0}</span>
                            <span className="text-xs text-slate-400">Insiden</span>
                        </div>
                    </Card>

                    <Card className="p-4 bg-white dark:bg-slate-800 border-l-4 border-l-rose-500">
                        <p className="text-xs font-semibold text-rose-600 uppercase tracking-wider">Laporan Baru</p>
                        <div className="flex items-baseline justify-between mt-2">
                            <span className="text-2xl font-black text-rose-600">{metrics.submitted || 0}</span>
                            <span className="text-xs text-rose-500">Menunggu</span>
                        </div>
                    </Card>

                    <Card className="p-4 bg-white dark:bg-slate-800 border-l-4 border-l-amber-500">
                        <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Telah Direview</p>
                        <div className="flex items-baseline justify-between mt-2">
                            <span className="text-2xl font-black text-amber-600">{metrics.reviewed || 0}</span>
                            <span className="text-xs text-amber-500">Evaluasi</span>
                        </div>
                    </Card>

                    <Card className="p-4 bg-white dark:bg-slate-800 border-l-4 border-l-emerald-500">
                        <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Diterbitkan WO</p>
                        <div className="flex items-baseline justify-between mt-2">
                            <span className="text-2xl font-black text-emerald-600">{metrics.converted || 0}</span>
                            <span className="text-xs text-emerald-500">Dalam Pengerjaan</span>
                        </div>
                    </Card>

                    <Card className="p-4 bg-white dark:bg-slate-800 border-l-4 border-l-rose-700">
                        <p className="text-xs font-semibold text-rose-700 uppercase tracking-wider">Kerusakan Kritis</p>
                        <div className="flex items-baseline justify-between mt-2">
                            <span className="text-2xl font-black text-rose-700">{metrics.critical || 0}</span>
                            <span className="text-xs text-rose-500">Stop Operasi</span>
                        </div>
                    </Card>
                </div>

                {/* Filter Bar */}
                <Card className="p-5 bg-white dark:bg-slate-800">
                    <form onSubmit={handleFilter} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Cari Laporan</label>
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="No. BDR / Unit / Lokasi..."
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
                            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Kategori Kerusakan</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            >
                                <option value="">Semua Kategori</option>
                                <option value="engine">Engine (Mesin)</option>
                                <option value="transmission">Transmission (Transmisi)</option>
                                <option value="hydraulic">Hydraulic (Hidrolik)</option>
                                <option value="brake">Brake (Rem)</option>
                                <option value="steering">Steering (Kemudi)</option>
                                <option value="electrical">Electrical (Kelistrikan)</option>
                                <option value="tire">Tire (Ban)</option>
                                <option value="suspension">Suspension (Suspensi)</option>
                                <option value="cooling_system">Cooling System (Radiator)</option>
                                <option value="body">Body / Dump Structure</option>
                                <option value="other">Lainnya</option>
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
                                <option value="critical">Critical (Kritis)</option>
                                <option value="high">High (Tinggi)</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Status Laporan</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            >
                                <option value="">Semua Status</option>
                                <option value="submitted">Baru (Submitted)</option>
                                <option value="reviewed">Direview (Reviewed)</option>
                                <option value="converted_to_request">Menjadi Request</option>
                                <option value="converted_to_wo">Menjadi WO</option>
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

                {/* Reports Table */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                                    <th className="py-3.5 px-4">No. BDR & Waktu</th>
                                    <th className="py-3.5 px-4">Armada & Lokasi</th>
                                    <th className="py-3.5 px-4">Pelapor</th>
                                    <th className="py-3.5 px-4">Kategori & Kerusakan</th>
                                    <th className="py-3.5 px-4">Prioritas</th>
                                    <th className="py-3.5 px-4">Status & Tindak Lanjut</th>
                                    <th className="py-3.5 px-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {reports.data?.length > 0 ? (
                                    reports.data.map((rep) => (
                                        <tr key={rep.id} className={`hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors ${
                                            rep.is_critical ? 'bg-rose-50/50 dark:bg-rose-950/20' : ''
                                        }`}>
                                            <td className="py-3.5 px-4">
                                                <div className="font-mono font-bold text-slate-900 dark:text-white">
                                                    {rep.report_number}
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    {rep.breakdown_date} • {rep.breakdown_time} WITA
                                                </div>
                                                <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                                                    HM: {rep.current_hm} | KM: {rep.current_km}
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-4">
                                                <div className="font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                                                    <Truck className="w-4 h-4 text-emerald-600" />
                                                    <span>{rep.unit?.unit_code}</span>
                                                </div>
                                                <div className="text-xs text-slate-500 flex items-center space-x-1 mt-0.5">
                                                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                                                    <span>{rep.location_name}</span>
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-4">
                                                <div className="text-slate-900 dark:text-white font-medium text-xs flex items-center space-x-1">
                                                    <User className="w-3.5 h-3.5 text-blue-500" />
                                                    <span>{rep.reporter_name}</span>
                                                </div>
                                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 mt-1 inline-block">
                                                    {rep.reporter_type}
                                                </span>
                                            </td>

                                            <td className="py-3.5 px-4 max-w-xs">
                                                <span className="font-bold text-slate-900 dark:text-white text-xs block capitalize">
                                                    {rep.damage_category?.replace('_', ' ')}
                                                </span>
                                                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mt-0.5" title={rep.damage_description}>
                                                    {rep.damage_description}
                                                </p>
                                            </td>

                                            <td className="py-3.5 px-4">
                                                {getPriorityBadge(rep.priority)}
                                            </td>

                                            <td className="py-3.5 px-4">
                                                <div className="space-y-1">
                                                    <div>{getStatusBadge(rep.status)}</div>
                                                    {rep.work_order && (
                                                        <span className="inline-flex items-center text-[11px] font-mono text-emerald-600 font-bold">
                                                            SPK: {rep.work_order.wo_number}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-4 text-right">
                                                <div className="flex items-center justify-end space-x-1">
                                                    <Button
                                                        size="sm"
                                                        variant="secondary"
                                                        onClick={() => openReview(rep)}
                                                        title="Review Laporan"
                                                    >
                                                        Review
                                                    </Button>

                                                    {rep.status !== 'converted_to_wo' && !rep.work_order && (
                                                        <Button
                                                            size="sm"
                                                            variant="primary"
                                                            onClick={() => openConvertWo(rep)}
                                                            title="Terbitkan Work Order Langsung"
                                                        >
                                                            Buat WO
                                                        </Button>
                                                    )}

                                                    {rep.status === 'submitted' && (
                                                        <Button
                                                            size="sm"
                                                            variant="secondary"
                                                            onClick={() => convertToRequest(rep)}
                                                            title="Konversi ke Maintenance Request"
                                                        >
                                                            Ke MR
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="py-12 text-center text-slate-400">
                                            Tidak ada laporan kerusakan unit pada filter yang dipilih.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                        <span className="text-xs text-slate-500">
                            Menampilkan {reports.data?.length || 0} dari {reports.total || 0} laporan kerusakan
                        </span>
                        <Pagination links={reports.links} />
                    </div>
                </div>
            </div>

            {/* Modal Create Breakdown Report */}
            <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Formulir Laporan Kerusakan Unit (Breakdown)" maxWidth="max-w-2xl">
                <form onSubmit={submitCreate} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Armada Unit Bermasalah *</label>
                            <select
                                required
                                value={createForm.data.unit_id}
                                onChange={(e) => handleUnitSelect(e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            >
                                {master.units?.map((u) => (
                                    <option key={u.id} value={u.id}>{u.unit_code} - {u.unit_type} (HM: {u.last_hm})</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Site Tambang *</label>
                            <select
                                required
                                value={createForm.data.site_id}
                                onChange={(e) => createForm.setData('site_id', e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            >
                                {master.sites?.map((s) => (
                                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Peran Pelapor *</label>
                            <select
                                required
                                value={createForm.data.reporter_type}
                                onChange={(e) => createForm.setData('reporter_type', e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            >
                                <option value="driver">Driver (Pengemudi)</option>
                                <option value="foreman">Foreman / Pengawas Lapangan</option>
                                <option value="mechanic">Mekanik Workshop</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap Pelapor *</label>
                            <input
                                type="text"
                                required
                                placeholder="Contoh: Budi Santoso"
                                value={createForm.data.reporter_name}
                                onChange={(e) => createForm.setData('reporter_name', e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Tanggal Kerusakan *</label>
                            <input
                                type="date"
                                required
                                value={createForm.data.breakdown_date}
                                onChange={(e) => createForm.setData('breakdown_date', e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Jam Kejadian (WITA) *</label>
                            <input
                                type="time"
                                required
                                value={createForm.data.breakdown_time}
                                onChange={(e) => createForm.setData('breakdown_time', e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">HM Saat Kerusakan *</label>
                            <input
                                type="number"
                                step="0.1"
                                required
                                value={createForm.data.current_hm}
                                onChange={(e) => createForm.setData('current_hm', e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">KM Saat Kerusakan *</label>
                            <input
                                type="number"
                                step="0.1"
                                required
                                value={createForm.data.current_km}
                                onChange={(e) => createForm.setData('current_km', e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Lokasi Detail Kerusakan *</label>
                            <input
                                type="text"
                                required
                                placeholder="Contoh: Hauling Road KM 14 Tikungan S, dekat Jembatan 2"
                                value={createForm.data.location_name}
                                onChange={(e) => createForm.setData('location_name', e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Kategori Kerusakan *</label>
                            <select
                                required
                                value={createForm.data.damage_category}
                                onChange={(e) => createForm.setData('damage_category', e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
                            >
                                <option value="engine">Engine (Mesin)</option>
                                <option value="transmission">Transmission (Transmisi)</option>
                                <option value="hydraulic">Hydraulic (Sistem Hidrolik - Kritis)</option>
                                <option value="brake">Brake (Sistem Pengereman - Kritis)</option>
                                <option value="steering">Steering (Sistem Kemudi - Kritis)</option>
                                <option value="electrical">Electrical (Kelistrikan)</option>
                                <option value="tire">Tire (Ban / Pelek)</option>
                                <option value="suspension">Suspension (Per Daun / Trunnion)</option>
                                <option value="cooling_system">Cooling System (Radiator/Coolant)</option>
                                <option value="body">Body (Dump Vessel / Chassis)</option>
                                <option value="other">Lainnya</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Tingkat Prioritas *</label>
                            <select
                                required
                                value={createForm.data.priority}
                                onChange={(e) => createForm.setData('priority', e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold text-rose-600"
                            >
                                <option value="critical">Critical (Kritis - Stop Operasi & Kunci Unit)</option>
                                <option value="high">High (Mendesak / Butuh Respon Segera)</option>
                                <option value="medium">Medium (Normal)</option>
                                <option value="low">Low (Kerusakan Ringan / Kosmetik)</option>
                            </select>
                        </div>

                        <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Deskripsi & Gejala Kerusakan *</label>
                            <textarea
                                rows="3"
                                required
                                placeholder="Jelaskan secara rinci apa yang terjadi, bunyi abnormal, kebocoran cairan, asap, atau kendala setir/rem..."
                                value={createForm.data.damage_description}
                                onChange={(e) => createForm.setData('damage_description', e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            ></textarea>
                        </div>
                    </div>

                    {(createForm.data.priority === 'critical' || ['brake', 'steering', 'hydraulic'].includes(createForm.data.damage_category)) && (
                        <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-900 rounded-xl flex items-start space-x-2 text-xs text-rose-800 dark:text-rose-200 animate-pulse">
                            <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <strong>PERINGATAN PROTOKOL K3LH TAMBANG:</strong>
                                <p className="mt-0.5">
                                    Laporan berkategori kritis ini akan <strong>MENGUNCI STATUS ARMADA MENJADI BREAKDOWN</strong> secara otomatis. Armada tidak boleh dijalankan dan tidak dapat dijadwalkan dalam Daily Dispatch hingga perbaikan selesai serta lolos inspeksi RFU resmi.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <Button type="button" variant="secondary" onClick={() => setIsCreateOpen(false)}>
                            Batal
                        </Button>
                        <Button type="submit" variant="danger" disabled={createForm.processing}>
                            {createForm.processing ? 'Menyimpan...' : 'Kirim Laporan Kerusakan'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Modal Review Breakdown Report */}
            {selectedReport && (
                <Modal isOpen={isReviewOpen} onClose={() => setIsReviewOpen(false)} title={`Review Laporan: ${selectedReport.report_number}`} maxWidth="max-w-lg">
                    <form onSubmit={submitReview} className="space-y-4">
                        <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl space-y-1 text-xs">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Unit:</span>
                                <span className="font-bold text-slate-900 dark:text-white">{selectedReport.unit?.unit_code}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Kategori:</span>
                                <span className="capitalize font-semibold text-slate-800 dark:text-slate-200">{selectedReport.damage_category}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Deskripsi:</span>
                                <span className="text-slate-700 dark:text-slate-300">{selectedReport.damage_description}</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Status Hasil Review *</label>
                            <select
                                required
                                value={reviewForm.data.status}
                                onChange={(e) => reviewForm.setData('status', e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold"
                            >
                                <option value="reviewed">Telah Direview (Diverifikasi Benar)</option>
                                <option value="rejected">Tolak Laporan (Tidak Ditemukan Kerusakan)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Catatan Evaluasi Planner / Foreman *</label>
                            <textarea
                                rows="3"
                                required
                                placeholder="Tuliskan arahan perbaikan, suku cadang yang dicurigai aus, atau rekomendasi workshop..."
                                value={reviewForm.data.review_notes}
                                onChange={(e) => reviewForm.setData('review_notes', e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            ></textarea>
                        </div>

                        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                            <Button type="button" variant="secondary" onClick={() => setIsReviewOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit" variant="primary" disabled={reviewForm.processing}>
                                {reviewForm.processing ? 'Menyimpan...' : 'Simpan Review'}
                            </Button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Modal Convert to Work Order */}
            {selectedReport && (
                <Modal isOpen={isConvertWoOpen} onClose={() => setIsConvertWoOpen(false)} title={`Penerbitan SPK / Work Order: ${selectedReport.report_number}`} maxWidth="max-w-lg">
                    <form onSubmit={submitConvertWo} className="space-y-4">
                        <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl space-y-1 text-xs">
                            <span className="text-slate-500 block">Unit Armada:</span>
                            <span className="font-bold text-slate-900 dark:text-white text-sm">{selectedReport.unit?.unit_code}</span>
                            <span className="text-slate-500 block mt-2">Keluhan Kerusakan:</span>
                            <span className="text-slate-800 dark:text-slate-200 font-medium">{selectedReport.damage_description}</span>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Jenis Pekerjaan Workshop *</label>
                            <select
                                required
                                value={convertWoForm.data.job_type}
                                onChange={(e) => convertWoForm.setData('job_type', e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
                            >
                                <option value="emergency_repair">Emergency Repair (Darurat)</option>
                                <option value="corrective_maintenance">Corrective Maintenance (CM)</option>
                                <option value="tire_maintenance">Tire Maintenance</option>
                                <option value="electrical_repair">Electrical Repair</option>
                                <option value="general_repair">General Repair</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Tugaskan Lead Mekanik PIC *</label>
                            <select
                                required
                                value={convertWoForm.data.assigned_mechanic_id}
                                onChange={(e) => convertWoForm.setData('assigned_mechanic_id', e.target.value)}
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
                                    value={convertWoForm.data.target_completion_date}
                                    onChange={(e) => convertWoForm.setData('target_completion_date', e.target.value)}
                                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Estimasi Biaya (Rp)</label>
                                <input
                                    type="number"
                                    value={convertWoForm.data.estimated_cost}
                                    onChange={(e) => convertWoForm.setData('estimated_cost', e.target.value)}
                                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                            <Button type="button" variant="secondary" onClick={() => setIsConvertWoOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit" variant="primary" disabled={convertWoForm.processing}>
                                {convertWoForm.processing ? 'Menerbitkan...' : 'Terbitkan Work Order & Job Card'}
                            </Button>
                        </div>
                    </form>
                </Modal>
            )}
        </DashboardLayout>
    );
}
