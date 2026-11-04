import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { Clock, Plus, Edit3, Trash2, X, Moon, Sun } from 'lucide-react';
import DashboardLayout from '../../components/templates/DashboardLayout';
import Button from '../../components/atoms/Button';
import Input from '../../components/atoms/Input';
import Select from '../../components/atoms/Select';
import FormField from '../../components/molecules/FormField';
import Badge from '../../components/atoms/Badge';
import ToggleSwitch from '../../components/atoms/ToggleSwitch';
import PaginationControls from '../../components/molecules/PaginationControls';
import { useAlertStore } from '../../stores/useAlertStore';

export default function ShiftsIndex({ shifts, sites = [] }) {
    const { confirm } = useAlertStore();
    const [modal, setModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({
        site_id: sites[0]?.id || '',
        code: '',
        name: '',
        start_time: '06:00',
        end_time: '18:00',
        is_night_shift: false,
        is_active: true,
    });

    const openCreate = () => {
        setEditing(null);
        setForm({
            site_id: sites[0]?.id || '',
            code: `SHIFT-${Math.floor(10 + Math.random() * 90)}`,
            name: '',
            start_time: '06:00',
            end_time: '18:00',
            is_night_shift: false,
            is_active: true,
        });
        setModal(true);
    };

    const openEdit = (shift) => {
        setEditing(shift);
        setForm({
            site_id: shift.site_id || '',
            code: shift.code,
            name: shift.name,
            start_time: shift.start_time,
            end_time: shift.end_time,
            is_night_shift: shift.is_night_shift,
            is_active: shift.is_active,
        });
        setModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editing) {
            router.put(`/master/shifts/${editing.id}`, form, { onSuccess: () => setModal(false) });
        } else {
            router.post('/master/shifts', form, { onSuccess: () => setModal(false) });
        }
    };

    const handleDelete = async (shift) => {
        const ok = await confirm({
            title: `Hapus Shift: ${shift.name}?`,
            message: 'Tindakan ini akan menghapus jadwal shift operasional.',
        });
        if (ok) router.delete(`/master/shifts/${shift.id}`);
    };

    return (
        <DashboardLayout title="Manajemen Shift Kerja (SSR)" breadcrumbs={['Master Data', 'Shift Kerja']}>
            <div className="flex items-center justify-between pb-3">
                <p className="text-xs text-slate-500">Konfigurasi rotasi waktu operasional hauling batubara.</p>
                <Button variant="primary" icon={Plus} onClick={openCreate}>Tambah Shift</Button>
            </div>

            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-slate-800/40 uppercase font-semibold text-slate-500 border-b border-slate-200 dark:border-slate-800">
                            <tr>
                                <th className="py-3 px-4">Kode & Nama Shift</th>
                                <th className="py-3 px-4">Waktu Operasional</th>
                                <th className="py-3 px-4">Kategori Shift</th>
                                <th className="py-3 px-4">Site</th>
                                <th className="py-3 px-4">Status</th>
                                <th className="py-3 px-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                            {shifts.data.map((shift) => (
                                <tr key={shift.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                    <td className="py-3.5 px-4">
                                        <p className="font-bold text-slate-900 dark:text-white">{shift.name}</p>
                                        <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-mono">{shift.code}</p>
                                    </td>
                                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                                        {shift.start_time} - {shift.end_time}
                                    </td>
                                    <td className="py-3.5 px-4">
                                        {shift.is_night_shift ? (
                                            <span className="inline-flex items-center gap-1.5 text-indigo-700 bg-indigo-50 dark:bg-indigo-950/60 dark:text-indigo-300 px-2 py-0.5 rounded-full font-semibold">
                                                <Moon className="w-3 h-3 text-indigo-500" />
                                                <span>Shift Malam</span>
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 text-amber-700 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-300 px-2 py-0.5 rounded-full font-semibold">
                                                <Sun className="w-3 h-3 text-amber-500" />
                                                <span>Shift Siang</span>
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{shift.site?.name || 'Seluruh Site'}</td>
                                    <td className="py-3.5 px-4">
                                        <Badge variant={shift.is_active ? 'success' : 'warning'} dot>
                                            {shift.is_active ? 'Aktif' : 'Nonaktif'}
                                        </Badge>
                                    </td>
                                    <td className="py-3.5 px-4 text-right">
                                        <div className="inline-flex items-center gap-1.5">
                                            <button onClick={() => openEdit(shift)} className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800">
                                                <Edit3 className="w-3.5 h-3.5" />
                                            </button>
                                            <button onClick={() => handleDelete(shift)} className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <PaginationControls links={shifts.links} from={shifts.from} to={shifts.to} total={shifts.total} />
            </div>

            {/* Modal */}
            {modal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setModal(false)} />
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                                <h3 className="font-bold text-sm text-slate-900 dark:text-white">{editing ? 'Edit Shift' : 'Tambah Shift Baru'}</h3>
                                <button onClick={() => setModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                            </div>
                            <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-xs">
                                <FormField label="Kode Shift" required>
                                    <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
                                </FormField>
                                <FormField label="Nama Shift" required>
                                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="cth. Shift 1 (Siang)" required />
                                </FormField>
                                <div className="grid grid-cols-2 gap-3">
                                    <FormField label="Jam Mulai" required>
                                        <Input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} required />
                                    </FormField>
                                    <FormField label="Jam Selesai" required>
                                        <Input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} required />
                                    </FormField>
                                </div>
                                <div className="py-2">
                                    <ToggleSwitch
                                        checked={form.is_night_shift}
                                        onChange={(val) => setForm({ ...form, is_night_shift: val })}
                                        label="Merupakan Shift Malam (Night Shift)"
                                    />
                                </div>
                                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                                    <Button variant="secondary" onClick={() => setModal(false)}>Batal</Button>
                                    <Button variant="primary" type="submit">Simpan Shift</Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
