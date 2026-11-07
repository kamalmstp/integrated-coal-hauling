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
    Truck,
    Plus,
    Filter,
    RefreshCw,
    Activity,
    CheckCircle2,
    AlertTriangle,
    Wrench,
    Clock,
    Search,
    ShieldAlert,
    Eye,
    Edit,
    Gauge,
    Layers,
    Building2,
    Calendar,
} from 'lucide-react';

export default function FleetRegistryIndex({
    units = { data: [], links: [] },
    filters = {},
    summary = {},
    master = {},
}) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [unitType, setUnitType] = useState(filters.unit_type || '');
    const [siteId, setSiteId] = useState(filters.site_id || '');

    // Modals
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isStatusOpen, setIsStatusOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [selectedUnit, setSelectedUnit] = useState(null);

    // Form Create
    const createForm = useForm({
        unit_code: '',
        registration_number: '',
        unit_type: 'dump_truck_10',
        brand: 'Hino',
        model: 'FM 260 JD',
        year: new Date().getFullYear(),
        capacity_ton: 25.0,
        capacity_m3: 18.0,
        chassis_number: '',
        engine_number: '',
        last_hm: 0,
        last_km: 0,
        status: 'standby',
        site_id: master.sites?.[0]?.id || '',
        vendor_id: master.vendors?.[0]?.id || '',
        operation_start_date: new Date().toISOString().split('T')[0],
    });

    // Form Edit
    const editForm = useForm({
        registration_number: '',
        unit_type: '',
        brand: '',
        model: '',
        year: '',
        capacity_ton: '',
        capacity_m3: '',
        chassis_number: '',
        engine_number: '',
        last_hm: '',
        last_km: '',
        status: '',
        site_id: '',
        vendor_id: '',
    });

    // Form Status
    const statusForm = useForm({
        status: 'standby',
    });

    const handleFilter = (e) => {
        e?.preventDefault();
        router.get('/fleet/registry', {
            search,
            status,
            unit_type: unitType,
            site_id: siteId,
        }, { preserveState: true, preserveScroll: true });
    };

    const handleReset = () => {
        setSearch('');
        setStatus('');
        setUnitType('');
        setSiteId('');
        router.get('/fleet/registry');
    };

    const handleOpenEdit = (unit) => {
        setSelectedUnit(unit);
        editForm.setData({
            registration_number: unit.registration_number,
            unit_type: unit.unit_type,
            brand: unit.brand,
            model: unit.model || '',
            year: unit.year || '',
            capacity_ton: unit.capacity_ton,
            capacity_m3: unit.capacity_m3 || '',
            chassis_number: unit.chassis_number || '',
            engine_number: unit.engine_number || '',
            last_hm: unit.last_hm,
            last_km: unit.last_km,
            status: unit.status,
            site_id: unit.site_id,
            vendor_id: unit.vendor_id || '',
        });
        setIsEditOpen(true);
    };

    const handleOpenStatus = (unit) => {
        setSelectedUnit(unit);
        statusForm.setData('status', unit.status);
        setIsStatusOpen(true);
    };

    const handleOpenDetail = (unit) => {
        setSelectedUnit(unit);
        setIsDetailOpen(true);
    };

    const submitCreate = (e) => {
        e.preventDefault();
        createForm.post('/fleet/registry', {
            onSuccess: () => {
                createForm.reset();
                setIsCreateOpen(false);
            },
        });
    };

    const submitEdit = (e) => {
        e.preventDefault();
        editForm.put(`/fleet/registry/${selectedUnit.id}`, {
            onSuccess: () => {
                setIsEditOpen(false);
            },
        });
    };

    const submitStatus = (e) => {
        e.preventDefault();
        statusForm.put(`/fleet/registry/${selectedUnit.id}/status`, {
            onSuccess: () => {
                setIsStatusOpen(false);
            },
        });
    };

    const getStatusBadge = (unitStatus) => {
        switch (unitStatus) {
            case 'operating':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 animate-pulse"><span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-emerald-500"></span>Operating</span>;
            case 'standby':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"><span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-blue-500"></span>Standby RFU</span>;
            case 'breakdown':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"><span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-rose-500"></span>Breakdown</span>;
            case 'maintenance':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"><span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-amber-500"></span>Maintenance</span>;
            default:
                return <span className="px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">{unitStatus}</span>;
        }
    };

    const formatUnitType = (type) => {
        const types = {
            dump_truck_10: 'DT 10 Roda',
            dump_truck_12: 'DT 12 Roda',
            light_vehicle: 'Light Vehicle (LV)',
            fuel_truck: 'Fuel Truck',
            service_truck: 'Service Truck',
            support_equipment: 'Support Equipment',
        };
        return types[type] || type;
    };

    return (
        <DashboardLayout>
            <Head title="Unit Registry & Fleet Status Monitoring - TAP" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div>
                        <div className="flex items-center space-x-3">
                            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                                <Truck className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                                    Unit Registry & Fleet Status
                                </h1>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Registrasi seluruh unit dump truck, armada pendukung, dan pemantauan status RFU real-time
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3 w-full sm:w-auto">
                        <Button
                            variant="secondary"
                            onClick={() => router.get('/fleet/registry')}
                            className="flex items-center space-x-2"
                        >
                            <RefreshCw className="w-4 h-4" />
                            <span>Segarkan</span>
                        </Button>
                        <Button
                            variant="primary"
                            onClick={() => setIsCreateOpen(true)}
                            className="flex items-center space-x-2"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Registrasi Unit Baru</span>
                        </Button>
                    </div>
                </div>

                {/* Summary / Real-time Status Monitoring */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                    <Card className="p-4 bg-white dark:bg-slate-800 border-l-4 border-l-slate-500">
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Armada</p>
                        <div className="flex items-baseline justify-between mt-2">
                            <span className="text-2xl font-black text-slate-900 dark:text-white">{summary.total || 0}</span>
                            <span className="text-xs text-slate-400">Unit</span>
                        </div>
                    </Card>

                    <Card className="p-4 bg-white dark:bg-slate-800 border-l-4 border-l-emerald-500">
                        <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Ready (RFU)</p>
                        <div className="flex items-baseline justify-between mt-2">
                            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{summary.rfu_ready || 0}</span>
                            <span className="text-xs text-emerald-600/80">Siap Jalan</span>
                        </div>
                    </Card>

                    <Card className="p-4 bg-white dark:bg-slate-800 border-l-4 border-l-emerald-400">
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Operating</p>
                        <div className="flex items-baseline justify-between mt-2">
                            <span className="text-2xl font-black text-slate-900 dark:text-white">{summary.operating || 0}</span>
                            <span className="text-xs text-slate-400">Hauling</span>
                        </div>
                    </Card>

                    <Card className="p-4 bg-white dark:bg-slate-800 border-l-4 border-l-blue-500">
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Standby</p>
                        <div className="flex items-baseline justify-between mt-2">
                            <span className="text-2xl font-black text-slate-900 dark:text-white">{summary.standby || 0}</span>
                            <span className="text-xs text-slate-400">Siaga</span>
                        </div>
                    </Card>

                    <Card className="p-4 bg-white dark:bg-slate-800 border-l-4 border-l-rose-500">
                        <p className="text-xs font-medium text-rose-600 dark:text-rose-400 uppercase tracking-wider">Breakdown</p>
                        <div className="flex items-baseline justify-between mt-2">
                            <span className="text-2xl font-black text-rose-600 dark:text-rose-400">{summary.breakdown || 0}</span>
                            <span className="text-xs text-rose-500">Kritis</span>
                        </div>
                    </Card>

                    <Card className="p-4 bg-white dark:bg-slate-800 border-l-4 border-l-amber-500">
                        <p className="text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wider">Maintenance</p>
                        <div className="flex items-baseline justify-between mt-2">
                            <span className="text-2xl font-black text-amber-600 dark:text-amber-400">{summary.maintenance || 0}</span>
                            <span className="text-xs text-amber-500">Workshop</span>
                        </div>
                    </Card>
                </div>

                {/* Filter Bar */}
                <Card className="p-5 bg-white dark:bg-slate-800">
                    <form onSubmit={handleFilter} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Cari Armada</label>
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="No. Lambung / Plat / Seri..."
                                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Status Operasi</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            >
                                <option value="">Semua Status</option>
                                <option value="operating">Operating</option>
                                <option value="standby">Standby (RFU)</option>
                                <option value="breakdown">Breakdown</option>
                                <option value="maintenance">Maintenance</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Jenis Unit</label>
                            <select
                                value={unitType}
                                onChange={(e) => setUnitType(e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            >
                                <option value="">Semua Tipe</option>
                                <option value="dump_truck_10">Dump Truck 10 Roda</option>
                                <option value="dump_truck_12">Dump Truck 12 Roda</option>
                                <option value="light_vehicle">Light Vehicle</option>
                                <option value="fuel_truck">Fuel Truck</option>
                                <option value="service_truck">Service Truck</option>
                                <option value="support_equipment">Support Equipment</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Site Proyek</label>
                            <select
                                value={siteId}
                                onChange={(e) => setSiteId(e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            >
                                <option value="">Semua Site</option>
                                {master.sites?.map((s) => (
                                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-end space-x-2">
                            <Button type="submit" variant="primary" className="flex-1 flex items-center justify-center space-x-1">
                                <Filter className="w-4 h-4" />
                                <span>Filter</span>
                            </Button>
                            <Button type="button" variant="secondary" onClick={handleReset}>
                                Reset
                            </Button>
                        </div>
                    </form>
                </Card>

                {/* Units Table */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                                    <th className="py-3.5 px-4">No. Lambung & Plat</th>
                                    <th className="py-3.5 px-4">Tipe & Spesifikasi</th>
                                    <th className="py-3.5 px-4">Kapasitas</th>
                                    <th className="py-3.5 px-4">HM & KM Terakhir</th>
                                    <th className="py-3.5 px-4">Status & RFU</th>
                                    <th className="py-3.5 px-4">P2H Terakhir</th>
                                    <th className="py-3.5 px-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {units.data?.length > 0 ? (
                                    units.data.map((unit) => {
                                        const isRfu = (unit.status === 'operating' || unit.status === 'standby') && !unit.active_work_order;
                                        return (
                                            <tr key={unit.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                                <td className="py-3.5 px-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200">
                                                            <Truck className="w-5 h-5 text-emerald-600" />
                                                        </div>
                                                        <div>
                                                            <span className="font-bold text-slate-900 dark:text-white block text-base">
                                                                {unit.unit_code}
                                                            </span>
                                                            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                                                                {unit.registration_number}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="py-3.5 px-4">
                                                    <div className="text-slate-900 dark:text-white font-medium">
                                                        {formatUnitType(unit.unit_type)}
                                                    </div>
                                                    <div className="text-xs text-slate-500 dark:text-slate-400">
                                                        {unit.brand} {unit.model} ({unit.year || '-'})
                                                    </div>
                                                </td>

                                                <td className="py-3.5 px-4">
                                                    <div className="font-semibold text-slate-900 dark:text-white">
                                                        {unit.capacity_ton} <span className="text-xs font-normal text-slate-500">Ton</span>
                                                    </div>
                                                    {unit.capacity_m3 && (
                                                        <div className="text-xs text-slate-500 dark:text-slate-400">
                                                            {unit.capacity_m3} m³
                                                        </div>
                                                    )}
                                                </td>

                                                <td className="py-3.5 px-4">
                                                    <div className="text-slate-900 dark:text-white font-mono font-medium">
                                                        {Number(unit.last_hm).toLocaleString('id-ID')} <span className="text-xs font-sans text-slate-500">HM</span>
                                                    </div>
                                                    <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
                                                        {Number(unit.last_km).toLocaleString('id-ID')} KM
                                                    </div>
                                                </td>

                                                <td className="py-3.5 px-4">
                                                    <div className="space-y-1">
                                                        <div>{getStatusBadge(unit.status)}</div>
                                                        <div>
                                                            {isRfu ? (
                                                                <span className="inline-flex items-center text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                                                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                                                                    RFU Verified
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center text-xs font-medium text-rose-600 dark:text-rose-400">
                                                                    <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                                                                    Not RFU
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="py-3.5 px-4">
                                                    {unit.latest_p2h ? (
                                                        <div>
                                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                                                unit.latest_p2h.overall_condition === 'rfu'
                                                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                                                    : unit.latest_p2h.overall_condition === 'rfu_with_notes'
                                                                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                                                                    : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 font-bold'
                                                            }`}>
                                                                {unit.latest_p2h.overall_condition.toUpperCase()}
                                                            </span>
                                                            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                                                {unit.latest_p2h.inspection_date}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-slate-400 italic">Belum Ada P2H</span>
                                                    )}
                                                </td>

                                                <td className="py-3.5 px-4 text-right">
                                                    <div className="flex items-center justify-end space-x-1.5">
                                                        <button
                                                            onClick={() => handleOpenDetail(unit)}
                                                            className="p-1.5 text-slate-500 hover:text-emerald-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
                                                            title="Detail Armada"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleOpenStatus(unit)}
                                                            className="p-1.5 text-slate-500 hover:text-blue-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
                                                            title="Ubah Status"
                                                        >
                                                            <Activity className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleOpenEdit(unit)}
                                                            className="p-1.5 text-slate-500 hover:text-amber-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
                                                            title="Edit Spesifikasi"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="py-12 text-center text-slate-400 dark:text-slate-500">
                                            Tidak ada unit yang sesuai dengan kriteria filter.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                            Menampilkan {units.data?.length || 0} unit dari {units.total || 0} armada terdaftar
                        </span>
                        <Pagination links={units.links} />
                    </div>
                </div>
            </div>

            {/* Modal Create Unit */}
            <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Registrasi Unit Armada Baru" maxWidth="max-w-3xl">
                <form onSubmit={submitCreate} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nomor Lambung (Unit Code) *</label>
                            <input
                                type="text"
                                required
                                placeholder="Contoh: DT-201"
                                value={createForm.data.unit_code}
                                onChange={(e) => createForm.setData('unit_code', e.target.value.toUpperCase())}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            />
                            {createForm.errors.unit_code && <p className="text-xs text-rose-500 mt-1">{createForm.errors.unit_code}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nomor Polisi (Plat) *</label>
                            <input
                                type="text"
                                required
                                placeholder="Contoh: KT 8234 TAP"
                                value={createForm.data.registration_number}
                                onChange={(e) => createForm.setData('registration_number', e.target.value.toUpperCase())}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Jenis Armada *</label>
                            <select
                                value={createForm.data.unit_type}
                                onChange={(e) => createForm.setData('unit_type', e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            >
                                <option value="dump_truck_10">Dump Truck 10 Roda</option>
                                <option value="dump_truck_12">Dump Truck 12 Roda</option>
                                <option value="light_vehicle">Light Vehicle (LV)</option>
                                <option value="fuel_truck">Fuel Truck</option>
                                <option value="service_truck">Service Truck</option>
                                <option value="support_equipment">Support Equipment</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Merek (Brand) *</label>
                            <input
                                type="text"
                                required
                                placeholder="Hino / Scania / Volvo / Mitsubishi"
                                value={createForm.data.brand}
                                onChange={(e) => createForm.setData('brand', e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Model / Tipe Seri</label>
                            <input
                                type="text"
                                placeholder="FM 260 JD / FMX 440"
                                value={createForm.data.model}
                                onChange={(e) => createForm.setData('model', e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Tahun Pembuatan</label>
                            <input
                                type="number"
                                placeholder="2024"
                                value={createForm.data.year}
                                onChange={(e) => createForm.setData('year', e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Kapasitas Angkut (Ton) *</label>
                            <input
                                type="number"
                                step="0.1"
                                required
                                value={createForm.data.capacity_ton}
                                onChange={(e) => createForm.setData('capacity_ton', e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Kapasitas Bak (m³)</label>
                            <input
                                type="number"
                                step="0.1"
                                value={createForm.data.capacity_m3}
                                onChange={(e) => createForm.setData('capacity_m3', e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Hour Meter (HM) Awal *</label>
                            <input
                                type="number"
                                step="0.1"
                                required
                                value={createForm.data.last_hm}
                                onChange={(e) => createForm.setData('last_hm', e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Kilo Meter (KM) Awal *</label>
                            <input
                                type="number"
                                step="0.1"
                                required
                                value={createForm.data.last_km}
                                onChange={(e) => createForm.setData('last_km', e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Site Proyek *</label>
                            <select
                                required
                                value={createForm.data.site_id}
                                onChange={(e) => createForm.setData('site_id', e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            >
                                {master.sites?.map((s) => (
                                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Vendor / Kepemilikan</label>
                            <select
                                value={createForm.data.vendor_id}
                                onChange={(e) => createForm.setData('vendor_id', e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            >
                                <option value="">Internal TAP</option>
                                {master.vendors?.map((v) => (
                                    <option key={v.id} value={v.id}>{v.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <Button type="button" variant="secondary" onClick={() => setIsCreateOpen(false)}>
                            Batal
                        </Button>
                        <Button type="submit" variant="primary" disabled={createForm.processing}>
                            {createForm.processing ? 'Menyimpan...' : 'Simpan & Daftarkan Unit'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Modal Edit Unit */}
            <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title={`Edit Spesifikasi Armada: ${selectedUnit?.unit_code}`}>
                <form onSubmit={submitEdit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nomor Polisi (Plat)</label>
                            <input
                                type="text"
                                required
                                value={editForm.data.registration_number}
                                onChange={(e) => editForm.setData('registration_number', e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Kapasitas (Ton)</label>
                            <input
                                type="number"
                                step="0.1"
                                required
                                value={editForm.data.capacity_ton}
                                onChange={(e) => editForm.setData('capacity_ton', e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Hour Meter (HM)</label>
                            <input
                                type="number"
                                step="0.1"
                                required
                                value={editForm.data.last_hm}
                                onChange={(e) => editForm.setData('last_hm', e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Kilo Meter (KM)</label>
                            <input
                                type="number"
                                step="0.1"
                                required
                                value={editForm.data.last_km}
                                onChange={(e) => editForm.setData('last_km', e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <Button type="button" variant="secondary" onClick={() => setIsEditOpen(false)}>
                            Batal
                        </Button>
                        <Button type="submit" variant="primary" disabled={editForm.processing}>
                            {editForm.processing ? 'Menyimpan...' : 'Perbarui Spesifikasi'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Modal Quick Status Switch */}
            <Modal isOpen={isStatusOpen} onClose={() => setIsStatusOpen(false)} title={`Ubah Status Armada: ${selectedUnit?.unit_code}`}>
                <form onSubmit={submitStatus} className="space-y-4">
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                        Pilih status operasional terkini untuk unit <strong>{selectedUnit?.unit_code}</strong> ({selectedUnit?.registration_number}):
                    </p>

                    <div className="space-y-2">
                        {['operating', 'standby', 'breakdown', 'maintenance'].map((st) => (
                            <label
                                key={st}
                                className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition ${
                                    statusForm.data.status === st
                                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
                                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                                }`}
                            >
                                <div className="flex items-center space-x-3">
                                    <input
                                        type="radio"
                                        name="status"
                                        value={st}
                                        checked={statusForm.data.status === st}
                                        onChange={() => statusForm.setData('status', st)}
                                        className="text-emerald-600 focus:ring-emerald-500"
                                    />
                                    <div>
                                        <span className="font-semibold text-slate-900 dark:text-white capitalize block">
                                            {st}
                                        </span>
                                        <span className="text-xs text-slate-500 dark:text-slate-400">
                                            {st === 'operating' && 'Unit sedang berjalan beroperasi hauling batubara.'}
                                            {st === 'standby' && 'Unit siap operasi (RFU) namun idle / antre / pergantian shift.'}
                                            {st === 'breakdown' && 'Unit mengalami kerusakan mendadak di jalan / pit / tambang.'}
                                            {st === 'maintenance' && 'Unit sedang berada di bengkel/workshop untuk perbaikan/PM.'}
                                        </span>
                                    </div>
                                </div>
                                {getStatusBadge(st)}
                            </label>
                        ))}
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <Button type="button" variant="secondary" onClick={() => setIsStatusOpen(false)}>
                            Batal
                        </Button>
                        <Button type="submit" variant="primary" disabled={statusForm.processing}>
                            {statusForm.processing ? 'Menyimpan...' : 'Simpan Status'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Modal Detail Unit */}
            {selectedUnit && (
                <Modal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} title={`Detail Armada: ${selectedUnit.unit_code}`} maxWidth="max-w-2xl">
                    <div className="space-y-4">
                        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-xs text-slate-500 dark:text-slate-400 block">Nomor Lambung</span>
                                <span className="font-bold text-slate-900 dark:text-white text-base">{selectedUnit.unit_code}</span>
                            </div>
                            <div>
                                <span className="text-xs text-slate-500 dark:text-slate-400 block">Nomor Polisi</span>
                                <span className="font-mono font-bold text-slate-900 dark:text-white">{selectedUnit.registration_number}</span>
                            </div>
                            <div>
                                <span className="text-xs text-slate-500 dark:text-slate-400 block">Tipe Unit</span>
                                <span className="font-medium text-slate-900 dark:text-white">{formatUnitType(selectedUnit.unit_type)}</span>
                            </div>
                            <div>
                                <span className="text-xs text-slate-500 dark:text-slate-400 block">Brand & Model</span>
                                <span className="text-slate-900 dark:text-white">{selectedUnit.brand} {selectedUnit.model} ({selectedUnit.year})</span>
                            </div>
                            <div>
                                <span className="text-xs text-slate-500 dark:text-slate-400 block">Kapasitas Muatan</span>
                                <span className="font-semibold text-slate-900 dark:text-white">{selectedUnit.capacity_ton} Ton / {selectedUnit.capacity_m3 || '-'} m³</span>
                            </div>
                            <div>
                                <span className="text-xs text-slate-500 dark:text-slate-400 block">Status Terkini</span>
                                <div>{getStatusBadge(selectedUnit.status)}</div>
                            </div>
                            <div>
                                <span className="text-xs text-slate-500 dark:text-slate-400 block">Total Hour Meter (HM)</span>
                                <span className="font-mono font-bold text-slate-900 dark:text-white">{Number(selectedUnit.last_hm).toLocaleString('id-ID')} HM</span>
                            </div>
                            <div>
                                <span className="text-xs text-slate-500 dark:text-slate-400 block">Total Kilo Meter (KM)</span>
                                <span className="font-mono font-bold text-slate-900 dark:text-white">{Number(selectedUnit.last_km).toLocaleString('id-ID')} KM</span>
                            </div>
                            <div>
                                <span className="text-xs text-slate-500 dark:text-slate-400 block">Nomor Rangka</span>
                                <span className="font-mono text-xs text-slate-700 dark:text-slate-300">{selectedUnit.chassis_number || '-'}</span>
                            </div>
                            <div>
                                <span className="text-xs text-slate-500 dark:text-slate-400 block">Nomor Mesin</span>
                                <span className="font-mono text-xs text-slate-700 dark:text-slate-300">{selectedUnit.engine_number || '-'}</span>
                            </div>
                            <div>
                                <span className="text-xs text-slate-500 dark:text-slate-400 block">Site Penempatan</span>
                                <span className="text-slate-900 dark:text-white font-medium">{selectedUnit.site?.name || '-'}</span>
                            </div>
                            <div>
                                <span className="text-xs text-slate-500 dark:text-slate-400 block">Vendor / Pemilik</span>
                                <span className="text-slate-900 dark:text-white">{selectedUnit.vendor?.name || 'Internal TAP'}</span>
                            </div>
                        </div>

                        {selectedUnit.active_work_order && (
                            <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl">
                                <div className="flex items-center space-x-2 text-rose-700 dark:text-rose-300 font-bold mb-1">
                                    <ShieldAlert className="w-5 h-5" />
                                    <span>Work Order Aktif: {selectedUnit.active_work_order.wo_number}</span>
                                </div>
                                <p className="text-xs text-rose-600 dark:text-rose-400">
                                    {selectedUnit.active_work_order.defect_summary}
                                </p>
                            </div>
                        )}

                        <div className="flex justify-end pt-2">
                            <Button variant="secondary" onClick={() => setIsDetailOpen(false)}>
                                Tutup
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </DashboardLayout>
    );
}
