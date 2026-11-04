import React, { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import {
    Users,
    UserPlus,
    RefreshCw,
    Edit3,
    Trash2,
    X,
    Briefcase,
    Building2,
    Calendar,
    Phone,
    FileText,
} from 'lucide-react';
import DashboardLayout from '../../components/templates/DashboardLayout';
import Button from '../../components/atoms/Button';
import Input from '../../components/atoms/Input';
import Select from '../../components/atoms/Select';
import FormField from '../../components/molecules/FormField';
import Badge from '../../components/atoms/Badge';
import SearchBar from '../../components/molecules/SearchBar';
import PaginationControls from '../../components/molecules/PaginationControls';
import { useAlertStore } from '../../stores/useAlertStore';

export default function EmployeesIndex({
    employees,
    filters = {},
    companies = [],
    sites = [],
    departments = [],
    positions = [],
}) {
    const { confirm } = useAlertStore();

    const [search, setSearch] = useState(filters.search || '');
    const [departmentId, setDepartmentId] = useState(filters.department_id || 'all');
    const [siteId, setSiteId] = useState(filters.site_id || 'all');
    const [status, setStatus] = useState(filters.status || 'all');
    const [employmentStatus, setEmploymentStatus] = useState(filters.employment_status || 'all');
    const [sortBy, setSortBy] = useState(filters.sort_by || 'created_at');
    const [sortDirection, setSortDirection] = useState(filters.sort_direction || 'desc');
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Modal Add/Edit
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [formData, setFormData] = useState({
        employee_code: '',
        nik: '',
        name: '',
        company_id: companies[0]?.id || '',
        site_id: sites[0]?.id || '',
        department_id: departments[0]?.id || '',
        position_id: positions[0]?.id || '',
        join_date: new Date().toISOString().split('T')[0],
        employment_status: 'contract',
        phone: '',
        email: '',
        address: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        document_notes: '',
        is_active: true,
    });

    const isFirstRender = useRef(true);

    const applyFilters = (overrides = {}) => {
        const queryParams = {
            search: overrides.search !== undefined ? overrides.search : search,
            department_id: overrides.department_id !== undefined ? overrides.department_id : departmentId,
            site_id: overrides.site_id !== undefined ? overrides.site_id : siteId,
            status: overrides.status !== undefined ? overrides.status : status,
            employment_status: overrides.employment_status !== undefined ? overrides.employment_status : employmentStatus,
            sort_by: overrides.sortBy !== undefined ? overrides.sortBy : sortBy,
            sort_direction: overrides.sortDirection !== undefined ? overrides.sortDirection : sortDirection,
        };

        if (!queryParams.search) delete queryParams.search;
        if (queryParams.department_id === 'all') delete queryParams.department_id;
        if (queryParams.site_id === 'all') delete queryParams.site_id;
        if (queryParams.status === 'all') delete queryParams.status;
        if (queryParams.employment_status === 'all') delete queryParams.employment_status;

        router.get('/master/employees', queryParams, {
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
        const timer = setTimeout(() => applyFilters({ search }), 400);
        return () => clearTimeout(timer);
    }, [search]);

    const openCreateModal = () => {
        setEditingEmployee(null);
        setFormData({
            employee_code: `TAP-EMP-${Math.floor(100 + Math.random() * 900)}`,
            nik: `64720${Date.now().toString().slice(-11)}`,
            name: '',
            company_id: companies[0]?.id || '',
            site_id: sites[0]?.id || '',
            department_id: departments[0]?.id || '',
            position_id: positions[0]?.id || '',
            join_date: new Date().toISOString().split('T')[0],
            employment_status: 'contract',
            phone: '',
            email: '',
            address: '',
            emergency_contact_name: '',
            emergency_contact_phone: '',
            document_notes: '',
            is_active: true,
        });
        setIsModalOpen(true);
    };

    const openEditModal = (emp) => {
        setEditingEmployee(emp);
        setFormData({
            employee_code: emp.employee_code,
            nik: emp.nik,
            name: emp.name,
            company_id: emp.company_id,
            site_id: emp.site_id,
            department_id: emp.department_id,
            position_id: emp.position_id,
            join_date: emp.join_date ? emp.join_date.split('T')[0] : '',
            employment_status: emp.employment_status,
            phone: emp.phone || '',
            email: emp.email || '',
            address: emp.address || '',
            emergency_contact_name: emp.emergency_contact_name || '',
            emergency_contact_phone: emp.emergency_contact_phone || '',
            document_notes: emp.document_notes || '',
            is_active: emp.is_active,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingEmployee) {
            router.put(`/master/employees/${editingEmployee.id}`, formData, {
                onSuccess: () => setIsModalOpen(false),
            });
        } else {
            router.post('/master/employees', formData, {
                onSuccess: () => setIsModalOpen(false),
            });
        }
    };

    const handleDelete = async (emp) => {
        const ok = await confirm({
            title: `Hapus Karyawan: ${emp.name}?`,
            message: `Karyawan dengan ID ${emp.employee_code} akan dinonaktifkan dan masuk ke histori.`,
            confirmButtonText: 'Ya, Hapus Data',
        });
        if (ok) router.delete(`/master/employees/${emp.id}`);
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'permanent':
                return <Badge variant="success">Tetap</Badge>;
            case 'contract':
                return <Badge variant="primary">Kontrak</Badge>;
            case 'pkwt':
                return <Badge variant="warning">PKWT</Badge>;
            case 'probation':
                return <Badge variant="purple">Probation</Badge>;
            case 'resigned':
            default:
                return <Badge variant="danger">Resigned</Badge>;
        }
    };

    return (
        <DashboardLayout title="Master Data Karyawan (SSR)" breadcrumbs={['Master Data', 'Karyawan']}>
            {/* Action Bar & Filters */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                            <Users className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Direktori Tenaga Kerja TAP</h3>
                            <p className="text-xs text-slate-500">Total {employees.total} karyawan terdaftar di seluruh site proyek.</p>
                        </div>
                    </div>
                    <Button variant="primary" icon={UserPlus} onClick={openCreateModal}>
                        Tambah Karyawan Baru
                    </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="lg:col-span-2">
                        <SearchBar
                            value={search}
                            onChange={(val) => setSearch(val)}
                            onClear={() => { setSearch(''); applyFilters({ search: '' }); }}
                            placeholder="Cari NIK, Nama, atau Employee ID..."
                        />
                    </div>
                    <div>
                        <Select
                            value={departmentId}
                            onChange={(e) => { setDepartmentId(e.target.value); applyFilters({ department_id: e.target.value }); }}
                            options={[{ value: 'all', label: 'Semua Departemen' }, ...departments.map((d) => ({ value: d.id, label: d.name }))]}
                            placeholder=""
                        />
                    </div>
                    <div>
                        <Select
                            value={siteId}
                            onChange={(e) => { setSiteId(e.target.value); applyFilters({ site_id: e.target.value }); }}
                            options={[{ value: 'all', label: 'Semua Site' }, ...sites.map((s) => ({ value: s.id, label: s.name }))]}
                            placeholder=""
                        />
                    </div>
                    <div>
                        <Select
                            value={employmentStatus}
                            onChange={(e) => { setEmploymentStatus(e.target.value); applyFilters({ employment_status: e.target.value }); }}
                            options={[
                                { value: 'all', label: 'Status Kontrak (Semua)' },
                                { value: 'permanent', label: 'Tetap' },
                                { value: 'contract', label: 'Kontrak' },
                                { value: 'pkwt', label: 'PKWT' },
                                { value: 'probation', label: 'Probation' },
                            ]}
                            placeholder=""
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-slate-800/40 uppercase font-semibold text-slate-500 border-b border-slate-200 dark:border-slate-800">
                            <tr>
                                <th className="py-3 px-4">Employee ID & Nama</th>
                                <th className="py-3 px-4">NIK</th>
                                <th className="py-3 px-4">Departemen & Jabatan</th>
                                <th className="py-3 px-4">Penugasan Site</th>
                                <th className="py-3 px-4">Tgl Gabung</th>
                                <th className="py-3 px-4">Status Kerja</th>
                                <th className="py-3 px-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                            {employees.data.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-slate-400">
                                        Tidak ada data karyawan yang sesuai dengan kriteria filter.
                                    </td>
                                </tr>
                            ) : (
                                employees.data.map((emp) => (
                                    <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                        <td className="py-3.5 px-4">
                                            <p className="font-bold text-slate-900 dark:text-white">{emp.name}</p>
                                            <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-mono">{emp.employee_code}</p>
                                        </td>
                                        <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300">{emp.nik}</td>
                                        <td className="py-3.5 px-4">
                                            <p className="font-semibold text-slate-800 dark:text-slate-200">{emp.position?.title || '-'}</p>
                                            <p className="text-[11px] text-slate-400">{emp.department?.name || '-'}</p>
                                        </td>
                                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{emp.site?.name || '-'}</td>
                                        <td className="py-3.5 px-4 text-slate-500">{emp.join_date ? new Date(emp.join_date).toLocaleDateString('id-ID') : '-'}</td>
                                        <td className="py-3.5 px-4">{getStatusBadge(emp.employment_status)}</td>
                                        <td className="py-3.5 px-4 text-right">
                                            <div className="inline-flex items-center gap-1.5">
                                                <button onClick={() => openEditModal(emp)} className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800" title="Edit Karyawan">
                                                    <Edit3 className="w-3.5 h-3.5" />
                                                </button>
                                                <button onClick={() => handleDelete(emp)} className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800" title="Hapus Karyawan">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <PaginationControls links={employees.links} from={employees.from} to={employees.to} total={employees.total} />
            </div>

            {/* Modal Add/Edit */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setIsModalOpen(false)} />
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                                <h3 className="font-bold text-sm text-slate-900 dark:text-white">{editingEmployee ? 'Edit Data Karyawan' : 'Form Karyawan Baru'}</h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                            </div>

                            <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <FormField label="Employee ID" required>
                                        <Input value={formData.employee_code} onChange={(e) => setFormData({ ...formData, employee_code: e.target.value })} required />
                                    </FormField>
                                    <FormField label="NIK (Nomor Induk Kependudukan)" required>
                                        <Input value={formData.nik} onChange={(e) => setFormData({ ...formData, nik: e.target.value })} required />
                                    </FormField>
                                </div>

                                <FormField label="Nama Lengkap Karyawan" required>
                                    <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="cth. Supriyadi" required />
                                </FormField>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <FormField label="Site Penempatan" required>
                                        <Select
                                            value={formData.site_id}
                                            onChange={(e) => setFormData({ ...formData, site_id: e.target.value })}
                                            options={sites.map((s) => ({ value: s.id, label: s.name }))}
                                            placeholder=""
                                        />
                                    </FormField>
                                    <FormField label="Departemen" required>
                                        <Select
                                            value={formData.department_id}
                                            onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                                            options={departments.map((d) => ({ value: d.id, label: d.name }))}
                                            placeholder=""
                                        />
                                    </FormField>
                                    <FormField label="Jabatan" required>
                                        <Select
                                            value={formData.position_id}
                                            onChange={(e) => setFormData({ ...formData, position_id: e.target.value })}
                                            options={positions.map((p) => ({ value: p.id, label: p.title }))}
                                            placeholder=""
                                        />
                                    </FormField>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <FormField label="Tanggal Bergabung" required>
                                        <Input type="date" value={formData.join_date} onChange={(e) => setFormData({ ...formData, join_date: e.target.value })} required />
                                    </FormField>
                                    <FormField label="Status Kepegawaian" required>
                                        <Select
                                            value={formData.employment_status}
                                            onChange={(e) => setFormData({ ...formData, employment_status: e.target.value })}
                                            options={[
                                                { value: 'permanent', label: 'Karyawan Tetap' },
                                                { value: 'contract', label: 'Kontrak PKWT' },
                                                { value: 'probation', label: 'Masa Percobaan' },
                                                { value: 'resigned', label: 'Berhenti / Resigned' },
                                            ]}
                                            placeholder=""
                                        />
                                    </FormField>
                                    <FormField label="Nomor Telepon / WhatsApp">
                                        <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+62 812-xxxx-xxxx" />
                                    </FormField>
                                </div>

                                <FormField label="Alamat Domisili / Mess Site">
                                    <Input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Alamat lengkap atau nama mess karyawan" />
                                </FormField>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <FormField label="Kontak Darurat (Nama)">
                                        <Input value={formData.emergency_contact_name} onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })} placeholder="Nama keluarga / wali" />
                                    </FormField>
                                    <FormField label="No. Telepon Darurat">
                                        <Input value={formData.emergency_contact_phone} onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })} placeholder="+62 8xx-xxxx" />
                                    </FormField>
                                </div>

                                <FormField label="Catatan Dokumen / Sertifikat (KTP, BPJS, Ijazah)">
                                    <Input value={formData.document_notes} onChange={(e) => setFormData({ ...formData, document_notes: e.target.value })} placeholder="KTP terlampir, BPJS Ketenagakerjaan aktif" />
                                </FormField>

                                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                                    <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Batal</Button>
                                    <Button variant="primary" type="submit">Simpan Karyawan</Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
