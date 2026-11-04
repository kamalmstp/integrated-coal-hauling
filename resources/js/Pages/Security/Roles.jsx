import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { ShieldCheck, Plus, Edit3, Trash2, X, Check, Lock, Shield } from 'lucide-react';
import DashboardLayout from '../../components/templates/DashboardLayout';
import Button from '../../components/atoms/Button';
import Input from '../../components/atoms/Input';
import FormField from '../../components/molecules/FormField';
import Badge from '../../components/atoms/Badge';
import { useAlertStore } from '../../stores/useAlertStore';

export default function RolesIndex({ roles = [], permissionsGrouped = {} }) {
    const { confirm } = useAlertStore();

    const [modal, setModal] = useState(false);
    const [editingRole, setEditingRole] = useState(null);
    const [form, setForm] = useState({
        name: '',
        label: '',
        description: '',
        permissions: [],
    });

    const openCreate = () => {
        setEditingRole(null);
        setForm({
            name: '',
            label: '',
            description: '',
            permissions: [],
        });
        setModal(true);
    };

    const openEdit = (role) => {
        setEditingRole(role);
        setForm({
            name: role.name,
            label: role.label,
            description: role.description || '',
            permissions: role.permissions ? role.permissions.map((p) => p.id) : [],
        });
        setModal(true);
    };

    const togglePermission = (permId) => {
        setForm((prev) => {
            const has = prev.permissions.includes(permId);
            return {
                ...prev,
                permissions: has
                    ? prev.permissions.filter((id) => id !== permId)
                    : [...prev.permissions, permId],
            };
        });
    };

    const toggleAllInGroup = (groupPerms) => {
        const groupIds = groupPerms.map((p) => p.id);
        const allSelected = groupIds.every((id) => form.permissions.includes(id));

        setForm((prev) => ({
            ...prev,
            permissions: allSelected
                ? prev.permissions.filter((id) => !groupIds.includes(id))
                : Array.from(new Set([...prev.permissions, ...groupIds])),
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingRole) {
            router.put(`/security/roles/${editingRole.id}`, form, { onSuccess: () => setModal(false) });
        } else {
            router.post('/security/roles', form, { onSuccess: () => setModal(false) });
        }
    };

    const handleDelete = async (role) => {
        const ok = await confirm({
            title: `Hapus Role: ${role.label}?`,
            message: 'Tindakan ini akan menghapus role hak akses ini dari sistem.',
        });
        if (ok) router.delete(`/security/roles/${role.id}`);
    };

    return (
        <DashboardLayout title="Manajemen Role & Hak Akses (RBAC)" breadcrumbs={['Keamanan', 'Role & Permission']}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
                <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Role-Based Access Control (RBAC)</h3>
                    <p className="text-xs text-slate-500">Konfigurasi hak akses berbasis peran untuk mengontrol fungsionalitas backend dan tampilan frontend.</p>
                </div>
                <Button variant="primary" icon={Plus} onClick={openCreate}>Tambah Role Baru</Button>
            </div>

            {/* Roles Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {roles.map((role) => (
                    <div
                        key={role.id}
                        className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4"
                    >
                        <div>
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                                        <ShieldCheck className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{role.label}</h4>
                                        <p className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 font-semibold">{role.name}</p>
                                    </div>
                                </div>
                                <Badge variant="default">{role.users_count || 0} Pengguna</Badge>
                            </div>

                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-3 leading-relaxed">
                                {role.description || 'Tidak ada deskripsi khusus.'}
                            </p>
                        </div>

                        <div>
                            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <span className="text-[11px] font-medium text-slate-500">
                                    {role.permissions ? `${role.permissions.length} Izin Aktif` : '0 Izin'}
                                </span>
                                <div className="flex items-center gap-1.5">
                                    <Button variant="outline" size="sm" icon={Edit3} onClick={() => openEdit(role)}>
                                        Atur Izin
                                    </Button>
                                    {role.name !== 'super_admin' && (
                                        <button
                                            onClick={() => handleDelete(role)}
                                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                                            title="Hapus Role"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal Edit / Create Role */}
            {modal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setModal(false)} />
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                                    {editingRole ? `Konfigurasi Hak Akses: ${editingRole.label}` : 'Tambah Role Baru'}
                                </h3>
                                <button onClick={() => setModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                            </div>

                            <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
                                <div className="grid grid-cols-2 gap-3">
                                    <FormField label="Identifier Role (Unik, Huruf Kecil & Underscore)" required>
                                        <Input
                                            value={form.name}
                                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                                            placeholder="cth. dispatcher_lead"
                                            disabled={Boolean(editingRole)}
                                            required
                                        />
                                    </FormField>
                                    <FormField label="Nama Label Tampilan" required>
                                        <Input
                                            value={form.label}
                                            onChange={(e) => setForm({ ...form, label: e.target.value })}
                                            placeholder="cth. Dispatcher Lead"
                                            required
                                        />
                                    </FormField>
                                </div>

                                <FormField label="Deskripsi Tanggung Jawab">
                                    <Input
                                        value={form.description}
                                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                                        placeholder="Tanggung jawab dan cakupan peran..."
                                    />
                                </FormField>

                                {/* Permission Matrix by Groups */}
                                <div className="pt-2">
                                    <h4 className="font-bold text-slate-900 dark:text-white mb-2">Daftar Hak Akses (Permissions Matrix)</h4>
                                    <div className="max-h-72 overflow-y-auto space-y-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                                        {Object.entries(permissionsGrouped).map(([group, perms]) => (
                                            <div key={group} className="space-y-1.5 pb-2 border-b border-slate-200/50 dark:border-slate-700/50 last:border-b-0">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-bold text-[11px] uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                                                        Modul: {group}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleAllInGroup(perms)}
                                                        className="text-[10px] text-slate-500 hover:underline"
                                                    >
                                                        Pilih / Batal Semua
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                                    {perms.map((p) => {
                                                        const isChecked = form.permissions.includes(p.id);
                                                        return (
                                                            <label
                                                                key={p.id}
                                                                className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors border ${
                                                                    isChecked
                                                                        ? 'bg-indigo-50/60 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800'
                                                                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                                                                }`}
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    className="rounded text-indigo-600"
                                                                    checked={isChecked}
                                                                    onChange={() => togglePermission(p.id)}
                                                                />
                                                                <div>
                                                                    <p className="font-semibold text-slate-800 dark:text-slate-200">{p.label}</p>
                                                                    <p className="text-[10px] font-mono text-slate-400">{p.name}</p>
                                                                </div>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                                    <Button variant="secondary" onClick={() => setModal(false)}>Batal</Button>
                                    <Button variant="primary" type="submit">Simpan Konfigurasi Role</Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
