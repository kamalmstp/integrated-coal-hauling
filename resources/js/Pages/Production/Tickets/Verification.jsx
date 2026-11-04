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
    CheckCircle2,
    XCircle,
    AlertTriangle,
    ShieldCheck,
    Truck,
    Scale,
    Filter,
    Calendar,
    Clock,
    CheckSquare,
    Square,
} from 'lucide-react';

export default function TicketVerification({
    pendingTickets = { data: [] },
    filters = {},
    shifts = [],
}) {
    const [selectedIds, setSelectedIds] = useState([]);
    const [filterDate, setFilterDate] = useState(filters.date || '');
    const [filterShift, setFilterShift] = useState(filters.shift_id || '');

    // Reject Modal
    const [isRejectOpen, setIsRejectOpen] = useState(false);
    const [targetTicket, setTargetTicket] = useState(null);
    const rejectForm = useForm({
        rejection_reason: '',
    });

    const handleFilter = (e) => {
        e.preventDefault();
        router.get('/production/tickets/verification-queue', {
            date: filterDate,
            shift_id: filterShift,
        }, { preserveState: true });
    };

    const handleSingleVerify = (ticket) => {
        if (confirm(`Verifikasi tiket ${ticket.ticket_number} (${ticket.tonnage} Ton)?`)) {
            router.post(`/production/tickets/${ticket.id}/verify`, {}, { preserveScroll: true });
        }
    };

    const handleBatchVerify = () => {
        if (selectedIds.length === 0) return;
        if (confirm(`Verifikasi sekaligus ${selectedIds.length} tiket terpilih sebagai data produksi resmi?`)) {
            router.post('/production/tickets/batch-verify', {
                ticket_ids: selectedIds,
            }, {
                preserveScroll: true,
                onSuccess: () => setSelectedIds([]),
            });
        }
    };

    const openReject = (ticket) => {
        setTargetTicket(ticket);
        rejectForm.setData({ rejection_reason: '' });
        setIsRejectOpen(true);
    };

    const handleRejectSubmit = (e) => {
        e.preventDefault();
        if (!targetTicket) return;
        rejectForm.post(`/production/tickets/${targetTicket.id}/reject`, {
            onSuccess: () => {
                setIsRejectOpen(false);
                rejectForm.reset();
            },
        });
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === pendingTickets.data.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(pendingTickets.data.map((t) => t.id));
        }
    };

    const toggleSelectOne = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter((item) => item !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    return (
        <DashboardLayout>
            <Head title="Verifikasi Tiket Dumping — TAP Coal Hauling" />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="p-2 rounded-lg bg-amber-600 text-white shadow-sm">
                            <ShieldCheck className="w-5 h-5" />
                        </span>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Antrean Verifikasi Tiket Dumping
                            </h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Workflow persetujuan produksi resmi oleh Supervisor / Foreman Hauling
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {selectedIds.length > 0 && (
                        <Button onClick={handleBatchVerify} className="bg-emerald-600 hover:bg-emerald-700">
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Verifikasi Terpilih ({selectedIds.length})
                        </Button>
                    )}
                </div>
            </div>

            {/* Filter Bar */}
            <Card className="p-4 mb-6">
                <form onSubmit={handleFilter} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Tanggal Operasional</label>
                        <Input
                            type="date"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Shift Kerja</label>
                        <Select
                            value={filterShift}
                            onChange={(e) => setFilterShift(e.target.value)}
                            options={[
                                { value: '', label: 'Semua Shift' },
                                ...(shifts.map((s) => ({ value: s.id, label: s.name })) || []),
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
                <div className="p-3 bg-amber-50/60 dark:bg-amber-950/20 border-b border-amber-200 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        Hanya tiket berstatus <strong>Verified</strong> yang akan dihitung ke dalam angka produksi tonase resmi.
                    </span>
                    <span className="font-bold">{pendingTickets.total || 0} Tiket Menunggu Approval</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
                            <tr>
                                <th className="py-3 px-3 text-center w-10">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.length > 0 && selectedIds.length === pendingTickets.data.length}
                                        onChange={toggleSelectAll}
                                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                </th>
                                <th className="py-3 px-3">No. Tiket</th>
                                <th className="py-3 px-3">Tanggal & Jam</th>
                                <th className="py-3 px-3">Armada & Driver</th>
                                <th className="py-3 px-3">Rute Dumping</th>
                                <th className="py-3 px-3">Material</th>
                                <th className="py-3 px-3 text-right">Tonase Netto</th>
                                <th className="py-3 px-3">Checker JSI</th>
                                <th className="py-3 px-3 text-right">Aksi Verifikasi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {pendingTickets.data.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="py-12 text-center text-slate-400">
                                        <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-500 opacity-60" />
                                        <p className="font-semibold text-sm">Semua tiket telah diverifikasi!</p>
                                        <p className="text-xs text-slate-400 mt-1">Tidak ada antrean verifikasi yang tertunda pada filter ini.</p>
                                    </td>
                                </tr>
                            ) : (
                                pendingTickets.data.map((t) => (
                                    <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                        <td className="py-3 px-3 text-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(t.id)}
                                                onChange={() => toggleSelectOne(t.id)}
                                                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                        </td>
                                        <td className="py-3 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                                            {t.ticket_number}
                                        </td>
                                        <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                                            <div>{t.ticket_date}</div>
                                            <div className="text-[11px] text-slate-400">
                                                {t.dumping_time ? new Date(t.dumping_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'} • {t.shift?.name}
                                            </div>
                                        </td>
                                        <td className="py-3 px-3">
                                            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                                <Truck className="w-3.5 h-3.5 text-slate-400" />
                                                {t.unit?.unit_code}
                                            </div>
                                            <div className="text-[11px] text-slate-500">{t.driver?.employee?.name}</div>
                                        </td>
                                        <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                                            <div>{t.loading_point?.name}</div>
                                            <div className="text-[11px] text-slate-400">ke {t.dumping_point?.name}</div>
                                        </td>
                                        <td className="py-3 px-3">
                                            <Badge variant="outline">{t.material?.name}</Badge>
                                        </td>
                                        <td className="py-3 px-3 text-right font-black text-slate-900 dark:text-white text-sm">
                                            {Number(t.tonnage).toFixed(2)} T
                                        </td>
                                        <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                                            {t.checker_name}
                                        </td>
                                        <td className="py-3 px-3 text-right">
                                            <div className="inline-flex gap-1.5">
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleSingleVerify(t)}
                                                    className="bg-emerald-600 hover:bg-emerald-700 py-1 px-2.5"
                                                >
                                                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                                                    Setujui
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="danger"
                                                    onClick={() => openReject(t)}
                                                    className="py-1 px-2.5"
                                                >
                                                    <XCircle className="w-3.5 h-3.5 mr-1" />
                                                    Tolak
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                    <Pagination links={pendingTickets.links} />
                </div>
            </Card>

            {/* Modal Tolak Tiket */}
            <Modal
                isOpen={isRejectOpen}
                onClose={() => setIsRejectOpen(false)}
                title={`Tolak Tiket ${targetTicket?.ticket_number}`}
            >
                <form onSubmit={handleRejectSubmit} className="space-y-4">
                    <div className="p-3 bg-rose-50 dark:bg-rose-950/30 rounded-lg text-xs text-rose-800 dark:text-rose-200">
                        Tiket yang ditolak <strong>TIDAK AKAN DIHITUNG</strong> dalam rekapitulasi produksi resmi TAP.
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
                            placeholder="Alasan penolakan (misal: Unit tidak sesuai dengan penugasan dispatch, tonase tidak valid)..."
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="secondary" onClick={() => setIsRejectOpen(false)}>Batal</Button>
                        <Button type="submit" variant="danger" disabled={rejectForm.processing}>Konfirmasi Tolak Tiket</Button>
                    </div>
                </form>
            </Modal>
        </DashboardLayout>
    );
}
