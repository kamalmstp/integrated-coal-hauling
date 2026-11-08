import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import DashboardLayout from '../../../components/templates/DashboardLayout';
import {
    ShoppingCart,
    ClipboardList,
    CheckCircle2,
    Clock,
    AlertOctagon,
    TrendingUp,
    Building2,
    ShieldCheck,
    Award,
    Plus,
    X,
} from 'lucide-react';

const formatIDR = (val) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(val || 0));

export default function ProcurementDashboardIndex({
    metrics = {},
    purchaseBySite = [],
    vendorPerformance = [],
    approvalRules = [],
    recentPos = [],
    filters = {},
    master = {},
}) {
    const [siteId, setSiteId] = useState(filters.site_id || '');
    const [showRuleModal, setShowRuleModal] = useState(false);

    const ruleForm = useForm({
        rule_code: '',
        rule_name: '',
        document_type: 'ALL',
        site_id: '',
        department_id: '',
        purchase_category: '',
        min_amount: 0,
        max_amount: '',
        step_order: 1,
        approver_position_id: master.positions?.[0]?.id ?? '',
        approver_role_label: master.positions?.[0]?.name ?? 'Site Manager',
    });

    const applyFilter = (newSite) => {
        setSiteId(newSite);
        router.get('/procurement/dashboard', { site_id: newSite || undefined }, { preserveState: true, preserveScroll: true });
    };

    const submitRule = (e) => {
        e.preventDefault();
        ruleForm.post('/procurement/approval-rules', {
            onSuccess: () => {
                setShowRuleModal(false);
                ruleForm.reset();
            },
        });
    };

    return (
        <DashboardLayout title="Dashboard Procurement Management">
            <Head title="Procurement Dashboard - TAP" />

            <div className="space-y-6">
                {/* Header & Site Filter */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-md">
                                Phase 6 — Procurement Management
                            </span>
                            <span className="text-xs text-slate-500">
                                PR &rarr; Approval &rarr; RFQ &rarr; Comparison &rarr; PO &rarr; GRN &rarr; 3-Way Match Invoice
                            </span>
                        </div>
                        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                            Procurement & Supply Chain Control Tower
                        </h1>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Terintegrasi penuh dengan Warehouse, Maintenance, Vendor Master, dan Persiapan Kewajiban Pembayaran Finance.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                        <select
                            value={siteId}
                            onChange={(e) => applyFilter(e.target.value)}
                            className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                        >
                            <option value="">Semua Site Operasional</option>
                            {(master.sites || []).map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.code} — {s.name}
                                </option>
                            ))}
                        </select>

                        <button
                            type="button"
                            onClick={() => setShowRuleModal(true)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
                        >
                            <ShieldCheck className="w-3.5 h-3.5" /> Konfigurasi Matriks Approval
                        </button>
                    </div>
                </div>

                {/* 6 Required Procurement KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-6 gap-3.5">
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                        <span className="text-[11px] font-semibold text-amber-600">PR Pending Approval</span>
                        <p className="text-2xl font-extrabold text-amber-600 mt-1">
                            {metrics.pr_pending_approval || 0}
                        </p>
                        <Link href="/procurement/purchase-requests" className="text-[10px] text-indigo-600 font-bold hover:underline">
                            Otorisasi PR &rarr;
                        </Link>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                        <span className="text-[11px] font-semibold text-emerald-600">PR Approved</span>
                        <p className="text-2xl font-extrabold text-emerald-600 mt-1">{metrics.pr_approved || 0}</p>
                        <Link href="/procurement/rfqs" className="text-[10px] text-indigo-600 font-bold hover:underline">
                            Proses RFQ &rarr;
                        </Link>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                        <span className="text-[11px] font-semibold text-blue-600">PO Outstanding</span>
                        <p className="text-2xl font-extrabold text-blue-600 mt-1">{metrics.po_outstanding || 0}</p>
                        <Link href="/procurement/purchase-orders" className="text-[10px] text-indigo-600 font-bold hover:underline">
                            Monitor PO &rarr;
                        </Link>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                        <span className="text-[11px] font-semibold text-purple-600">Partial Delivery</span>
                        <p className="text-2xl font-extrabold text-purple-600 mt-1">{metrics.partial_delivery || 0}</p>
                        <Link href="/procurement/goods-receipts" className="text-[10px] text-indigo-600 font-bold hover:underline">
                            Goods Receipt &rarr;
                        </Link>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                        <span className="text-[11px] font-semibold text-rose-600">Overdue Delivery</span>
                        <p className="text-2xl font-extrabold text-rose-600 mt-1">{metrics.overdue_delivery || 0}</p>
                        <span className="text-[10px] text-slate-400">Melewati Target Kirim</span>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                        <span className="text-[11px] font-semibold text-slate-500">Total Purchase Value</span>
                        <p className="text-base font-extrabold text-slate-900 dark:text-white mt-1.5">
                            {formatIDR(metrics.total_purchase_value)}
                        </p>
                        <span className="text-[10px] text-emerald-600 font-bold">
                            {metrics.pending_invoices_count || 0} Invoice Tercatat
                        </span>
                    </div>
                </div>

                {/* Vendor Performance & Purchase by Site */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
                        <div className="p-4 border-b border-slate-200/80 dark:border-slate-800">
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Award className="w-4 h-4 text-amber-500" />
                                Evaluasi Kinerja Vendor (Vendor Performance Scorecard)
                            </h2>
                            <p className="text-[11px] text-slate-500">
                                Diukur otomatis berdasarkan ketepatan waktu pengiriman (On-Time Delivery) dan kualitas barang diterima (Quality Acceptance vs Damaged/Rejected).
                            </p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                                        <th className="py-2.5 px-3">Vendor</th>
                                        <th className="py-2.5 px-3 text-right">Total PO</th>
                                        <th className="py-2.5 px-3 text-right">Nilai Kontrak PO</th>
                                        <th className="py-2.5 px-3 text-right">On-Time Delivery</th>
                                        <th className="py-2.5 px-3 text-right">Quality Acceptance</th>
                                        <th className="py-2.5 px-3 text-right">Damaged / Retur</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800">
                                    {vendorPerformance.map((vp) => (
                                        <tr key={vp.vendor_id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                                            <td className="py-2.5 px-3">
                                                <div className="font-bold text-slate-900 dark:text-white">
                                                    {vp.vendor_code} — {vp.vendor_name}
                                                </div>
                                                <div className="text-[10px] text-slate-500">{vp.vendor_type}</div>
                                            </td>
                                            <td className="py-2.5 px-3 text-right font-bold">{vp.po_count} PO</td>
                                            <td className="py-2.5 px-3 text-right font-bold text-indigo-600">
                                                {formatIDR(vp.total_po_value)}
                                            </td>
                                            <td className="py-2.5 px-3 text-right">
                                                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                                                    {vp.on_time_delivery_rate}%
                                                </span>
                                            </td>
                                            <td className="py-2.5 px-3 text-right">
                                                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px]">
                                                    {vp.quality_acceptance_rate}%
                                                </span>
                                            </td>
                                            <td className="py-2.5 px-3 text-right font-bold text-rose-600">
                                                {vp.damaged_or_rejected_qty} Unit
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Purchase by Site */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
                        <div className="p-4 border-b border-slate-200/80 dark:border-slate-800">
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-indigo-600" />
                                Rekapitulasi Pembelian per Site (Purchase by Site)
                            </h2>
                        </div>
                        <div className="p-4 space-y-3">
                            {purchaseBySite.map((st) => (
                                <div
                                    key={st.site_id}
                                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/50 space-y-1.5"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                                            {st.site_code} — {st.site_name}
                                        </span>
                                        <span className="text-xs font-extrabold text-indigo-600">
                                            {formatIDR(st.total_value)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                                        <span>Total PR: {st.pr_count}</span>
                                        <span>Total PO: {st.po_count}</span>
                                        <span className="text-amber-600 font-semibold">
                                            Outstanding: {st.outstanding_po} PO
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Configurable Approval Rules Matrix */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
                    <div className="p-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                        <div>
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                Matriks Otorisasi & Approval Dinamis (Configurable Approval Rules)
                            </h2>
                            <p className="text-[11px] text-slate-500">
                                Berdasarkan Jabatan, Site, Departemen, Nilai Transaksi, dan Kategori Pembelian (Nominal tidak di-hardcode di dalam kode sumber).
                            </p>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                                    <th className="py-2.5 px-3">Step</th>
                                    <th className="py-2.5 px-3">Kode & Nama Aturan</th>
                                    <th className="py-2.5 px-3">Dokumen</th>
                                    <th className="py-2.5 px-3">Site / Dept / Kategori</th>
                                    <th className="py-2.5 px-3 text-right">Batas Nilai Transaksi (Min - Max)</th>
                                    <th className="py-2.5 px-3">Jabatan Otorisator</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800">
                                {approvalRules.map((r) => (
                                    <tr key={r.id}>
                                        <td className="py-2.5 px-3 font-extrabold text-indigo-600">Step {r.step_order}</td>
                                        <td className="py-2.5 px-3">
                                            <div className="font-bold text-slate-900 dark:text-white">{r.rule_code}</div>
                                            <div className="text-[11px] text-slate-500">{r.rule_name}</div>
                                        </td>
                                        <td className="py-2.5 px-3 font-semibold">{r.document_type}</td>
                                        <td className="py-2.5 px-3 text-[11px]">
                                            Site: {r.site?.code || 'ALL'} • Dept: {r.department?.name || 'ALL'} • Kat:{' '}
                                            {r.purchase_category || 'ALL'}
                                        </td>
                                        <td className="py-2.5 px-3 text-right font-mono">
                                            {formatIDR(r.min_amount)} s/d {r.max_amount ? formatIDR(r.max_amount) : 'Tak Terbatas'}
                                        </td>
                                        <td className="py-2.5 px-3 font-bold text-emerald-700 dark:text-emerald-400">
                                            {r.approver_role_label} ({r.approver_position?.name || 'Position'})
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal Tambah Rule Approval */}
            {showRuleModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden shadow-xl">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                Tambah Konfigurasi Aturan Approval Procurement
                            </h3>
                            <button onClick={() => setShowRuleModal(false)} className="text-slate-400">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={submitRule} className="p-4 space-y-3 text-xs">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold mb-1">Kode Rule *</label>
                                    <input
                                        type="text"
                                        value={ruleForm.data.rule_code}
                                        onChange={(e) => ruleForm.setData('rule_code', e.target.value)}
                                        placeholder="APR-STEP2-FIN"
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold mb-1">Urutan Step *</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={ruleForm.data.step_order}
                                        onChange={(e) => ruleForm.setData('step_order', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Nama Tahap Approval *</label>
                                <input
                                    type="text"
                                    value={ruleForm.data.rule_name}
                                    onChange={(e) => ruleForm.setData('rule_name', e.target.value)}
                                    placeholder="Otorisasi Kepala Site / Manager"
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold mb-1">Min Nilai Transaksi (IDR) *</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={ruleForm.data.min_amount}
                                        onChange={(e) => ruleForm.setData('min_amount', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold mb-1">Max Nilai (Kosong = Tanpa Batas)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={ruleForm.data.max_amount}
                                        onChange={(e) => ruleForm.setData('max_amount', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold mb-1">Jabatan (Position)</label>
                                    <select
                                        value={ruleForm.data.approver_position_id}
                                        onChange={(e) => {
                                            const pos = (master.positions || []).find(
                                                (p) => String(p.id) === String(e.target.value)
                                            );
                                            ruleForm.setData({
                                                ...ruleForm.data,
                                                approver_position_id: e.target.value,
                                                approver_role_label: pos ? pos.name : ruleForm.data.approver_role_label,
                                            });
                                        }}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                    >
                                        {(master.positions || []).map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-semibold mb-1">Tipe Dokumen</label>
                                    <select
                                        value={ruleForm.data.document_type}
                                        onChange={(e) => ruleForm.setData('document_type', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                    >
                                        <option value="ALL">ALL (PR & PO)</option>
                                        <option value="PR">PR Only</option>
                                        <option value="PO">PO Only</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowRuleModal(false)}
                                    className="px-4 py-2 rounded-xl border border-slate-200"
                                >
                                    Batal
                                </button>
                                <button type="submit" className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold">
                                    Simpan Aturan Approval
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
