import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import DashboardLayout from '../../../components/templates/DashboardLayout';
import Card from '../../../components/molecules/Card';
import Button from '../../../components/atoms/Button';
import Modal from '../../../components/molecules/Modal';
import Pagination from '../../../components/molecules/Pagination';
import {
    Gauge,
    Plus,
    Filter,
    RefreshCw,
    AlertTriangle,
    CheckCircle2,
    Clock,
    Wrench,
    TrendingUp,
    Truck,
    User,
    Calendar,
    AlertOctagon,
    BellRing,
    ChevronRight,
} from 'lucide-react';

export default function HmKmMonitoringIndex({
    logs = { data: [], links: [] },
    serviceIntervals = [],
    filters = {},
    kpi = {},
    master = {},
}) {
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const [unitId, setUnitId] = useState(filters.unit_id || '');
    const [shiftId, setShiftId] = useState(filters.shift_id || '');
    const [onlyAnomaly, setOnlyAnomaly] = useState(filters.only_anomaly || false);

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('logs'); // 'logs' or 'intervals'

    // Form HM/KM Log
    const form = useForm({
        unit_id: master.units?.[0]?.id || '',
        driver_id: master.drivers?.[0]?.id || '',
        shift_id: master.shifts?.[0]?.id || '',
        log_date: new Date().toISOString().split('T')[0],
        start_hm: master.units?.[0]?.last_hm || 0,
        end_hm: (Number(master.units?.[0]?.last_hm || 0) + 9.5).toFixed(1),
        start_km: master.units?.[0]?.last_km || 0,
        end_km: (Number(master.units?.[0]?.last_km || 0) + 180).toFixed(1),
        notes: '',
    });

    const handleFilter = (e) => {
        e?.preventDefault();
        router.get('/fleet/hm-km', {
            date_from: dateFrom,
            date_to: dateTo,
            unit_id: unitId,
            shift_id: shiftId,
            only_anomaly: onlyAnomaly ? '1' : '',
        }, { preserveState: true, preserveScroll: true });
    };

    const handleReset = () => {
        setDateFrom('');
        setDateTo('');
        setUnitId('');
        setShiftId('');
        setOnlyAnomaly(false);
        router.get('/fleet/hm-km');
    };

    const handleUnitSelect = (id) => {
        const u = master.units?.find((item) => item.id == id);
        const lastHm = Number(u?.last_hm || 0);
        const lastKm = Number(u?.last_km || 0);
        form.setData({
            ...form.data,
            unit_id: id,
            start_hm: lastHm,
            end_hm: (lastHm + 10.0).toFixed(1),
            start_km: lastKm,
            end_km: (lastKm + 200).toFixed(1),
        });
    };

    const calcDeltaHm = (Number(form.data.end_hm) - Number(form.data.start_hm)).toFixed(1);
    const calcDeltaKm = (Number(form.data.end_km) - Number(form.data.start_km)).toFixed(1);
    const isCalculatedAnomaly = Number(calcDeltaHm) > 14.0 || Number(calcDeltaKm) > 600.0;
    const isNegativeDelta = Number(calcDeltaHm) < 0 || Number(calcDeltaKm) < 0;

    const submitLog = (e) => {
        e.preventDefault();
        form.post('/fleet/hm-km', {
            onSuccess: () => {
                form.reset();
                setIsCreateOpen(false);
            },
        });
    };

    return (
        <DashboardLayout>
            <Head title="Monitoring HM/KM & PM Planner - TAP" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div>
                        <div className="flex items-center space-x-3">
                            <div className="p-2.5 rounded-xl bg-cyan-50 text-cyan-600 dark:bg-cyan-950/60 dark:text-cyan-400">
                                <Gauge className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                                    Monitoring HM/KM & PM Service Planner
                                </h1>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Pencatatan hour meter & odometer per shift, audit anomali angka, dan pemantauan interval servis berkala (PM 250 - PM 2000)
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3 w-full sm:w-auto">
                        <Button
                            variant="secondary"
                            onClick={() => router.get('/fleet/hm-km')}
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
                            <span>Catat HM/KM Shift</span>
                        </Button>
                    </div>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                    <Card className="p-4 bg-white dark:bg-slate-800 border-l-4 border-l-slate-500">
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Catatan</p>
                        <div className="flex items-baseline justify-between mt-2">
                            <span className="text-2xl font-black text-slate-900 dark:text-white">{kpi.total_logs || 0}</span>
                            <span className="text-xs text-slate-400">Shift</span>
                        </div>
                    </Card>

                    <Card className="p-4 bg-white dark:bg-slate-800 border-l-4 border-l-cyan-500">
                        <p className="text-xs font-medium text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">Jam Operasi (HM)</p>
                        <div className="flex items-baseline justify-between mt-2">
                            <span className="text-2xl font-black text-cyan-600 dark:text-cyan-400">{kpi.total_operating_hm || 0}</span>
                            <span className="text-xs text-cyan-600/80">Jam Mesin</span>
                        </div>
                    </Card>

                    <Card className="p-4 bg-white dark:bg-slate-800 border-l-4 border-l-blue-500">
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Jarak (KM)</p>
                        <div className="flex items-baseline justify-between mt-2">
                            <span className="text-2xl font-black text-slate-900 dark:text-white">{kpi.total_distance_km || 0}</span>
                            <span className="text-xs text-slate-400">Kilometer</span>
                        </div>
                    </Card>

                    <Card className="p-4 bg-white dark:bg-slate-800 border-l-4 border-l-rose-500">
                        <p className="text-xs font-medium text-rose-600 dark:text-rose-400 uppercase tracking-wider">Anomali Terdeteksi</p>
                        <div className="flex items-baseline justify-between mt-2">
                            <span className="text-2xl font-black text-rose-600 dark:text-rose-400">{kpi.anomalies_detected || 0}</span>
                            <span className="text-xs text-rose-500">Kasus</span>
                        </div>
                    </Card>

                    <Card className="p-4 bg-white dark:bg-slate-800 border-l-4 border-l-amber-500">
                        <p className="text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wider">Servis Mendekati</p>
                        <div className="flex items-baseline justify-between mt-2">
                            <span className="text-2xl font-black text-amber-600 dark:text-amber-400">{kpi.service_due_soon || 0}</span>
                            <span className="text-xs text-amber-500">Due Soon</span>
                        </div>
                    </Card>

                    <Card className="p-4 bg-white dark:bg-slate-800 border-l-4 border-l-rose-700">
                        <p className="text-xs font-medium text-rose-700 dark:text-rose-400 uppercase tracking-wider">Servis Terlewat</p>
                        <div className="flex items-baseline justify-between mt-2">
                            <span className="text-2xl font-black text-rose-700 dark:text-rose-400">{kpi.service_overdue || 0}</span>
                            <span className="text-xs text-rose-500">Overdue!</span>
                        </div>
                    </Card>
                </div>

                {/* Tabs Switcher */}
                <div className="flex border-b border-slate-200 dark:border-slate-700">
                    <button
                        onClick={() => setActiveTab('logs')}
                        className={`py-3 px-6 font-semibold text-sm border-b-2 transition flex items-center space-x-2 ${
                            activeTab === 'logs'
                                ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
                                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
                        }`}
                    >
                        <Clock className="w-4 h-4" />
                        <span>Log HM/KM Harian & Anomali</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('intervals')}
                        className={`py-3 px-6 font-semibold text-sm border-b-2 transition flex items-center space-x-2 ${
                            activeTab === 'intervals'
                                ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
                                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
                        }`}
                    >
                        <Wrench className="w-4 h-4" />
                        <span>Program Servis Berkala (PM Planner)</span>
                        {(kpi.service_due_soon > 0 || kpi.service_overdue > 0) && (
                            <span className="px-2 py-0.5 rounded-full text-xs bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 font-bold">
                                {kpi.service_due_soon + kpi.service_overdue} Alert
                            </span>
                        )}
                    </button>
                </div>

                {activeTab === 'logs' && (
                    <>
                        {/* Filter Bar */}
                        <Card className="p-5 bg-white dark:bg-slate-800">
                            <form onSubmit={handleFilter} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Dari Tanggal</label>
                                    <input
                                        type="date"
                                        value={dateFrom}
                                        onChange={(e) => setDateFrom(e.target.value)}
                                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Sampai Tanggal</label>
                                    <input
                                        type="date"
                                        value={dateTo}
                                        onChange={(e) => setDateTo(e.target.value)}
                                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                    />
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
                                            <option key={u.id} value={u.id}>{u.unit_code}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Shift</label>
                                    <select
                                        value={shiftId}
                                        onChange={(e) => setShiftId(e.target.value)}
                                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                    >
                                        <option value="">Semua Shift</option>
                                        {master.shifts?.map((s) => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex items-center pt-5">
                                    <label className="flex items-center space-x-2 text-xs font-semibold text-rose-600 dark:text-rose-400 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={onlyAnomaly}
                                            onChange={(e) => setOnlyAnomaly(e.target.checked)}
                                            className="rounded text-rose-600 focus:ring-rose-500"
                                        />
                                        <span>Hanya Anomali</span>
                                    </label>
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

                        {/* Logs Table */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                                            <th className="py-3.5 px-4">Tanggal & Shift</th>
                                            <th className="py-3.5 px-4">Armada & Driver</th>
                                            <th className="py-3.5 px-4">Hour Meter (HM)</th>
                                            <th className="py-3.5 px-4">Delta HM</th>
                                            <th className="py-3.5 px-4">Odometer (KM)</th>
                                            <th className="py-3.5 px-4">Delta KM</th>
                                            <th className="py-3.5 px-4">Status & Anomali</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                        {logs.data?.length > 0 ? (
                                            logs.data.map((log) => (
                                                <tr key={log.id} className={`hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors ${
                                                    log.is_anomaly ? 'bg-rose-50/60 dark:bg-rose-950/20' : ''
                                                }`}>
                                                    <td className="py-3.5 px-4">
                                                        <div className="font-bold text-slate-900 dark:text-white">
                                                            {log.log_date}
                                                        </div>
                                                        <div className="text-xs text-slate-500">
                                                            {log.shift?.name} ({log.shift?.code})
                                                        </div>
                                                    </td>

                                                    <td className="py-3.5 px-4">
                                                        <div className="font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                                                            <Truck className="w-4 h-4 text-emerald-600" />
                                                            <span>{log.unit?.unit_code}</span>
                                                        </div>
                                                        <div className="text-xs text-slate-500 dark:text-slate-400">
                                                            {log.driver?.employee?.name || 'Driver Shift'}
                                                        </div>
                                                    </td>

                                                    <td className="py-3.5 px-4 font-mono text-xs">
                                                        <div>Awal: <span className="font-bold text-slate-900 dark:text-white">{Number(log.start_hm).toLocaleString('id-ID')}</span></div>
                                                        <div>Akhir: <span className="font-bold text-slate-900 dark:text-white">{Number(log.end_hm).toLocaleString('id-ID')}</span></div>
                                                    </td>

                                                    <td className="py-3.5 px-4">
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded font-mono font-bold text-xs ${
                                                            log.diff_hm > 14
                                                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                                                : 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300'
                                                        }`}>
                                                            +{Number(log.diff_hm).toFixed(1)} Jam
                                                        </span>
                                                    </td>

                                                    <td className="py-3.5 px-4 font-mono text-xs">
                                                        <div>Awal: <span className="font-bold text-slate-900 dark:text-white">{Number(log.start_km).toLocaleString('id-ID')}</span></div>
                                                        <div>Akhir: <span className="font-bold text-slate-900 dark:text-white">{Number(log.end_km).toLocaleString('id-ID')}</span></div>
                                                    </td>

                                                    <td className="py-3.5 px-4">
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded font-mono font-bold text-xs ${
                                                            log.diff_km > 600
                                                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                                                : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                                        }`}>
                                                            +{Number(log.diff_km).toFixed(1)} KM
                                                        </span>
                                                    </td>

                                                    <td className="py-3.5 px-4">
                                                        {log.is_anomaly ? (
                                                            <div>
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                                                                    <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                                                                    ANOMALI
                                                                </span>
                                                                <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 max-w-xs">
                                                                    {log.anomaly_reason}
                                                                </p>
                                                            </div>
                                                        ) : (
                                                            <span className="inline-flex items-center text-xs text-emerald-600 dark:text-emerald-400">
                                                                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                                                                Valid & Wajar
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="7" className="py-12 text-center text-slate-400 dark:text-slate-500">
                                                    Belum ada histori pencatatan HM/KM sesuai filter yang dipilih.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                    Menampilkan {logs.data?.length || 0} dari {logs.total || 0} catatan operasional
                                </span>
                                <Pagination links={logs.links} />
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'intervals' && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {serviceIntervals.map((interval) => {
                                const isOverdue = interval.status === 'overdue';
                                const isDueSoon = interval.status === 'due_soon';
                                const currentHm = Number(interval.unit?.last_hm || 0);
                                const lastHm = Number(interval.last_service_hm || 0);
                                const nextHm = Number(interval.next_service_hm || 0);
                                const totalCycle = nextHm - lastHm || interval.interval_hm;
                                const progress = Math.min(100, Math.max(0, ((currentHm - lastHm) / totalCycle) * 100));

                                return (
                                    <Card key={interval.id} className={`p-4 bg-white dark:bg-slate-800 border-t-4 ${
                                        isOverdue ? 'border-t-rose-600' : isDueSoon ? 'border-t-amber-500' : 'border-t-emerald-500'
                                    }`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <span className="font-bold text-slate-900 dark:text-white text-base">
                                                    {interval.unit?.unit_code}
                                                </span>
                                                <span className="text-xs text-slate-500 block">
                                                    Program: {interval.service_type} ({interval.interval_hm} HM)
                                                </span>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                                                isOverdue
                                                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 animate-pulse'
                                                    : isDueSoon
                                                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                            }`}>
                                                {interval.status.replace('_', ' ')}
                                            </span>
                                        </div>

                                        <div className="my-3 space-y-1.5">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-slate-500">HM Saat Ini:</span>
                                                <span className="font-mono font-bold text-slate-900 dark:text-white">{currentHm.toLocaleString('id-ID')} HM</span>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span className="text-slate-500">Target Servis:</span>
                                                <span className="font-mono font-bold text-slate-900 dark:text-white">{nextHm.toLocaleString('id-ID')} HM</span>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span className="text-slate-500">Sisa Menuju Servis:</span>
                                                <span className={`font-mono font-bold ${
                                                    isOverdue ? 'text-rose-600' : isDueSoon ? 'text-amber-600' : 'text-emerald-600'
                                                }`}>
                                                    {Number(interval.remaining_hm).toFixed(1)} HM
                                                </span>
                                            </div>

                                            {/* Progress Bar */}
                                            <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden mt-2">
                                                <div
                                                    className={`h-full transition-all duration-500 ${
                                                        isOverdue ? 'bg-rose-600' : isDueSoon ? 'bg-amber-500' : 'bg-emerald-500'
                                                    }`}
                                                    style={{ width: `${progress}%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center text-xs">
                                            <span className="text-slate-400">Servis terakhir: {lastHm} HM</span>
                                            {isOverdue && (
                                                <span className="text-rose-600 font-bold flex items-center">
                                                    <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                                                    Segera Masuk Bengkel
                                                </span>
                                            )}
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Input Log HM/KM Shift */}
            <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Pencatatan HM/KM Awal & Akhir Shift" maxWidth="max-w-2xl">
                <form onSubmit={submitLog} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Armada Unit *</label>
                            <select
                                required
                                value={form.data.unit_id}
                                onChange={(e) => handleUnitSelect(e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            >
                                {master.units?.map((u) => (
                                    <option key={u.id} value={u.id}>{u.unit_code} (HM Terakhir: {u.last_hm})</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Driver Penanggung Jawab</label>
                            <select
                                value={form.data.driver_id}
                                onChange={(e) => form.setData('driver_id', e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            >
                                <option value="">Pilih Driver</option>
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
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            >
                                {master.shifts?.map((s) => (
                                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Tanggal Operasi *</label>
                            <input
                                type="date"
                                required
                                value={form.data.log_date}
                                onChange={(e) => form.setData('log_date', e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl space-y-4">
                        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                            Pencatatan Jam Mesin (Hour Meter)
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">HM Awal Shift</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    required
                                    value={form.data.start_hm}
                                    onChange={(e) => form.setData('start_hm', e.target.value)}
                                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">HM Akhir Shift</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    required
                                    value={form.data.end_hm}
                                    onChange={(e) => form.setData('end_hm', e.target.value)}
                                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                                />
                            </div>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-500">Estimasi Selisih HM Operasi:</span>
                            <span className={`font-mono font-bold text-sm ${
                                Number(calcDeltaHm) > 14 ? 'text-rose-600' : 'text-cyan-600 dark:text-cyan-400'
                            }`}>
                                +{calcDeltaHm} Jam
                            </span>
                        </div>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl space-y-4">
                        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                            Pencatatan Odometer (Kilo Meter)
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">KM Awal Shift</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    required
                                    value={form.data.start_km}
                                    onChange={(e) => form.setData('start_km', e.target.value)}
                                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">KM Akhir Shift</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    required
                                    value={form.data.end_km}
                                    onChange={(e) => form.setData('end_km', e.target.value)}
                                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                                />
                            </div>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-500">Estimasi Selisih Jarak Tempuh:</span>
                            <span className={`font-mono font-bold text-sm ${
                                Number(calcDeltaKm) > 600 ? 'text-rose-600' : 'text-blue-600 dark:text-blue-400'
                            }`}>
                                +{calcDeltaKm} KM
                            </span>
                        </div>
                    </div>

                    {/* Anomaly Detection Banner */}
                    {isCalculatedAnomaly && (
                        <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-900 rounded-xl flex items-center space-x-2 text-xs text-rose-700 dark:text-rose-300">
                            <AlertOctagon className="w-5 h-5 flex-shrink-0" />
                            <span>
                                <strong>Perhatian:</strong> Angka yang dimasukkan terdeteksi anomali (&gt; 14 jam atau &gt; 600 KM dalam 1 shift). Sistem akan memberi tanda investigasi pada data ini.
                            </span>
                        </div>
                    )}

                    {isNegativeDelta && (
                        <div className="p-3 bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-200 text-xs rounded-lg font-bold">
                            Error: Angka Akhir tidak boleh lebih kecil dari Angka Awal!
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Catatan / Alasan Log</label>
                        <input
                            type="text"
                            placeholder="Contoh: Operasi hauling normal, tidak ada kendala mesin"
                            value={form.data.notes}
                            onChange={(e) => form.setData('notes', e.target.value)}
                            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                        />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <Button type="button" variant="secondary" onClick={() => setIsCreateOpen(false)}>
                            Batal
                        </Button>
                        <Button type="submit" variant="primary" disabled={form.processing || isNegativeDelta}>
                            {form.processing ? 'Menyimpan...' : 'Simpan Log & Perbarui PM'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </DashboardLayout>
    );
}
