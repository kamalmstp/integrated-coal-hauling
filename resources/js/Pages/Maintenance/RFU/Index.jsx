import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import DashboardLayout from '../../../components/templates/DashboardLayout';
import Card from '../../../components/molecules/Card';
import Button from '../../../components/atoms/Button';
import Modal from '../../../components/molecules/Modal';
import Pagination from '../../../components/molecules/Pagination';
import {
    ShieldCheck,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Filter,
    RefreshCw,
    Search,
    Truck,
    Wrench,
    ClipboardCheck,
    Clock,
    UserCheck,
    Award,
    ShieldAlert,
    FileCheck,
} from 'lucide-react';

export default function RfuIndex({
    orders = { data: [], links: [] },
    metrics = {},
    recentApprovals = [],
    filters = {},
    master = {},
}) {
    const [siteId, setSiteId] = useState(filters.site_id || '');
    const [unitId, setUnitId] = useState(filters.unit_id || '');
    const [rfuStatus, setRfuStatus] = useState(filters.rfu_status || '');

    // Modals
    const [isInspectOpen, setIsInspectOpen] = useState(false);
    const [isApproveOpen, setIsApproveOpen] = useState(false);
    const [selectedWo, setSelectedWo] = useState(null);

    // Form: Submit QA Inspection
    const inspectForm = useForm({
        work_order_id: '',
        inspector_id: master.inspectors?.[0]?.id || '',
        inspection_type: 'post_repair_qa',
        inspection_date: new Date().toISOString().slice(0, 16),
        test_run_hm: '',
        test_run_km: '',
        test_run_result: 'Unit dilakukan test run 15 menit keliling area workshop, pengereman normal, tidak ada kebocoran oli, suhu mesin stabil.',
        result: 'passed',
        notes: 'Pekerjaan dinyatakan lulus uji QA dan memenuhi standar keselamatan hauling.',
    });

    // Form: Approve RFU
    const approveForm = useForm({
        work_order_id: '',
        approver_id: master.inspectors?.[0]?.id || '',
        approval_date: new Date().toISOString().slice(0, 16),
        signature_hash: 'SIG-RFU-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
        notes: 'Unit dinyatakan Ready For Use (RFU) dan siap dialokasikan ke antrean standby produksi tambang.',
    });

    const handleFilter = (e) => {
        e.preventDefault();
        router.get('/maintenance/rfu', {
            site_id: siteId || undefined,
            unit_id: unitId || undefined,
            rfu_status: rfuStatus || undefined,
        }, { preserveState: true });
    };

    const handleReset = () => {
        setSiteId('');
        setUnitId('');
        setRfuStatus('');
        router.get('/maintenance/rfu');
    };

    const openInspectModal = (wo) => {
        setSelectedWo(wo);
        inspectForm.setData({
            work_order_id: wo.id,
            inspector_id: master.inspectors?.[0]?.id || '',
            inspection_type: 'post_repair_qa',
            inspection_date: new Date().toISOString().slice(0, 16),
            test_run_hm: (parseFloat(wo.hm_at_service || wo.unit?.last_hm || 0) + 0.3).toFixed(1),
            test_run_km: (parseFloat(wo.km_at_service || wo.unit?.last_km || 0) + 2).toFixed(1),
            test_run_result: 'Unit dilakukan test run 15 menit keliling area workshop, pengereman normal, tidak ada kebocoran oli, suhu mesin stabil.',
            result: 'passed',
            notes: 'Pekerjaan dinyatakan lulus uji QA dan memenuhi standar keselamatan hauling.',
        });
        setIsInspectOpen(true);
    };

    const openApproveModal = (wo) => {
        setSelectedWo(wo);
        approveForm.setData({
            work_order_id: wo.id,
            approver_id: master.inspectors?.[0]?.id || '',
            approval_date: new Date().toISOString().slice(0, 16),
            signature_hash: 'SIG-RFU-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
            notes: 'Unit dinyatakan Ready For Use (RFU) dan siap dialokasikan ke antrean standby produksi tambang.',
        });
        setIsApproveOpen(true);
    };

    const submitInspect = (e) => {
        e.preventDefault();
        inspectForm.post('/maintenance/rfu/inspect', {
            onSuccess: () => {
                setIsInspectOpen(false);
            },
        });
    };

    const submitApprove = (e) => {
        e.preventDefault();
        approveForm.post('/maintenance/rfu/approve', {
            onSuccess: () => {
                setIsApproveOpen(false);
            },
        });
    };

    const getRfuBadge = (st) => {
        const map = {
            waiting_repair: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
            repair_in_progress: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
            waiting_inspection: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 animate-pulse',
            inspection_failed: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 font-bold',
            approved_rfu: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 font-bold',
            rejected_rfu: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
        };
        const labels = {
            waiting_repair: 'Menunggu Perbaikan',
            repair_in_progress: 'Dalam Perbaikan',
            waiting_inspection: 'Menunggu Uji QA',
            inspection_failed: 'Gagal Uji QA (Rework)',
            approved_rfu: 'RFU Disetujui (Standby)',
            rejected_rfu: 'RFU Ditolak',
        };
        return <span className={`px-2.5 py-1 text-xs font-semibold rounded-full uppercase tracking-wider ${map[st] || 'bg-gray-100 text-gray-700'}`}>{labels[st] || st}</span>;
    };

    return (
        <DashboardLayout>
            <Head title="RFU & QA Inspection Management — TAP Fleet" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                            <ShieldCheck className="w-7 h-7 text-emerald-500" />
                            Ready For Use (RFU) & QA Inspection
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Pusat verifikasi mutu paska-servis: inspeksi keselamatan, uji coba jalan (test run), dan pengesahan status unit siap kembali beroperasi (Standby).
                        </p>
                    </div>
                </div>

                {/* Strict Rule Notice Box */}
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200">
                    <div className="flex items-start gap-2.5">
                        <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                        <div className="space-y-1">
                            <p className="font-bold text-sm text-amber-950 dark:text-amber-300">
                                Prosedur Keselamatan & Integritas RFU TAP:
                            </p>
                            <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                                <li><strong>Lead Mekanik dilarang meng-approve RFU pekerjaannya sendiri</strong> untuk mencegah konflik kepentingan.</li>
                                <li><strong>Unit dengan kerusakan kritis (rem, kemudi, hidrolik) WAJIB lulus uji QA</strong> sebelum pengesahan RFU dapat dilakukan.</li>
                                <li><strong>Unit yang disetujui RFU otomatis berstatus STANDBY</strong> (bukan langsung Operasi). Foreman Dispatch yang berwenang menugaskannya kembali pada Daily Dispatch.</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    <Card className="p-3 text-center border-l-4 border-l-gray-400">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Antrean Perbaikan</p>
                        <p className="text-xl font-bold text-gray-800 dark:text-white mt-1">{metrics.waiting_repair || 0}</p>
                    </Card>

                    <Card className="p-3 text-center border-l-4 border-l-amber-500">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Sedang Dikerjakan</p>
                        <p className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">{metrics.repair_in_progress || 0}</p>
                    </Card>

                    <Card className="p-3 text-center border-l-4 border-l-purple-500">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Menunggu Uji QA</p>
                        <p className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-1">{metrics.waiting_inspection || 0}</p>
                    </Card>

                    <Card className="p-3 text-center border-l-4 border-l-red-500">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Gagal Uji QA (Rework)</p>
                        <p className="text-xl font-bold text-red-600 dark:text-red-400 mt-1">{metrics.inspection_failed || 0}</p>
                    </Card>

                    <Card className="p-3 text-center border-l-4 border-l-emerald-500">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Disetujui RFU</p>
                        <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{metrics.approved_rfu || 0}</p>
                    </Card>

                    <Card className="p-3 text-center border-l-4 border-l-rose-500">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">RFU Ditolak</p>
                        <p className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1">{metrics.rejected_rfu || 0}</p>
                    </Card>
                </div>

                {/* Filter */}
                <Card className="p-4">
                    <form onSubmit={handleFilter} className="grid grid-cols-1 md:grid-cols-4 gap-3">
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
                                value={unitId}
                                onChange={(e) => setUnitId(e.target.value)}
                                className="w-full py-2 px-3 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            >
                                <option value="">Semua Unit</option>
                                {master.units?.map((u) => (
                                    <option key={u.id} value={u.id}>{u.unit_code} - {u.unit_type}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <select
                                value={rfuStatus}
                                onChange={(e) => setRfuStatus(e.target.value)}
                                className="w-full py-2 px-3 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            >
                                <option value="">Semua Status RFU</option>
                                <option value="waiting_repair">Menunggu Perbaikan</option>
                                <option value="repair_in_progress">Dalam Perbaikan</option>
                                <option value="waiting_inspection">Menunggu Uji QA</option>
                                <option value="inspection_failed">Gagal Uji QA (Rework)</option>
                                <option value="approved_rfu">RFU Disetujui</option>
                                <option value="rejected_rfu">RFU Ditolak</option>
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
                                    <th className="py-3 px-4">Unit Alat Berat</th>
                                    <th className="py-3 px-4">Lead Mekanik</th>
                                    <th className="py-3 px-4">Status QA Inspection</th>
                                    <th className="py-3 px-4">Status RFU</th>
                                    <th className="py-3 px-4">Penyetuju RFU</th>
                                    <th className="py-3 px-4 text-center">Tindakan QA & RFU</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                                {orders.data?.length > 0 ? (
                                    orders.data.map((wo) => {
                                        const hasPassedInspection = wo.latest_inspection?.result === 'passed';

                                        return (
                                            <tr key={wo.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition">
                                                <td className="py-3 px-4 whitespace-nowrap">
                                                    <div className="font-bold text-gray-900 dark:text-white">
                                                        {wo.wo_number}
                                                    </div>
                                                    <div className="text-xs text-gray-400">
                                                        Status WO: <span className="font-semibold uppercase">{wo.status}</span>
                                                    </div>
                                                </td>

                                                <td className="py-3 px-4 whitespace-nowrap">
                                                    <div className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                                                        <Truck className="w-4 h-4 text-blue-500" />
                                                        {wo.unit?.unit_code}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        Status Unit: <span className="font-semibold uppercase">{wo.unit?.status}</span>
                                                    </div>
                                                </td>

                                                <td className="py-3 px-4 whitespace-nowrap text-xs font-semibold text-gray-800 dark:text-gray-200">
                                                    {wo.mechanic?.name || '-'}
                                                </td>

                                                <td className="py-3 px-4 whitespace-nowrap text-xs">
                                                    {wo.latest_inspection ? (
                                                        <div>
                                                            <span className={`inline-flex items-center gap-1 font-bold ${wo.latest_inspection.result === 'passed' ? 'text-green-600' : 'text-red-600'}`}>
                                                                {wo.latest_inspection.result === 'passed' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                                                                {wo.latest_inspection.result?.toUpperCase()}
                                                            </span>
                                                            <div className="text-[11px] text-gray-400 mt-0.5">
                                                                Inspektor: {wo.latest_inspection.inspector?.name}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 italic">Belum diinspeksi</span>
                                                    )}
                                                </td>

                                                <td className="py-3 px-4 whitespace-nowrap">
                                                    {getRfuBadge(wo.rfu_status)}
                                                </td>

                                                <td className="py-3 px-4 whitespace-nowrap text-xs text-gray-700 dark:text-gray-300">
                                                    {wo.rfu_approval?.approver ? (
                                                        <div>
                                                            <div className="font-semibold text-emerald-600 flex items-center gap-1">
                                                                <Award className="w-3.5 h-3.5" /> {wo.rfu_approval.approver.name}
                                                            </div>
                                                            <div className="text-[10px] text-gray-400 font-mono">
                                                                {wo.rfu_approval.approval_date?.slice(0, 10)}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 italic">-</span>
                                                    )}
                                                </td>

                                                <td className="py-3 px-4 whitespace-nowrap text-center">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        <Button
                                                            onClick={() => openInspectModal(wo)}
                                                            className="px-2.5 py-1 text-xs bg-purple-600 hover:bg-purple-700 text-white"
                                                            title="Input Uji QA & Test Run"
                                                        >
                                                            <ClipboardCheck className="w-3.5 h-3.5 mr-1" /> Uji QA
                                                        </Button>

                                                        {wo.rfu_status !== 'approved_rfu' && (
                                                            <Button
                                                                onClick={() => openApproveModal(wo)}
                                                                className={`px-2.5 py-1 text-xs ${hasPassedInspection ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-gray-300 text-gray-600 cursor-not-allowed'}`}
                                                                title={hasPassedInspection ? 'Sahkan RFU (Ready For Use)' : 'Wajib lulus inspeksi terlebih dahulu'}
                                                            >
                                                                <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Sahkan RFU
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
                                            Tidak ada unit yang sedang dalam siklus pemeriksaan RFU.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {orders.links && (
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                            <Pagination links={orders.links} />
                        </div>
                    )}
                </Card>

                {/* MODAL: SUBMIT QA INSPECTION */}
                <Modal isOpen={isInspectOpen} onClose={() => setIsInspectOpen(false)} title={`Pemeriksaan Mutu & Uji QA: ${selectedWo?.wo_number}`} maxWidth="max-w-xl">
                    <form onSubmit={submitInspect} className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1">Inspektor Mutu QA *</label>
                                <select
                                    value={inspectForm.data.inspector_id}
                                    onChange={(e) => inspectForm.setData('inspector_id', e.target.value)}
                                    className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                    required
                                >
                                    {master.inspectors?.map((ins) => (
                                        <option key={ins.id} value={ins.id}>{ins.name} ({ins.employee_code})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1">Hasil Uji QA (Result) *</label>
                                <select
                                    value={inspectForm.data.result}
                                    onChange={(e) => inspectForm.setData('result', e.target.value)}
                                    className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold"
                                    required
                                >
                                    <option value="passed">PASSED (Lulus Sempurna)</option>
                                    <option value="needs_rework">NEEDS REWORK (Perlu Penyesuaian)</option>
                                    <option value="failed">FAILED (Gagal Uji Coba)</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1">HM Saat Test Run</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={inspectForm.data.test_run_hm}
                                    onChange={(e) => inspectForm.setData('test_run_hm', e.target.value)}
                                    className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1">KM Saat Test Run</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={inspectForm.data.test_run_km}
                                    onChange={(e) => inspectForm.setData('test_run_km', e.target.value)}
                                    className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1">Hasil & Observasi Test Run *</label>
                            <textarea
                                rows="2"
                                value={inspectForm.data.test_run_result}
                                onChange={(e) => inspectForm.setData('test_run_result', e.target.value)}
                                className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1">Catatan Tambahan QA</label>
                            <textarea
                                rows="2"
                                value={inspectForm.data.notes}
                                onChange={(e) => inspectForm.setData('notes', e.target.value)}
                                className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                            <Button type="button" variant="outline" onClick={() => setIsInspectOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={inspectForm.processing} className="bg-purple-600 hover:bg-purple-700 text-white">
                                {inspectForm.processing ? 'Menyimpan...' : 'Simpan Hasil Inspeksi QA'}
                            </Button>
                        </div>
                    </form>
                </Modal>

                {/* MODAL: APPROVE RFU */}
                <Modal isOpen={isApproveOpen} onClose={() => setIsApproveOpen(false)} title={`Pengesahan Ready For Use (RFU): ${selectedWo?.unit?.unit_code}`} maxWidth="max-w-lg">
                    <form onSubmit={submitApprove} className="space-y-4">
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 space-y-1">
                            <p className="font-bold">Konfirmasi Pemulihan Status Unit:</p>
                            <p>
                                Setelah disetujui, armada <strong>{selectedWo?.unit?.unit_code}</strong> akan resmi dipulihkan ke status <strong>STANDBY</strong> (Ready For Use) dan Work Order dinyatakan selesai.
                            </p>
                            <p className="text-[11px] text-gray-500 italic">
                                *Sesuai aturan operasional, Lead Mekanik yang mengerjakan ({selectedWo?.mechanic?.name}) dilarang mengesahkan RFU sendiri.
                            </p>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1">Pejabat Pengesah (Approver) *</label>
                            <select
                                value={approveForm.data.approver_id}
                                onChange={(e) => approveForm.setData('approver_id', e.target.value)}
                                className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold"
                                required
                            >
                                {master.inspectors?.map((ins) => (
                                    <option key={ins.id} value={ins.id}>{ins.name} ({ins.employee_code})</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1">Catatan Pengesahan RFU</label>
                            <textarea
                                rows="3"
                                value={approveForm.data.notes}
                                onChange={(e) => approveForm.setData('notes', e.target.value)}
                                className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                            <Button type="button" variant="outline" onClick={() => setIsApproveOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={approveForm.processing} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                                {approveForm.processing ? 'Mengesahkan...' : 'Sahkan Unit Jadi STANDBY (RFU)'}
                            </Button>
                        </div>
                    </form>
                </Modal>
            </div>
        </DashboardLayout>
    );
}
