import React, { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import {
    Truck,
    Plus,
    Edit3,
    Trash2,
    X,
    Gauge,
    AlertCircle,
    CheckCircle2,
    Wrench,
    Clock,
    Shield,
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

export default function UnitsIndex({
    units,
    filters = {},
    sites = [],
    vendors = [],
    statistics = {},
}) {
    const { confirm } = useAlertStore();

    const [search, setSearch] = useState(filters.search || '');
    const [unitType, setUnitType] = useState(filters.unit_type || 'all');
    const [status, setStatus] = useState(filters.status || 'all');
    const [siteId, setSiteId] = useState(filters.site_id || 'all');
    const [sortBy, setSortBy] = useState(filters.sort_by || 'created_at');
    const [sortDirection, setSortDirection] = useState(filters.sort_direction || 'desc');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUnit, setEditingUnit] = useState(null);
    const [formData, setFormData] = useState({
        unit_code: '',
        registration_number: '',
        unit_type: 'dump_truck_10',
        brand: 'Hino',
        model: '500 FM 260 JD',
        year: 2024,
        capacity_ton: 30,
        capacity_m3: 22,
        chassis_number: '',
        engine_number: '',
        last_hm: 0,
        last_km: 0,
        status: 'operating',
        operation_start_date: new Date().toISOString().split('T')[0],
        site_id: sites[0]?.id || '',
        vendor_id: '',
        is_active: true,
    });

    const isFirstRender = useRef(true);

    const applyFilters = (overrides = {}) => {
        const queryParams = {
            search: overrides.search !== undefined ? overrides.search : search,
            unit_type: overrides.unit_type !== undefined ? overrides.unit_type : unitType,
            status: overrides.status !== undefined ? overrides.status : status,
            site_id: overrides.site_id !== undefined ? overrides.site_id : siteId,
            sort_by: overrides.sortBy !== undefined ? overrides.sortBy : sortBy,
            sort_direction: overrides.sortDirection !== undefined ? overrides.sortDirection : sortDirection,
        };

        if (!queryParams.search) delete queryParams.search;
        if (queryParams.unit_type === 'all') delete queryParams.unit_type;
        if (queryParams.status === 'all') delete queryParams.status;
        if (queryParams.site_id === 'all') delete queryParams.site_id;

        router.get('/master/units', queryParams, {
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
        setEditingUnit(null);
        setFormData({
            unit_code: `DT-${Math.floor(100 + Math.random() * 900)}`,
            registration_number: `KT ${Math.floor(1000 + Math.random() * 9000)} MT`,
            unit_type: 'dump_truck_10',
            brand: 'Hino',
            model: '500 FM 260 JD',
            year: 2024,
            capacity_ton: 30,
            capacity_m3: 22,
            chassis_number: `MHK${Math.random().toString(36).substring(2, 12).toUpperCase()}`,
            engine_number: `ENG${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
            last_hm: 1200,
            last_km: 25000,
            status: 'operating',
            operation_start_date: new Date().toISOString().split('T')[0],
            site_id: sites[0]?.id || '',
            vendor_id: '',
            is_active: true,
        });
        setIsModalOpen(true);
    };

    const openEditModal = (unit) => {
        setEditingUnit(unit);
        setFormData({
            unit_code: unit.unit_code,
            registration_number: unit.registration_number,
            unit_type: unit.unit_type,
            brand: unit.brand,
            model: unit.model || '',
            year: unit.year || 2023,
            capacity_ton: unit.capacity_ton,
            capacity_m3: unit.capacity_m3,
            chassis_number: unit.chassis_number || '',
            engine_number: unit.engine_number || '',
            last_hm: unit.last_hm,
            last_km: unit.last_km,
            status: unit.status,
            operation_start_date: unit.operation_start_date ? unit.operation_start_date.split('T')[0] : '',
            site_id: unit.site_id,
            vendor_id: unit.vendor_id || '',
            is_active: unit.is_active,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingUnit) {
            router.put(`/master/units/${editingUnit.id}`, formData, {
                onSuccess: () => setIsModalOpen(false),
            });
        } else {
            router.post('/master/units', formData, {
                onSuccess: () => setIsModalOpen(false),
            });
        }
    };

    const handleDelete = async (unit) => {
        const ok = await confirm({
            title: `Hapus Unit: ${unit.unit_code}?`,
            message: `Data unit nomor lambung ${unit.unit_code} (${unit.registration_number}) akan dipindahkan ke arsip.`,
            confirmButtonText: 'Ya, Hapus Unit',
        });
        if (ok) router.delete(`/master/units/${unit.id}`);
    };

    const getUnitTypeLabel = (type) => {
        switch (type) {
            case 'dump_truck_10':
                return 'Dump Truck 10 Roda';
            case 'dump_truck_12':
                return 'Dump Truck 12 Roda';
            case 'light_vehicle':
                return 'Light Vehicle (LV)';
            case 'fuel_truck':
                return 'Fuel Truck (Tanker)';
            case 'service_truck':
                return 'Service Truck';
            case 'support_equipment':
                return 'Support Equipment';
            default:
                return type;
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'operating':
                return <Badge variant="success" dot>Operating (Jalan)</Badge>;
            case 'standby':
                return <Badge variant="primary" dot>Standby (Siap)</Badge>;
            case 'maintenance':
                return <Badge variant="warning" dot>Maintenance</Badge>;
            case 'breakdown':
            default:
                return <Badge variant="danger" dot>Breakdown (Rusak)</Badge>;
        }
    };

    return (
        <DashboardLayout title="Master Data Armada & Unit Hauling (SSR)" breadcrumbs={['Master Data', 'Armada Unit']}>
            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Total Armada</span>
                    <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{statistics.total || 0} Unit</p>
                </div>
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                    <span className="text-[10px] font-bold text-emerald-500 uppercase">Operating (Beroperasi)</span>
                    <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{statistics.operating || 0} Unit</p>
                </div>
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                    <span className="text-[10px] font-bold text-amber-500 uppercase">Maintenance / Service</span>
                    <p className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">{statistics.maintenance || 0} Unit</p>
                </div>
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                    <span className="text-[10px] font-bold text-rose-500 uppercase">Breakdown (BD)</span>
                    <p className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1">{statistics.breakdown || 0} Unit</p>
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
                            placeholder="Cari No. Lambung, Plat, Brand..."
                        />
                    </div>
                    <div className="flex flex-wrap items-center gap-2.5">
                        <div className="w-44">
                            <Select
                                value={unitType}
                                onChange={(e) => { setUnitType(e.target.value); applyFilters({ unit_type: e.target.value }); }}
                                options={[
                                    { value: 'all', label: 'Semua Jenis Unit' },
                                    { value: 'dump_truck_10', label: 'Dump Truck 10 Roda' },
                                    { value: 'dump_truck_12', label: 'Dump Truck 12 Roda' },
                                    { value: 'light_vehicle', label: 'Light Vehicle' },
                                    { value: 'fuel_truck', label: 'Fuel Truck' },
                                    { value: 'service_truck', label: 'Service Truck' },
                                    { value: 'support_equipment', label: 'Support Equipment' },
                                ]}
                                placeholder=""
                            />
                        </div>
                        <div className="w-36">
                            <Select
                                value={status}
                                onChange={(e) => { setStatus(e.target.value); applyFilters({ status: e.target.value }); }}
                                options={[
                                    { value: 'all', label: 'Semua Status' },
                                    { value: 'operating', label: 'Operating' },
                                    { value: 'standby', label: 'Standby' },
                                    { value: 'maintenance', label: 'Maintenance' },
                                    { value: 'breakdown', label: 'Breakdown' },
                                ]}
                                placeholder=""
                            />
                        </div>
                        <div className="w-36">
                            <Select
                                value={siteId}
                                onChange={(e) => { setSiteId(e.target.value); applyFilters({ site_id: e.target.value }); }}
                                options={[{ value: 'all', label: 'Semua Site' }, ...sites.map((s) => ({ value: s.id, label: s.name }))]}
                                placeholder=""
                            />
                        </div>
                        <Button variant="primary" icon={Plus} onClick={openCreateModal}>
                            Tambah Unit
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
                                <th className="py-3 px-4">No. Lambung & Plat</th>
                                <th className="py-3 px-4">Jenis Unit</th>
                                <th className="py-3 px-4">Merek & Model</th>
                                <th className="py-3 px-4">Kapasitas (Ton / M3)</th>
                                <th className="py-3 px-4">HM & KM Terakhir</th>
                                <th className="py-3 px-4">Site / Kepemilikan</th>
                                <th className="py-3 px-4">Status Unit</th>
                                <th className="py-3 px-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                            {units.data.map((unit) => (
                                <tr key={unit.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                    <td className="py-3.5 px-4">
                                        <p className="font-extrabold text-sm text-indigo-600 dark:text-indigo-400 font-mono">{unit.unit_code}</p>
                                        <p className="text-[11px] text-slate-500 font-mono">{unit.registration_number}</p>
                                    </td>
                                    <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200">
                                        {getUnitTypeLabel(unit.unit_type)}
                                    </td>
                                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                                        <p className="font-semibold">{unit.brand}</p>
                                        <p className="text-[11px] text-slate-400">{unit.model} ({unit.year || '-'})</p>
                                    </td>
                                    <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                                        {unit.capacity_ton} Ton / {unit.capacity_m3} M3
                                    </td>
                                    <td className="py-3.5 px-4">
                                        <span className="font-mono text-slate-800 dark:text-slate-200">{Number(unit.last_hm).toLocaleString()} HM</span>
                                        <p className="text-[11px] text-slate-400 font-mono">{Number(unit.last_km).toLocaleString()} KM</p>
                                    </td>
                                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                                        <p className="font-semibold">{unit.site?.name || '-'}</p>
                                        <p className="text-[11px] text-slate-400">{unit.vendor?.name ? `Rental: ${unit.vendor.name}` : 'Aset Milik TAP'}</p>
                                    </td>
                                    <td className="py-3.5 px-4">
                                        {getStatusBadge(unit.status)}
                                    </td>
                                    <td className="py-3.5 px-4 text-right">
                                        <div className="inline-flex items-center gap-1.5">
                                            <button onClick={() => openEditModal(unit)} className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800">
                                                <Edit3 className="w-3.5 h-3.5" />
                                            </button>
                                            <button onClick={() => handleDelete(unit)} className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <PaginationControls links={units.links} from={units.from} to={units.to} total={units.total} />
            </div>

            {/* Modal Add/Edit Unit */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setIsModalOpen(false)} />
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                                <h3 className="font-bold text-sm text-slate-900 dark:text-white">{editingUnit ? 'Edit Unit Armada' : 'Registrasi Unit Armada Baru'}</h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                            </div>
                            <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-xs">
                                <div className="grid grid-cols-2 gap-3">
                                    <FormField label="Nomor Lambung (Unit ID)" required>
                                        <Input value={formData.unit_code} onChange={(e) => setFormData({ ...formData, unit_code: e.target.value })} placeholder="cth. DT-101" required />
                                    </FormField>
                                    <FormField label="Nomor Polisi (Plat)" required>
                                        <Input value={formData.registration_number} onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })} placeholder="cth. KT 8101 MT" required />
                                    </FormField>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <FormField label="Jenis Unit" required>
                                        <Select
                                            value={formData.unit_type}
                                            onChange={(e) => setFormData({ ...formData, unit_type: e.target.value })}
                                            options={[
                                                { value: 'dump_truck_10', label: 'Dump Truck 10 Roda' },
                                                { value: 'dump_truck_12', label: 'Dump Truck 12 Roda' },
                                                { value: 'light_vehicle', label: 'Light Vehicle' },
                                                { value: 'fuel_truck', label: 'Fuel Truck' },
                                                { value: 'service_truck', label: 'Service Truck' },
                                                { value: 'support_equipment', label: 'Support Equipment' },
                                            ]}
                                            placeholder=""
                                        />
                                    </FormField>
                                    <FormField label="Merek (Brand)" required>
                                        <Input value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} placeholder="Hino / Scania / Volvo" required />
                                    </FormField>
                                    <FormField label="Model / Seri">
                                        <Input value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} placeholder="500 FM 260 JD" />
                                    </FormField>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <FormField label="Kapasitas Angkut (Ton)" required>
                                        <Input type="number" step="0.1" value={formData.capacity_ton} onChange={(e) => setFormData({ ...formData, capacity_ton: e.target.value })} required />
                                    </FormField>
                                    <FormField label="Volume Bak (M3)">
                                        <Input type="number" step="0.1" value={formData.capacity_m3} onChange={(e) => setFormData({ ...formData, capacity_m3: e.target.value })} />
                                    </FormField>
                                    <FormField label="Tahun Pembuatan">
                                        <Input type="number" value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value })} />
                                    </FormField>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <FormField label="Hour Meter (HM) Terakhir">
                                        <Input type="number" step="0.1" value={formData.last_hm} onChange={(e) => setFormData({ ...formData, last_hm: e.target.value })} />
                                    </FormField>
                                    <FormField label="Kilo Meter (KM) Terakhir">
                                        <Input type="number" step="0.1" value={formData.last_km} onChange={(e) => setFormData({ ...formData, last_km: e.target.value })} />
                                    </FormField>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <FormField label="Status Operasional Unit" required>
                                        <Select
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                            options={[
                                                { value: 'operating', label: 'Operating (Siap Jalan)' },
                                                { value: 'standby', label: 'Standby' },
                                                { value: 'maintenance', label: 'Maintenance' },
                                                { value: 'breakdown', label: 'Breakdown (Rusak)' },
                                            ]}
                                            placeholder=""
                                        />
                                    </FormField>
                                    <FormField label="Penempatan Site" required>
                                        <Select
                                            value={formData.site_id}
                                            onChange={(e) => setFormData({ ...formData, site_id: e.target.value })}
                                            options={sites.map((s) => ({ value: s.id, label: s.name }))}
                                            placeholder=""
                                        />
                                    </FormField>
                                    <FormField label="Kepemilikan / Vendor Rental">
                                        <Select
                                            value={formData.vendor_id}
                                            onChange={(e) => setFormData({ ...formData, vendor_id: e.target.value })}
                                            options={[{ value: '', label: 'Milik TAP Sendiri' }, ...vendors.map((v) => ({ value: v.id, label: v.name }))]}
                                            placeholder=""
                                        />
                                    </FormField>
                                </div>
                                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                                    <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Batal</Button>
                                    <Button variant="primary" type="submit">Simpan Unit Armada</Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
