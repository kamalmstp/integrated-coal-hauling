import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import DashboardLayout from '../../../components/templates/DashboardLayout';
import {
    Users,
    Briefcase,
    ArrowLeftRight,
    History,
    AlertOctagon,
    Plus,
    X,
    UserMinus,
    RefreshCw,
} from 'lucide-react';

export default function HrEmployeesIndex({
    employees = [],
    contracts = [],
    expiringContracts = [],
    transfers = [],
    statusHistories = [],
    sites = [],
    departments = [],
    positions = [],
    filters = {},
}) {
    const [activeTab, setActiveTab] = useState('employees');
    const [siteId, setSiteId] = useState(filters.site_id || '');
    const [search, setSearch] = useState(filters.search || '');

    const [showEmpModal, setShowEmpModal] = useState(false);
    const [showContractModal, setShowContractModal] = useState(false);
    const [extendTarget, setExtendTarget] = useState(null);
    const [separationTarget, setSeparationTarget] = useState(null);
    const [showTransferModal, setShowTransferModal] = useState(false);

    const empForm = useForm({
        employee_code: '',
        nik: '',
        name: '',
        birth_place: 'Banjarmasin',
        birth_date: '1992-05-14',
        gender: 'L',
        marital_status: 'K/1',
        site_id: sites[0]?.id || '',
        department_id: departments[0]?.id || '',
        position_id: positions[0]?.id || '',
        join_date: new Date().toISOString().substring(0, 10),
        employment_status: 'PKWT',
        phone: '',
        address: '',
        bank_name: 'Bank Mandiri',
        bank_account_number: '',
        bank_account_holder: '',
        npwp_number: '',
        bpjs_kesehatan_number: '',
        bpjs_ketenagakerjaan_number: '',
        create_initial_contract: true,
        contract_end_date: '',
        basic_salary: 5500000,
    });

    const contractForm = useForm({
        employee_id: employees[0]?.id || '',
        contract_type: 'PKWT',
        start_date: new Date().toISOString().substring(0, 10),
        end_date: '',
        basic_salary: 5500000,
        notes: '',
    });

    const extendForm = useForm({
        start_date: '',
        end_date: '',
        basic_salary: 5750000,
        notes: 'Perpanjangan kontrak kerja operasional hauling',
    });

    const separationForm = useForm({
        separation_type: 'resignation',
        separation_date: new Date().toISOString().substring(0, 10),
        reason: '',
    });

    const transferForm = useForm({
        employee_id: employees[0]?.id || '',
        transfer_type: 'site_mutation',
        effective_date: new Date().toISOString().substring(0, 10),
        to_site_id: sites[0]?.id || '',
        to_department_id: departments[0]?.id || '',
        to_position_id: positions[0]?.id || '',
        reason: 'Mutasi operasional antar-site PT Teknindo Adhya Pane',
    });

    const applyFilter = (newSite, newSearch) => {
        router.get(
            '/hr/employees',
            {
                site_id: newSite || undefined,
                search: newSearch || undefined,
            },
            { preserveState: true }
        );
    };

    const submitEmployee = (e) => {
        e.preventDefault();
        empForm.post('/hr/employees', {
            onSuccess: () => {
                setShowEmpModal(false);
                empForm.reset();
            },
        });
    };

    const submitContract = (e) => {
        e.preventDefault();
        contractForm.post('/hr/contracts', {
            onSuccess: () => setShowContractModal(false),
        });
    };

    const submitExtend = (e) => {
        e.preventDefault();
        if (!extendTarget) return;
        extendForm.post(`/hr/contracts/${extendTarget.id}/extend`, {
            onSuccess: () => setExtendTarget(null),
        });
    };

    const submitSeparation = (e) => {
        e.preventDefault();
        if (!separationTarget) return;
        separationForm.post(`/hr/employees/${separationTarget.id}/separation`, {
            onSuccess: () => setSeparationTarget(null),
        });
    };

    const submitTransfer = (e) => {
        e.preventDefault();
        transferForm.post('/hr/transfers', {
            onSuccess: () => setShowTransferModal(false),
        });
    };

    return (
        <DashboardLayout title="Employee Master & Employment Management">
            <Head title="Karyawan, PKWT/PKWTT & Mutasi - Phase 8" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                    <div>
                        <span className="px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            Employee Master & Employment Lifecycle
                        </span>
                        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                            Data Karyawan, Kontrak PKWT/PKWTT, Perpanjangan & Mutasi Site
                        </h1>
                        <p className="text-xs text-slate-500">
                            Kelola profil lengkap karyawan, rekening bank, kontrak kerja, resign/PHK, mutasi site & histori kepegawaian.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setShowEmpModal(true)}
                            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5"
                        >
                            <Plus className="w-4 h-4" /> Karyawan Baru
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowContractModal(true)}
                            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5"
                        >
                            <Briefcase className="w-4 h-4" /> Buat Kontrak PKWT/PKWTT
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowTransferModal(true)}
                            className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5"
                        >
                            <ArrowLeftRight className="w-4 h-4" /> Mutasi Karyawan
                        </button>
                    </div>
                </div>

                {/* Expiring Contracts Reminder Banner */}
                {expiringContracts.length > 0 && (
                    <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <AlertOctagon className="w-5 h-5 text-amber-600 shrink-0" />
                            <div>
                                <h3 className="text-xs font-bold text-amber-900 dark:text-amber-300">
                                    Reminder Masa Berlaku Kontrak Kerja ({expiringContracts.length} Kontrak Segera Berakhir)
                                </h3>
                                <p className="text-[11px] text-amber-700 dark:text-amber-400">
                                    Segera lakukan perpanjangan PKWT atau pengangkatan PKWTT sebelum masa kontrak habis.
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setActiveTab('contracts')}
                            className="px-3 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-bold shrink-0"
                        >
                            Lihat Kontrak Expiring
                        </button>
                    </div>
                )}

                {/* Filter & Tabs */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                    <div className="flex flex-wrap gap-1.5">
                        {[
                            { id: 'employees', label: `Master Karyawan (${employees.length})`, icon: Users },
                            { id: 'contracts', label: `Kontrak PKWT/PKWTT (${contracts.length})`, icon: Briefcase },
                            { id: 'transfers', label: `Mutasi & Transfer (${transfers.length})`, icon: ArrowLeftRight },
                            { id: 'history', label: `Histori Status (${statusHistories.length})`, icon: History },
                        ].map((t) => {
                            const Icon = t.icon;
                            return (
                                <button
                                    key={t.id}
                                    type="button"
                                    onClick={() => setActiveTab(t.id)}
                                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                                        activeTab === t.id
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                                    }`}
                                >
                                    <Icon className="w-3.5 h-3.5" /> {t.label}
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            placeholder="Cari NIK / Nama / ID..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                applyFilter(siteId, e.target.value);
                            }}
                            className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                        />
                        <select
                            value={siteId}
                            onChange={(e) => {
                                setSiteId(e.target.value);
                                applyFilter(e.target.value, search);
                            }}
                            className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                        >
                            <option value="">Semua Site</option>
                            {sites.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.code}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Tab 1: Employee Master */}
                {activeTab === 'employees' && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500">
                                    <tr>
                                        <th className="px-4 py-3">Employee ID & Nama</th>
                                        <th className="px-4 py-3">NIK & TTL</th>
                                        <th className="px-4 py-3">Site / Dept / Jabatan</th>
                                        <th className="px-4 py-3">Tgl Masuk & Status</th>
                                        <th className="px-4 py-3">Rekening & BPJS</th>
                                        <th className="px-4 py-3 text-right">Tindakan HR</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {employees.map((emp) => (
                                        <tr key={emp.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                                            <td className="px-4 py-3">
                                                <div className="font-bold text-slate-900 dark:text-white">
                                                    {emp.name}
                                                </div>
                                                <div className="text-[11px] text-indigo-600 font-semibold">
                                                    {emp.employee_code} • {emp.phone || '-'}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="font-mono text-slate-700 dark:text-slate-300">{emp.nik}</div>
                                                <div className="text-[11px] text-slate-400">
                                                    {emp.birth_place || '-'}, {emp.birth_date ? emp.birth_date.substring(0, 10) : '-'}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="font-semibold text-slate-800 dark:text-slate-200">
                                                    {emp.site?.code} — {emp.department?.name}
                                                </div>
                                                <div className="text-[11px] text-slate-500">
                                                    {emp.position?.title || emp.position?.name}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1.5">
                                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                                        emp.employment_status === 'PKWTT'
                                                            ? 'bg-emerald-100 text-emerald-800'
                                                            : emp.employment_status === 'PKWT'
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : 'bg-rose-100 text-rose-800'
                                                    }`}>
                                                        {emp.employment_status}
                                                    </span>
                                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                                        emp.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200 text-slate-600'
                                                    }`}>
                                                        {emp.is_active ? 'AKTIF' : 'NONAKTIF'}
                                                    </span>
                                                </div>
                                                <div className="text-[11px] text-slate-400 mt-0.5">
                                                    Join: {emp.join_date ? emp.join_date.substring(0, 10) : '-'}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-slate-700 dark:text-slate-300">
                                                    {emp.bank_name || '-'}: {emp.bank_account_number || '-'}
                                                </div>
                                                <div className="text-[10px] text-slate-400">
                                                    NPWP: {emp.npwp_number || '-'}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {emp.is_active && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setSeparationTarget(emp)}
                                                        className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold inline-flex items-center gap-1"
                                                    >
                                                        <UserMinus className="w-3 h-3" /> Resign / PHK
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Tab 2: Employment Contracts (PKWT / PKWTT & Extensions) */}
                {activeTab === 'contracts' && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500">
                                    <tr>
                                        <th className="px-4 py-3">No. Kontrak & Urutan</th>
                                        <th className="px-4 py-3">Karyawan & Site</th>
                                        <th className="px-4 py-3">Tipe</th>
                                        <th className="px-4 py-3">Periode Berlaku</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {contracts.map((c) => (
                                        <tr key={c.id}>
                                            <td className="px-4 py-3">
                                                <div className="font-bold text-slate-900 dark:text-white">{c.contract_number}</div>
                                                <div className="text-[11px] text-slate-400">
                                                     Kontrak ke-{c.sequence_number} {c.parent_contract ? `(Ext dari ${c.parent_contract.contract_number})` : ''}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="font-semibold">{c.employee?.name}</div>
                                                <div className="text-[11px] text-slate-400">{c.site?.code} — {c.department?.name}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                                    c.contract_type === 'PKWTT' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                                                }`}>
                                                    {c.contract_type}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div>Mulai: {c.start_date?.substring(0, 10)}</div>
                                                <div className="text-[11px] text-amber-600 font-semibold">
                                                    Akhir: {c.end_date ? c.end_date.substring(0, 10) : 'Permanen (PKWTT)'}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800">
                                                    {c.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {c.status === 'active' && c.contract_type === 'PKWT' && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setExtendTarget(c);
                                                            extendForm.setData({
                                                                start_date: c.end_date ? c.end_date.substring(0, 10) : '',
                                                                end_date: '',
                                                                basic_salary: c.basic_salary || 5750000,
                                                                notes: `Perpanjangan dari kontrak ${c.contract_number}`,
                                                            });
                                                        }}
                                                        className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold inline-flex items-center gap-1"
                                                    >
                                                        <RefreshCw className="w-3 h-3" /> Perpanjang PKWT
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Tab 3: Employee Transfers */}
                {activeTab === 'transfers' && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500">
                                    <tr>
                                        <th className="px-4 py-3">No. Mutasi & Tanggal</th>
                                        <th className="px-4 py-3">Karyawan</th>
                                        <th className="px-4 py-3">Dari Site / Dept</th>
                                        <th className="px-4 py-3">Ke Site / Dept</th>
                                        <th className="px-4 py-3">Alasan Mutasi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {transfers.map((tr) => (
                                        <tr key={tr.id}>
                                            <td className="px-4 py-3">
                                                <div className="font-bold">{tr.transfer_number}</div>
                                                <div className="text-[11px] text-slate-400">Efektif: {tr.effective_date?.substring(0, 10)}</div>
                                            </td>
                                            <td className="px-4 py-3 font-semibold">
                                                {tr.employee?.name} ({tr.employee?.employee_code})
                                            </td>
                                            <td className="px-4 py-3">
                                                {tr.from_site?.code} — {tr.from_department?.name}
                                            </td>
                                            <td className="px-4 py-3 font-bold text-indigo-600">
                                                {tr.to_site?.code} — {tr.to_department?.name}
                                            </td>
                                            <td className="px-4 py-3 text-slate-500">{tr.reason}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Tab 4: Employee Status History */}
                {activeTab === 'history' && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500">
                                    <tr>
                                        <th className="px-4 py-3">Tanggal Efektif</th>
                                        <th className="px-4 py-3">Karyawan</th>
                                        <th className="px-4 py-3">Event Kepegawaian</th>
                                        <th className="px-4 py-3">Perubahan Status</th>
                                        <th className="px-4 py-3">Referensi & Keterangan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {statusHistories.map((h) => (
                                        <tr key={h.id}>
                                            <td className="px-4 py-3 font-mono">{h.effective_date?.substring(0, 10)}</td>
                                            <td className="px-4 py-3 font-semibold">{h.employee?.name}</td>
                                            <td className="px-4 py-3">
                                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-indigo-50 text-indigo-700">
                                                    {h.event_type}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {h.old_employment_status || 'NEW'} &rarr; <strong>{h.new_employment_status}</strong>
                                            </td>
                                            <td className="px-4 py-3 text-slate-500">
                                                {h.reference_number ? `[${h.reference_number}] ` : ''}{h.remarks}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Tambah Karyawan */}
            {showEmpModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl p-6 shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                Registrasi Karyawan Baru (Employee Master)
                            </h3>
                            <button type="button" onClick={() => setShowEmpModal(false)}>
                                <X className="w-4 h-4 text-slate-400" />
                            </button>
                        </div>

                        <form onSubmit={submitEmployee} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div>
                                <label className="block font-semibold mb-1">Nama Lengkap *</label>
                                <input
                                    type="text"
                                    value={empForm.data.name}
                                    onChange={(e) => empForm.setData('name', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">NIK KTP (16 Digit) *</label>
                                <input
                                    type="text"
                                    value={empForm.data.nik}
                                    onChange={(e) => empForm.setData('nik', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Tempat Lahir</label>
                                <input
                                    type="text"
                                    value={empForm.data.birth_place}
                                    onChange={(e) => empForm.setData('birth_place', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Tanggal Lahir</label>
                                <input
                                    type="date"
                                    value={empForm.data.birth_date}
                                    onChange={(e) => empForm.setData('birth_date', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Site Penempatan *</label>
                                <select
                                    value={empForm.data.site_id}
                                    onChange={(e) => empForm.setData('site_id', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                    required
                                >
                                    {sites.map((s) => (
                                        <option key={s.id} value={s.id}>{s.code} — {s.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Departemen *</label>
                                <select
                                    value={empForm.data.department_id}
                                    onChange={(e) => empForm.setData('department_id', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                    required
                                >
                                    {departments.map((d) => (
                                        <option key={d.id} value={d.id}>{d.code} — {d.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Jabatan / Position *</label>
                                <select
                                    value={empForm.data.position_id}
                                    onChange={(e) => empForm.setData('position_id', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                    required
                                >
                                    {positions.map((p) => (
                                        <option key={p.id} value={p.id}>{p.code} — {p.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Status Kontrak Kerja *</label>
                                <select
                                    value={empForm.data.employment_status}
                                    onChange={(e) => empForm.setData('employment_status', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                >
                                    <option value="PKWT">PKWT (Kontrak Waktu Tertentu)</option>
                                    <option value="PKWTT">PKWTT (Karyawan Tetap)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Tanggal Masuk (Join Date) *</label>
                                <input
                                    type="date"
                                    value={empForm.data.join_date}
                                    onChange={(e) => empForm.setData('join_date', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Nomor Telepon / WA</label>
                                <input
                                    type="text"
                                    value={empForm.data.phone}
                                    onChange={(e) => empForm.setData('phone', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Bank & Nomor Rekening</label>
                                <input
                                    type="text"
                                    placeholder="No. Rekening Payroll"
                                    value={empForm.data.bank_account_number}
                                    onChange={(e) => empForm.setData('bank_account_number', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Alamat Domisili</label>
                                <input
                                    type="text"
                                    value={empForm.data.address}
                                    onChange={(e) => empForm.setData('address', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                />
                            </div>

                            <div className="sm:col-span-2 flex justify-end gap-2 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setShowEmpModal(false)}
                                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={empForm.processing}
                                    className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold"
                                >
                                    Simpan Karyawan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Buat Kontrak */}
            {showContractModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                Buat Kontrak Kerja (PKWT / PKWTT)
                            </h3>
                            <button type="button" onClick={() => setShowContractModal(false)}>
                                <X className="w-4 h-4 text-slate-400" />
                            </button>
                        </div>

                        <form onSubmit={submitContract} className="space-y-3 text-xs">
                            <div>
                                <label className="block font-semibold mb-1">Karyawan *</label>
                                <select
                                    value={contractForm.data.employee_id}
                                    onChange={(e) => contractForm.setData('employee_id', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                    required
                                >
                                    {employees.map((e) => (
                                        <option key={e.id} value={e.id}>{e.employee_code} — {e.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Jenis Kontrak *</label>
                                <select
                                    value={contractForm.data.contract_type}
                                    onChange={(e) => contractForm.setData('contract_type', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                >
                                    <option value="PKWT">PKWT (Waktu Tertentu)</option>
                                    <option value="PKWTT">PKWTT (Karyawan Tetap)</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold mb-1">Contract Start *</label>
                                    <input
                                        type="date"
                                        value={contractForm.data.start_date}
                                        onChange={(e) => contractForm.setData('start_date', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                        required
                                    />
                                </div>
                                {contractForm.data.contract_type === 'PKWT' && (
                                    <div>
                                        <label className="block font-semibold mb-1">Contract End *</label>
                                        <input
                                            type="date"
                                            value={contractForm.data.end_date}
                                            onChange={(e) => contractForm.setData('end_date', e.target.value)}
                                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                            required
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-end gap-2 pt-3">
                                <button type="button" onClick={() => setShowContractModal(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold">
                                    Batal
                                </button>
                                <button type="submit" disabled={contractForm.processing} className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold">
                                    Terbitkan Kontrak
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Perpanjangan Kontrak (Contract Extension) */}
            {extendTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                Perpanjangan Kontrak PKWT: {extendTarget.contract_number}
                            </h3>
                            <button type="button" onClick={() => setExtendTarget(null)}>
                                <X className="w-4 h-4 text-slate-400" />
                            </button>
                        </div>
                        <form onSubmit={submitExtend} className="space-y-3 text-xs">
                            <div>
                                <label className="block font-semibold mb-1">Tanggal Berakhir Baru (New Contract End) *</label>
                                <input
                                    type="date"
                                    value={extendForm.data.end_date}
                                    onChange={(e) => extendForm.setData('end_date', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Catatan Perpanjangan</label>
                                <input
                                    type="text"
                                    value={extendForm.data.notes}
                                    onChange={(e) => extendForm.setData('notes', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-3">
                                <button type="button" onClick={() => setExtendTarget(null)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold">
                                    Batal
                                </button>
                                <button type="submit" disabled={extendForm.processing} className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold">
                                    Simpan Perpanjangan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Resignation / Termination */}
            {separationTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-rose-600">
                                Pengakhiran Hubungan Kerja: {separationTarget.name}
                            </h3>
                            <button type="button" onClick={() => setSeparationTarget(null)}>
                                <X className="w-4 h-4 text-slate-400" />
                            </button>
                        </div>
                        <form onSubmit={submitSeparation} className="space-y-3 text-xs">
                            <div>
                                <label className="block font-semibold mb-1">Tipe Pengakhiran *</label>
                                <select
                                    value={separationForm.data.separation_type}
                                    onChange={(e) => separationForm.setData('separation_type', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                >
                                    <option value="resignation">Resignation (Pengunduran Diri)</option>
                                    <option value="termination">Termination (PHK / Habis Kontrak)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Tanggal Efektif *</label>
                                <input
                                    type="date"
                                    value={separationForm.data.separation_date}
                                    onChange={(e) => separationForm.setData('separation_date', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Alasan *</label>
                                <input
                                    type="text"
                                    value={separationForm.data.reason}
                                    onChange={(e) => separationForm.setData('reason', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-3">
                                <button type="button" onClick={() => setSeparationTarget(null)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold">
                                    Batal
                                </button>
                                <button type="submit" disabled={separationForm.processing} className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold">
                                    Konfirmasi Nonaktif
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Mutasi / Transfer Karyawan */}
            {showTransferModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                Mutasi & Transfer Karyawan Antar-Site / Departemen
                            </h3>
                            <button type="button" onClick={() => setShowTransferModal(false)}>
                                <X className="w-4 h-4 text-slate-400" />
                            </button>
                        </div>
                        <form onSubmit={submitTransfer} className="space-y-3 text-xs">
                            <div>
                                <label className="block font-semibold mb-1">Karyawan *</label>
                                <select
                                    value={transferForm.data.employee_id}
                                    onChange={(e) => transferForm.setData('employee_id', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                    required
                                >
                                    {employees.map((e) => (
                                        <option key={e.id} value={e.id}>{e.employee_code} — {e.name} ({e.site?.code})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Site Tujuan Baru *</label>
                                <select
                                    value={transferForm.data.to_site_id}
                                    onChange={(e) => transferForm.setData('to_site_id', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                    required
                                >
                                    {sites.map((s) => (
                                        <option key={s.id} value={s.id}>{s.code} — {s.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Departemen Tujuan *</label>
                                <select
                                    value={transferForm.data.to_department_id}
                                    onChange={(e) => transferForm.setData('to_department_id', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                    required
                                >
                                    {departments.map((d) => (
                                        <option key={d.id} value={d.id}>{d.code} — {d.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Jabatan Tujuan *</label>
                                <select
                                    value={transferForm.data.to_position_id}
                                    onChange={(e) => transferForm.setData('to_position_id', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                    required
                                >
                                    {positions.map((p) => (
                                        <option key={p.id} value={p.id}>{p.code} — {p.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Tanggal Efektif Mutasi *</label>
                                <input
                                    type="date"
                                    value={transferForm.data.effective_date}
                                    onChange={(e) => transferForm.setData('effective_date', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Alasan Mutasi *</label>
                                <input
                                    type="text"
                                    value={transferForm.data.reason}
                                    onChange={(e) => transferForm.setData('reason', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-3">
                                <button type="button" onClick={() => setShowTransferModal(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold">
                                    Batal
                                </button>
                                <button type="submit" disabled={transferForm.processing} className="px-4 py-2 rounded-xl bg-amber-600 text-white font-bold">
                                    Proses Mutasi
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
