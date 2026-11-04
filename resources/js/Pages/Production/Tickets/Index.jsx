import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import DashboardLayout from '../../../components/templates/DashboardLayout';
import Card from '../../../components/molecules/Card';
import Badge from '../../../components/atoms/Badge';
import Button from '../../../components/atoms/Button';
import Input from '../../../components/atoms/Input';
import Select from '../../../components/atoms/Select';
import Modal from '../../../components/molecules/Modal';
import Pagination from '../../../components/molecules/Pagination';
import {
    Ticket,
    Plus,
    Filter,
    Search,
    CheckCircle2,
    XCircle,
    Eye,
    Edit3,
    FileText,
    Download,
    Calendar,
    Truck,
    User,
    Scale,
    AlertTriangle,
} from 'lucide-react';

export default function TicketIndex({
    tickets = { data: [] },
    filters = {},
    counts = {},
    master = {},
}) {
    const [search, setSearch] = useState(filters.search || '');
    const [filterStatus, setFilterStatus] = useState(filters.status || '');
    const [filterShift, setFilterShift] = useState(filters.shift_id || '');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');

    // Modals
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isRejectOpen, setIsRejectOpen] = useState(false);
    const [isCorrectOpen, setIsCorrectOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);

    // Create Form
    const createForm = useForm({
        ticket_number: '',
        ticket_date: new Date().toISOString().split('T')[0],
        dumping_time: '12:00',
        site_id: master.sites?.[0]?.id || '',
        unit_id: master.units?.[0]?.id || '',
        driver_id: master.drivers?.[0]?.id || '',
        loading_point_id: master.loading_points?.[0]?.id || '',
        dumping_point_id: master.dumping_points?.[0]?.id || '',
        material_id: master.materials?.[0]?.id || '',
        shift_id: master.shifts?.[0]?.id || '',
        tonnage: '',
        gross_weight: '',
        tare_weight: '',
        checker_name: 'Suryadi (JSI Checker)',
        remarks: '',
        attachment: null,
    });

    // Reject Form
    const rejectForm = useForm({
        rejection_reason: '',
    });

    // Correct Form
    const correctForm = useForm({
        tonnage: '',
        unit_id: '',
        driver_id: '',
        loading_point_id: '',
        dumping_point_id: '',
        material_id: '',
        shift_id: '',
        remarks: '',
        reason: '',
    });

    const handleFilter = (e) => {
        e.preventDefault();
        router.get('/production/tickets', {
            search,
            status: filterStatus,
            shift_id: filterShift,
            date_from: dateFrom,
            date_to: dateTo,
        }, { preserveState: true });
    };

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        createForm.post('/production/tickets', {
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
            },
        });
    };

    const handleVerify = (ticket) => {
        if (confirm(`Verifikasi tiket ${ticket.ticket_number} sebagai data produksi resmi?`)) {
            router.post(`/production/tickets/${ticket.id}/verify`, {}, { preserveScroll: true });
        }
    };

    const openReject = (ticket) => {
        setSelectedTicket(ticket);
        rejectForm.setData({ rejection_reason: '' });
        setIsRejectOpen(true);
    };

    const handleRejectSubmit = (e) => {
        e.preventDefault();
        if (!selectedTicket) return;
        rejectForm.post(`/production/tickets/${selectedTicket.id}/reject`, {
            onSuccess: () => {
                setIsRejectOpen(false);
                rejectForm.reset();
            },
        });
    };

    const openCorrect = (ticket) => {
        setSelectedTicket(ticket);
        correctForm.setData({
            tonnage: ticket.tonnage,
            unit_id: ticket.unit_id,
            driver_id: ticket.driver_id,
            loading_point_id: ticket.loading_point_id,
            dumping_point_id: ticket.dumping_point_id,
            material_id: ticket.material_id,
            shift_id: ticket.shift_id,
            remarks: ticket.remarks || '',
            reason: '',
        });
        setIsCorrectOpen(true);
    };

    const handleCorrectSubmit = (e) => {
        e.preventDefault();
        if (!selectedTicket) return;
        correctForm.post(`/production/tickets/${selectedTicket.id}/correct`, {
            onSuccess: () => {
                setIsCorrectOpen(false);
                correctForm.reset();
            },
        });
    };

    const openDetail = (ticket) => {
        setSelectedTicket(ticket);
        setIsDetailOpen(true);
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'verified':
                return <Badge variant="success">Verified (Resmi)</Badge>;
            case 'pending_verification':
            case 'submitted':
                return <Badge variant="warning">Pending Verification</Badge>;
            case 'rejected':
                return <Badge variant="danger">Rejected (Ditolak)</Badge>;
            case 'corrected':
                return <Badge variant="primary">Corrected (Revisi)</Badge>;
            case 'draft':
                return <Badge variant="secondary">Draft</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <DashboardLayout>
            <Head title="Manajemen Tiket Dumping — TAP Coal Hauling" />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="p-2 rounded-lg bg-indigo-600 text-white shadow-sm">
                            <Ticket className="w-5 h-5" />
                        </span>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Manajemen Tiket Dumping
                            </h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Pencatatan tiket timbangan/checker JSI, alur verifikasi, proteksi duplikasi, dan audit koreksi
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="secondary" onClick={() => router.get('/production/import')}>
                        <Download className="w-4 h-4 mr-2" />
                        Bulk Import Excel
                    </Button>
                    <Button onClick={() => setIsCreateOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Input Tiket Baru
                    </Button>
                </div>
            </div>

            {/* KPI Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
                <div
                    onClick={() => { setFilterStatus(''); router.get('/production/tickets'); }}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${filterStatus === '' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}
                >
                    <span className="text-[11px] font-medium text-slate-500 uppercase">Semua Tiket</span>
                    <div className="text-xl font-black text-slate-900 dark:text-white mt-1">{counts.total || 0}</div>
                </div>
                <div
                    onClick={() => { setFilterStatus('verified'); router.get('/production/tickets', { status: 'verified' }); }}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${filterStatus === 'verified' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40' : 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'}`}
                >
                    <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-300 uppercase">Verified (Produksi)</span>
                    <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{counts.verified || 0}</div>
                </div>
                <div
                    onClick={() => { setFilterStatus('pending_verification'); router.get('/production/tickets', { status: 'pending_verification' }); }}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${filterStatus === 'pending_verification' ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40' : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/60'}`}
                >
                    <span className="text-[11px] font-medium text-amber-700 dark:text-amber-300 uppercase">Pending Verifikasi</span>
                    <div className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">{counts.pending || 0}</div>
                </div>
                <div
                    onClick={() => { setFilterStatus('rejected'); router.get('/production/tickets', { status: 'rejected' }); }}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${filterStatus === 'rejected' ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40' : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/60'}`}
                >
                    <span className="text-[11px] font-medium text-rose-700 dark:text-rose-300 uppercase">Ditolak (Rejected)</span>
                    <div className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1">{counts.rejected || 0}</div>
                </div>
                <div
                    onClick={() => { setFilterStatus('corrected'); router.get('/production/tickets', { status: 'corrected' }); }}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${filterStatus === 'corrected' ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40' : 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/60'}`}
                >
                    <span className="text-[11px] font-medium text-blue-700 dark:text-blue-300 uppercase">Corrected (Revisi)</span>
                    <div className="text-xl font-black text-blue-600 dark:text-blue-400 mt-1">{counts.corrected || 0}</div>
                </div>
                <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
                    <span className="text-[11px] font-medium text-purple-700 dark:text-purple-300 uppercase">Total Tonase Resmi</span>
                    <div className="text-xl font-black text-purple-600 dark:text-purple-400 mt-1">{Number(counts.total_production_ton || 0).toFixed(1)} T</div>
                </div>
            </div>

            {/* Filter Bar */}
            <Card className="p-4 mb-6">
                <form onSubmit={handleFilter} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
                    <div className="lg:col-span-2">
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Cari Tiket / Unit / Checker</label>
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="No Tiket, DT-101, Nama Checker..."
                                className="pl-9"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Status</label>
                        <Select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            options={[
                                { value: '', label: 'Semua Status' },
                                { value: 'verified', label: 'Verified (Resmi)' },
                                { value: 'pending_verification', label: 'Pending Verifikasi' },
                                { value: 'submitted', label: 'Submitted' },
                                { value: 'rejected', label: 'Rejected' },
                                { value: 'corrected', label: 'Corrected' },
                            ]}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Dari Tanggal</label>
                        <Input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Sampai Tanggal</label>
                        <Input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                        />
                    </div>
                    <div>
                        <Button type="submit" variant="secondary" className="w-full">
                            <Filter className="w-4 h-4 mr-1" />
                            Filter
                        </Button>
                    </div>
                </form>
            </Card>

            {/* Table */}
            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
                            <tr>
                                <th className="py-3 px-4">No. Tiket</th>
                                <th className="py-3 px-4">Tanggal & Jam</th>
                                <th className="py-3 px-4">Unit & Driver</th>
                                <th className="py-3 px-4">Loading - Dumping</th>
                                <th className="py-3 px-4">Material</th>
                                <th className="py-3 px-4 text-right">Tonase</th>
                                <th className="py-3 px-4">Checker JSI</th>
                                <th className="py-3 px-4 text-center">Status</th>
                                <th className="py-3 px-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {tickets.data.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="py-8 text-center text-slate-400">
                                        Tidak ada tiket dumping yang sesuai dengan kriteria pencarian.
                                    </td>
                                </tr>
                            ) : (
                                tickets.data.map((t) => (
                                    <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                        <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                                            {t.ticket_number}
                                        </td>
                                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                                            <div>{t.ticket_date}</div>
                                            <div className="text-[11px] text-slate-400">
                                                {t.dumping_time ? new Date(t.dumping_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'} • {t.shift?.name}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                                <Truck className="w-3.5 h-3.5 text-slate-400" />
                                                {t.unit?.unit_code}
                                            </div>
                                            <div className="text-[11px] text-slate-500">{t.driver?.employee?.name}</div>
                                        </td>
                                        <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                                            <div>{t.loading_point?.name}</div>
                                            <div className="text-[11px] text-slate-400">ke {t.dumping_point?.name}</div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <Badge variant="outline">{t.material?.name}</Badge>
                                        </td>
                                        <td className="py-3 px-4 text-right font-black text-slate-900 dark:text-white text-sm">
                                            {Number(t.tonnage).toFixed(2)} T
                                        </td>
                                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                                            {t.checker_name}
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            {getStatusBadge(t.status)}
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="inline-flex gap-1">
                                                <button
                                                    onClick={() => openDetail(t)}
                                                    title="Lihat Detail & Audit"
                                                    className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>

                                                {/* Verification & Action Buttons */}
                                                {t.status !== 'verified' && (
                                                    <button
                                                        onClick={() => handleVerify(t)}
                                                        title="Verifikasi Tiket"
                                                        className="p-1.5 rounded hover:bg-emerald-50 dark:hover:bg-emerald-950 text-emerald-600 dark:text-emerald-400"
                                                    >
                                                        <CheckCircle2 className="w-4 h-4" />
                                                    </button>
                                                )}

                                                {t.status !== 'rejected' && (
                                                    <button
                                                        onClick={() => openReject(t)}
                                                        title="Tolak Tiket"
                                                        className="p-1.5 rounded hover:bg-rose-50 dark:hover:bg-rose-950 text-rose-600 dark:text-rose-400"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() => openCorrect(t)}
                                                    title="Koreksi Khusus (Audit Trail)"
                                                    className="p-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-950 text-blue-600 dark:text-blue-400"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                    <Pagination links={tickets.links} />
                </div>
            </Card>

            {/* Modal 1: Input Tiket Baru */}
            <Modal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                title="Input Tiket Dumping (Data Sumber JSI)"
            >
                <form onSubmit={handleCreateSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nomor Tiket (Unik)</label>
                            <Input
                                value={createForm.data.ticket_number}
                                onChange={(e) => createForm.setData('ticket_number', e.target.value)}
                                placeholder="TKT-YYYYMMDD-XXX"
                                required
                            />
                            {createForm.errors.ticket_number && (
                                <p className="text-rose-600 text-[11px] mt-1">{createForm.errors.ticket_number}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Checker JSI</label>
                            <Input
                                value={createForm.data.checker_name}
                                onChange={(e) => createForm.setData('checker_name', e.target.value)}
                                placeholder="Nama checker timbangan..."
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Tanggal Tiket</label>
                            <Input
                                type="date"
                                value={createForm.data.ticket_date}
                                onChange={(e) => createForm.setData('ticket_date', e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Jam Dumping</label>
                            <Input
                                type="time"
                                value={createForm.data.dumping_time}
                                onChange={(e) => createForm.setData('dumping_time', e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Unit Armada DT</label>
                            <Select
                                value={createForm.data.unit_id}
                                onChange={(e) => createForm.setData('unit_id', e.target.value)}
                                options={master.units?.map((u) => ({ value: u.id, label: `${u.unit_code} (${u.capacity_ton}T)` })) || []}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Driver</label>
                            <Select
                                value={createForm.data.driver_id}
                                onChange={(e) => createForm.setData('driver_id', e.target.value)}
                                options={master.drivers?.map((d) => ({ value: d.id, label: `${d.employee?.name} (${d.driver_code})` })) || []}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Loading Point</label>
                            <Select
                                value={createForm.data.loading_point_id}
                                onChange={(e) => createForm.setData('loading_point_id', e.target.value)}
                                options={master.loading_points?.map((l) => ({ value: l.id, label: l.name })) || []}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Dumping Point</label>
                            <Select
                                value={createForm.data.dumping_point_id}
                                onChange={(e) => createForm.setData('dumping_point_id', e.target.value)}
                                options={master.dumping_points?.map((l) => ({ value: l.id, label: l.name })) || []}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Material</label>
                            <Select
                                value={createForm.data.material_id}
                                onChange={(e) => createForm.setData('material_id', e.target.value)}
                                options={master.materials?.map((m) => ({ value: m.id, label: m.name })) || []}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Shift</label>
                            <Select
                                value={createForm.data.shift_id}
                                onChange={(e) => createForm.setData('shift_id', e.target.value)}
                                options={master.shifts?.map((s) => ({ value: s.id, label: s.name })) || []}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Netto Tonase (Ton)</label>
                            <Input
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={createForm.data.tonnage}
                                onChange={(e) => createForm.setData('tonnage', e.target.value)}
                                placeholder="31.50"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Keterangan / Remarks</label>
                        <Input
                            value={createForm.data.remarks}
                            onChange={(e) => createForm.setData('remarks', e.target.value)}
                            placeholder="Catatan tambahan muatan..."
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="secondary" onClick={() => setIsCreateOpen(false)}>Batal</Button>
                        <Button type="submit" disabled={createForm.processing}>Simpan Tiket</Button>
                    </div>
                </form>
            </Modal>

            {/* Modal 2: Detail & Timeline Audit Tiket */}
            <Modal
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                title={`Detail Tiket ${selectedTicket?.ticket_number}`}
            >
                {selectedTicket && (
                    <div className="space-y-4 text-xs">
                        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg flex justify-between items-center">
                            <div>
                                <span className="text-slate-500 block">Status Produksi</span>
                                <div className="mt-1">{getStatusBadge(selectedTicket.status)}</div>
                            </div>
                            <div className="text-right">
                                <span className="text-slate-500 block">Total Tonase</span>
                                <span className="text-lg font-black text-slate-900 dark:text-white">
                                    {Number(selectedTicket.tonnage).toFixed(2)} Ton
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 p-3 border border-slate-100 dark:border-slate-800 rounded-lg">
                            <div>
                                <span className="text-slate-400 block text-[11px]">Nomor Tiket:</span>
                                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{selectedTicket.ticket_number}</span>
                            </div>
                            <div>
                                <span className="text-slate-400 block text-[11px]">Tanggal & Jam:</span>
                                <span className="text-slate-800 dark:text-slate-200">{selectedTicket.ticket_date} {selectedTicket.dumping_time}</span>
                            </div>
                            <div>
                                <span className="text-slate-400 block text-[11px]">Armada Unit:</span>
                                <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedTicket.unit?.unit_code}</span>
                            </div>
                            <div>
                                <span className="text-slate-400 block text-[11px]">Driver:</span>
                                <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedTicket.driver?.employee?.name}</span>
                            </div>
                            <div>
                                <span className="text-slate-400 block text-[11px]">Rute Loading:</span>
                                <span className="text-slate-800 dark:text-slate-200">{selectedTicket.loading_point?.name}</span>
                            </div>
                            <div>
                                <span className="text-slate-400 block text-[11px]">Rute Dumping:</span>
                                <span className="text-slate-800 dark:text-slate-200">{selectedTicket.dumping_point?.name}</span>
                            </div>
                            <div>
                                <span className="text-slate-400 block text-[11px]">External Checker:</span>
                                <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedTicket.checker_name}</span>
                            </div>
                            <div>
                                <span className="text-slate-400 block text-[11px]">Sumber Data:</span>
                                <span className="font-mono uppercase text-slate-800 dark:text-slate-200">{selectedTicket.source}</span>
                            </div>
                        </div>

                        {/* Rejection notice if rejected */}
                        {selectedTicket.status === 'rejected' && (
                            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-lg text-rose-800 dark:text-rose-200">
                                <span className="font-bold block">Alasan Penolakan:</span>
                                <p className="mt-1">{selectedTicket.rejection_reason}</p>
                                <span className="text-[10px] text-rose-500 block mt-1">Ditolak pada: {selectedTicket.rejected_at}</span>
                            </div>
                        )}

                        {/* Correction History */}
                        <div>
                            <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Riwayat Koreksi Tiket</h3>
                            {selectedTicket.corrections?.length === 0 ? (
                                <p className="text-slate-400">Tidak ada riwayat koreksi pada tiket ini.</p>
                            ) : (
                                <div className="space-y-2">
                                    {selectedTicket.corrections.map((c) => (
                                        <div key={c.id} className="p-2.5 rounded border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20">
                                            <div className="flex justify-between text-[11px]">
                                                <span className="font-semibold text-blue-700 dark:text-blue-300">Koreksi Diajukan</span>
                                                <span className="text-slate-400">{c.created_at}</span>
                                            </div>
                                            <p className="mt-1 text-slate-700 dark:text-slate-300 font-medium">Alasan: {c.reason}</p>
                                            <div className="mt-1 text-[11px] text-slate-500">
                                                Tonase lama: <strong>{c.old_data?.tonnage} T</strong> → Tonase baru: <strong>{c.new_data?.tonnage} T</strong>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end pt-2">
                            <Button variant="secondary" onClick={() => setIsDetailOpen(false)}>Tutup</Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Modal 3: Tolak Tiket (Reject) */}
            <Modal
                isOpen={isRejectOpen}
                onClose={() => setIsRejectOpen(false)}
                title={`Tolak Tiket ${selectedTicket?.ticket_number}`}
            >
                <form onSubmit={handleRejectSubmit} className="space-y-4">
                    <div className="p-3 bg-rose-50 dark:bg-rose-950/30 rounded-lg text-xs text-rose-800 dark:text-rose-200 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <span>Tiket yang ditolak <strong>TIDAK AKAN DIHITUNG</strong> dalam rekapitulasi produksi resmi TAP.</span>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Alasan Penolakan (Wajib Diisi)
                        </label>
                        <textarea
                            value={rejectForm.data.rejection_reason}
                            onChange={(e) => rejectForm.setData('rejection_reason', e.target.value)}
                            className="w-full text-xs rounded-lg border-slate-300 dark:border-slate-700 dark:bg-slate-800 p-2.5"
                            rows={3}
                            placeholder="Tuliskan alasan penolakan secara spesifik (misal: Unit tidak sesuai dispatch, selisih timbangan di luar toleransi)..."
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="secondary" onClick={() => setIsRejectOpen(false)}>Batal</Button>
                        <Button type="submit" variant="danger" disabled={rejectForm.processing}>Konfirmasi Penolakan</Button>
                    </div>
                </form>
            </Modal>

            {/* Modal 4: Koreksi Tiket Khusus */}
            <Modal
                isOpen={isCorrectOpen}
                onClose={() => setIsCorrectOpen(false)}
                title={`Koreksi Khusus: ${selectedTicket?.ticket_number}`}
            >
                <form onSubmit={handleCorrectSubmit} className="space-y-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg text-xs text-blue-800 dark:text-blue-200">
                        Tiket yang sudah verified tidak dapat diedit langsung. Perubahan nilai tonase atau armada harus disertai alasan resmi dan dicatat di audit trail.
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Tonase Baru (Ton)</label>
                            <Input
                                type="number"
                                step="0.01"
                                value={correctForm.data.tonnage}
                                onChange={(e) => correctForm.setData('tonnage', e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Ganti Unit Armada</label>
                            <Select
                                value={correctForm.data.unit_id}
                                onChange={(e) => correctForm.setData('unit_id', e.target.value)}
                                options={master.units?.map((u) => ({ value: u.id, label: u.unit_code })) || []}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Loading Point</label>
                            <Select
                                value={correctForm.data.loading_point_id}
                                onChange={(e) => correctForm.setData('loading_point_id', e.target.value)}
                                options={master.loading_points?.map((l) => ({ value: l.id, label: l.name })) || []}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Dumping Point</label>
                            <Select
                                value={correctForm.data.dumping_point_id}
                                onChange={(e) => correctForm.setData('dumping_point_id', e.target.value)}
                                options={master.dumping_points?.map((l) => ({ value: l.id, label: l.name })) || []}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Alasan Koreksi (Audit Trail Wajib)
                        </label>
                        <textarea
                            value={correctForm.data.reason}
                            onChange={(e) => correctForm.setData('reason', e.target.value)}
                            className="w-full text-xs rounded-lg border-slate-300 dark:border-slate-700 dark:bg-slate-800 p-2.5"
                            rows={3}
                            placeholder="Alasan perubahan angka tonase atau data tiket (misal: printout timbangan JSI keliru ketik tare weight)..."
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="secondary" onClick={() => setIsCorrectOpen(false)}>Batal</Button>
                        <Button type="submit" disabled={correctForm.processing}>Simpan Koreksi</Button>
                    </div>
                </form>
            </Modal>
        </DashboardLayout>
    );
}
