import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import DashboardLayout from '../../../components/templates/DashboardLayout';
import {
    UserCheck,
    Award,
    Truck,
    MapPin,
    ShieldCheck,
    Plus,
    X,
} from 'lucide-react';

export default function HrDriversIndex({
    drivers = [],
    trainings = [],
    driverSiteHistories = [],
    units = [],
    sites = [],
    filters = {},
}) {
    const [activeTab, setActiveTab] = useState('drivers');
    const [siteId, setSiteId] = useState(filters.site_id || '');
    const [eligibility, setEligibility] = useState(filters.eligibility || '');

    const [editDriver, setEditDriver] = useState(null);
    const [trainingDriver, setTrainingDriver] = useState(null);

    const credForm = useForm({
        sim_number: '',
        sim_type: 'B II Umum',
        sim_expiry: '',
        simper_number: '',
        simper_expiry: '',
        mcu_status: 'fit',
        mcu_date: '',
        mcu_expiry: '',
        assigned_unit_id: '',
        notes: '',
    });

    const trainingForm = useForm({
        training_name: 'Defensive Driving & Hauling Safety Refresher',
        training_category: 'defensive_driving',
        provider: 'TAP HSE & Safety Academy',
        training_date: new Date().toISOString().substring(0, 10),
        expiry_date: '',
        score: 92,
        certificate_number: '',
        status: 'passed',
        notes: '',
    });

    const applyFilter = (newSite, newElig) => {
        router.get(
            '/hr/drivers',
            {
                site_id: newSite || undefined,
                eligibility: newElig || undefined,
            },
            { preserveState: true }
        );
    };

    const openEditDriver = (drv) => {
        setEditDriver(drv);
        credForm.setData({
            sim_number: drv.sim_number || '',
            sim_type: drv.sim_type || 'B II Umum',
            sim_expiry: drv.sim_expiry ? drv.sim_expiry.substring(0, 10) : '',
            simper_number: drv.simper_number || '',
            simper_expiry: drv.simper_expiry ? drv.simper_expiry.substring(0, 10) : '',
            mcu_status: drv.mcu_status || 'fit',
            mcu_date: drv.mcu_date ? drv.mcu_date.substring(0, 10) : '',
            mcu_expiry: drv.mcu_expiry ? drv.mcu_expiry.substring(0, 10) : '',
            assigned_unit_id: drv.assigned_unit_id || '',
            notes: drv.notes || '',
        });
    };

    const submitCredentials = (e) => {
        e.preventDefault();
        if (!editDriver) return;
        credForm.put(`/hr/drivers/${editDriver.id}/credentials`, {
            onSuccess: () => setEditDriver(null),
        });
    };

    const submitTraining = (e) => {
        e.preventDefault();
        if (!trainingDriver) return;
        trainingForm.post(`/hr/drivers/${trainingDriver.id}/trainings`, {
            onSuccess: () => setTrainingDriver(null),
        });
    };

    const badgeEligibility = (status) => {
        if (status === 'eligible') {
            return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
        }
        if (status === 'warning_expiring') {
            return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
        }
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300';
    };

    return (
        <DashboardLayout title="HR Driver Management & K3LH Eligibility">
            <Head title="Driver SIM, SIMPER, MCU & Training - Phase 8" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                    <div>
                        <span className="px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                            Integrated with Driver Master
                        </span>
                        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                            Kelayakan Administrasi Driver, SIM, SIMPER, MCU, Training & Unit Assignment
                        </h1>
                        <p className="text-xs text-slate-500">
                            Terintegrasi langsung dengan Master Driver tanpa duplikasi tabel — pantau lisensi, sertifikasi K3LH, dan riwayat site driver.
                        </p>
                    </div>
                </div>

                {/* Tabs & Filters */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                    <div className="flex flex-wrap gap-1.5">
                        {[
                            { id: 'drivers', label: `Kelayakan & Lisensi Driver (${drivers.length})`, icon: UserCheck },
                            { id: 'trainings', label: `Riwayat Training & Sertifikasi (${trainings.length})`, icon: Award },
                            { id: 'site_history', label: `Riwayat Site Driver (${driverSiteHistories.length})`, icon: MapPin },
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
                        <select
                            value={eligibility}
                            onChange={(e) => {
                                setEligibility(e.target.value);
                                applyFilter(siteId, e.target.value);
                            }}
                            className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                        >
                            <option value="">Semua Status Kelayakan</option>
                            <option value="eligible">Eligible (Layak Operasi)</option>
                            <option value="warning_expiring">Warning Expiring (&le; 30 Hari)</option>
                            <option value="ineligible_expired">Ineligible (Expired)</option>
                            <option value="ineligible_mcu">Ineligible (MCU Unfit)</option>
                        </select>

                        <select
                            value={siteId}
                            onChange={(e) => {
                                setSiteId(e.target.value);
                                applyFilter(e.target.value, eligibility);
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

                {/* Tab 1: Drivers Table */}
                {activeTab === 'drivers' && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500">
                                    <tr>
                                        <th className="px-4 py-3">Driver & Site</th>
                                        <th className="px-4 py-3">SIM Polisi</th>
                                        <th className="px-4 py-3">SIMPER Tambang</th>
                                        <th className="px-4 py-3">Status MCU</th>
                                        <th className="px-4 py-3">Driver Assignment (Unit DT)</th>
                                        <th className="px-4 py-3">Status Kelayakan Administrasi</th>
                                        <th className="px-4 py-3 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {drivers.map((drv) => (
                                        <tr key={drv.id}>
                                            <td className="px-4 py-3">
                                                <div className="font-bold text-slate-900 dark:text-white">
                                                    {drv.employee?.name}
                                                </div>
                                                <div className="text-[11px] text-indigo-600 font-semibold">
                                                    {drv.driver_code} • {drv.employee?.site?.code}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="font-semibold">{drv.sim_type} — {drv.sim_number}</div>
                                                <div className="text-[11px] text-slate-400">
                                                    Exp: {drv.sim_expiry ? drv.sim_expiry.substring(0, 10) : '-'}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="font-semibold">{drv.simper_number}</div>
                                                <div className="text-[11px] text-amber-600 font-semibold">
                                                    Exp: {drv.simper_expiry ? drv.simper_expiry.substring(0, 10) : '-'}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                                                    drv.mcu_status === 'fit' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                                }`}>
                                                    {drv.mcu_status}
                                                </span>
                                                <div className="text-[11px] text-slate-400 mt-0.5">
                                                    Exp: {drv.mcu_expiry ? drv.mcu_expiry.substring(0, 10) : '-'}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                {drv.assigned_unit ? (
                                                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-bold text-slate-800 dark:text-slate-200 inline-flex items-center gap-1">
                                                        <Truck className="w-3 h-3 text-emerald-500" /> {drv.assigned_unit.unit_code}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400">Pool / Standby</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${badgeEligibility(drv.administrative_eligibility_status)}`}>
                                                    {drv.administrative_eligibility_status?.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right space-x-1.5">
                                                <button
                                                    type="button"
                                                    onClick={() => openEditDriver(drv)}
                                                    className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold"
                                                >
                                                    Update Lisensi/Unit
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setTrainingDriver(drv)}
                                                    className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold"
                                                >
                                                    + Training
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Tab 2: Trainings */}
                {activeTab === 'trainings' && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500">
                                    <tr>
                                        <th className="px-4 py-3">Kode & Nama Training</th>
                                        <th className="px-4 py-3">Driver & Site</th>
                                        <th className="px-4 py-3">Kategori</th>
                                        <th className="px-4 py-3">Tgl Training & Berlaku s/d</th>
                                        <th className="px-4 py-3">Nilai & Sertifikat</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {trainings.map((t) => (
                                        <tr key={t.id}>
                                            <td className="px-4 py-3">
                                                <div className="font-bold">{t.training_name}</div>
                                                <div className="text-[11px] text-slate-400">{t.training_code} • {t.provider}</div>
                                            </td>
                                            <td className="px-4 py-3 font-semibold">
                                                {t.employee?.name} ({t.driver?.driver_code}) • {t.site?.code}
                                            </td>
                                            <td className="px-4 py-3 uppercase text-[11px] font-bold text-indigo-600">
                                                {t.training_category?.replace('_', ' ')}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div>Pelaksanaan: {t.training_date?.substring(0, 10)}</div>
                                                <div className="text-[11px] text-emerald-600">Exp: {t.expiry_date?.substring(0, 10)}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="font-bold text-emerald-600">Skor: {t.score} ({t.status?.toUpperCase()})</div>
                                                <div className="text-[11px] text-slate-400">{t.certificate_number}</div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Tab 3: Driver Site History */}
                {activeTab === 'site_history' && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500">
                                    <tr>
                                        <th className="px-4 py-3">No. Dokumen Mutasi</th>
                                        <th className="px-4 py-3">Nama Driver</th>
                                        <th className="px-4 py-3">Site Asal</th>
                                        <th className="px-4 py-3">Site Tujuan</th>
                                        <th className="px-4 py-3">Tanggal Efektif & Keterangan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {driverSiteHistories.map((h) => (
                                        <tr key={h.id}>
                                            <td className="px-4 py-3 font-bold">{h.transfer_number}</td>
                                            <td className="px-4 py-3 font-semibold">{h.employee?.name}</td>
                                            <td className="px-4 py-3">{h.from_site?.code} — {h.from_site?.name}</td>
                                            <td className="px-4 py-3 font-bold text-indigo-600">{h.to_site?.code} — {h.to_site?.name}</td>
                                            <td className="px-4 py-3 text-slate-500">
                                                {h.effective_date?.substring(0, 10)} • {h.reason}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Update Driver Credentials & Unit Assignment */}
            {editDriver && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg p-6 shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                Update Lisensi & Unit Driver: {editDriver.employee?.name} ({editDriver.driver_code})
                            </h3>
                            <button type="button" onClick={() => setEditDriver(null)}>
                                <X className="w-4 h-4 text-slate-400" />
                            </button>
                        </div>

                        <form onSubmit={submitCredentials} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div>
                                <label className="block font-semibold mb-1">Nomor SIM Polisi *</label>
                                <input
                                    type="text"
                                    value={credForm.data.sim_number}
                                    onChange={(e) => credForm.setData('sim_number', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Masa Berlaku SIM *</label>
                                <input
                                    type="date"
                                    value={credForm.data.sim_expiry}
                                    onChange={(e) => credForm.setData('sim_expiry', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Nomor SIMPER Tambang *</label>
                                <input
                                    type="text"
                                    value={credForm.data.simper_number}
                                    onChange={(e) => credForm.setData('simper_number', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Masa Berlaku SIMPER *</label>
                                <input
                                    type="date"
                                    value={credForm.data.simper_expiry}
                                    onChange={(e) => credForm.setData('simper_expiry', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Status MCU *</label>
                                <select
                                    value={credForm.data.mcu_status}
                                    onChange={(e) => credForm.setData('mcu_status', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                >
                                    <option value="fit">FIT (Layak Kerja)</option>
                                    <option value="fit_with_note">FIT WITH NOTE</option>
                                    <option value="unfit">UNFIT (Tidak Layak)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Masa Berlaku MCU *</label>
                                <input
                                    type="date"
                                    value={credForm.data.mcu_expiry}
                                    onChange={(e) => credForm.setData('mcu_expiry', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                    required
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block font-semibold mb-1">Driver Unit Assignment (Dump Truck)</label>
                                <select
                                    value={credForm.data.assigned_unit_id}
                                    onChange={(e) => credForm.setData('assigned_unit_id', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                >
                                    <option value="">-- Pool / Tidak Terikat Unit Tertentu --</option>
                                    {units
                                        .filter((u) => !editDriver.employee?.site_id || Number(u.site_id) === Number(editDriver.employee.site_id))
                                        .map((u) => (
                                            <option key={u.id} value={u.id}>
                                                {u.unit_code} — {u.brand} {u.model} ({u.status})
                                            </option>
                                        ))}
                                </select>
                            </div>

                            <div className="sm:col-span-2 flex justify-end gap-2 pt-3">
                                <button type="button" onClick={() => setEditDriver(null)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold">
                                    Batal
                                </button>
                                <button type="submit" disabled={credForm.processing} className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold">
                                    Simpan & Evaluasi Kelayakan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Catat Training Driver */}
            {trainingDriver && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                Catat Sertifikasi Training: {trainingDriver.employee?.name}
                            </h3>
                            <button type="button" onClick={() => setTrainingDriver(null)}>
                                <X className="w-4 h-4 text-slate-400" />
                            </button>
                        </div>

                        <form onSubmit={submitTraining} className="space-y-3 text-xs">
                            <div>
                                <label className="block font-semibold mb-1">Nama Program Training *</label>
                                <input
                                    type="text"
                                    value={trainingForm.data.training_name}
                                    onChange={(e) => trainingForm.setData('training_name', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Kategori *</label>
                                <select
                                    value={trainingForm.data.training_category}
                                    onChange={(e) => trainingForm.setData('training_category', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                >
                                    <option value="defensive_driving">Defensive Driving Training (DDT)</option>
                                    <option value="safety_k3lh">Safety & K3LH Pertambangan</option>
                                    <option value="unit_familiarization">Unit Heavy Duty Familiarization</option>
                                    <option value="fatigue_management">Fatigue & Alertness Management</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold mb-1">Tgl Pelaksanaan *</label>
                                    <input
                                        type="date"
                                        value={trainingForm.data.training_date}
                                        onChange={(e) => trainingForm.setData('training_date', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold mb-1">Nilai Evaluasi (0-100)</label>
                                    <input
                                        type="number"
                                        value={trainingForm.data.score}
                                        onChange={(e) => trainingForm.setData('score', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-3">
                                <button type="button" onClick={() => setTrainingDriver(null)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold">
                                    Batal
                                </button>
                                <button type="submit" disabled={trainingForm.processing} className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold">
                                    Simpan Training
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
