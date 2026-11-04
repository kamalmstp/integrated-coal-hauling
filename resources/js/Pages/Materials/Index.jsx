import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { Layers, Plus, Edit3, Trash2, X, Scale } from 'lucide-react';
import DashboardLayout from '../../components/templates/DashboardLayout';
import Button from '../../components/atoms/Button';
import Input from '../../components/atoms/Input';
import Select from '../../components/atoms/Select';
import FormField from '../../components/molecules/FormField';
import Badge from '../../components/atoms/Badge';
import PaginationControls from '../../components/molecules/PaginationControls';
import { useAlertStore } from '../../stores/useAlertStore';

export default function MaterialsIndex({ materials }) {
    const { confirm } = useAlertStore();
    const [modal, setModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({
        code: '',
        name: '',
        unit_of_measure: 'Ton',
        density: 1.300,
        is_active: true,
    });

    const openCreate = () => {
        setEditing(null);
        setForm({
            code: `MAT-${Math.floor(100 + Math.random() * 900)}`,
            name: '',
            unit_of_measure: 'Ton',
            density: 1.300,
            is_active: true,
        });
        setModal(true);
    };

    const openEdit = (m) => {
        setEditing(m);
        setForm({
            code: m.code,
            name: m.name,
            unit_of_measure: m.unit_of_measure,
            density: m.density,
            is_active: m.is_active,
        });
        setModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editing) {
            router.put(`/master/materials/${editing.id}`, form, { onSuccess: () => setModal(false) });
        } else {
            router.post('/master/materials', form, { onSuccess: () => setModal(false) });
        }
    };

    const handleDelete = async (m) => {
        const ok = await confirm({
            title: `Hapus Material: ${m.name}?`,
            message: 'Tindakan ini akan menghapus jenis material dari konfigurasi.',
        });
        if (ok) router.delete(`/master/materials/${m.id}`);
    };

    return (
        <DashboardLayout title="Master Data Jenis Material Tambang (SSR)" breadcrumbs={['Master Data', 'Material']}>
            <div className="flex items-center justify-between pb-3">
                <p className="text-xs text-slate-500">Konfigurasi jenis muatan hauling, satuan ukur (Ton/BCM/Liter), dan densitas material.</p>
                <Button variant="primary" icon={Plus} onClick={openCreate}>Tambah Material</Button>
            </div>

            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-slate-800/40 uppercase font-semibold text-slate-500 border-b border-slate-200 dark:border-slate-800">
                            <tr>
                                <th className="py-3 px-4">Kode & Nama Material</th>
                                <th className="py-3 px-4">Satuan Pengukuran (UoM)</th>
                                <th className="py-3 px-4">Faktor Densitas (Ton/M3)</th>
                                <th className="py-3 px-4">Status</th>
                                <th className="py-3 px-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                            {materials.data.map((m) => (
                                <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                    <td className="py-3.5 px-4">
                                        <p className="font-bold text-slate-900 dark:text-white">{m.name}</p>
                                        <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-mono">{m.code}</p>
                                    </td>
                                    <td className="py-3.5 px-4">
                                        <span className="font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                                            {m.unit_of_measure}
                                        </span>
                                    </td>
                                    <td className="py-3.5 px-4 font-mono font-bold text-amber-600 dark:text-amber-400">
                                        {m.density}
                                    </td>
                                    <td className="py-3.5 px-4">
                                        <Badge variant={m.is_active ? 'success' : 'warning'} dot>
                                            {m.is_active ? 'Aktif' : 'Nonaktif'}
                                        </Badge>
                                    </td>
                                    <td className="py-3.5 px-4 text-right">
                                        <div className="inline-flex items-center gap-1.5">
                                            <button onClick={() => openEdit(m)} className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800">
                                                <Edit3 className="w-3.5 h-3.5" />
                                            </button>
                                            <button onClick={() => handleDelete(m)} className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <PaginationControls links={materials.links} from={materials.from} to={materials.to} total={materials.total} />
            </div>

            {/* Modal */}
            {modal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setModal(false)} />
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                                <h3 className="font-bold text-sm text-slate-900 dark:text-white">{editing ? 'Edit Material' : 'Tambah Jenis Material'}</h3>
                                <button onClick={() => setModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                            </div>
                            <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-xs">
                                <FormField label="Kode Material" required>
                                    <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
                                </FormField>
                                <FormField label="Nama Material" required>
                                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="cth. Coal ROM" required />
                                </FormField>
                                <div className="grid grid-cols-2 gap-3">
                                    <FormField label="Satuan (UoM)" required>
                                        <Select
                                            value={form.unit_of_measure}
                                            onChange={(e) => setForm({ ...form, unit_of_measure: e.target.value })}
                                            options={[
                                                { value: 'Ton', label: 'Ton (Metrik)' },
                                                { value: 'BCM', label: 'BCM (Bank Cubic Meter)' },
                                                { value: 'M3', label: 'M3 (Meter Kubik)' },
                                                { value: 'Liter', label: 'Liter (Bahan Bakar)' },
                                            ]}
                                            placeholder=""
                                        />
                                    </FormField>
                                    <FormField label="Densitas (Ton/M3)" required>
                                        <Input type="number" step="0.001" value={form.density} onChange={(e) => setForm({ ...form, density: e.target.value })} required />
                                    </FormField>
                                </div>
                                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                                    <Button variant="secondary" onClick={() => setModal(false)}>Batal</Button>
                                    <Button variant="primary" type="submit">Simpan Material</Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
