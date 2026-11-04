import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import DashboardLayout from '../../../components/templates/DashboardLayout';
import Card from '../../../components/molecules/Card';
import Badge from '../../../components/atoms/Badge';
import Button from '../../../components/atoms/Button';
import Input from '../../../components/atoms/Input';
import Select from '../../../components/atoms/Select';
import Modal from '../../../components/molecules/Modal';
import Pagination from '../../../components/molecules/Pagination';
import {
    Scale,
    Plus,
    Filter,
    CheckCircle2,
    AlertTriangle,
    Eye,
    FileSpreadsheet,
    Calendar,
    ArrowRight,
} from 'lucide-react';

export default function ReconciliationIndex({
    reconciliations = { data: [] },
    filters = {},
    sites = [],
}) {
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');
    const [selectedSite, setSelectedSite] = useState(filters.site_id || '');
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const form = useForm({
        site_id: sites[0]?.id || '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
        jsi_file: null,
    });

    const handleFilter = (e) => {
        e.preventDefault();
        router.get('/production/reconciliation', {
            status: selectedStatus,
            site_id: selectedSite,
        }, { preserveState: true });
    };

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        form.post('/production/reconciliation', {
            onSuccess: () => {
                setIsCreateOpen(false);
                form.reset();
            },
        });
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'settled':
                return <Badge variant="success">Selesai (Settled)</Badge>;
            case 'in_review':
                return <Badge variant="warning">Dalam Review</Badge>;
            case 'disputed':
                return <Badge variant="danger">Dispute (Selisih)</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <DashboardLayout>
            <Head title="Rekonsiliasi Tiket TAP vs JSI — Coal Hauling" />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="p-2 rounded-lg bg-rose-600 text-white shadow-sm">
                            <Scale className="w-5 h-5" />
                        </span>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Rekonsiliasi Tiket TAP vs JSI
                            </h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Fasilitas pencocokan otomatis antara data tiket timbangan TAP dengan rekapan eksternal JSI
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button onClick={() => setIsCreateOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Mulai Rekonsiliasi Baru
                    </Button>
                </div>
            </div>

            {/* Filter Bar */}
            <Card className="p-4 mb-6">
                <form onSubmit={handleFilter} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Site Proyek</label>
                        <Select
                            value={selectedSite}
                            onChange={(e) => setSelectedSite(e.target.value)}
                            options={[
                                { value: '', label: 'Semua Site' },
                                ...sites.map((s) => ({ value: s.id, label: s.name })),
                            ]}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Status Rekonsiliasi</label>
                        <Select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            options={[
                                { value: '', label: 'Semua Status' },
                                { value: 'in_review', label: 'Dalam Review' },
                                { value: 'settled', label: 'Selesai (Settled)' },
                                { value: 'disputed', label: 'Dispute / Selisih' },
                            ]}
                        />
                    </div>
                    <div>
                        <Button type="submit" variant="secondary" className="w-full">
                            <Filter className="w-4 h-4 mr-1" />
                            Terapkan Filter
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
                                <th className="py-3 px-4">Kode Rekonsiliasi</th>
                                <th className="py-3 px-4">Site Tambang</th>
                                <th className="py-3 px-4">Periode Tanggal</th>
                                <th className="py-3 px-4 text-center">Tiket TAP vs JSI</th>
                                <th className="py-3 px-4 text-right">Tonase TAP vs JSI</th>
                                <th className="py-3 px-4 text-center">Cocok</th>
                                <th className="py-3 px-4 text-center">Selisih</th>
                                <th className="py-3 px-4 text-center">Status</th>
                                <th className="py-3 px-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {reconciliations.data.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="py-8 text-center text-slate-400">
                                        Belum ada riwayat rekonsiliasi. Klik "Mulai Rekonsiliasi Baru" untuk mencocokkan data.
                                    </td>
                                </tr>
                            ) : (
                                reconciliations.data.map((rec) => (
                                    <tr key={rec.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                        <td className="py-3 px-4 font-mono font-bold text-rose-600 dark:text-rose-400">
                                            {rec.reconciliation_code}
                                        </td>
                                        <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                                            {rec.site?.name}
                                        </td>
                                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                                            {rec.start_date} s/d {rec.end_date}
                                        </td>
                                        <td className="py-3 px-4 text-center font-bold text-slate-700 dark:text-slate-300">
                                            {rec.total_tap_tickets} / {rec.total_jsi_tickets}
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="font-bold text-slate-900 dark:text-white">
                                                {Number(rec.total_tap_tonnage).toFixed(1)} T
                                            </div>
                                            <div className="text-[11px] text-slate-400">
                                                JSI: {Number(rec.total_jsi_tonnage).toFixed(1)} T
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <span className="font-bold text-emerald-600">{rec.matched_tickets_count}</span>
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            {rec.discrepancy_tickets_count > 0 || rec.missing_in_tap_count > 0 ? (
                                                <span className="font-bold text-rose-600">
                                                    {(rec.discrepancy_tickets_count || 0) + (rec.missing_in_tap_count || 0)}
                                                </span>
                                            ) : (
                                                <span className="text-slate-400">0</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            {getStatusBadge(rec.status)}
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <Link
                                                href={`/production/reconciliation/${rec.id}`}
                                                className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition"
                                            >
                                                <Eye className="w-3.5 h-3.5 mr-1" />
                                                Detail
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                    <Pagination links={reconciliations.links} />
                </div>
            </Card>

            {/* Modal Rekonsiliasi Baru */}
            <Modal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                title="Mulai Rekonsiliasi Tiket TAP vs JSI"
            >
                <form onSubmit={handleCreateSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Site Proyek</label>
                        <Select
                            value={form.data.site_id}
                            onChange={(e) => form.setData('site_id', e.target.value)}
                            options={sites.map((s) => ({ value: s.id, label: s.name }))}
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Dari Tanggal</label>
                            <Input
                                type="date"
                                value={form.data.start_date}
                                onChange={(e) => form.setData('start_date', e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Sampai Tanggal</label>
                            <Input
                                type="date"
                                value={form.data.end_date}
                                onChange={(e) => form.setData('end_date', e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Berkas Rekapitulasi JSI (Excel .xlsx / CSV)
                        </label>
                        <div className="border border-slate-300 dark:border-slate-700 rounded-lg p-3 bg-slate-50 dark:bg-slate-800/40">
                            <input
                                type="file"
                                accept=".csv,.xlsx"
                                onChange={(e) => form.setData('jsi_file', e.target.files[0])}
                                className="text-xs text-slate-600 dark:text-slate-300"
                            />
                            <p className="text-[11px] text-slate-400 mt-1">
                                Jika file tidak diunggah, sistem akan memvalidasi kelengkapan tiket TAP pada rentang tanggal tersebut.
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="secondary" onClick={() => setIsCreateOpen(false)}>Batal</Button>
                        <Button type="submit" disabled={form.processing}>Jalankan Rekonsiliasi</Button>
                    </div>
                </form>
            </Modal>
        </DashboardLayout>
    );
}
