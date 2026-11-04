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
} from 'lucide-react';
import DashboardLayout from '../../components/templates/DashboardLayout';
import DataTable from '../../components/organisms/DataTable';
import PaginationControls from '../../components/molecules/PaginationControls';
import SearchBar from '../../components/molecules/SearchBar';
import FilterDropdown from '../../components/molecules/FilterDropdown';
import Button from '../../components/atoms/Button';
import Input from '../../components/atoms/Input';
import Select from '../../components/atoms/Select';
import FormField from '../../components/molecules/FormField';
import { useAlertStore } from '../../stores/useAlertStore';

export default function UsersIndex({
    users,
    filters = {},
    statistics = {},
}) {
    const { confirm, addAlert } = useAlertStore();

    // Local filter state
    const [search, setSearch] = useState(filters.search || '');
    const [role, setRole] = useState(filters.role || 'all');
    const [status, setStatus] = useState(filters.status || 'all');
    const [perPage, setPerPage] = useState(filters.per_page || 10);
    const [sortBy, setSortBy] = useState(filters.sort_by || 'created_at');
    const [sortDirection, setSortDirection] = useState(filters.sort_direction || 'desc');
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
        password: '',
    });

    const isFirstRender = useRef(true);

    // Apply filters to server (Server Side Processing)
    const applyFilters = (newOverrides = {}) => {
        const queryParams = {
            search: newOverrides.search !== undefined ? newOverrides.search : search,
            role: newOverrides.role !== undefined ? newOverrides.role : role,
            status: newOverrides.status !== undefined ? newOverrides.status : status,
            per_page: newOverrides.perPage !== undefined ? newOverrides.perPage : perPage,
            sort_by: newOverrides.sortBy !== undefined ? newOverrides.sortBy : sortBy,
            sort_direction: newOverrides.sortDirection !== undefined ? newOverrides.sortDirection : sortDirection,
        };

        // Remove empty or 'all' defaults
        if (!queryParams.search) delete queryParams.search;
        if (queryParams.role === 'all') delete queryParams.role;
        if (queryParams.status === 'all') delete queryParams.status;
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

    // Debounced search handling
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

    const handleRoleChange = (newRole) => {
        setRole(newRole);
        applyFilters({ role: newRole });
    };

    const handleStatusChange = (newStatus) => {
        setStatus(newStatus);
        applyFilters({ status: newStatus });
    };

    const handlePerPageChange = (newPerPage) => {
        setPerPage(newPerPage);
        applyFilters({ perPage: newPerPage });
    };

    const handleSort = (columnKey) => {
        const nextDirection = sortBy === columnKey && sortDirection === 'asc' ? 'desc' : 'asc';
        setSortBy(columnKey);
        setSortDirection(nextDirection);
        applyFilters({ sortBy: columnKey, sortDirection: nextDirection });
    };

    const handleResetFilters = () => {
        setSearch('');
        setRole('all');
        setStatus('all');
        setPerPage(10);
        setSortBy('created_at');
        setSortDirection('desc');
        router.get('/users', {}, { preserveState: true, replace: true });
    };

    // Open Modal for Create
    const openCreateModal = () => {
        setEditingUser(null);
        setFormData({
            name: '',
            email: '',
            role: 'user',
            status: 'active',
            phone: '',
            password: '',
        });
        setFormErrors({});
        setIsModalOpen(true);
    };

    // Open Modal for Edit
    const openEditModal = (user) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
            phone: user.phone || '',
            password: '',
        });
        setFormErrors({});
        setIsModalOpen(true);
    };

    // Submit Create or Edit Form
    const handleFormSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFormErrors({});

        if (editingUser) {
            // Update User
            router.put(`/users/${editingUser.id}`, formData, {
                onSuccess: () => {
                    setIsModalOpen(false);
                },
                onError: (errors) => {
                    setFormErrors(errors);
                },
                onFinish: () => setIsSubmitting(false),
            });
        } else {
            // Create User
            router.post('/users', formData, {
                onSuccess: () => {
                    setIsModalOpen(false);
                },
                onError: (errors) => {
                    setFormErrors(errors);
                },
                onFinish: () => setIsSubmitting(false),
            });
        }
    };

    // Delete User with Confirm Dialog
    const handleDeleteUser = async (user) => {
        const isConfirmed = await confirm({
            title: `Hapus Pengguna: ${user.name}?`,
            message: `Data pengguna dengan email ${user.email} akan dihapus secara permanen dari basis data MySQL.`,
            confirmButtonText: 'Ya, Hapus Pengguna',
            cancelButtonText: 'Batalkan',
            type: 'danger',
        });

        if (isConfirmed) {
            router.delete(`/users/${user.id}`, {
                preserveScroll: true,
            });
        }
    };

    return (
        <DashboardLayout title="Manajemen Pengguna (SSR)" breadcrumbs={['Data Pengguna']}>
            {/* Server-Side Rendering Banner */}
            <div className="p-5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-indigo-600 text-white shadow-sm">
                        <Database className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                Server Side Rendering & Processing Active
                            </h3>
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                Realtime MySQL
                            </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                            Pencarian, filter per role/status, sorting dinamis, dan pagination diolah langsung di server side melalui Laravel Eloquent.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Button
                        variant="primary"
                        icon={UserPlus}
                        onClick={openCreateModal}
                        className="w-full md:w-auto"
                    >
                        Tambah Pengguna Baru
                    </Button>
                </div>
            </div>

            {/* Main Table Card */}
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
                {/* Search & Filter Toolbar */}
                <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Search Bar Molecule */}
                    <div className="w-full lg:max-w-xs">
                        <SearchBar
                            value={search}
                            onChange={(val) => setSearch(val)}
                            onClear={() => {
                                setSearch('');
                                applyFilters({ search: '' });
                            }}
                            placeholder="Cari nama, email, atau telepon..."
                        />
                    </div>

                    {/* Filter Dropdown Molecule */}
                    <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 w-full lg:w-auto">
                        <FilterDropdown
                            role={role}
                            status={status}
                            perPage={perPage}
                            onRoleChange={handleRoleChange}
                            onStatusChange={handleStatusChange}
                            onPerPageChange={handlePerPageChange}
                        />

                        {(search || role !== 'all' || status !== 'all' || perPage !== 10) && (
                            <Button
                                variant="ghost"
                                size="sm"
                                icon={RefreshCw}
                                onClick={handleResetFilters}
                                className="text-slate-500 hover:text-slate-700"
                            >
                                Reset Filter
                            </Button>
                        )}
                    </div>
                </div>

                {/* Data Table Organism */}
                <div className="relative">
                    {isRefreshing && (
                        <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-2xs z-10 flex items-center justify-center">
                            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-full shadow-md">
                                Memuat data server...
                            </span>
                        </div>
                    )}

                    <DataTable
                        users={users.data}
                        sortBy={sortBy}
                        sortDirection={sortDirection}
                        onSort={handleSort}
                        onEdit={openEditModal}
                        onDelete={handleDeleteUser}
                    />
                </div>

                {/* Server-Side Pagination Controls Molecule */}
                <PaginationControls
                    links={users.links}
                    from={users.from}
                    to={users.to}
                    total={users.total}
                />
            </div>

            {/* Create/Edit User Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
                        onClick={() => setIsModalOpen(false)}
                    />
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div
                            className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 transition-all"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                    {editingUser ? 'Edit Data Pengguna' : 'Tambah Pengguna Baru'}
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleFormSubmit} className="mt-4 space-y-4">
                                <FormField label="Nama Lengkap" error={formErrors.name} required>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="cth. Budi Santoso"
                                        error={Boolean(formErrors.name)}
                                        required
                                    />
                                </FormField>

                                <FormField label="Alamat Email" error={formErrors.email} required>
                                    <Input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="cth. budi@example.com"
                                        error={Boolean(formErrors.email)}
                                        required
                                    />
                                </FormField>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <FormField label="Peran (Role)" error={formErrors.role} required>
                                        <Select
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                            options={[
                                                { value: 'user', label: 'User Biasa' },
                                                { value: 'editor', label: 'Editor' },
                                                { value: 'manager', label: 'Manager' },
                                                { value: 'admin', label: 'Administrator' },
                                            ]}
                                            placeholder=""
                                            error={Boolean(formErrors.role)}
                                        />
                                    </FormField>

                                    <FormField label="Status Akun" error={formErrors.status} required>
                                        <Select
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                            options={[
                                                { value: 'active', label: 'Aktif' },
                                                { value: 'inactive', label: 'Nonaktif' },
                                                { value: 'suspended', label: 'Ditangguhkan' },
                                            ]}
                                            placeholder=""
                                            error={Boolean(formErrors.status)}
                                        />
                                    </FormField>
                                </div>

                                <FormField label="No. Telepon" error={formErrors.phone}>
                                    <Input
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="+62 812-3456-7890"
                                        error={Boolean(formErrors.phone)}
                                    />
                                </FormField>

                                <FormField
                                    label={editingUser ? 'Password (Kosongkan jika tidak diubah)' : 'Password'}
                                    error={formErrors.password}
                                    required={!editingUser}
                                >
                                    <Input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="Minimal 6 karakter"
                                        error={Boolean(formErrors.password)}
                                        required={!editingUser}
                                    />
                                </FormField>

                                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                                    <Button
                                        variant="secondary"
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                    >
                                        Batal
                                    </Button>
                                    <Button
                                        variant="primary"
                                        type="submit"
                                        isLoading={isSubmitting}
                                    >
                                        {editingUser ? 'Simpan Perubahan' : 'Buat Pengguna'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
