import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import DashboardLayout from '../../../components/templates/DashboardLayout';
import Card from '../../../components/molecules/Card';
import Badge from '../../../components/atoms/Badge';
import Button from '../../../components/atoms/Button';
import Input from '../../../components/atoms/Input';
import Modal from '../../../components/molecules/Modal';
import Pagination from '../../../components/molecules/Pagination';
import {
    ClipboardCheck,
    Plus,
    Filter,
    RefreshCw,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    Truck,
    User,
    Clock,
    Search,
    ShieldAlert,
    Camera,
    Eye,
    ShieldCheck,
    FileText,
    Wrench,
    AlertOctagon,
} from 'lucide-react';

const STANDARD_P2H_ITEMS = [
    { name: 'Engine (Suara & Getaran Mesin)', category: 'Engine & Fluids', is_critical: true },
    { name: 'Oil Level (Oli Mesin, Transmisi & Kebocoran)', category: 'Engine & Fluids', is_critical: true },
    { name: 'Coolant (Air Radiator & Sistem Pendingin)', category: 'Engine & Fluids', is_critical: false },
    { name: 'Brake System (Rem Servis & Rem Parkir)', category: 'Brake & Steering', is_critical: true },
    { name: 'Steering System (Kemudi & Power Steering)', category: 'Brake & Steering', is_critical: true },
    { name: 'Tire Condition & Pressure (Kondisi & Tekanan Ban)', category: 'Wheels & Tires', is_critical: false },
    { name: 'Wheel Nut (Baut & Mur Roda)', category: 'Wheels & Tires', is_critical: true },
    { name: 'Lamps & Rotary (Lampu Kerja, Rem, Sein, Rotari)', category: 'Electrical & Visibility', is_critical: false },
    { name: 'Horn & Backup Alarm (Klakson & Sirine Mundur)', category: 'Electrical & Visibility', is_critical: false },
    { name: 'Mirrors & Glass (Kaca Spion & Kaca Depan)', category: 'Electrical & Visibility', is_critical: false },
    { name: 'Seat Belt (Sabuk Pengaman Driver)', category: 'Cabin & Safety', is_critical: true },
    { name: 'Body & Chassis (Dump Body & Kerangka)', category: 'Cabin & Safety', is_critical: false },
    { name: 'Hydraulic System (Pompa & Silinder Dump)', category: 'Hydraulic', is_critical: true },
    { name: 'Battery (Aki & Terminal Kabel)', category: 'Electrical & Visibility', is_critical: false },
    { name: 'Safety Equipment (APAR, Ganjal Ban, Kotak P3K)', category: 'Cabin & Safety', is_critical: true },
];

export default function DigitalP2hIndex({
    inspections = { data: [], links: [] },
    filters = {},
    metrics = {},
    master = {},
}) {
    const [date, setDate] = useState(filters.date || new Date().toISOString().split('T')[0]);
    const [condition, setCondition] = useState(filters.condition || '');
    const [unitId, setUnitId] = useState(filters.unit_id || '');
    const [shiftId, setShiftId] = useState(filters.shift_id || '');

    // Modals
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [selectedInspection, setSelectedInspection] = useState(null);

    // Initial Checklist items
    const initialItems = STANDARD_P2H_ITEMS.map((item) => ({
        item_name: item.name,
        category: item.category,
        is_critical: item.is_critical,
        status: 'good',
        defect_description: '',
        photo_path: '',
    }));

    // Form Digital P2H
    const form = useForm({
        unit_id: master.units?.[0]?.id || '',
        driver_id: master.drivers?.[0]?.id || '',
        shift_id: master.shifts?.[0]?.id || '',
        inspection_date: new Date().toISOString().split('T')[0],
        inspection_time: new Date().toTimeString().split(' ')[0].substring(0, 5),
        current_hm: master.units?.[0]?.last_hm || 0,
        current_km: master.units?.[0]?.last_km || 0,
        driver_notes: '',
        items: initialItems,
    });

    const handleFilter = (e) => {
        e?.preventDefault();
        router.get('/fleet/p2h', {
            date,
            condition,
            unit_id: unitId,
            shift_id: shiftId,
        }, { preserveState: true, preserveScroll: true });
    };

    const handleReset = () => {
        setDate(new Date().toISOString().split('T')[0]);
        setCondition('');
        setUnitId('');
        setShiftId('');
        router.get('/fleet/p2h');
    };

    const handleUnitSelect = (id) => {
        const u = master.units?.find((item) => item.id == id);
        form.setData({
            ...form.data,
            unit_id: id,
            current_hm: u?.last_hm || 0,
            current_km: u?.last_km || 0,
        });
    };

    const handleItemStatusChange = (index, status) => {
        const newItems = [...form.data.items];
        newItems[index].status = status;
        if (status === 'good') {
            newItems[index].defect_description = '';
        }
        form.setData('items', newItems);
    };

    const handleItemDefectChange = (index, desc) => {
        const newItems = [...form.data.items];
        newItems[index].defect_description = desc;
        form.setData('items', newItems);
    };

    // Detect if current form has critical defects
    const hasCriticalDefect = form.data.items.some(
        (it) => it.is_critical && it.status === 'not_good'
    );

    const hasMinorDefect = form.data.items.some(
        (it) => !it.is_critical && it.status === 'not_good'
    );

    const submitP2h = (e) => {
        e.preventDefault();
        form.post('/fleet/p2h', {
            onSuccess: () => {
                form.reset();
                setIsCreateOpen(false);
            },
        });
    };

    const openDetail = (insp) => {
        setSelectedInspection(insp);
        setIsDetailOpen(true);
    };

    const getConditionBadge = (cond) => {
        switch (cond) {
            case 'rfu':
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        SIAP OPERASI (RFU)
                    </span>
                );
            case 'rfu_with_notes':
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                        RFU DENGAN CATATAN
                    </span>
                );
            case 'not_rfu':
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 animate-pulse">
                        <AlertOctagon className="w-3.5 h-3.5 mr-1" />
                        TIDAK SIAP (NOT RFU)
                    </span>
                );
            default:
                return <span>{cond}</span>;
        }
    };

    return (
        <DashboardLayout>
            <Head title="Digital P2H - Pemeriksaan Pra-Operasi Harian - TAP" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div>
                        <div className="flex items-center space-x-3">
                            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                                <ClipboardCheck className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                                    Digital P2H (Pemeriksaan Pra-Operasi Harian)
                                </h1>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Checklist keselamatan 15 item pra-shift, deteksi kegagalan kritis, dan integrasi otomatis ke Maintenance Work Order
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3 w-full sm:w-auto">
                        <Button
                            variant="secondary"
                            onClick={() => router.get('/fleet/p2h')}
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
                            <span>Isi Form P2H Baru</span>
                        </Button>
                    </div>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                    <Card className="p-4 bg-white dark:bg-slate-800 border-l-4 border-l-slate-500">
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Inspeksi</p>
                        <div className="flex items-baseline justify-between mt-2">
                            <span className="text-2xl font-black text-slate-900 dark:text-white">{metrics.total || 0}</span>
                            <span className="text-xs text-slate-400">Hari ini</span>
                        </div>
                    </Card>

                    <Card className="p-4 bg-white dark:bg-slate-800 border-l-4 border-l-emerald-500">
                        <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Lolos RFU</p>
                        <div className="flex items-baseline justify-between mt-2">
                            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{metrics.rfu || 0}</span>
                            <span className="text-xs text-emerald-600/80">Kondisi Baik</span>
                        </div>
                    </Card>

                    <Card className="p-4 bg-white dark:bg-slate-800 border-l-4 border-l-amber-500">
                        <p className="text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wider">RFU Catatan</p>
                        <div className="flex items-baseline justify-between mt-2">
                            <span className="text-2xl font-black text-amber-600 dark:text-amber-400">{metrics.rfu_with_notes || 0}</span>
                            <span className="text-xs text-amber-500">Minor Defect</span>
                        </div>
                    </Card>

                    <Card className="p-4 bg-white dark:bg-slate-800 border-l-4 border-l-rose-500">
                        <p className="text-xs font-medium text-rose-600 dark:text-rose-400 uppercase tracking-wider">Not RFU</p>
                        <div className="flex items-baseline justify-between mt-2">
                            <span className="text-2xl font-black text-rose-600 dark:text-rose-400">{metrics.not_rfu || 0}</span>
                            <span className="text-xs text-rose-500">Dilarang Jalan</span>
                        </div>
                    </Card>

                    <Card className="p-4 bg-white dark:bg-slate-800 border-l-4 border-l-rose-700">
                        <p className="text-xs font-medium text-rose-700 dark:text-rose-400 uppercase tracking-wider">Cacat Kritis</p>
                        <div className="flex items-baseline justify-between mt-2">
                            <span className="text-2xl font-black text-rose-700 dark:text-rose-400">{metrics.critical_defects || 0}</span>
                            <span className="text-xs text-rose-500">Auto WO</span>
                        </div>
                    </Card>
                </div>

                {/* Filter Bar */}
                <Card className="p-5 bg-white dark:bg-slate-800">
                    <form onSubmit={handleFilter} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Tanggal Inspeksi</label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Hasil Kelayakan</label>
                            <select
                                value={condition}
                                onChange={(e) => setCondition(e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            >
                                <option value="">Semua Hasil</option>
                                <option value="rfu">Lolos Siap Operasi (RFU)</option>
                                <option value="rfu_with_notes">RFU dengan Catatan</option>
                                <option value="not_rfu">Tidak Siap Operasi (NOT RFU)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Armada Unit</label>
                            <select
                                value={unitId}
                                onChange={(e) => setUnitId(e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            >
                                <option value="">Semua Unit</option>
                                {master.units?.map((u) => (
                                    <option key={u.id} value={u.id}>{u.unit_code} ({u.unit_type})</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Shift Kerja</label>
                            <select
                                value={shiftId}
                                onChange={(e) => setShiftId(e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            >
                                <option value="">Semua Shift</option>
                                {master.shifts?.map((s) => (
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

                {/* Table Inspections */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                                    <th className="py-3.5 px-4">No. P2H & Waktu</th>
                                    <th className="py-3.5 px-4">Armada & HM/KM</th>
                                    <th className="py-3.5 px-4">Driver Penguji</th>
                                    <th className="py-3.5 px-4">Shift</th>
                                    <th className="py-3.5 px-4">Kondisi Kelayakan</th>
                                    <th className="py-3.5 px-4">Status Work Order</th>
                                    <th className="py-3.5 px-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {inspections.data?.length > 0 ? (
                                    inspections.data.map((insp) => (
                                        <tr key={insp.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                            <td className="py-3.5 px-4">
                                                <div className="font-mono font-bold text-slate-900 dark:text-white">
                                                    {insp.inspection_number}
                                                </div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                                    {insp.inspection_date} • {insp.inspection_time} WITA
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-4">
                                                <div className="font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                                                    <Truck className="w-4 h-4 text-emerald-600" />
                                                    <span>{insp.unit?.unit_code}</span>
                                                </div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                                                    {Number(insp.current_hm).toLocaleString('id-ID')} HM • {Number(insp.current_km).toLocaleString('id-ID')} KM
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-4">
                                                <div className="text-slate-900 dark:text-white font-medium flex items-center space-x-1.5">
                                                    <User className="w-3.5 h-3.5 text-blue-500" />
                                                    <span>{insp.driver?.employee?.name || '-'}</span>
                                                </div>
                                                <div className="text-xs font-mono text-slate-400">
                                                    {insp.driver?.driver_code}
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-4">
                                                <span className="px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                                    {insp.shift?.name || '-'}
                                                </span>
                                            </td>

                                            <td className="py-3.5 px-4">
                                                {getConditionBadge(insp.overall_condition)}
                                            </td>

                                            <td className="py-3.5 px-4">
                                                {insp.work_order ? (
                                                    <div className="inline-flex items-center space-x-1 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-1 rounded-lg">
                                                        <Wrench className="w-3.5 h-3.5" />
                                                        <span>{insp.work_order.wo_number} ({insp.work_order.status})</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-400">Tidak ada kerusakan</span>
                                                )}
                                            </td>

                                            <td className="py-3.5 px-4 text-right">
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() => openDetail(insp)}
                                                    className="inline-flex items-center space-x-1"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    <span>Lihat Form</span>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="py-12 text-center text-slate-400 dark:text-slate-500">
                                            Belum ada data pemeriksaan P2H pada tanggal dan filter yang dipilih.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                            Menampilkan {inspections.data?.length || 0} dari {inspections.total || 0} lembar P2H
                        </span>
                        <Pagination links={inspections.links} />
                    </div>
                </div>
            </div>

            {/* Modal Input Digital P2H */}
            <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Form Pemeriksaan Pra-Operasi Harian (Digital P2H)" maxWidth="max-w-4xl">
                <form onSubmit={submitP2h} className="space-y-6">
                    {/* Header info */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Armada Unit *</label>
                            <select
                                required
                                value={form.data.unit_id}
                                onChange={(e) => handleUnitSelect(e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                            >
                                {master.units?.map((u) => (
                                    <option key={u.id} value={u.id}>{u.unit_code} - {u.unit_type} (HM: {u.last_hm})</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Driver Penguji *</label>
                            <select
                                required
                                value={form.data.driver_id}
                                onChange={(e) => form.setData('driver_id', e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                            >
                                {master.drivers?.map((d) => (
                                    <option key={d.id} value={d.id}>{d.employee?.name} ({d.driver_code})</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Shift Kerja *</label>
                            <select
                                required
                                value={form.data.shift_id}
                                onChange={(e) => form.setData('shift_id', e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                            >
                                {master.shifts?.map((s) => (
                                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Waktu Inspeksi</label>
                            <div className="flex space-x-1">
                                <input
                                    type="date"
                                    required
                                    value={form.data.inspection_date}
                                    onChange={(e) => form.setData('inspection_date', e.target.value)}
                                    className="w-2/3 px-2 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                />
                                <input
                                    type="time"
                                    required
                                    value={form.data.inspection_time}
                                    onChange={(e) => form.setData('inspection_time', e.target.value)}
                                    className="w-1/3 px-1 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Hour Meter (HM) Saat Ini *</label>
                            <input
                                type="number"
                                step="0.1"
                                required
                                value={form.data.current_hm}
                                onChange={(e) => form.setData('current_hm', e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Kilo Meter (KM) Saat Ini *</label>
                            <input
                                type="number"
                                step="0.1"
                                required
                                value={form.data.current_km}
                                onChange={(e) => form.setData('current_km', e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Catatan Tambahan Driver</label>
                            <input
                                type="text"
                                placeholder="Contoh: Bunyi decit halus pada rem kanan belakang"
                                value={form.data.driver_notes}
                                onChange={(e) => form.setData('driver_notes', e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                            />
                        </div>
                    </div>

                    {/* Critical Alert Warning Banner */}
                    {hasCriticalDefect && (
                        <div className="p-4 bg-rose-50 dark:bg-rose-950/50 border-2 border-rose-500 rounded-xl flex items-start space-x-3 text-rose-900 dark:text-rose-200 animate-pulse">
                            <AlertOctagon className="w-6 h-6 text-rose-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-bold text-sm">PERINGATAN KESELAMATAN KRITIS (SOP K3LH TAP)</h4>
                                <p className="text-xs mt-1">
                                    Item bertanda <strong>KRITIS</strong> dinyatakan Rusak (Not Good). Berdasarkan standar operasional tambang, armada ini <strong>TIDAK DAPAT DIJALANKAN (NOT RFU)</strong>. Sistem akan secara otomatis mengunci status armada ke <strong>BREAKDOWN</strong> dan menerbitkan Work Order langsung ke divisi Maintenance.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* 15 Checklist Items */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                                <ClipboardCheck className="w-4 h-4 text-emerald-600" />
                                <span>Checklist Pemeriksaan 15 Item Wajib</span>
                            </h3>
                            <span className="text-xs text-slate-500">
                                {form.data.items.filter((i) => i.status === 'good').length}/15 Baik
                            </span>
                        </div>

                        <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden divide-y divide-slate-200 dark:divide-slate-700">
                            {form.data.items.map((item, idx) => (
                                <div key={idx} className={`p-3 text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                                    item.status === 'not_good'
                                        ? (item.is_critical ? 'bg-rose-50/70 dark:bg-rose-950/20' : 'bg-amber-50/70 dark:bg-amber-950/20')
                                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                                }`}>
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2">
                                            <span className="font-semibold text-slate-900 dark:text-white">
                                                {idx + 1}. {item.item_name}
                                            </span>
                                            {item.is_critical && (
                                                <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 uppercase">
                                                    KRITIS
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-[11px] text-slate-400 block">{item.category}</span>

                                        {item.status === 'not_good' && (
                                            <div className="mt-2">
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="Deskripsikan kerusakan / temuan..."
                                                    value={item.defect_description}
                                                    onChange={(e) => handleItemDefectChange(idx, e.target.value)}
                                                    className="w-full px-2.5 py-1.5 text-xs rounded border border-rose-300 dark:border-rose-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Radio status options */}
                                    <div className="flex items-center space-x-2">
                                        <label className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer border transition flex items-center space-x-1 ${
                                            item.status === 'good'
                                                ? 'bg-emerald-600 text-white border-emerald-600'
                                                : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                        }`}>
                                            <input
                                                type="radio"
                                                name={`item_${idx}`}
                                                className="hidden"
                                                checked={item.status === 'good'}
                                                onChange={() => handleItemStatusChange(idx, 'good')}
                                            />
                                            <span>Good</span>
                                        </label>

                                        <label className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer border transition flex items-center space-x-1 ${
                                            item.status === 'not_good'
                                                ? 'bg-rose-600 text-white border-rose-600'
                                                : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                        }`}>
                                            <input
                                                type="radio"
                                                name={`item_${idx}`}
                                                className="hidden"
                                                checked={item.status === 'not_good'}
                                                onChange={() => handleItemStatusChange(idx, 'not_good')}
                                            />
                                            <span>Not Good</span>
                                        </label>

                                        <label className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer border transition flex items-center space-x-1 ${
                                            item.status === 'not_applicable'
                                                ? 'bg-slate-600 text-white border-slate-600'
                                                : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                        }`}>
                                            <input
                                                type="radio"
                                                name={`item_${idx}`}
                                                className="hidden"
                                                checked={item.status === 'not_applicable'}
                                                onChange={() => handleItemStatusChange(idx, 'not_applicable')}
                                            />
                                            <span>N/A</span>
                                        </label>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Konfirmasi Tanda Tangan Digital Driver */}
                    <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 rounded-xl flex items-center space-x-3">
                        <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        <div className="text-xs text-slate-700 dark:text-slate-300">
                            Dengan mengklik tombol submit, saya menyatakan telah melakukan pemeriksaan fisik menyeluruh terhadap armada ini secara jujur dan bertanggung jawab sesuai SOP K3LH PT Teknindo Adhya Pane. Hash tanda tangan digital akan dicatat secara kriptografis.
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <Button type="button" variant="secondary" onClick={() => setIsCreateOpen(false)}>
                            Batal
                        </Button>
                        <Button type="submit" variant={hasCriticalDefect ? 'danger' : 'primary'} disabled={form.processing}>
                            {form.processing ? 'Menyimpan & Menandatangani...' : (hasCriticalDefect ? 'Laporkan Cacat Kritis & Kirim WO' : 'Kirim Form P2H Selesai')}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Modal Detail P2H */}
            {selectedInspection && (
                <Modal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} title={`Lembar Pemeriksaan P2H: ${selectedInspection.inspection_number}`} maxWidth="max-w-3xl">
                    <div className="space-y-4">
                        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                            <div>
                                <span className="text-slate-500 block">Unit Armada</span>
                                <span className="font-bold text-slate-900 dark:text-white text-sm">{selectedInspection.unit?.unit_code}</span>
                            </div>
                            <div>
                                <span className="text-slate-500 block">Driver Penguji</span>
                                <span className="font-bold text-slate-900 dark:text-white text-sm">{selectedInspection.driver?.employee?.name}</span>
                            </div>
                            <div>
                                <span className="text-slate-500 block">Tanggal & Waktu</span>
                                <span className="font-medium text-slate-900 dark:text-white">{selectedInspection.inspection_date} {selectedInspection.inspection_time}</span>
                            </div>
                            <div>
                                <span className="text-slate-500 block">Shift Kerja</span>
                                <span className="font-medium text-slate-900 dark:text-white">{selectedInspection.shift?.name}</span>
                            </div>
                            <div>
                                <span className="text-slate-500 block">Hour Meter (HM)</span>
                                <span className="font-mono font-bold text-slate-900 dark:text-white">{Number(selectedInspection.current_hm).toLocaleString('id-ID')} HM</span>
                            </div>
                            <div>
                                <span className="text-slate-500 block">Kilo Meter (KM)</span>
                                <span className="font-mono font-bold text-slate-900 dark:text-white">{Number(selectedInspection.current_km).toLocaleString('id-ID')} KM</span>
                            </div>
                            <div className="sm:col-span-2">
                                <span className="text-slate-500 block">Hasil Kelayakan</span>
                                <div>{getConditionBadge(selectedInspection.overall_condition)}</div>
                            </div>
                        </div>

                        {selectedInspection.work_order && (
                            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-900 rounded-xl text-xs">
                                <span className="font-bold text-rose-800 dark:text-rose-300 block mb-1">
                                    Work Order Otomatis: {selectedInspection.work_order.wo_number}
                                </span>
                                <p className="text-rose-700 dark:text-rose-400">
                                    {selectedInspection.work_order.defect_summary}
                                </p>
                            </div>
                        )}

                        <div className="border border-slate-200 dark:border-slate-700 rounded-xl divide-y divide-slate-200 dark:divide-slate-700 max-h-80 overflow-y-auto">
                            {selectedInspection.items?.map((item, idx) => (
                                <div key={idx} className="p-3 text-xs flex items-center justify-between">
                                    <div>
                                        <span className="font-semibold text-slate-900 dark:text-white block">
                                            {idx + 1}. {item.item_name} {item.is_critical && <span className="text-rose-500 font-bold">(Kritis)</span>}
                                        </span>
                                        {item.defect_description && (
                                            <span className="text-rose-600 dark:text-rose-400 italic">Temuan: {item.defect_description}</span>
                                        )}
                                    </div>
                                    <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                                        item.status === 'good'
                                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                            : item.status === 'not_good'
                                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                    }`}>
                                        {item.status.replace('_', ' ')}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {selectedInspection.driver_signature_hash && (
                            <div className="p-2.5 bg-slate-100 dark:bg-slate-900 rounded-lg text-[11px] font-mono text-slate-500 break-all">
                                Digital Signature Hash: {selectedInspection.driver_signature_hash}
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
