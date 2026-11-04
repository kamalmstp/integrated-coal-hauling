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
    Route as RouteIcon,
    Plus,
    Filter,
    Clock,
    AlertTriangle,
    Truck,
    MapPin,
    CheckCircle2,
    Calendar,
} from 'lucide-react';

export default function HaulingIndex({
    activities = { data: [] },
    filters = {},
    metrics = {},
    master = {},
}) {
    const [filterDate, setFilterDate] = useState(filters.date || '');
    const [filterStatus, setFilterStatus] = useState(filters.status || '');
    const [filterUnit, setFilterUnit] = useState(filters.unit_id || '');
    const [filterShift, setFilterShift] = useState(filters.shift_id || '');

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isUpdateStatusOpen, setIsUpdateStatusOpen] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState(null);

    const createForm = useForm({
        unit_id: master.units?.[0]?.id || '',
        driver_id: master.drivers?.[0]?.id || '',
        loading_point_id: master.loading_points?.[0]?.id || '',
        dumping_point_id: master.dumping_points?.[0]?.id || '',
        material_id: master.materials?.[0]?.id || '',
        shift_id: master.shifts?.[0]?.id || '',
        activity_date: filters.date || new Date().toISOString().split('T')[0],
        journey_status: 'loading',
        delay_type: '',
        delay_duration_minutes: 0,
        delay_notes: '',
    });

    const statusForm = useForm({
        journey_status: 'hauling',
        delay_type: '',
        delay_duration_minutes: 0,
        delay_notes: '',
    });

    const handleFilter = (e) => {
        e.preventDefault();
        router.get('/production/hauling', {
            date: filterDate,
            status: filterStatus,
            unit_id: filterUnit,
            shift_id: filterShift,
        }, { preserveState: true });
    };

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        createForm.post('/production/hauling', {
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
            },
        });
    };

    const handleStatusSubmit = (e) => {
        e.preventDefault();
        if (!selectedActivity) return;
        statusForm.put(`/production/hauling/${selectedActivity.id}/status`, {
            onSuccess: () => {
                setIsUpdateStatusOpen(false);
                statusForm.reset();
            },
        });
    };

    const openStatusModal = (act) => {
        setSelectedActivity(act);
        statusForm.setData({
            journey_status: act.journey_status,
            delay_type: act.delay_type || '',
            delay_duration_minutes: act.delay_duration_minutes || 0,
            delay_notes: act.delay_notes || '',
        });
        setIsUpdateStatusOpen(true);
    };

    const getJourneyBadge = (status) => {
        switch (status) {
            case 'loading':
                return <Badge variant="warning">Loading di Front</Badge>;
            case 'hauling':
                return <Badge variant="primary">Hauling (Jalan)</Badge>;
            case 'queueing_dump':
                return <Badge variant="secondary">Antre Dumping</Badge>;
            case 'dumped':
                return <Badge variant="success">Selesai Dumping</Badge>;
            case 'returning':
                return <Badge variant="info">Kosongan Balik</Badge>;
            case 'delay_breakdown':
                return <Badge variant="danger">Delay Breakdown</Badge>;
            case 'delay_weather':
                return <Badge variant="danger">Delay Hujan/Slippery</Badge>;
            case 'delay_road':
                return <Badge variant="danger">Kendala Jalan</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <DashboardLayout>
            <Head title="Loading & Hauling Tracking — TAP" />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="p-2 rounded-lg bg-teal-600 text-white shadow-sm">
                            <RouteIcon className="w-5 h-5" />
                        </span>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Loading & Hauling Activity Log
                            </h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Pencatatan posisi perjalanan armada, waktu siklus loading-dumping, dan pencatatan hambatan
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button onClick={() => setIsCreateOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Catat Perjalanan Baru
                    </Button>
                </div>
            </div>

            {/* Metrics Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
                <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
                    <span className="text-[11px] font-medium text-slate-500 uppercase">Total Log Aktivitas</span>
                    <div className="text-xl font-black text-slate-900 dark:text-white mt-1">{metrics.total || 0}</div>
                </div>
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <span className="text-[11px] font-medium text-amber-700 dark:text-amber-300 uppercase">Sedang Loading</span>
                    <div className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">{metrics.loading || 0}</div>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <span className="text-[11px] font-medium text-blue-700 dark:text-blue-300 uppercase">In-Transit Hauling</span>
                    <div className="text-xl font-black text-blue-600 dark:text-blue-400 mt-1">{metrics.hauling || 0}</div>
                </div>
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                    <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-300 uppercase">Selesai Dumping</span>
                    <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{metrics.dumped || 0}</div>
                </div>
                <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-lg">
                    <span className="text-[11px] font-medium text-rose-700 dark:text-rose-300 uppercase">Mengalami Kendala/Delay</span>
                    <div className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1">{metrics.delayed || 0}</div>
                </div>
            </div>

            {/* Filter Bar */}
            <Card className="p-4 mb-6">
                <form onSubmit={handleFilter} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Tanggal</label>
                        <Input
                            type="date"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Status Perjalanan</label>
                        <Select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            options={[
                                { value: '', label: 'Semua Status' },
                                { value: 'loading', label: 'Loading di Front' },
                                { value: 'hauling', label: 'Hauling (Jalan)' },
                                { value: 'queueing_dump', label: 'Antre Dumping' },
                                { value: 'dumped', label: 'Selesai Dumping' },
                                { value: 'returning', label: 'Kosongan Balik' },
                                { value: 'delay_breakdown', label: 'Delay Breakdown' },
                                { value: 'delay_weather', label: 'Delay Cuaca/Hujan' },
                                { value: 'delay_road', label: 'Delay Jalur' },
                            ]}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Armada DT</label>
                        <Select
                            value={filterUnit}
                            onChange={(e) => setFilterUnit(e.target.value)}
                            options={[
                                { value: '', label: 'Semua Armada' },
                                ...(master.units?.map((u) => ({ value: u.id, label: u.unit_code })) || []),
                            ]}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Shift</label>
                        <Select
                            value={filterShift}
                            onChange={(e) => setFilterShift(e.target.value)}
                            options={[
                                { value: '', label: 'Semua Shift' },
                                ...(master.shifts?.map((s) => ({ value: s.id, label: s.name })) || []),
                            ]}
                        />
                    </div>
                    <div>
                        <Button type="submit" variant="secondary" className="w-full">
                            <Filter className="w-4 h-4 mr-1" />
                            Filter Data
                        </Button>
                    </div>
                </form>
            </Card>

            {/* Table */}
            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
                            <tr>
                                <th className="py-3 px-4">Armada & Driver</th>
                                <th className="py-3 px-4">Rute Hauling</th>
                                <th className="py-3 px-4">Shift & Tanggal</th>
                                <th className="py-3 px-4">Waktu Loading</th>
                                <th className="py-3 px-4">Waktu Hauling</th>
                                <th className="py-3 px-4">Waktu Dumping</th>
                                <th className="py-3 px-4">Status</th>
                                <th className="py-3 px-4">Kendala / Delay</th>
                                <th className="py-3 px-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {activities.data.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="py-8 text-center text-slate-400">
                                        Tidak ada catatan aktivitas perjalanan hauling pada filter ini.
                                    </td>
                                </tr>
                            ) : (
                                activities.data.map((act) => (
                                    <tr key={act.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                        <td className="py-3 px-4">
                                            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                                <Truck className="w-3.5 h-3.5 text-slate-400" />
                                                {act.unit?.unit_code}
                                            </div>
                                            <div className="text-[11px] text-slate-500">{act.driver?.employee?.name}</div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                                                <MapPin className="w-3 h-3 text-emerald-500" />
                                                <span>{act.loading_point?.name}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-slate-500 text-[11px]">
                                                <MapPin className="w-3 h-3 text-blue-500" />
                                                <span>{act.dumping_point?.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                                            <div>{act.shift?.name}</div>
                                            <div className="text-[11px] text-slate-400">{act.activity_date}</div>
                                        </td>
                                        <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                                            {act.loading_start_time ? new Date(act.loading_start_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
                                        </td>
                                        <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                                            {act.hauling_start_time ? new Date(act.hauling_start_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
                                        </td>
                                        <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                                            {act.dumping_time ? new Date(act.dumping_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
                                        </td>
                                        <td className="py-3 px-4">
                                            {getJourneyBadge(act.journey_status)}
                                        </td>
                                        <td className="py-3 px-4">
                                            {act.delay_type ? (
                                                <div className="text-rose-600 dark:text-rose-400 text-[11px] font-semibold flex items-center gap-1">
                                                    <AlertTriangle className="w-3 h-3" />
                                                    <span>{act.delay_type} ({act.delay_duration_minutes}m)</span>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 text-[11px]">Lancar</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <Button size="sm" variant="secondary" onClick={() => openStatusModal(act)}>
                                                Update Status
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                    <Pagination links={activities.links} />
                </div>
            </Card>

            {/* Modal: Catat Perjalanan Baru */}
            <Modal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                title="Catat Aktivitas Loading & Hauling"
            >
                <form onSubmit={handleCreateSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Pilih Unit DT</label>
                            <Select
                                value={createForm.data.unit_id}
                                onChange={(e) => createForm.setData('unit_id', e.target.value)}
                                options={master.units?.map((u) => ({ value: u.id, label: u.unit_code })) || []}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Driver</label>
                            <Select
                                value={createForm.data.driver_id}
                                onChange={(e) => createForm.setData('driver_id', e.target.value)}
                                options={master.drivers?.map((d) => ({ value: d.id, label: `${d.employee?.name} (${d.driver_code})` })) || []}
                                required
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Loading Point</label>
                            <Select
                                value={createForm.data.loading_point_id}
                                onChange={(e) => createForm.setData('loading_point_id', e.target.value)}
                                options={master.loading_points?.map((l) => ({ value: l.id, label: l.name })) || []}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Dumping Point</label>
                            <Select
                                value={createForm.data.dumping_point_id}
                                onChange={(e) => createForm.setData('dumping_point_id', e.target.value)}
                                options={master.dumping_points?.map((l) => ({ value: l.id, label: l.name })) || []}
                                required
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Material</label>
                            <Select
                                value={createForm.data.material_id}
                                onChange={(e) => createForm.setData('material_id', e.target.value)}
                                options={master.materials?.map((m) => ({ value: m.id, label: m.name })) || []}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Shift</label>
                            <Select
                                value={createForm.data.shift_id}
                                onChange={(e) => createForm.setData('shift_id', e.target.value)}
                                options={master.shifts?.map((s) => ({ value: s.id, label: s.name })) || []}
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Status Perjalanan</label>
                        <Select
                            value={createForm.data.journey_status}
                            onChange={(e) => createForm.setData('journey_status', e.target.value)}
                            options={[
                                { value: 'loading', label: 'Loading di Front' },
                                { value: 'hauling', label: 'Hauling (Berjalan)' },
                                { value: 'queueing_dump', label: 'Antre Dumping' },
                                { value: 'dumped', label: 'Selesai Dumping' },
                            ]}
                        />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="secondary" onClick={() => setIsCreateOpen(false)}>Batal</Button>
                        <Button type="submit" disabled={createForm.processing}>Simpan Aktivitas</Button>
                    </div>
                </form>
            </Modal>

            {/* Modal: Update Status Perjalanan */}
            <Modal
                isOpen={isUpdateStatusOpen}
                onClose={() => setIsUpdateStatusOpen(false)}
                title={`Update Status: Unit ${selectedActivity?.unit?.unit_code}`}
            >
                <form onSubmit={handleStatusSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Status Baru</label>
                        <Select
                            value={statusForm.data.journey_status}
                            onChange={(e) => statusForm.setData('journey_status', e.target.value)}
                            options={[
                                { value: 'loading', label: 'Loading di Front' },
                                { value: 'hauling', label: 'Hauling (Mulai Berjalan)' },
                                { value: 'queueing_dump', label: 'Antre Dumping di Stockpile/Jetty' },
                                { value: 'dumped', label: 'Selesai Dumping' },
                                { value: 'returning', label: 'Kosongan Balik ke Front' },
                                { value: 'delay_breakdown', label: 'Kendala: Breakdown Unit' },
                                { value: 'delay_weather', label: 'Kendala: Hujan / Licin' },
                                { value: 'delay_road', label: 'Kendala: Insiden Jalur' },
                            ]}
                            required
                        />
                    </div>

                    {statusForm.data.journey_status.startsWith('delay') && (
                        <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-rose-800 dark:text-rose-200 mb-1">Tipe Kendala</label>
                                    <Input
                                        value={statusForm.data.delay_type}
                                        onChange={(e) => statusForm.setData('delay_type', e.target.value)}
                                        placeholder="Misal: Pecah Ban, Amblas, Hujan Deras"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-rose-800 dark:text-rose-200 mb-1">Estimasi Durasi (Menit)</label>
                                    <Input
                                        type="number"
                                        min={0}
                                        value={statusForm.data.delay_duration_minutes}
                                        onChange={(e) => statusForm.setData('delay_duration_minutes', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-rose-800 dark:text-rose-200 mb-1">Keterangan Kendala</label>
                                <textarea
                                    value={statusForm.data.delay_notes}
                                    onChange={(e) => statusForm.setData('delay_notes', e.target.value)}
                                    className="w-full text-xs rounded-lg border-rose-300 dark:border-rose-700 dark:bg-slate-800 p-2"
                                    rows={2}
                                    placeholder="Detail titik KM atau tindak lanjut mekanik..."
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="secondary" onClick={() => setIsUpdateStatusOpen(false)}>Batal</Button>
                        <Button type="submit" disabled={statusForm.processing}>Perbarui Status</Button>
                    </div>
                </form>
            </Modal>
        </DashboardLayout>
    );
}
