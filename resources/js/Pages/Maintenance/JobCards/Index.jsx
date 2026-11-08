import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import DashboardLayout from '../../../components/templates/DashboardLayout';
import Card from '../../../components/molecules/Card';
import Button from '../../../components/atoms/Button';
import Modal from '../../../components/molecules/Modal';
import Pagination from '../../../components/molecules/Pagination';
import {
    FileSpreadsheet,
    Printer,
    CheckCircle2,
    Clock,
    Search,
    Filter,
    RefreshCw,
    Truck,
    UserCheck,
    CheckSquare,
    AlertCircle,
    Eye,
    ShieldCheck,
} from 'lucide-react';

export default function JobCardIndex({
    jobCards = { data: [], links: [] },
    filters = {},
    master = {},
}) {
    const [search, setSearch] = useState(filters.search || '');
    const [siteId, setSiteId] = useState(filters.site_id || '');
    const [unitId, setUnitId] = useState(filters.unit_id || '');
    const [status, setStatus] = useState(filters.status || '');

    // Modals
    const [isSignOffOpen, setIsSignOffOpen] = useState(false);
    const [selectedJc, setSelectedJc] = useState(null);

    // Form: Supervisor Sign-Off
    const signOffForm = useForm({
        supervisor_id: master.employees?.[0]?.id || '',
        supervisor_notes: 'Pekerjaan perbaikan telah diperiksa menyeluruh, checklist lengkap, dan unit telah siap uji QA.',
    });

    const handleFilter = (e) => {
        e.preventDefault();
        router.get('/maintenance/job-cards', {
            site_id: siteId || undefined,
            unit_id: unitId || undefined,
            status: status || undefined,
            search: search || undefined,
        }, { preserveState: true });
    };

    const handleReset = () => {
        setSearch('');
        setSiteId('');
        setUnitId('');
        setStatus('');
        router.get('/maintenance/job-cards');
    };

    const toggleChecklistItem = (item) => {
        router.post(`/maintenance/job-cards/checklists/${item.id}`, {
            is_checked: !item.is_checked,
            notes: item.notes,
        }, { preserveScroll: true });
    };

    const openSignOffModal = (jc) => {
        setSelectedJc(jc);
        signOffForm.setData({
            supervisor_id: master.employees?.[0]?.id || '',
            supervisor_notes: 'Pekerjaan perbaikan telah diperiksa menyeluruh, checklist lengkap, dan unit telah siap uji QA.',
        });
        setIsSignOffOpen(true);
    };

    const submitSignOff = (e) => {
        e.preventDefault();
        signOffForm.post(`/maintenance/job-cards/${selectedJc.id}/sign-off`, {
            onSuccess: () => {
                setIsSignOffOpen(false);
            },
        });
    };

    return (
        <DashboardLayout>
            <Head title="Job Card Management — TAP Maintenance" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                            <FileSpreadsheet className="w-7 h-7 text-indigo-500" />
                            Job Card & Checklist Management
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Pencatatan kartu kerja fisik ke digital, verifikasi checklist teknis, tanda tangan supervisor, dan cetak form Job Card standar TAP.
                        </p>
                    </div>
                </div>

                {/* Filter */}
                <Card className="p-4">
                    <form onSubmit={handleFilter} className="grid grid-cols-1 md:grid-cols-5 gap-3">
                        <div className="relative md:col-span-2">
                            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari Job Card#, WO#, Unit, Keluhan..."
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
                                <option value="open">Open (Terbuka)</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                                <option value="signed_off">Signed Off (Supervisor)</option>
                                <option value="closed">Closed</option>
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

                {/* Job Cards Table */}
                <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    <th className="py-3 px-4">Job Card & Tanggal</th>
                                    <th className="py-3 px-4">Work Order & Unit</th>
                                    <th className="py-3 px-4">Keluhan & Pekerjaan</th>
                                    <th className="py-3 px-4">Checklist Items</th>
                                    <th className="py-3 px-4">Lead Mekanik</th>
                                    <th className="py-3 px-4">Status & Pengawas</th>
                                    <th className="py-3 px-4 text-center">Aksi & Cetak</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                                {jobCards.data?.length > 0 ? (
                                    jobCards.data.map((jc) => {
                                        const totalItems = jc.checklists?.length || 0;
                                        const checkedItems = jc.checklists?.filter((c) => c.is_checked)?.length || 0;

                                        return (
                                            <tr key={jc.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition">
                                                <td className="py-3 px-4 whitespace-nowrap">
                                                    <div className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                                                        <FileSpreadsheet className="w-4 h-4 text-indigo-500" />
                                                        {jc.job_card_number}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        {jc.issue_date}
                                                    </div>
                                                </td>

                                                <td className="py-3 px-4 whitespace-nowrap">
                                                    <div className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                                                        <Truck className="w-3.5 h-3.5 text-blue-500" />
                                                        {jc.unit?.unit_code}
                                                    </div>
                                                    <div className="text-xs text-amber-600 font-mono">
                                                        {jc.work_order?.wo_number}
                                                    </div>
                                                </td>

                                                <td className="py-3 px-4 max-w-xs text-xs">
                                                    <p className="font-medium text-gray-900 dark:text-white line-clamp-1">{jc.initial_complaint || '-'}</p>
                                                    <p className="text-gray-500 dark:text-gray-400 line-clamp-1 italic mt-0.5">{jc.work_performed || 'Belum diisi'}</p>
                                                </td>

                                                <td className="py-3 px-4 whitespace-nowrap">
                                                    <div className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                                                        {checkedItems} / {totalItems} Centang
                                                    </div>
                                                    <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1 overflow-hidden">
                                                        <div
                                                            className="bg-indigo-600 h-1.5 rounded-full"
                                                            style={{ width: `${totalItems > 0 ? (checkedItems / totalItems) * 100 : 0}%` }}
                                                        ></div>
                                                    </div>
                                                </td>

                                                <td className="py-3 px-4 whitespace-nowrap text-xs font-medium text-gray-800 dark:text-gray-200">
                                                    {jc.lead_mechanic?.name || '-'}
                                                </td>

                                                <td className="py-3 px-4 whitespace-nowrap">
                                                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full uppercase ${jc.status === 'signed_off' ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300'}`}>
                                                        {jc.status?.replace('_', ' ')}
                                                    </span>
                                                    {jc.supervisor && (
                                                        <div className="text-[11px] text-gray-500 mt-1 flex items-center gap-1">
                                                            <UserCheck className="w-3 h-3 text-green-500" />
                                                            {jc.supervisor.name}
                                                        </div>
                                                    )}
                                                </td>

                                                <td className="py-3 px-4 whitespace-nowrap text-center">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        <a
                                                            href={`/maintenance/job-cards/${jc.id}/print`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 transition"
                                                            title="Buka / Cetak Job Card PDF"
                                                        >
                                                            <Printer className="w-3.5 h-3.5 text-indigo-500" /> Cetak
                                                        </a>

                                                        {jc.status !== 'signed_off' && (
                                                            <Button
                                                                onClick={() => openSignOffModal(jc)}
                                                                className="px-2.5 py-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                                                            >
                                                                <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Sign-Off
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="py-8 text-center text-gray-500 dark:text-gray-400">
                                            Tidak ada Job Card yang sesuai filter pencarian.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {jobCards.links && (
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                            <Pagination links={jobCards.links} />
                        </div>
                    )}
                </Card>

                {/* MODAL: SUPERVISOR SIGN OFF */}
                <Modal isOpen={isSignOffOpen} onClose={() => setIsSignOffOpen(false)} title={`Persetujuan Supervisor: ${selectedJc?.job_card_number}`} maxWidth="max-w-md">
                    <form onSubmit={submitSignOff} className="space-y-4">
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300">
                            Dengan menandatangani Job Card ini, Supervisor menyatakan pekerjaan workshop telah selesai diperiksa dan memenuhi standar operasional armada TAP.
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1">Supervisor Pengawas *</label>
                            <select
                                value={signOffForm.data.supervisor_id}
                                onChange={(e) => signOffForm.setData('supervisor_id', e.target.value)}
                                className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                required
                            >
                                {master.employees?.map((emp) => (
                                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.employee_code})</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1">Catatan Pengawas (Sign-Off Notes) *</label>
                            <textarea
                                rows="3"
                                value={signOffForm.data.supervisor_notes}
                                onChange={(e) => signOffForm.setData('supervisor_notes', e.target.value)}
                                className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                required
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                            <Button type="button" variant="outline" onClick={() => setIsSignOffOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={signOffForm.processing} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                {signOffForm.processing ? 'Menyimpan...' : 'Tanda Tangani Job Card'}
                            </Button>
                        </div>
                    </form>
                </Modal>
            </div>
        </DashboardLayout>
    );
}
