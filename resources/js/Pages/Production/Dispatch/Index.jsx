import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import DashboardLayout from '../../../components/templates/DashboardLayout';
import Card from '../../../components/molecules/Card';
import Badge from '../../../components/atoms/Badge';
import Button from '../../../components/atoms/Button';
import Input from '../../../components/atoms/Input';
import Select from '../../../components/atoms/Select';
import Modal from '../../../components/molecules/Modal';
import {
    CalendarCheck,
    Plus,
    Filter,
    Truck,
    User,
    MapPin,
    Layers,
    Clock,
    History,
    RefreshCw,
    AlertTriangle,
    CheckCircle,
} from 'lucide-react';

export default function DispatchIndex({
    dispatches = [],
    filters = {},
    summary = {},
    master = {},
}) {
    const [filterDate, setFilterDate] = useState(filters.date || '');
    const [filterShift, setFilterShift] = useState(filters.shift_id || '');
    const [filterSite, setFilterSite] = useState(filters.site_id || '');

    // Modals
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isAddAssignOpen, setIsAddAssignOpen] = useState(false);
    const [selectedDispatch, setSelectedDispatch] = useState(null);

    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null);

    // Form create dispatch
    const createForm = useForm({
        date: filters.date || new Date().toISOString().split('T')[0],
        site_id: master.sites?.[0]?.id || '',
        shift_id: master.shifts?.[0]?.id || '',
        supervisor_id: master.supervisors?.[0]?.id || '',
        notes: '',
    });

    // Form add assignment
    const assignForm = useForm({
        unit_id: master.units?.[0]?.id || '',
        driver_id: master.drivers?.[0]?.id || '',
        loading_point_id: master.loading_points?.[0]?.id || '',
        dumping_point_id: master.dumping_points?.[0]?.id || '',
        material_id: master.materials?.[0]?.id || '',
        target_ritase: 5,
        remarks: '',
    });

    // Form change status
    const statusForm = useForm({
        status: 'operating',
        reason: '',
    });

    // Form swap unit/driver
    const swapForm = useForm({
        unit_id: '',
        driver_id: '',
        reason: '',
    });

    const handleFilter = (e) => {
        e.preventDefault();
        router.get('/production/dispatch', {
            date: filterDate,
            shift_id: filterShift,
            site_id: filterSite,
        }, { preserveState: true });
    };

    const handleCreateDispatch = (e) => {
        e.preventDefault();
        createForm.post('/production/dispatch', {
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
            },
        });
    };

    const handleAddAssignment = (e) => {
        e.preventDefault();
        if (!selectedDispatch) return;
        assignForm.post(`/production/dispatch/${selectedDispatch.id}/assignments`, {
            onSuccess: () => {
                setIsAddAssignOpen(false);
                assignForm.reset();
            },
        });
    };

    const handleStatusSubmit = (e) => {
        e.preventDefault();
        if (!selectedAssignment) return;
        statusForm.put(`/production/assignments/${selectedAssignment.id}/status`, {
            onSuccess: () => {
                setIsStatusModalOpen(false);
                statusForm.reset();
            },
        });
    };

    const handleSwapSubmit = (e) => {
        e.preventDefault();
        if (!selectedAssignment) return;
        swapForm.put(`/production/assignments/${selectedAssignment.id}/swap`, {
            onSuccess: () => {
                setIsSwapModalOpen(false);
                swapForm.reset();
            },
        });
    };

    const openSwap = (asg) => {
        setSelectedAssignment(asg);
        swapForm.setData({
            unit_id: asg.unit_id,
            driver_id: asg.driver_id,
            reason: '',
        });
        setIsSwapModalOpen(true);
    };

    const openStatus = (asg) => {
        setSelectedAssignment(asg);
        statusForm.setData({
            status: asg.status,
            reason: '',
        });
        setIsStatusModalOpen(true);
    };

    const openHistory = (asg) => {
        setSelectedAssignment(asg);
        setIsHistoryModalOpen(true);
    };

    return (
        <DashboardLayout>
            <Head title="Daily Dispatch Board — TAP Coal Hauling" />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="p-2 rounded-lg bg-blue-600 text-white shadow-sm">
                            <CalendarCheck className="w-5 h-5" />
                        </span>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Daily Dispatch Board
                            </h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Pengaturan jadwal operasional harian, alokasi armada DT, penugasan driver, dan rute hauling
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button onClick={() => setIsCreateOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Buat Jadwal Dispatch
                    </Button>
                </div>
            </div>

            {/* Filter Bar */}
            <Card className="p-4 mb-6">
                <form onSubmit={handleFilter} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                            Tanggal Operasional
                        </label>
                        <Input
                            type="date"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                            Shift Kerja
                        </label>
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
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                            Site Proyek
                        </label>
                        <Select
                            value={filterSite}
                            onChange={(e) => setFilterSite(e.target.value)}
                            options={[
                                { value: '', label: 'Semua Site' },
                                ...(master.sites?.map((s) => ({ value: s.id, label: s.name })) || []),
                            ]}
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button type="submit" variant="secondary" className="w-full">
                            <Filter className="w-4 h-4 mr-1" />
                            Terapkan Filter
                        </Button>
                    </div>
                </form>
            </Card>

            {/* Metrics Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
                <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
                    <span className="text-[11px] font-medium text-slate-500 uppercase">Total Unit Ditugaskan</span>
                    <div className="text-xl font-black text-slate-900 dark:text-white mt-1">{summary.assigned_units || 0} DT</div>
                </div>
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                    <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-300 uppercase">Operating (Jalan)</span>
                    <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{summary.operating_units || 0} DT</div>
                </div>
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <span className="text-[11px] font-medium text-amber-700 dark:text-amber-300 uppercase">Standby</span>
                    <div className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">{summary.standby_units || 0} DT</div>
                </div>
                <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-lg">
                    <span className="text-[11px] font-medium text-rose-700 dark:text-rose-300 uppercase">Breakdown</span>
                    <div className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1">{summary.breakdown_units || 0} DT</div>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <span className="text-[11px] font-medium text-blue-700 dark:text-blue-300 uppercase">Target Ritase</span>
                    <div className="text-xl font-black text-blue-600 dark:text-blue-400 mt-1">{summary.target_ritase || 0} Rit</div>
                </div>
                <div className="p-3 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg">
                    <span className="text-[11px] font-medium text-purple-700 dark:text-purple-300 uppercase">Ritase Tercapai</span>
                    <div className="text-xl font-black text-purple-600 dark:text-purple-400 mt-1">{summary.actual_ritase || 0} Rit</div>
                </div>
            </div>

            {/* Dispatches List */}
            {dispatches.length === 0 ? (
                <Card className="p-12 text-center text-slate-500">
                    <CalendarCheck className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p className="text-base font-semibold">Tidak ada jadwal dispatch pada tanggal ini</p>
                    <p className="text-xs text-slate-400 mt-1">Gunakan tombol "Buat Jadwal Dispatch" di kanan atas untuk membuat penugasan shift baru.</p>
                </Card>
            ) : (
                <div className="space-y-6">
                    {dispatches.map((disp) => (
                        <Card key={disp.id} className="overflow-hidden">
                            {/* Dispatch Header */}
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <Badge variant="primary" className="font-mono text-xs">{disp.dispatch_number}</Badge>
                                    <div>
                                        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                            {disp.shift?.name}
                                            <span className="text-xs font-normal text-slate-500">({disp.date})</span>
                                        </h2>
                                        <p className="text-xs text-slate-500">
                                            Site: <strong>{disp.site?.name}</strong> • Supervisor: <strong>{disp.supervisor?.name || 'Belum ditentukan'}</strong>
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Badge variant={disp.status === 'completed' ? 'secondary' : 'success'}>
                                        {disp.status.toUpperCase()}
                                    </Badge>
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={() => {
                                            setSelectedDispatch(disp);
                                            setIsAddAssignOpen(true);
                                        }}
                                    >
                                        <Plus className="w-3.5 h-3.5 mr-1" />
                                        Tambah Unit DT
                                    </Button>
                                </div>
                            </div>

                            {/* Assignments Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-100/60 dark:bg-slate-800/40 text-slate-500 uppercase tracking-wider font-semibold">
                                        <tr>
                                            <th className="py-2.5 px-3">No. Lambung</th>
                                            <th className="py-2.5 px-3">Driver</th>
                                            <th className="py-2.5 px-3">Loading Point</th>
                                            <th className="py-2.5 px-3">Dumping Point</th>
                                            <th className="py-2.5 px-3">Material</th>
                                            <th className="py-2.5 px-3 text-center">Ritase (Akt / Tgt)</th>
                                            <th className="py-2.5 px-3 text-center">Status</th>
                                            <th className="py-2.5 px-3 text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {disp.assignments.length === 0 ? (
                                            <tr>
                                                <td colSpan="8" className="py-6 text-center text-slate-400">
                                                    Belum ada armada dump truck yang dialokasikan pada dispatch ini.
                                                </td>
                                            </tr>
                                        ) : (
                                            disp.assignments.map((asg) => (
                                                <tr key={asg.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                                                    <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                        <Truck className="w-3.5 h-3.5 text-slate-400" />
                                                        {asg.unit?.unit_code}
                                                        <span className="text-[10px] text-slate-400 font-normal">({asg.unit?.unit_type === 'dump_truck_10' ? '10 Roda' : '12 Roda'})</span>
                                                    </td>
                                                    <td className="py-2.5 px-3">
                                                        <div className="font-semibold text-slate-800 dark:text-slate-200">{asg.driver?.employee?.name}</div>
                                                        <div className="text-[10px] text-slate-400">{asg.driver?.driver_code}</div>
                                                    </td>
                                                    <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                                                        {asg.loading_point?.name}
                                                    </td>
                                                    <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                                                        {asg.dumping_point?.name}
                                                    </td>
                                                    <td className="py-2.5 px-3">
                                                        <Badge variant="outline">{asg.material?.code}</Badge>
                                                    </td>
                                                    <td className="py-2.5 px-3 text-center font-bold">
                                                        <span className="text-emerald-600 dark:text-emerald-400">{asg.actual_ritase}</span> / {asg.target_ritase}
                                                    </td>
                                                    <td className="py-2.5 px-3 text-center">
                                                        <span
                                                            onClick={() => openStatus(asg)}
                                                            className={`cursor-pointer inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                                                                asg.status === 'operating' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                                                                asg.status === 'breakdown' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                                                                asg.status === 'standby' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                                                                'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                                            }`}
                                                        >
                                                            {asg.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-2.5 px-3 text-right">
                                                        <div className="inline-flex gap-1">
                                                            <button
                                                                onClick={() => openSwap(asg)}
                                                                title="Tukar Unit / Driver"
                                                                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                                                            >
                                                                <RefreshCw className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button
                                                                onClick={() => openHistory(asg)}
                                                                title="Histori Perubahan"
                                                                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                                                            >
                                                                <History className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Modal 1: Buat Jadwal Dispatch */}
            <Modal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                title="Buat Jadwal Daily Dispatch Baru"
            >
                <form onSubmit={handleCreateDispatch} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Tanggal Operasional</label>
                        <Input
                            type="date"
                            value={createForm.data.date}
                            onChange={(e) => createForm.setData('date', e.target.value)}
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Site Proyek</label>
                            <Select
                                value={createForm.data.site_id}
                                onChange={(e) => createForm.setData('site_id', e.target.value)}
                                options={master.sites?.map((s) => ({ value: s.id, label: s.name })) || []}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Shift Kerja</label>
                            <Select
                                value={createForm.data.shift_id}
                                onChange={(e) => createForm.setData('shift_id', e.target.value)}
                                options={master.shifts?.map((s) => ({ value: s.id, label: s.name })) || []}
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Supervisor Bertugas</label>
                        <Select
                            value={createForm.data.supervisor_id}
                            onChange={(e) => createForm.setData('supervisor_id', e.target.value)}
                            options={master.supervisors?.map((sup) => ({ value: sup.id, label: `${sup.name} (${sup.employee_code})` })) || []}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Catatan Operasional</label>
                        <textarea
                            value={createForm.data.notes}
                            onChange={(e) => createForm.setData('notes', e.target.value)}
                            className="w-full text-xs rounded-lg border-slate-300 dark:border-slate-700 dark:bg-slate-800 p-2"
                            rows={3}
                            placeholder="Catatan kondisi jalan hauling, cuaca, atau prioritas ROM..."
                        />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="secondary" onClick={() => setIsCreateOpen(false)}>Batal</Button>
                        <Button type="submit" disabled={createForm.processing}>Simpan Jadwal</Button>
                    </div>
                </form>
            </Modal>

            {/* Modal 2: Tambah Alokasi Unit ke Dispatch */}
            <Modal
                isOpen={isAddAssignOpen}
                onClose={() => setIsAddAssignOpen(false)}
                title={`Tambah Unit DT ke ${selectedDispatch?.dispatch_number || ''}`}
            >
                <form onSubmit={handleAddAssignment} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Pilih Unit DT</label>
                            <Select
                                value={assignForm.data.unit_id}
                                onChange={(e) => assignForm.setData('unit_id', e.target.value)}
                                options={master.units?.map((u) => ({ value: u.id, label: `${u.unit_code} (${u.unit_type})` })) || []}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Pilih Driver</label>
                            <Select
                                value={assignForm.data.driver_id}
                                onChange={(e) => assignForm.setData('driver_id', e.target.value)}
                                options={master.drivers?.map((d) => ({ value: d.id, label: `${d.employee?.name} (${d.driver_code})` })) || []}
                                required
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Loading Point</label>
                            <Select
                                value={assignForm.data.loading_point_id}
                                onChange={(e) => assignForm.setData('loading_point_id', e.target.value)}
                                options={master.loading_points?.map((l) => ({ value: l.id, label: l.name })) || []}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Dumping Point</label>
                            <Select
                                value={assignForm.data.dumping_point_id}
                                onChange={(e) => assignForm.setData('dumping_point_id', e.target.value)}
                                options={master.dumping_points?.map((l) => ({ value: l.id, label: l.name })) || []}
                                required
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Material</label>
                            <Select
                                value={assignForm.data.material_id}
                                onChange={(e) => assignForm.setData('material_id', e.target.value)}
                                options={master.materials?.map((m) => ({ value: m.id, label: m.name })) || []}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Ritase</label>
                            <Input
                                type="number"
                                min={1}
                                value={assignForm.data.target_ritase}
                                onChange={(e) => assignForm.setData('target_ritase', e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Keterangan Khusus</label>
                        <Input
                            value={assignForm.data.remarks}
                            onChange={(e) => assignForm.setData('remarks', e.target.value)}
                            placeholder="Catatan penugasan armada..."
                        />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="secondary" onClick={() => setIsAddAssignOpen(false)}>Batal</Button>
                        <Button type="submit" disabled={assignForm.processing}>Tambahkan ke Dispatch</Button>
                    </div>
                </form>
            </Modal>

            {/* Modal 3: Update Status Penugasan */}
            <Modal
                isOpen={isStatusModalOpen}
                onClose={() => setIsStatusModalOpen(false)}
                title={`Ubah Status: Unit ${selectedAssignment?.unit?.unit_code}`}
            >
                <form onSubmit={handleStatusSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Status Baru</label>
                        <Select
                            value={statusForm.data.status}
                            onChange={(e) => statusForm.setData('status', e.target.value)}
                            options={[
                                { value: 'assigned', label: 'Assigned (Menunggu)' },
                                { value: 'operating', label: 'Operating (Aktif Jalan)' },
                                { value: 'standby', label: 'Standby' },
                                { value: 'breakdown', label: 'Breakdown (Rusak)' },
                                { value: 'completed', label: 'Completed (Selesai)' },
                                { value: 'cancelled', label: 'Cancelled (Dibatalkan)' },
                            ]}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Alasan Perubahan (Audit Trail)</label>
                        <textarea
                            value={statusForm.data.reason}
                            onChange={(e) => statusForm.setData('reason', e.target.value)}
                            className="w-full text-xs rounded-lg border-slate-300 dark:border-slate-700 dark:bg-slate-800 p-2"
                            rows={3}
                            placeholder="Wajib mengisi alasan (misal: Unit ban bocor di KM 12, pergantian shift, dll)..."
                            required
                        />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="secondary" onClick={() => setIsStatusModalOpen(false)}>Batal</Button>
                        <Button type="submit" disabled={statusForm.processing}>Simpan Status</Button>
                    </div>
                </form>
            </Modal>

            {/* Modal 4: Tukar Unit atau Driver */}
            <Modal
                isOpen={isSwapModalOpen}
                onClose={() => setIsSwapModalOpen(false)}
                title={`Swap Unit / Driver (${selectedAssignment?.unit?.unit_code})`}
            >
                <form onSubmit={handleSwapSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Ganti Unit Armada</label>
                        <Select
                            value={swapForm.data.unit_id}
                            onChange={(e) => swapForm.setData('unit_id', e.target.value)}
                            options={master.units?.map((u) => ({ value: u.id, label: `${u.unit_code} (${u.status})` })) || []}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Ganti Driver</label>
                        <Select
                            value={swapForm.data.driver_id}
                            onChange={(e) => swapForm.setData('driver_id', e.target.value)}
                            options={master.drivers?.map((d) => ({ value: d.id, label: `${d.employee?.name} (${d.driver_code})` })) || []}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Alasan Penukaran</label>
                        <textarea
                            value={swapForm.data.reason}
                            onChange={(e) => swapForm.setData('reason', e.target.value)}
                            className="w-full text-xs rounded-lg border-slate-300 dark:border-slate-700 dark:bg-slate-800 p-2"
                            rows={3}
                            placeholder="Alasan pergantian unit atau driver (misal: driver sakit, unit swap untuk service)..."
                            required
                        />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="secondary" onClick={() => setIsSwapModalOpen(false)}>Batal</Button>
                        <Button type="submit" disabled={swapForm.processing}>Simpan Penukaran</Button>
                    </div>
                </form>
            </Modal>

            {/* Modal 5: Histori Perubahan Assignment (Audit Trail) */}
            <Modal
                isOpen={isHistoryModalOpen}
                onClose={() => setIsHistoryModalOpen(false)}
                title={`Audit Log: Unit ${selectedAssignment?.unit?.unit_code}`}
            >
                <div className="space-y-3 max-h-96 overflow-y-auto">
                    {selectedAssignment?.logs?.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-4">Belum ada riwayat perubahan.</p>
                    ) : (
                        selectedAssignment?.logs?.map((log) => (
                            <div key={log.id} className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs">
                                <div className="flex justify-between items-center mb-1">
                                    <Badge variant="outline">{log.change_type.toUpperCase()}</Badge>
                                    <span className="text-[10px] text-slate-400">{log.created_at}</span>
                                </div>
                                <p className="font-medium text-slate-800 dark:text-slate-200">{log.reason}</p>
                                <div className="mt-1 text-[11px] text-slate-500">
                                    Diubah oleh: <strong>{log.user?.name || 'Sistem'}</strong>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Modal>
        </DashboardLayout>
    );
}
