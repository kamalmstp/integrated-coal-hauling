import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    Smartphone,
    Wrench,
    Clock,
    Camera,
    CheckCircle2,
    AlertTriangle,
    ArrowLeft,
    Truck,
    CheckSquare,
    Save,
    Calendar,
    User,
    ChevronDown,
    Activity,
    Layers,
} from 'lucide-react';

export default function MobilePortal({
    selectedMechanicId = 1,
    mechanicsList = [],
    assignedOrders = [],
    myLogs = [],
}) {
    const currentMech = mechanicsList.find((m) => m.id === selectedMechanicId) || mechanicsList[0];

    const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'form', 'history'
    const [selectedOrder, setSelectedOrder] = useState(assignedOrders[0] || null);

    // Form: Mobile Log Work
    const form = useForm({
        mechanic_id: selectedMechanicId,
        work_order_id: assignedOrders[0]?.id || '',
        log_date: new Date().toISOString().slice(0, 10),
        start_time: '08:00',
        end_time: '12:00',
        duration_hours: 4.0,
        diagnosis: '',
        action_taken: '',
        work_notes: '',
        photo_before: '',
        photo_after: '',
        status_update: 'in_progress',
    });

    const handleMechanicChange = (id) => {
        router.get('/maintenance/mechanic-portal', { mechanic_id: id });
    };

    const handleSelectOrder = (order) => {
        setSelectedOrder(order);
        form.setData((data) => ({
            ...data,
            work_order_id: order.id,
            diagnosis: order.diagnosis || '',
            status_update: order.status === 'open' ? 'in_progress' : order.status,
        }));
        setActiveTab('form');
    };

    const calculateDuration = (start, end) => {
        if (!start || !end) return;
        const [sh, sm] = start.split(':').map(Number);
        const [eh, em] = end.split(':').map(Number);
        const diff = (eh * 60 + em) - (sh * 60 + sm);
        if (diff > 0) {
            form.setData('duration_hours', Math.round((diff / 60) * 10) / 10);
        }
    };

    const handleSubmitLog = (e) => {
        e.preventDefault();
        form.post('/maintenance/mechanic-portal/work-log', {
            onSuccess: () => {
                setActiveTab('history');
                form.reset('action_taken', 'work_notes', 'photo_before', 'photo_after');
            },
        });
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between max-w-md mx-auto shadow-2xl relative">
            <Head title="Mechanic Mobile Portal — TAP Maintenance" />

            {/* Mobile Header Bar */}
            <div className="sticky top-0 z-30 bg-slate-800/95 backdrop-blur border-b border-slate-700 p-4">
                <div className="flex items-center justify-between">
                    <Link
                        href="/maintenance/mechanics"
                        className="p-1.5 rounded-lg bg-slate-700 text-slate-300 hover:text-white flex items-center gap-1 text-xs"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Desktop</span>
                    </Link>

                    <div className="text-center">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-800">
                            TAP WORKSHOP MOBILE
                        </span>
                        <h2 className="text-sm font-bold text-white mt-0.5">Portal Kerja Mekanik</h2>
                    </div>

                    <div className="w-8"></div>
                </div>

                {/* Mechanic Profile Switcher */}
                <div className="mt-3 bg-slate-900/80 p-2.5 rounded-xl border border-slate-700/80 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-cyan-600 text-white font-bold flex items-center justify-center text-xs">
                            {currentMech?.name?.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                            <p className="text-xs font-bold text-white leading-tight">{currentMech?.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{currentMech?.employee_code}</p>
                        </div>
                    </div>

                    <select
                        value={selectedMechanicId}
                        onChange={(e) => handleMechanicChange(e.target.value)}
                        className="text-xs bg-slate-800 text-slate-200 border border-slate-600 rounded-lg px-2 py-1 max-w-[120px] truncate"
                    >
                        {mechanicsList.map((m) => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Body Tabs Content */}
            <div className="flex-1 p-4 overflow-y-auto pb-24">
                {activeTab === 'orders' && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                <Wrench className="w-3.5 h-3.5 text-cyan-400" />
                                Tugas Work Order Aktif ({assignedOrders.length})
                            </h3>
                            <span className="text-[10px] text-cyan-400 font-mono">Ketuk untuk lapor</span>
                        </div>

                        {assignedOrders.length > 0 ? (
                            assignedOrders.map((order) => (
                                <div
                                    key={order.id}
                                    onClick={() => handleSelectOrder(order)}
                                    className="p-3.5 rounded-xl bg-slate-800 border border-slate-700/80 hover:border-cyan-500 cursor-pointer transition shadow-md"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                                                <Truck className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-bold text-white text-sm">{order.unit?.unit_code}</span>
                                                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase ${order.priority === 'critical' ? 'bg-red-500 text-white' : order.priority === 'high' ? 'bg-orange-500 text-white' : 'bg-blue-500 text-white'}`}>
                                                        {order.priority}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-slate-400">{order.wo_number}</p>
                                            </div>
                                        </div>

                                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-700 text-cyan-300">
                                            {order.status?.replace('_', ' ')}
                                        </span>
                                    </div>

                                    <div className="mt-2.5 text-xs text-slate-300 font-medium line-clamp-2">
                                        {order.defect_summary}
                                    </div>

                                    {order.tasks?.length > 0 && (
                                        <div className="mt-2 pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
                                            <span>Task: {order.tasks.filter(t => t.status === 'completed').length} / {order.tasks.length} selesai</span>
                                            <span className="text-cyan-400 font-semibold">Isi Log & Progres &rarr;</span>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="py-12 text-center text-slate-500 text-xs">
                                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-60" />
                                Tidak ada Work Order aktif yang ditugaskan ke Anda saat ini.
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'form' && (
                    <form onSubmit={handleSubmitLog} className="space-y-4">
                        <div className="p-3 bg-cyan-950/40 rounded-xl border border-cyan-800 text-xs">
                            <span className="text-cyan-400 font-bold uppercase block text-[10px]">Work Order Terpilih:</span>
                            <div className="flex justify-between items-center mt-1">
                                <span className="font-bold text-white text-sm">{selectedOrder?.unit?.unit_code || 'Pilih WO'}</span>
                                <span className="font-mono text-slate-400">{selectedOrder?.wo_number}</span>
                            </div>
                            <p className="text-slate-300 text-[11px] mt-0.5 line-clamp-1">{selectedOrder?.defect_summary}</p>
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Pilih Work Order Target *</label>
                            <select
                                value={form.data.work_order_id}
                                onChange={(e) => {
                                    form.setData('work_order_id', e.target.value);
                                    const ord = assignedOrders.find((o) => o.id === parseInt(e.target.value));
                                    if (ord) setSelectedOrder(ord);
                                }}
                                className="w-full text-xs rounded-lg border border-slate-700 bg-slate-800 text-white py-2 px-3"
                                required
                            >
                                {assignedOrders.map((ord) => (
                                    <option key={ord.id} value={ord.id}>{ord.unit?.unit_code} - {ord.wo_number}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Jam Mulai *</label>
                                <input
                                    type="time"
                                    value={form.data.start_time}
                                    onChange={(e) => {
                                        form.setData('start_time', e.target.value);
                                        calculateDuration(e.target.value, form.data.end_time);
                                    }}
                                    className="w-full text-xs rounded-lg border border-slate-700 bg-slate-800 text-white py-2 px-3 font-mono"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Jam Selesai *</label>
                                <input
                                    type="time"
                                    value={form.data.end_time}
                                    onChange={(e) => {
                                        form.setData('end_time', e.target.value);
                                        calculateDuration(form.data.start_time, e.target.value);
                                    }}
                                    className="w-full text-xs rounded-lg border border-slate-700 bg-slate-800 text-white py-2 px-3 font-mono"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Durasi Pengerjaan (Jam) *</label>
                            <input
                                type="number"
                                step="0.1"
                                value={form.data.duration_hours}
                                onChange={(e) => form.setData('duration_hours', parseFloat(e.target.value))}
                                className="w-full text-xs rounded-lg border border-slate-700 bg-slate-800 text-cyan-300 font-bold font-mono py-2 px-3"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Diagnosa / Temuan Mekanik</label>
                            <input
                                type="text"
                                placeholder="Contoh: Seal cylinder bocor dan hose tekanan tinggi retak"
                                value={form.data.diagnosis}
                                onChange={(e) => form.setData('diagnosis', e.target.value)}
                                className="w-full text-xs rounded-lg border border-slate-700 bg-slate-800 text-white py-2 px-3"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Tindakan / Action Taken *</label>
                            <textarea
                                rows="3"
                                placeholder="Jelaskan apa yang sudah dibongkar, diganti, atau distel..."
                                value={form.data.action_taken}
                                onChange={(e) => form.setData('action_taken', e.target.value)}
                                className="w-full text-xs rounded-lg border border-slate-700 bg-slate-800 text-white py-2 px-3"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1 flex items-center gap-1">
                                    <Camera className="w-3 h-3 text-cyan-400" /> Foto Sebelum (URL)
                                </label>
                                <input
                                    type="text"
                                    placeholder="https://... atau upload"
                                    value={form.data.photo_before}
                                    onChange={(e) => form.setData('photo_before', e.target.value)}
                                    className="w-full text-[11px] rounded-lg border border-slate-700 bg-slate-800 text-white py-1.5 px-2"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1 flex items-center gap-1">
                                    <Camera className="w-3 h-3 text-emerald-400" /> Foto Sesudah (URL)
                                </label>
                                <input
                                    type="text"
                                    placeholder="https://... atau upload"
                                    value={form.data.photo_after}
                                    onChange={(e) => form.setData('photo_after', e.target.value)}
                                    className="w-full text-[11px] rounded-lg border border-slate-700 bg-slate-800 text-white py-1.5 px-2"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Status Progres Work Order *</label>
                            <select
                                value={form.data.status_update}
                                onChange={(e) => form.setData('status_update', e.target.value)}
                                className="w-full text-xs rounded-lg border border-slate-700 bg-slate-800 text-white py-2 px-3 font-semibold"
                                required
                            >
                                <option value="in_progress">In Progress (Pengerjaan Masih Berlanjut)</option>
                                <option value="waiting_sparepart">Waiting Sparepart (Menunggu Suku Cadang)</option>
                                <option value="waiting_inspection">Waiting Inspection (Selesai Perbaikan, Siap QA)</option>
                                <option value="completed">Completed (Selesai Sepenuhnya)</option>
                            </select>
                        </div>

                        <Button
                            type="submit"
                            disabled={form.processing}
                            className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold text-sm rounded-xl shadow-lg flex items-center justify-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            {form.processing ? 'Menyimpan Log...' : 'Kirim Log Kerja ke Workshop'}
                        </Button>
                    </form>
                )}

                {activeTab === 'history' && (
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-cyan-400" />
                            Riwayat Log Kerja Terakhir ({myLogs.length})
                        </h3>

                        {myLogs.length > 0 ? (
                            myLogs.map((log) => (
                                <div key={log.id} className="p-3 bg-slate-800 rounded-xl border border-slate-700 text-xs">
                                    <div className="flex justify-between items-center font-semibold text-white">
                                        <span>Unit: {log.work_order?.unit?.unit_code}</span>
                                        <span className="font-mono text-cyan-400 font-bold">{log.duration_hours} Jam</span>
                                    </div>
                                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">{log.log_date} ({log.start_time?.slice(11, 16) || '08:00'} - {log.end_time?.slice(11, 16) || '12:00'})</p>
                                    <p className="text-slate-200 mt-1 font-medium">{log.action_taken}</p>
                                    {log.diagnosis && (
                                        <p className="text-[11px] text-slate-400 italic mt-0.5">Diagnosa: {log.diagnosis}</p>
                                    )}
                                    <div className="mt-2 pt-2 border-t border-slate-700/60 flex justify-between items-center text-[10px] text-slate-400">
                                        <span>WO: {log.work_order?.wo_number}</span>
                                        <span className="uppercase text-cyan-300 font-mono">{log.status_update || 'in_progress'}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-8 text-center text-slate-500 text-xs">
                                Belum ada riwayat kerja yang dikirim.
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Mobile Bottom Navigation Bar */}
            <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-slate-800/95 backdrop-blur border-t border-slate-700 p-2 z-30 grid grid-cols-3 gap-1">
                <button
                    onClick={() => setActiveTab('orders')}
                    className={`flex flex-col items-center justify-center py-1.5 rounded-lg text-xs font-semibold transition ${activeTab === 'orders' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                    <Wrench className="w-4 h-4 mb-0.5" />
                    <span>Tugas WO</span>
                </button>

                <button
                    onClick={() => setActiveTab('form')}
                    className={`flex flex-col items-center justify-center py-1.5 rounded-lg text-xs font-semibold transition ${activeTab === 'form' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                    <Save className="w-4 h-4 mb-0.5" />
                    <span>Input Log</span>
                </button>

                <button
                    onClick={() => setActiveTab('history')}
                    className={`flex flex-col items-center justify-center py-1.5 rounded-lg text-xs font-semibold transition ${activeTab === 'history' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                    <Clock className="w-4 h-4 mb-0.5" />
                    <span>Riwayat</span>
                </button>
            </div>
        </div>
    );
}
