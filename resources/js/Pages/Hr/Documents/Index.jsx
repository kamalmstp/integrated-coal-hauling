import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import DashboardLayout from '../../../components/templates/DashboardLayout';
import {
    ShieldCheck,
    FileText,
    Lock,
    Unlock,
    Plus,
    X,
} from 'lucide-react';

export default function HrDocumentsIndex({
    documents = [],
    employees = [],
    sites = [],
    filters = {},
}) {
    const [siteId, setSiteId] = useState(filters.site_id || '');
    const [docType, setDocType] = useState(filters.document_type || '');
    const [showUploadModal, setShowUploadModal] = useState(false);

    const docForm = useForm({
        site_id: employees[0]?.site_id || sites[0]?.id || '',
        employee_id: employees[0]?.id || '',
        document_type: 'ktp',
        document_title: '',
        document_number: '',
        issue_date: new Date().toISOString().substring(0, 10),
        expiry_date: '',
        access_level: 'confidential_personal',
        is_sensitive: true,
        notes: 'Dokumen terverifikasi HRD TAP',
    });

    const applyFilter = (newSite, newType) => {
        router.get(
            '/hr/documents',
            {
                site_id: newSite || undefined,
                document_type: newType || undefined,
            },
            { preserveState: true }
        );
    };

    const submitDocument = (e) => {
        e.preventDefault();
        docForm.post('/hr/documents', {
            onSuccess: () => {
                setShowUploadModal(false);
                docForm.reset();
            },
        });
    };

    return (
        <DashboardLayout title="Employee Document Vault & Sensitive Access Control">
            <Head title="Dokumen Karyawan & Proteksi Akses - Phase 8" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                    <div>
                        <span className="px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded-md bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                            RBAC & Sensitive Document Access Control
                        </span>
                        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                            Arsip Dokumen Karyawan (KTP, SIM, SIMPER, MCU, Kontrak Kerja & Sertifikat)
                        </h1>
                        <p className="text-xs text-slate-500">
                            Dokumen pribadi & sensitif (KTP, Rekam Medis MCU, Kontrak Gaji) diproteksi ketat sesuai hak akses HRD & pemilik dokumen.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setShowUploadModal(true)}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5"
                    >
                        <Plus className="w-4 h-4" /> Unggah Dokumen HR
                    </button>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                    <div className="flex flex-wrap items-center gap-2">
                        <select
                            value={docType}
                            onChange={(e) => {
                                setDocType(e.target.value);
                                applyFilter(siteId, e.target.value);
                            }}
                            className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                        >
                            <option value="">Semua Kategori Dokumen</option>
                            <option value="ktp">KTP (Confidential)</option>
                            <option value="sim">SIM Polisi</option>
                            <option value="simper">SIMPER Tambang</option>
                            <option value="mcu">Medical Check Up / MCU (Confidential)</option>
                            <option value="employment_contract">Kontrak Kerja PKWT/PKWTT (Confidential)</option>
                            <option value="training_certificate">Sertifikat Training</option>
                            <option value="supporting_document">Dokumen Pendukung</option>
                        </select>

                        <select
                            value={siteId}
                            onChange={(e) => {
                                setSiteId(e.target.value);
                                applyFilter(e.target.value, docType);
                            }}
                            className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                        >
                            <option value="">Semua Site</option>
                            {sites.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.code} — {s.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="text-xs text-slate-500">
                        Total Dokumen Tersimpan: <strong>{documents.length}</strong>
                    </div>
                </div>

                {/* Documents Table */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500">
                                <tr>
                                    <th className="px-4 py-3">Kode & Judul Dokumen</th>
                                    <th className="px-4 py-3">Karyawan & Site</th>
                                    <th className="px-4 py-3">Kategori</th>
                                    <th className="px-4 py-3">Nomor & Masa Berlaku</th>
                                    <th className="px-4 py-3">Klasifikasi Keamanan</th>
                                    <th className="px-4 py-3 text-right">Status Akses</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {documents.map((doc) => (
                                    <tr key={doc.id}>
                                        <td className="px-4 py-3">
                                            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                                <FileText className="w-3.5 h-3.5 text-indigo-500" /> {doc.document_title}
                                            </div>
                                            <div className="text-[11px] text-slate-400">{doc.document_code}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-semibold">{doc.employee?.name}</div>
                                            <div className="text-[11px] text-indigo-600">{doc.site?.code} • {doc.employee?.employee_code}</div>
                                        </td>
                                        <td className="px-4 py-3 uppercase text-[11px] font-bold">
                                            {doc.document_type?.replace('_', ' ')}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-mono">{doc.document_number || '-'}</div>
                                            <div className="text-[11px] text-slate-400">
                                                Exp: {doc.expiry_date ? doc.expiry_date.substring(0, 10) : 'Seumur Hidup / Permanen'}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase inline-flex items-center gap-1 ${
                                                doc.is_sensitive
                                                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                            }`}>
                                                {doc.is_sensitive ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                                                {doc.access_level?.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {doc.can_access ? (
                                                <a
                                                    href={`/hr/documents/${doc.id}/access`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold inline-flex items-center gap-1"
                                                >
                                                    <ShieldCheck className="w-3 h-3" /> Buka Dokumen
                                                </a>
                                            ) : (
                                                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-400 text-[11px] font-semibold inline-flex items-center gap-1">
                                                    <Lock className="w-3 h-3" /> Terkunci (Restricted)
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal Unggah Dokumen HR */}
            {showUploadModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                Simpan Dokumen Karyawan & Set Klasifikasi Akses
                            </h3>
                            <button type="button" onClick={() => setShowUploadModal(false)}>
                                <X className="w-4 h-4 text-slate-400" />
                            </button>
                        </div>
                        <form onSubmit={submitDocument} className="space-y-3 text-xs">
                            <div>
                                <label className="block font-semibold mb-1">Karyawan *</label>
                                <select
                                    value={docForm.data.employee_id}
                                    onChange={(e) => {
                                        const emp = employees.find((x) => Number(x.id) === Number(e.target.value));
                                        docForm.setData({
                                            ...docForm.data,
                                            employee_id: e.target.value,
                                            site_id: emp ? emp.site_id : docForm.data.site_id,
                                        });
                                    }}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                    required
                                >
                                    {employees.map((e) => (
                                        <option key={e.id} value={e.id}>{e.employee_code} — {e.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Tipe Dokumen *</label>
                                <select
                                    value={docForm.data.document_type}
                                    onChange={(e) => {
                                        const t = e.target.value;
                                        const isSens = ['ktp', 'mcu', 'employment_contract', 'npwp_bpjs'].includes(t);
                                        docForm.setData({
                                            ...docForm.data,
                                            document_type: t,
                                            access_level: isSens ? 'confidential_personal' : 'public_operational',
                                            is_sensitive: isSens,
                                        });
                                    }}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                >
                                    <option value="ktp">KTP</option>
                                    <option value="sim">SIM Polisi</option>
                                    <option value="simper">SIMPER Tambang</option>
                                    <option value="mcu">Hasil MCU</option>
                                    <option value="employment_contract">Kontrak Kerja PKWT/PKWTT</option>
                                    <option value="training_certificate">Sertifikat Training</option>
                                    <option value="supporting_document">Dokumen Pendukung</option>
                                </select>
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Judul Dokumen *</label>
                                <input
                                    type="text"
                                    value={docForm.data.document_title}
                                    onChange={(e) => docForm.setData('document_title', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold mb-1">Nomor Dokumen</label>
                                    <input
                                        type="text"
                                        value={docForm.data.document_number}
                                        onChange={(e) => docForm.setData('document_number', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold mb-1">Tanggal Berakhir</label>
                                    <input
                                        type="date"
                                        value={docForm.data.expiry_date}
                                        onChange={(e) => docForm.setData('expiry_date', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Level Proteksi Akses *</label>
                                <select
                                    value={docForm.data.access_level}
                                    onChange={(e) => docForm.setData('access_level', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                >
                                    <option value="confidential_personal">Confidential Personal (Hanya HRD & Karyawan Ybs)</option>
                                    <option value="restricted_hr">Restricted HR & Management</option>
                                    <option value="public_operational">Public Operational (Dapat Diakses Dispatch/HSE)</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-2 pt-3">
                                <button type="button" onClick={() => setShowUploadModal(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold">
                                    Batal
                                </button>
                                <button type="submit" disabled={docForm.processing} className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold">
                                    Simpan Dokumen
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
