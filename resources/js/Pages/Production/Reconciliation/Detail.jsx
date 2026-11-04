import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import DashboardLayout from '../../../components/templates/DashboardLayout';
import Card from '../../../components/molecules/Card';
import Badge from '../../../components/atoms/Badge';
import Button from '../../../components/atoms/Button';
import Select from '../../../components/atoms/Select';
import Modal from '../../../components/molecules/Modal';
import Pagination from '../../../components/molecules/Pagination';
import {
    Scale,
    ArrowLeft,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    CheckSquare,
    FileText,
    HelpCircle,
    Filter,
} from 'lucide-react';

export default function ReconciliationDetail({
    reconciliation = {},
    items = { data: [] },
    filters = {},
    counts = {},
}) {
    const [selectedItem, setSelectedItem] = useState(null);
    const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
    const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);

    const resolveForm = useForm({
        resolution_status: 'resolved_accept_tap',
        resolution_notes: '',
    });

    const settleForm = useForm({
        status: 'settled',
        settlement_notes: reconciliation.settlement_notes || '',
    });

    const handleFilterStatus = (status) => {
        router.get(`/production/reconciliation/${reconciliation.id}`, {
            match_status: status,
        }, { preserveState: true });
    };

    const openResolveModal = (item) => {
        setSelectedItem(item);
        resolveForm.setData({
            resolution_status: item.resolution_status || 'resolved_accept_tap',
            resolution_notes: item.resolution_notes || '',
        });
        setIsResolveModalOpen(true);
    };

    const handleResolveSubmit = (e) => {
        e.preventDefault();
        if (!selectedItem) return;
        resolveForm.put(`/production/reconciliation/items/${selectedItem.id}`, {
            onSuccess: () => {
                setIsResolveModalOpen(false);
                resolveForm.reset();
            },
        });
    };

    const handleSettleSubmit = (e) => {
        e.preventDefault();
        settleForm.post(`/production/reconciliation/${reconciliation.id}/settle`, {
            onSuccess: () => {
                setIsSettleModalOpen(false);
            },
        });
    };

    const getMatchBadge = (status) => {
        switch (status) {
            case 'match':
                return <Badge variant="success">Cocok (Match)</Badge>;
            case 'tonnage_diff':
                return <Badge variant="warning">Selisih Tonase</Badge>;
            case 'unit_diff':
                return <Badge variant="warning">Beda Unit</Badge>;
            case 'missing_in_tap':
                return <Badge variant="danger">Tidak Ada di TAP</Badge>;
            case 'missing_in_jsi':
                return <Badge variant="danger">Tidak Ada di JSI</Badge>;
            case 'duplicate':
                return <Badge variant="danger">Tiket Duplikat</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getResolutionBadge = (status) => {
        switch (status) {
            case 'resolved_accept_tap':
                return <Badge variant="success">Disetujui TAP</Badge>;
            case 'resolved_accept_jsi':
                return <Badge variant="primary">Disetujui JSI</Badge>;
            case 'resolved_adjusted':
                return <Badge variant="info">Disesuaikan</Badge>;
            case 'ignored':
                return <Badge variant="secondary">Diabaikan</Badge>;
            default:
                return <Badge variant="outline">Belum Diselesaikan</Badge>;
        }
    };

    return (
        <DashboardLayout>
            <Head title={`Rekonsiliasi ${reconciliation.reconciliation_code} — TAP`} />

            {/* Back & Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <Link
                        href="/production/reconciliation"
                        className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 mb-2"
                    >
                        <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                        Kembali ke Daftar Rekonsiliasi
                    </Link>
                    <div className="flex items-center gap-2">
                        <span className="p-2 rounded-lg bg-rose-600 text-white shadow-sm">
                            <Scale className="w-5 h-5" />
                        </span>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                                Detail Rekonsiliasi: {reconciliation.reconciliation_code}
                                <Badge variant={reconciliation.status === 'settled' ? 'success' : 'warning'}>
                                    {reconciliation.status.toUpperCase()}
                                </Badge>
                            </h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Site: <strong>{reconciliation.site?.name}</strong> • Periode: <strong>{reconciliation.start_date} s/d {reconciliation.end_date}</strong> • File: <strong>{reconciliation.source_file_name || '-'}</strong>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button onClick={() => setIsSettleModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-700">
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Selesaikan Rekonsiliasi
                    </Button>
                </div>
            </div>

            {/* Summary Statistics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <Card className="p-4 border-l-4 border-l-blue-500">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Tiket TAP</span>
                    <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
                        {reconciliation.total_tap_tickets} Tiket
                    </div>
                    <span className="text-xs text-slate-500 mt-1 block">Tonase: <strong>{Number(reconciliation.total_tap_tonnage).toFixed(2)} Ton</strong></span>
                </Card>

                <Card className="p-4 border-l-4 border-l-purple-500">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Tiket JSI</span>
                    <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
                        {reconciliation.total_jsi_tickets} Tiket
                    </div>
                    <span className="text-xs text-slate-500 mt-1 block">Tonase: <strong>{Number(reconciliation.total_jsi_tonnage).toFixed(2)} Ton</strong></span>
                </Card>

                <Card className="p-4 border-l-4 border-l-emerald-500">
                    <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 uppercase">Tiket Cocok (Match)</span>
                    <div className="text-xl font-black text-emerald-600 mt-1">
                        {reconciliation.matched_tickets_count} Tiket
                    </div>
                    <span className="text-xs text-emerald-600 mt-1 block">{Number(reconciliation.matched_tonnage).toFixed(2)} Ton Klop</span>
                </Card>

                <Card className="p-4 border-l-4 border-l-rose-500">
                    <span className="text-[11px] font-semibold text-rose-700 dark:text-rose-300 uppercase">Tiket Selisih (Discrepant)</span>
                    <div className="text-xl font-black text-rose-600 mt-1">
                        {(reconciliation.discrepancy_tickets_count || 0) + (reconciliation.missing_in_tap_count || 0)} Tiket
                    </div>
                    <span className="text-xs text-rose-600 mt-1 block">Selisih: {Number(reconciliation.discrepancy_tonnage).toFixed(2)} Ton</span>
                </Card>
            </div>

            {/* Filter Buttons Ribbon */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                <button
                    onClick={() => handleFilterStatus('all')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition whitespace-nowrap ${filters.match_status === 'all' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
                >
                    Semua Baris ({counts.all})
                </button>
                <button
                    onClick={() => handleFilterStatus('match')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition whitespace-nowrap ${filters.match_status === 'match' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'}`}
                >
                    Cocok ({counts.match})
                </button>
                <button
                    onClick={() => handleFilterStatus('tonnage_diff')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition whitespace-nowrap ${filters.match_status === 'tonnage_diff' ? 'bg-amber-600 text-white' : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'}`}
                >
                    Selisih Tonase ({counts.tonnage_diff})
                </button>
                <button
                    onClick={() => handleFilterStatus('missing_in_tap')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition whitespace-nowrap ${filters.match_status === 'missing_in_tap' ? 'bg-rose-600 text-white' : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'}`}
                >
                    Tidak Ada di TAP ({counts.missing_in_tap})
                </button>
                <button
                    onClick={() => handleFilterStatus('missing_in_jsi')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition whitespace-nowrap ${filters.match_status === 'missing_in_jsi' ? 'bg-purple-600 text-white' : 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300'}`}
                >
                    Tidak Ada di JSI ({counts.missing_in_jsi})
                </button>
            </div>

            {/* Reconciliation Comparison Table */}
            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
                            <tr>
                                <th className="py-3 px-4">No. Tiket TAP</th>
                                <th className="py-3 px-4">No. Tiket JSI</th>
                                <th className="py-3 px-4 text-center">Unit (TAP / JSI)</th>
                                <th className="py-3 px-4 text-right">Tonase TAP</th>
                                <th className="py-3 px-4 text-right">Tonase JSI</th>
                                <th className="py-3 px-4 text-right">Selisih Tonase</th>
                                <th className="py-3 px-4 text-center">Kategori Cocok</th>
                                <th className="py-3 px-4 text-center">Status Penyelesaian</th>
                                <th className="py-3 px-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {items.data.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="py-8 text-center text-slate-400">
                                        Tidak ada baris rekonsiliasi pada kategori ini.
                                    </td>
                                </tr>
                            ) : (
                                items.data.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                        <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                                            {item.tap_ticket_number || <span className="text-slate-400 italic">Tidak ada</span>}
                                        </td>
                                        <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">
                                            {item.jsi_ticket_number || <span className="text-slate-400 italic">Tidak ada</span>}
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <span className="font-semibold text-slate-800 dark:text-slate-200">{item.tap_unit_code || '-'}</span>
                                            <span className="text-slate-400 mx-1">/</span>
                                            <span className="text-slate-500">{item.jsi_unit_code || '-'}</span>
                                        </td>
                                        <td className="py-3 px-4 text-right font-semibold">
                                            {Number(item.tap_tonnage).toFixed(2)} T
                                        </td>
                                        <td className="py-3 px-4 text-right font-semibold text-purple-600 dark:text-purple-400">
                                            {Number(item.jsi_tonnage).toFixed(2)} T
                                        </td>
                                        <td className="py-3 px-4 text-right font-black">
                                            {Math.abs(item.tonnage_diff) > 0 ? (
                                                <span className="text-rose-600 dark:text-rose-400">
                                                    {Number(item.tonnage_diff).toFixed(2)} T
                                                </span>
                                            ) : (
                                                <span className="text-emerald-600">0.00 T</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            {getMatchBadge(item.match_status)}
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            {getResolutionBadge(item.resolution_status)}
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                onClick={() => openResolveModal(item)}
                                            >
                                                Penyelesaian
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                    <Pagination links={items.links} />
                </div>
            </Card>

            {/* Settlement Notes Summary if exists */}
            {reconciliation.settlement_notes && (
                <Card className="p-4 mt-6 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                        Catatan Penyelesaian Rekonsiliasi (Settlement Notes):
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300">{reconciliation.settlement_notes}</p>
                </Card>
            )}

            {/* Modal 1: Resolve Item Discrepancy */}
            <Modal
                isOpen={isResolveModalOpen}
                onClose={() => setIsResolveModalOpen(false)}
                title={`Penyelesaian Selisih Tiket: ${selectedItem?.tap_ticket_number || selectedItem?.jsi_ticket_number}`}
            >
                <form onSubmit={handleResolveSubmit} className="space-y-4">
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-xs space-y-1">
                        <div className="flex justify-between">
                            <span className="text-slate-500">Tonase TAP:</span>
                            <span className="font-bold">{selectedItem?.tap_tonnage} Ton</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Tonase JSI:</span>
                            <span className="font-bold text-purple-600">{selectedItem?.jsi_tonnage} Ton</span>
                        </div>
                        <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-1">
                            <span className="text-slate-500">Selisih Tonase:</span>
                            <span className="font-black text-rose-600">{selectedItem?.tonnage_diff} Ton</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Status Keputusan Penyelesaian</label>
                        <Select
                            value={resolveForm.data.resolution_status}
                            onChange={(e) => resolveForm.setData('resolution_status', e.target.value)}
                            options={[
                                { value: 'resolved_accept_tap', label: 'Disetujui: Menggunakan Angka Timbangan TAP' },
                                { value: 'resolved_accept_jsi', label: 'Disetujui: Menggunakan Angka Timbangan JSI' },
                                { value: 'resolved_adjusted', label: 'Disesuaikan Bersama (Adjusted Berita Acara)' },
                                { value: 'ignored', label: 'Diabaikan (Tiket Void/Batal)' },
                            ]}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Catatan Berita Acara / Alasan Keputusan</label>
                        <textarea
                            value={resolveForm.data.resolution_notes}
                            onChange={(e) => resolveForm.setData('resolution_notes', e.target.value)}
                            className="w-full text-xs rounded-lg border-slate-300 dark:border-slate-700 dark:bg-slate-800 p-2.5"
                            rows={3}
                            placeholder="Keterangan hasil konfirmasi dengan checker JSI atau print out struk..."
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="secondary" onClick={() => setIsResolveModalOpen(false)}>Batal</Button>
                        <Button type="submit" disabled={resolveForm.processing}>Simpan Penyelesaian</Button>
                    </div>
                </form>
            </Modal>

            {/* Modal 2: Final Settle Reconciliation */}
            <Modal
                isOpen={isSettleModalOpen}
                onClose={() => setIsSettleModalOpen(false)}
                title="Finalisasi & Selesaikan Rekonsiliasi"
            >
                <form onSubmit={handleSettleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Status Final</label>
                        <Select
                            value={settleForm.data.status}
                            onChange={(e) => settleForm.setData('status', e.target.value)}
                            options={[
                                { value: 'settled', label: 'Settled (Selesai Sepakat)' },
                                { value: 'disputed', label: 'Disputed (Masih Berselisih / Butuh Klarifikasi Direksi)' },
                            ]}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Catatan Kesepakatan Final (Settlement Notes)</label>
                        <textarea
                            value={settleForm.data.settlement_notes}
                            onChange={(e) => settleForm.setData('settlement_notes', e.target.value)}
                            className="w-full text-xs rounded-lg border-slate-300 dark:border-slate-700 dark:bg-slate-800 p-2.5"
                            rows={3}
                            placeholder="Catatan penutupan rekonsiliasi antara TAP dan pihak JSI..."
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="secondary" onClick={() => setIsSettleModalOpen(false)}>Batal</Button>
                        <Button type="submit" disabled={settleForm.processing}>Konfirmasi Selesai</Button>
                    </div>
                </form>
            </Modal>
        </DashboardLayout>
    );
}
