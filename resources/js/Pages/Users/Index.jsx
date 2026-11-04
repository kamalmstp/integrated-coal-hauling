import React, { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import {
    Users,
    UserPlus,
    RefreshCw,
    Shield,
    CheckCircle,
    X,
    Search,
    Database,
    Building2,
    MapPin,
    Lock,
    Edit3,
    Trash2,
} from 'lucide-react';
import DashboardLayout from '../../components/templates/DashboardLayout';
import PaginationControls from '../../components/molecules/PaginationControls';
import SearchBar from '../../components/molecules/SearchBar';
import Button from '../../components/atoms/Button';
import Input from '../../components/atoms/Input';
import Select from '../../components/atoms/Select';
import FormField from '../../components/molecules/FormField';
import Badge from '../../components/atoms/Badge';
import Avatar from '../../components/atoms/Avatar';
import { useAlertStore } from '../../stores/useAlertStore';

export default function UsersIndex({
    users,
    filters = {},
    roles = [],
    sites = [],
    companies = [],
    employees = [],
    statistics = {},
}) {
    const { confirm } = useAlertStore();

    // Local filter state
    const [search, setSearch] = useState(filters.search || '');
    const [role, setRole] = useState(filters.role || 'all');
    const [status, setStatus] = useState(filters.status || 'all');
    const [siteId, setSiteId] = useState(filters.site_id || 'all');
    const [sortBy, setSortBy] = useState(filters.sort_by || 'created_at');
    const [sortDirection, setSortDirection] = useState(filters.sort_direction || 'desc');
    const [perPage, setPerPage] = useState(filters.per_page || 10);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Modal state for Add/Edit User
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formErrors, setFormErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'user',
        status: 'active',
        phone: '',
        employee_id: '',
        site_id: '',
        company_id: '',
        role_ids: [],
        password: '',
    });

    const isFirstRender = useRef(true);

    const applyFilters = (newOverrides = {}) => {
        const queryParams = {
            search: newOverrides.search !== undefined ? newOverrides.search : search,
            role: newOverrides.role !== undefined ? newOverrides.role : role,
            status: newOverrides.status !== undefined ? newOverrides.status : status,
            site_id: newOverrides.site_id !== undefined ? newOverrides.site_id : siteId,
            per_page: newOverrides.perPage !== undefined ? newOverrides.perPage : perPage,
            sort_by: newOverrides.sortBy !== undefined ? newOverrides.sortBy : sortBy,
            sort_direction: newOverrides.sortDirection !== undefined ? newOverrides.sortDirection : sortDirection,
        };

        if (!queryParams.search) delete queryParams.search;
        if (queryParams.role === 'all') delete queryParams.role;
        if (queryParams.status === 'all') delete queryParams.status;
        if (queryParams.site_id === 'all') delete queryParams.site_id;
        if (queryParams.per_page === 10) delete queryParams.per_page;
        if (queryParams.sort_by === 'created_at' && queryParams.sort_direction === 'desc') {
            delete queryParams.sort_by;
            delete queryParams.sort_direction;
        }

        router.get('/users', queryParams, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onStart: () => setIsRefreshing(true),
            onFinish: () => setIsRefreshing(false),
        });
    };

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const timer = setTimeout(() => {
            applyFilters({ search });
        }, 400);

        return () => clearTimeout(timer);
    }, [search]);

    const handleSort = (columnKey) => {
        const nextDirection = sortBy === columnKey && sortDirection === 'asc' ? 'desc' : 'asc';
        setSortBy(columnKey);
        setSortDirection(nextDirection);
        applyFilters({ sortBy: columnKey, sortDirection: nextDirection });
    };

    const openCreateModal = () => {
        setEditingUser(null);
        setFormData({
            name: '',
            email: '',
            role: 'dispatcher',
            status: 'active',
            phone: '',
            employee_id: '',
            site_id: sites[0]?.id || '',
            company_id: companies[0]?.id || '',
            role_ids: roles[0] ? [roles[0].id] : [],
            password: '',
        });
        setFormErrors({});
        setIsModalOpen(true);
    };

    const openEditModal = (user) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            role: user.role || 'user',
            status: user.status,
            phone: user.phone || '',
            employee_id: user.employee_id || '',
            site_id: user.site_id || '',
            company_id: user.company_id || '',
            role_ids: user.roles ? user.roles.map((r) => r.id) : [],
            password: '',
        });
        setFormErrors({});
        setIsModalOpen(true);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFormErrors({});

        if (editingUser) {
            router.put(`/users/${editingUser.id}`, formData, {
                onSuccess: () => setIsModalOpen(false),
                onError: (errors) => setFormErrors(errors),
                onFinish: () => setIsSubmitting(false),
            });
        } else {
            router.post('/users', formData, {
                onSuccess: () => setIsModalOpen(false),
                onError: (errors) => setFormErrors(errors),
                onFinish: () => setIsSubmitting(false),
            });
        }
    };

    const handleDeleteUser = async (user) => {
        const isConfirmed = await confirm({
            title: `Hapus Pengguna: ${user.name}?`,
            message: `Akun dengan email ${user.email} akan dipindahkan ke arsip soft delete.`,
            confirmButtonText: 'Ya, Hapus Akun',
            cancelButtonText: 'Batalkan',
            type: 'danger',
        });

        if (isConfirmed) {
            router.delete(`/users/${user.id}`, { preserveScroll: true });
        }
    };

    const getRoleBadge = (user) => {
        if (user.roles && user.roles.length > 0) {
            return (
                <div className="flex flex-wrap gap-1">
                    {user.roles.map((r) => (
                        <Badge key={r.id} variant="purple" size="sm">{r.label}</Badge>
                    ))}
                </div>
            );
        }
        return <Badge variant="default" size="sm">{user.role || 'User'}</Badge>;
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'active':
                return <Badge variant="success" dot>Aktif</Badge>;
            case 'inactive':
                return <Badge variant="warning" dot>Nonaktif</Badge>;
            case 'suspended':
                return <Badge variant="danger" dot>Ditangguhkan</Badge>;
            default:
                return <Badge variant="default">{status}</Badge>;
        }
    };

    return (
        <DashboardLayout title="Manajemen Pengguna & Akun Sistem (SSR)" breadcrumbs={['Keamanan', 'Pengguna']}>
            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Total Akun</span>
                    <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{statistics.total || 0}</p>
                </div>
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                    <span className="text-[10px] font-bold text-emerald-500 uppercase">Akun Aktif</span>
                    <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{statistics.active || 0}</p>
                </div>
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                    <span className="text-[10px] font-bold text-amber-500 uppercase">Nonaktif</span>
                    <p className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">{statistics.inactive || 0}</p>
                </div>
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                    <span className="text-[10px] font-bold text-rose-500 uppercase">Ditangguhkan</span>
                    <p className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1">{statistics.suspended || 0}</p>
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
                            placeholder="Cari Nama, Email, Telepon..."
                        />
                    </div>
                    <div className="flex flex-wrap items-center gap-2.5">
                        <div className="w-40">
                            <Select
                                value={role}
                                onChange={(e) => { setRole(e.target.value); applyFilters({ role: e.target.value }); }}
                                options={[
                                    { value: 'all', label: 'Semua Role' },
                                    ...roles.map((r) => ({ value: r.name, label: r.label })),
                                ]}
                                placeholder=""
                            />
                        </div>
                        <div className="w-32">
                            <Select
                                value={status}
                                onChange={(e) => { setStatus(e.target.value); applyFilters({ status: e.target.value }); }}
                                options={[
                                    { value: 'all', label: 'Semua Status' },
                                    { value: 'active', label: 'Aktif' },
                                    { value: 'inactive', label: 'Nonaktif' },
                                    { value: 'suspended', label: 'Ditangguhkan' },
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
                        <Button variant="primary" icon={UserPlus} onClick={openCreateModal}>
                            Tambah Pengguna
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
                                <th className="py-3 px-4">Pengguna & Email</th>
                                <th className="py-3 px-4">Role / Peran Sistem</th>
                                <th className="py-3 px-4">Karyawan Terhubung</th>
                                <th className="py-3 px-4">Site Penugasan</th>
                                <th className="py-3 px-4">Status Akun</th>
                                <th className="py-3 px-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                            {users.data.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                    <td className="py-3.5 px-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar src={user.avatar} name={user.name} size="sm" />
                                            <div>
                                                <p className="font-bold text-slate-900 dark:text-white">{user.name}</p>
                                                <p className="text-[11px] text-slate-400">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3.5 px-4">{getRoleBadge(user)}</td>
                                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                                        {user.employee ? (
                                            <div>
                                                <p className="font-semibold">{user.employee.name}</p>
                                                <p className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400">{user.employee.employee_code}</p>
                                            </div>
                                        ) : (
                                            <span className="text-slate-400">Akun Khusus / IT</span>
                                        )}
                                    </td>
                                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{user.site?.name || 'Head Office'}</td>
                                    <td className="py-3.5 px-4">{getStatusBadge(user.status)}</td>
                                    <td className="py-3.5 px-4 text-right">
                                        <div className="inline-flex items-center gap-1.5">
                                            <button onClick={() => openEditModal(user)} className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800">
                                                <Edit3 className="w-3.5 h-3.5" />
                                            </button>
                                            <button onClick={() => handleDeleteUser(user)} className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <PaginationControls links={users.links} from={users.from} to={users.to} total={users.total} />
            </div>

            {/* Modal Add/Edit */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setIsModalOpen(false)} />
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                                    {editingUser ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
                                </h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                            </div>

                            <form onSubmit={handleFormSubmit} className="mt-4 space-y-3 text-xs">
                                <FormField label="Nama Lengkap" error={formErrors.name} required>
                                    <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                                </FormField>

                                <FormField label="Alamat Email (Login)" error={formErrors.email} required>
                                    <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                                </FormField>

                                <div className="grid grid-cols-2 gap-3">
                                    <FormField label="Role Hak Akses (RBAC)" required>
                                        <Select
                                            value={formData.role_ids[0] || ''}
                                            onChange={(e) => setFormData({ ...formData, role_ids: [Number(e.target.value)] })}
                                            options={roles.map((r) => ({ value: r.id, label: r.label }))}
                                            placeholder=""
                                        />
                                    </FormField>

                                    <FormField label="Status Akun" required>
                                        <Select
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                            options={[
                                                { value: 'active', label: 'Aktif' },
                                                { value: 'inactive', label: 'Nonaktif' },
                                                { value: 'suspended', label: 'Ditangguhkan' },
                                            ]}
                                            placeholder=""
                                        />
                                    </FormField>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <FormField label="Tautkan ke Karyawan">
                                        <Select
                                            value={formData.employee_id}
                                            onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                                            options={[
                                                { value: '', label: 'Tanpa Tautan Karyawan' },
                                                ...employees.map((emp) => ({ value: emp.id, label: `${emp.name} (${emp.employee_code})` })),
                                            ]}
                                            placeholder=""
                                        />
                                    </FormField>

                                    <FormField label="Site Penugasan">
                                        <Select
                                            value={formData.site_id}
                                            onChange={(e) => setFormData({ ...formData, site_id: e.target.value })}
                                            options={[
                                                { value: '', label: 'Head Office (Semua Site)' },
                                                ...sites.map((s) => ({ value: s.id, label: s.name })),
                                            ]}
                                            placeholder=""
                                        />
                                    </FormField>
                                </div>

                                <FormField label={editingUser ? 'Password (Kosongkan jika tidak diubah)' : 'Password'} required={!editingUser}>
                                    <Input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="Minimal 6 karakter"
                                        required={!editingUser}
                                    />
                                </FormField>

                                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                                    <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Batal</Button>
                                    <Button variant="primary" type="submit" isLoading={isSubmitting}>Simpan Pengguna</Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
