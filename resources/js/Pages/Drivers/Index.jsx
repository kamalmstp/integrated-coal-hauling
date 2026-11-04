import React, { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import {
    UserCheck,
    UserPlus,
    Edit3,
    Trash2,
    X,
    ShieldAlert,
    CheckCircle2,
    Clock,
    AlertTriangle,
    CreditCard,
    FileCheck,
} from 'lucide-react';
import DashboardLayout from '../../components/templates/DashboardLayout';
import Button from '../../components/atoms/Button';
import Input from '../../components/atoms/Input';
import Select from '../../components/atoms/Select';
import FormField from '../../components/molecules/FormField';
import Badge from '../../components/atoms/Badge';
import SearchBar from '../../components/molecules/SearchBar';
import PaginationControls from '../../components/molecules/PaginationControls';
import { useAlertStore } from '../../stores/useAlertStore';

export default function DriversIndex({
    drivers,
    filters = {},
    availableEmployees = [],
    statistics = {},
}) {
    const { confirm } = useAlertStore();

    const [search, setSearch] = useState(filters.search || '');
    const [mcuStatus, setMcuStatus] = useState(filters.mcu_status || 'all');
    const [status, setStatus] = useState(filters.status || 'all');
    const [simType, setSimType] = useState(filters.sim_type || 'all');
    const [sortBy, setSortBy] = useState(filters.sort_by || 'created_at');
    const [sortDirection, setSortDirection] = useState(filters.sort_direction || 'desc');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDriver, setEditingDriver] = useState(null);
    const [formData, setFormData] = useState({
        driver_code: '',
        employee_id: '',
        sim_number: '',
        sim_type: 'BII Umum',
        sim_expiry: '2028-12-31',
        simper_number: '',
        simper_expiry: '2026-12-31',
        mcu_status: 'fit',
        mcu_date: new Date().toISOString().split('T')[0],
        mcu_expiry: '2027-01-01',
        notes: '',
        is_active: true,
    });

    const isFirstRender = useRef(true);

    const applyFilters = (overrides = {}) => {
        const queryParams = {
            search: overrides.search !== undefined ? overrides.search : search,
            mcu_status: overrides.mcu_status !== undefined ? overrides.mcu_status : mcuStatus,
            status: overrides.status !== undefined ? overrides.status : status,
            sim_type: overrides.sim_type !== undefined ? overrides.sim_type : simType,
            sort_by: overrides.sortBy !== undefined ? overrides.sortBy : sortBy,
            sort_direction: overrides.sortDirection !== undefined ? overrides.sortDirection : sortDirection,
        };

        if (!queryParams.search) delete queryParams.search;
        if (queryParams.mcu_status === 'all') delete queryParams.mcu_status;
        if (queryParams.status === 'all') delete queryParams.status;
        if (queryParams.sim_type === 'all') delete queryParams.sim_type;

        router.get('/master/drivers', queryParams, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        const timer = setTimeout(() => applyFilters({ search }), 400);
        return () => clearTimeout(timer);
    }, [search]);

    const openCreateModal = () => {
        setEditingDriver(null);
        setFormData({
            driver_code: `DRV-${Math.floor(100 + Math.random() * 900)}`,
            employee_id: availableEmployees[0]?.id || '',
            sim_number: `SIM-${Math.floor(100000000000 + Math.random() * 900000000000)}`,
            sim_type: 'BII Umum',
            sim_expiry: '2028-12-31',
            simper_number: `SIMPER-TAP-2026-${Math.floor(100 + Math.random() * 900)}`,
            simper_expiry: '2026-12-31',
            mcu_status: 'fit',
            mcu_date: new Date().toISOString().split('T')[0],
            mcu_expiry: '2027-01-01',
            notes: '',
            is_active: true,
        });
        setIsModalOpen(true);
    };

    const openEditModal = (driver) => {
        setEditingDriver(driver);
        setFormData({
            driver_code: driver.driver_code,
            employee_id: driver.employee_id,
            sim_number: driver.sim_number,
            sim_type: driver.sim_type,
            sim_expiry: driver.sim_expiry ? driver.sim_expiry.split('T')[0] : '',
            simper_number: driver.simper_number,
            simper_expiry: driver.simper_expiry ? driver.simper_expiry.split('T')[0] : '',
            mcu_status: driver.mcu_status,
            mcu_date: driver.mcu_date ? driver.mcu_date.split('T')[0] : '',
            mcu_expiry: driver.mcu_expiry ? driver.mcu_expiry.split('T')[0] : '',
            notes: driver.notes || '',
            is_active: driver.is_active,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingDriver) {
            router.put(`/master/drivers/${editingDriver.id}`, formData, {
                onSuccess: () => setIsModalOpen(false),
            });
        } else {
            router.post('/master/drivers', formData, {
                onSuccess: () => setIsModalOpen(false),
            });
        }
    };

    const handleDelete = async (driver) => {
        const ok = await confirm({
            title: `Hapus Driver: ${driver.driver_code}?`,
            message: `Data driver ${driver.employee?.name || ''} akan dihapus dari daftar penugasan.`,
            confirmButtonText: 'Ya, Hapus Driver',
        });
        if (ok) router.delete(`/master/drivers/${driver.id}`);
    };

    const getMcuBadge = (mcu) => {
        switch (mcu) {
            case 'fit':
                return <Badge variant="success" dot>Fit Operasi</Badge>;
            case 'fit_with_note':
                return <Badge variant="warning" dot>Fit Bersyarat</Badge>;
            case 'unfit':
            default:
                return <Badge variant="danger" dot>Unfit (Stop)</Badge>;
        }
    };

    return (
        <DashboardLayout title="Master Data Driver & SIMPER (SSR)" breadcrumbs={['Master Data', 'Driver']}>
            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Total Driver</span>
                    <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{statistics.total || 0} Orang</p>
                </div>
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                    <span className="text-[10px] font-bold text-emerald-500 uppercase">MCU Fit (Siap Jalan)</span>
                    <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{statistics.fit || 0} Driver</p>
                </div>
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                    <span className="text-[10px] font-bold text-amber-500 uppercase">Fit Bersyarat</span>
                    <p className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">{statistics.fit_with_note || 0} Driver</p>
                </div>
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                    <span className="text-[10px] font-bold text-rose-500 uppercase">Unfit (Dilarang Bawa Unit)</span>
                    <p className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1">{statistics.unfit || 0} Driver</p>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="w-full sm:max-w-xs">
                        <SearchBar
                            value={search}
                            onChange={(val) => setSearch(val)}
                            onClear={() => { setSearch(''); applyFilters({ search: '' }); }}
                            placeholder="Cari Driver ID, Nama, No SIMPER..."
                        />
                    </div>
                    <div className="flex flex-wrap items-center gap-2.5">
                        <div className="w-40">
                            <Select
                                value={mcuStatus}
                                onChange={(e) => { setMcuStatus(e.target.value); applyFilters({ mcu_status: e.target.value }); }}
                                options={[
                                    { value: 'all', label: 'Semua Status MCU' },
                                    { value: 'fit', label: 'Fit' },
                                    { value: 'fit_with_note', label: 'Fit Bersyarat' },
                                    { value: 'unfit', label: 'Unfit' },
                                ]}
                                placeholder=""
                            />
                        </div>
                        <div className="w-36">
                            <Select
                                value={simType}
                                onChange={(e) => { setSimType(e.target.value); applyFilters({ sim_type: e.target.value }); }}
                                options={[
                                    { value: 'all', label: 'Semua Gol. SIM' },
                                    { value: 'BII Umum', label: 'SIM BII Umum' },
                                    { value: 'BI', label: 'SIM BI' },
                                    { value: 'A', label: 'SIM A' },
                                ]}
                                placeholder=""
                            />
                        </div>
                        <Button variant="primary" icon={UserPlus} onClick={openCreateModal}>
                            Daftarkan Driver
                        </Button>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-slate-800/40 uppercase font-semibold text-slate-500 border-b border-slate-200 dark:border-slate-800">
                            <tr>
                                <th className="py-3 px-4">Driver ID & Nama Driver</th>
                                <th className="py-3 px-4">Gol. SIM & No. SIM</th>
                                <th className="py-3 px-4">Nomor SIMPER Site</th>
                                <th className="py-3 px-4">Masa Berlaku SIMPER</th>
                                <th className="py-3 px-4">Status MCU</th>
                                <th className="py-3 px-4">Status Aktif</th>
                                <th className="py-3 px-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                            {drivers.data.map((driver) => (
                                <tr key={driver.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                    <td className="py-3.5 px-4">
                                        <p className="font-bold text-slate-900 dark:text-white">{driver.employee?.name || '-'}</p>
                                        <p className="text-[11px] text-amber-600 dark:text-amber-400 font-mono font-semibold">{driver.driver_code}</p>
                                    </td>
                                    <td className="py-3.5 px-4">
                                        <span className="font-semibold text-slate-800 dark:text-slate-200">{driver.sim_type}</span>
                                        <p className="text-[11px] text-slate-400 font-mono">{driver.sim_number}</p>
                                    </td>
                                    <td className="py-3.5 px-4 font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                                        {driver.simper_number}
                                    </td>
                                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                                        {driver.simper_expiry ? new Date(driver.simper_expiry).toLocaleDateString('id-ID') : '-'}
                                    </td>
                                    <td className="py-3.5 px-4">
                                        {getMcuBadge(driver.mcu_status)}
                                        {driver.notes && <p className="text-[10px] text-slate-400 mt-0.5">{driver.notes}</p>}
                                    </td>
                                    <td className="py-3.5 px-4">
                                        <Badge variant={driver.is_active ? 'success' : 'danger'}>
                                            {driver.is_active ? 'Siap Operasi' : 'Nonaktif'}
                                        </Badge>
                                    </td>
                                    <td className="py-3.5 px-4 text-right">
                                        <div className="inline-flex items-center gap-1.5">
                                            <button onClick={() => openEditModal(driver)} className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800">
                                                <Edit3 className="w-3.5 h-3.5" />
                                            </button>
                                            <button onClick={() => handleDelete(driver)} className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <PaginationControls links={drivers.links} from={drivers.from} to={drivers.to} total={drivers.total} />
            </div>

            {/* Modal Add/Edit Driver */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setIsModalOpen(false)} />
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                                <h3 className="font-bold text-sm text-slate-900 dark:text-white">{editingDriver ? 'Edit Driver' : 'Registrasi Driver Baru'}</h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                            </div>
                            <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-xs">
                                <div className="grid grid-cols-2 gap-3">
                                    <FormField label="Driver ID (Unik)" required>
                                        <Input value={formData.driver_code} onChange={(e) => setFormData({ ...formData, driver_code: e.target.value })} required />
                                    </FormField>
                                    <FormField label="Pilih Karyawan" required>
                                        {editingDriver ? (
                                            <Input value={editingDriver.employee?.name || ''} disabled />
                                        ) : (
                                            <Select
                                                value={formData.employee_id}
                                                onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                                                options={availableEmployees.map((e) => ({ value: e.id, label: `${e.name} (${e.employee_code})` }))}
                                                placeholder=""
                                            />
                                        )}
                                    </FormField>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <FormField label="Golongan SIM" required>
                                        <Select
                                            value={formData.sim_type}
                                            onChange={(e) => setFormData({ ...formData, sim_type: e.target.value })}
                                            options={[
                                                { value: 'BII Umum', label: 'BII Umum (Dump Truck)' },
                                                { value: 'BI', label: 'BI' },
                                                { value: 'A', label: 'A (Light Vehicle)' },
                                            ]}
                                            placeholder=""
                                        />
                                    </FormField>
                                    <FormField label="Nomor SIM Kepolisian" required>
                                        <Input value={formData.sim_number} onChange={(e) => setFormData({ ...formData, sim_number: e.target.value })} required />
                                    </FormField>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <FormField label="Nomor SIMPER (Perusahaan)" required>
                                        <Input value={formData.simper_number} onChange={(e) => setFormData({ ...formData, simper_number: e.target.value })} required />
                                    </FormField>
                                    <FormField label="Masa Berlaku SIMPER" required>
                                        <Input type="date" value={formData.simper_expiry} onChange={(e) => setFormData({ ...formData, simper_expiry: e.target.value })} required />
                                    </FormField>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <FormField label="Hasil MCU (Medical Check Up)" required>
                                        <Select
                                            value={formData.mcu_status}
                                            onChange={(e) => setFormData({ ...formData, mcu_status: e.target.value })}
                                            options={[
                                                { value: 'fit', label: 'Fit (Laik Operasi)' },
                                                { value: 'fit_with_note', label: 'Fit Bersyarat' },
                                                { value: 'unfit', label: 'Unfit (Dilarang Operasi)' },
                                            ]}
                                            placeholder=""
                                        />
                                    </FormField>
                                    <FormField label="Masa Berlaku MCU">
                                        <Input type="date" value={formData.mcu_expiry} onChange={(e) => setFormData({ ...formData, mcu_expiry: e.target.value })} />
                                    </FormField>
                                </div>
                                <FormField label="Catatan Medis / Syarat HSE">
                                    <Input value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="cth. Wajib kacamata silinder" />
                                </FormField>
                                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                                    <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Batal</Button>
                                    <Button variant="primary" type="submit">Simpan Driver</Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
