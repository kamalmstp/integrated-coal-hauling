import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import DashboardLayout from '../../../components/templates/DashboardLayout';
import Card from '../../../components/molecules/Card';
import Button from '../../../components/atoms/Button';
import Modal from '../../../components/molecules/Modal';
import Pagination from '../../../components/molecules/Pagination';
import {
    Package,
    Plus,
    Filter,
    RefreshCw,
    Search,
    Truck,
    Wrench,
    CheckCircle2,
    Clock,
    DollarSign,
    FileText,
    ArrowRight,
    Warehouse,
    ShieldCheck,
    Trash2,
    Eye,
} from 'lucide-react';

export default function SparepartRequestIndex({
    requests = { data: [], links: [] },
    metrics = {},
    filters = {},
    master = {},
}) {
    const [search, setSearch] = useState(filters.search || '');
    const [siteId, setSiteId] = useState(filters.site_id || '');
    const [status, setStatus] = useState(filters.status || '');
    const [workOrderId, setWorkOrderId] = useState(filters.work_order_id || '');

    // Modals
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isApproveOpen, setIsApproveOpen] = useState(false);
    const [isIssueOpen, setIsIssueOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [selectedReq, setSelectedReq] = useState(null);

    // Form: Create Sparepart Request
    const createForm = useForm({
        site_id: master.sites?.[0]?.id || '',
        work_order_id: master.workOrders?.[0]?.id || '',
        requester_id: master.mechanics?.[0]?.id || '',
        notes: '',
        items: [
            {
                part_number: '',
                part_name: '',
                category: 'brake',
                quantity: 1,
                unit: 'PCS',
                unit_price: 500000,
            },
        ],
    });

    // Form: Approve Request
    const approveForm = useForm({
        approver_id: master.mechanics?.[0]?.id || '',
        notes: 'Disetujui untuk perbaikan unit di workshop TAP.',
    });

    // Form: Issue by Warehouse
    const issueForm = useForm({
        issuer_id: master.mechanics?.[0]?.id || '',
        actual_cost: '',
    });

    const handleFilter = (e) => {
        e.preventDefault();
        router.get('/maintenance/spareparts', {
            site_id: siteId || undefined,
            status: status || undefined,
            work_order_id: workOrderId || undefined,
            search: search || undefined,
        }, { preserveState: true });
    };

    const handleReset = () => {
        setSearch('');
        setSiteId('');
        setStatus('');
        setWorkOrderId('');
        router.get('/maintenance/spareparts');
    };

    const addItemRow = () => {
        createForm.setData('items', [
            ...createForm.data.items,
            {
                part_number: '',
                part_name: '',
                category: 'engine',
                quantity: 1,
                unit: 'PCS',
                unit_price: 250000,
            },
        ]);
    };

    const removeItemRow = (index) => {
        if (createForm.data.items.length <= 1) return;
        const updated = createForm.data.items.filter((_, idx) => idx !== index);
        createForm.setData('items', updated);
    };

    const updateItemRow = (index, field, value) => {
        const updated = [...createForm.data.items];
        updated[index][field] = value;
        createForm.setData('items', updated);
    };

    const openApproveModal = (req) => {
        setSelectedReq(req);
        approveForm.setData({
            approver_id: master.mechanics?.[0]?.id || '',
            notes: 'Disetujui untuk perbaikan unit di workshop TAP.',
        });
        setIsApproveOpen(true);
    };

    const openIssueModal = (req) => {
        setSelectedReq(req);
        issueForm.setData({
            issuer_id: master.mechanics?.[0]?.id || '',
            actual_cost: req.total_cost || 0,
        });
        setIsIssueOpen(true);
    };

    const submitCreate = (e) => {
        e.preventDefault();
        createForm.post('/maintenance/spareparts', {
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
            },
        });
    };

    const submitApprove = (e) => {
        e.preventDefault();
        approveForm.post(`/maintenance/spareparts/${selectedReq.id}/approve`, {
            onSuccess: () => {
                setIsApproveOpen(false);
            },
        });
    };

    const submitIssue = (e) => {
        e.preventDefault();
        issueForm.post(`/maintenance/spareparts/${selectedReq.id}/issue`, {
            onSuccess: () => {
                setIsIssueOpen(false);
            },
        });
    };

    const getStatusBadge = (st) => {
        const map = {
            submitted: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
            approved: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
            issued_by_warehouse: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
            pending_integration: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
            rejected: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
        };
        const labels = {
            submitted: 'Menunggu Approval',
            approved: 'Disetujui Supervisor',
            issued_by_warehouse: 'Dikeluarkan Gudang (Issued)',
            pending_integration: 'Pending Warehouse (Phase 5)',
            rejected: 'Ditolak',
        };
        return <span className={`px-2.5 py-1 text-xs font-semibold rounded-full uppercase tracking-wider ${map[st] || 'bg-gray-100 text-gray-700'}`}>{labels[st] || st}</span>;
    };

    return (
        <DashboardLayout>
            <Head title="Sparepart Requests — TAP Workshop & Warehouse" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                            <Package className="w-7 h-7 text-orange-500" />
                            Sparepart Request & Inventory Integration
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Alur permintaan suku cadang dari mekanik, persetujuan supervisor workshop, pengeluaran logistik gudang, dan integrasi biaya aktual ke Work Order.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            onClick={() => setIsCreateOpen(true)}
                            className="bg-orange-600 hover:bg-orange-700 text-white flex items-center gap-2 shadow-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Buat Permintaan Sparepart
                        </Button>
                    </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    <Card className="p-3 border-l-4 border-l-blue-500 text-center">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Permintaan</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{metrics.total || 0}</p>
                    </Card>
                    <Card className="p-3 border-l-4 border-l-amber-500 text-center">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Menunggu Approval</p>
                        <p className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">{metrics.submitted || 0}</p>
                    </Card>
                    <Card className="p-3 border-l-4 border-l-cyan-500 text-center">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Disetujui</p>
                        <p className="text-xl font-bold text-cyan-600 dark:text-cyan-400 mt-1">{metrics.approved || 0}</p>
                    </Card>
                    <Card className="p-3 border-l-4 border-l-green-500 text-center">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Dikeluarkan Gudang</p>
                        <p className="text-xl font-bold text-green-600 dark:text-green-400 mt-1">{metrics.issued || 0}</p>
                    </Card>
                    <Card className="p-3 border-l-4 border-l-emerald-500 text-center">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Nilai Sparepart</p>
                        <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                            Rp {((metrics.total_cost || 0) / 1000000).toFixed(1)}M
                        </p>
                    </Card>
                </div>

                {/* Filter */}
                <Card className="p-4">
                    <form onSubmit={handleFilter} className="grid grid-cols-1 md:grid-cols-5 gap-3">
                        <div className="relative md:col-span-2">
                            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari Request#, WO#, Nama Part, Part Number..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            />
                        </div>

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
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full py-2 px-3 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            >
                                <option value="">Semua Status</option>
                                <option value="submitted">Menunggu Approval</option>
                                <option value="approved">Disetujui Supervisor</option>
                                <option value="issued_by_warehouse">Dikeluarkan Gudang</option>
                                <option value="pending_integration">Pending Warehouse (Phase 5)</option>
                                <option value="rejected">Ditolak</option>
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
                                    <th className="py-3 px-4">Request# & Tgl</th>
                                    <th className="py-3 px-4">Work Order & Unit</th>
                                    <th className="py-3 px-4">Pemohon & Supervisor</th>
                                    <th className="py-3 px-4">Daftar Item Sparepart</th>
                                    <th className="py-3 px-4 text-right">Total Biaya</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4 text-center">Aksi Gudang</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                                {requests.data?.length > 0 ? (
                                    requests.data.map((req) => (
                                        <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition">
                                            <td className="py-3 px-4 whitespace-nowrap">
                                                <div className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                                                    <Package className="w-4 h-4 text-orange-500" />
                                                    {req.request_number}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                                                    {req.request_date}
                                                </div>
                                            </td>

                                            <td className="py-3 px-4 whitespace-nowrap">
                                                <div className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                                                    <Truck className="w-3.5 h-3.5 text-blue-500" />
                                                    {req.work_order?.unit?.unit_code}
                                                </div>
                                                <div className="text-xs text-amber-600 font-mono">
                                                    {req.work_order?.wo_number}
                                                </div>
                                            </td>

                                            <td className="py-3 px-4 whitespace-nowrap text-xs">
                                                <div className="font-semibold text-gray-800 dark:text-gray-200">
                                                    {req.requester?.name || '-'}
                                                </div>
                                                <div className="text-gray-400 text-[11px]">
                                                    Appr: {req.approver?.name || 'Belum diapprove'}
                                                </div>
                                            </td>

                                            <td className="py-3 px-4 max-w-xs text-xs">
                                                <div className="space-y-0.5">
                                                    {req.items?.map((item, idx) => (
                                                        <div key={idx} className="line-clamp-1 text-gray-700 dark:text-gray-300">
                                                            • <span className="font-semibold">{item.part_name}</span> ({item.quantity} {item.unit})
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>

                                            <td className="py-3 px-4 whitespace-nowrap text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                                                Rp {Number(req.total_cost || 0).toLocaleString('id-ID')}
                                            </td>

                                            <td className="py-3 px-4 whitespace-nowrap">
                                                {getStatusBadge(req.status)}
                                            </td>

                                            <td className="py-3 px-4 whitespace-nowrap text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    {req.status === 'submitted' && (
                                                        <Button
                                                            onClick={() => openApproveModal(req)}
                                                            className="px-2.5 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                                                            title="Setujui Permintaan"
                                                        >
                                                            <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Setujui
                                                        </Button>
                                                    )}

                                                    {req.status === 'approved' && (
                                                        <Button
                                                            onClick={() => openIssueModal(req)}
                                                            className="px-2.5 py-1 text-xs bg-green-600 hover:bg-green-700 text-white"
                                                            title="Keluarkan dari Gudang"
                                                        >
                                                            <Warehouse className="w-3.5 h-3.5 mr-1" /> Issue Gudang
                                                        </Button>
                                                    )}

                                                    {req.status === 'issued_by_warehouse' && (
                                                        <span className="text-xs text-green-600 font-semibold flex items-center justify-center gap-1">
                                                            <CheckCircle2 className="w-3.5 h-3.5" /> Biaya Tercatat
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="py-8 text-center text-gray-500 dark:text-gray-400">
                                            Tidak ada permintaan sparepart yang sesuai filter.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {requests.links && (
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                            <Pagination links={requests.links} />
                        </div>
                    )}
                </Card>

                {/* MODAL: CREATE SPAREPART REQUEST */}
                <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Buat Permintaan Sparepart Baru" maxWidth="max-w-3xl">
                    <form onSubmit={submitCreate} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1">Site / Project *</label>
                                <select
                                    value={createForm.data.site_id}
                                    onChange={(e) => createForm.setData('site_id', e.target.value)}
                                    className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                    required
                                >
                                    {master.sites?.map((s) => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1">Work Order Target *</label>
                                <select
                                    value={createForm.data.work_order_id}
                                    onChange={(e) => createForm.setData('work_order_id', e.target.value)}
                                    className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                    required
                                >
                                    {master.workOrders?.map((w) => (
                                        <option key={w.id} value={w.id}>{w.unit?.unit_code} - {w.wo_number}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1">Mekanik Pemohon *</label>
                                <select
                                    value={createForm.data.requester_id}
                                    onChange={(e) => createForm.setData('requester_id', e.target.value)}
                                    className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                    required
                                >
                                    {master.mechanics?.map((m) => (
                                        <option key={m.id} value={m.id}>{m.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Items list */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 uppercase">
                                    Daftar Suku Cadang yang Diminta
                                </label>
                                <Button type="button" onClick={addItemRow} variant="ghost" className="text-xs text-orange-600">
                                    + Tambah Baris Item
                                </Button>
                            </div>

                            <div className="space-y-2 border border-gray-200 dark:border-gray-700 p-3 rounded-lg max-h-64 overflow-y-auto">
                                {createForm.data.items.map((item, idx) => (
                                    <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-gray-50 dark:bg-gray-800 p-2 rounded">
                                        <div className="col-span-3">
                                            <input
                                                type="text"
                                                placeholder="Part Number"
                                                value={item.part_number}
                                                onChange={(e) => updateItemRow(idx, 'part_number', e.target.value)}
                                                className="w-full text-xs rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white py-1 px-2 font-mono"
                                            />
                                        </div>

                                        <div className="col-span-4">
                                            <input
                                                type="text"
                                                placeholder="Nama Barang / Suku Cadang *"
                                                value={item.part_name}
                                                onChange={(e) => updateItemRow(idx, 'part_name', e.target.value)}
                                                className="w-full text-xs rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white py-1 px-2"
                                                required
                                            />
                                        </div>

                                        <div className="col-span-1">
                                            <input
                                                type="number"
                                                placeholder="Qty"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) => updateItemRow(idx, 'quantity', parseInt(e.target.value) || 1)}
                                                className="w-full text-xs rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white py-1 px-2 font-mono text-center"
                                                required
                                            />
                                        </div>

                                        <div className="col-span-1">
                                            <input
                                                type="text"
                                                placeholder="Unit"
                                                value={item.unit}
                                                onChange={(e) => updateItemRow(idx, 'unit', e.target.value)}
                                                className="w-full text-xs rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white py-1 px-2 text-center"
                                            />
                                        </div>

                                        <div className="col-span-2">
                                            <input
                                                type="number"
                                                placeholder="Harga Est"
                                                value={item.unit_price}
                                                onChange={(e) => updateItemRow(idx, 'unit_price', parseFloat(e.target.value) || 0)}
                                                className="w-full text-xs rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white py-1 px-2 font-mono text-right"
                                            />
                                        </div>

                                        <div className="col-span-1 text-center">
                                            <button
                                                type="button"
                                                onClick={() => removeItemRow(idx)}
                                                className="text-red-500 hover:text-red-700 p-1"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1">Catatan Tambahan</label>
                            <textarea
                                rows="2"
                                value={createForm.data.notes}
                                onChange={(e) => createForm.setData('notes', e.target.value)}
                                placeholder="Alasan penggantian part atau kondisi part lama..."
                                className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={createForm.processing} className="bg-orange-600 hover:bg-orange-700 text-white">
                                {createForm.processing ? 'Menyimpan...' : 'Kirim Permintaan'}
                            </Button>
                        </div>
                    </form>
                </Modal>

                {/* MODAL: APPROVE REQUEST */}
                <Modal isOpen={isApproveOpen} onClose={() => setIsApproveOpen(false)} title={`Persetujuan Permintaan: ${selectedReq?.request_number}`} maxWidth="max-w-md">
                    <form onSubmit={submitApprove} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1">Supervisor Penyetuju *</label>
                            <select
                                value={approveForm.data.approver_id}
                                onChange={(e) => approveForm.setData('approver_id', e.target.value)}
                                className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                required
                            >
                                {master.mechanics?.map((m) => (
                                    <option key={m.id} value={m.id}>{m.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1">Catatan Persetujuan</label>
                            <textarea
                                rows="2"
                                value={approveForm.data.notes}
                                onChange={(e) => approveForm.setData('notes', e.target.value)}
                                className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                            <Button type="button" variant="outline" onClick={() => setIsApproveOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={approveForm.processing} className="bg-blue-600 hover:bg-blue-700 text-white">
                                {approveForm.processing ? 'Memproses...' : 'Setujui Permintaan'}
                            </Button>
                        </div>
                    </form>
                </Modal>

                {/* MODAL: ISSUE BY WAREHOUSE */}
                <Modal isOpen={isIssueOpen} onClose={() => setIsIssueOpen(false)} title={`Pengeluaran Barang dari Gudang: ${selectedReq?.request_number}`} maxWidth="max-w-md">
                    <form onSubmit={submitIssue} className="space-y-4">
                        <div className="p-3 bg-green-50 dark:bg-green-950/40 rounded-lg border border-green-200 dark:border-green-800 text-xs text-green-800 dark:text-green-300">
                            Dengan mengonfirmasi pengeluaran barang ini, sistem secara otomatis mencatat pengeluaran ke dalam <strong>Maintenance Cost Ledger</strong> dan memperbarui akumulasi <strong>Actual Cost</strong> pada Work Order terkait.
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1">Petugas Gudang / Pengeluar *</label>
                            <select
                                value={issueForm.data.issuer_id}
                                onChange={(e) => issueForm.setData('issuer_id', e.target.value)}
                                className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                required
                            >
                                {master.mechanics?.map((m) => (
                                    <option key={m.id} value={m.id}>{m.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1">Total Biaya Aktual Gudang (Rp) *</label>
                            <input
                                type="number"
                                value={issueForm.data.actual_cost}
                                onChange={(e) => issueForm.setData('actual_cost', e.target.value)}
                                className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-emerald-600 font-bold font-mono"
                                required
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                            <Button type="button" variant="outline" onClick={() => setIsIssueOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={issueForm.processing} className="bg-green-600 hover:bg-green-700 text-white">
                                {issueForm.processing ? 'Mengeluarkan...' : 'Konfirmasi Pengeluaran Barang'}
                            </Button>
                        </div>
                    </form>
                </Modal>
            </div>
        </DashboardLayout>
    );
}
