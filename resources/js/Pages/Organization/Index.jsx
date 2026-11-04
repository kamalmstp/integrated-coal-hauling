import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import {
    Building2,
    MapPin,
    Network,
    Briefcase,
    Plus,
    Edit3,
    Trash2,
    X,
    CheckCircle2,
    Users,
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

export default function OrganizationIndex({
    tab = 'sites',
    companies = [],
    sites,
    departments,
    positions,
    filters = {},
}) {
    const { confirm } = useAlertStore();
    const [currentTab, setCurrentTab] = useState(tab);
    const [search, setSearch] = useState(filters.search || '');

    // Modals
    const [modalSite, setModalSite] = useState(false);
    const [editingSite, setEditingSite] = useState(null);
    const [siteForm, setSiteForm] = useState({ company_id: '1', code: '', name: '', location: '', latitude: '', longitude: '', is_active: true });

    const [modalDept, setModalDept] = useState(false);
    const [editingDept, setEditingDept] = useState(null);
    const [deptForm, setDeptForm] = useState({ company_id: '1', code: '', name: '', description: '', is_active: true });

    const [modalPos, setModalPos] = useState(false);
    const [editingPos, setEditingPos] = useState(null);
    const [posForm, setPosForm] = useState({ department_id: '1', parent_id: '', code: '', title: '', level: 2, is_active: true });

    const handleTabChange = (newTab) => {
        setCurrentTab(newTab);
        router.get('/organization', { tab: newTab, search: '' }, { preserveState: true, replace: true });
    };

    const handleSearch = (val) => {
        setSearch(val);
        router.get('/organization', { tab: currentTab, search: val }, { preserveState: true, replace: true });
    };

    // Site Handlers
    const openCreateSite = () => {
        setEditingSite(null);
        setSiteForm({ company_id: companies[0]?.id || '1', code: '', name: '', location: '', latitude: '', longitude: '', is_active: true });
        setModalSite(true);
    };

    const openEditSite = (site) => {
        setEditingSite(site);
        setSiteForm({
            company_id: site.company_id,
            code: site.code,
            name: site.name,
            location: site.location || '',
            latitude: site.latitude || '',
            longitude: site.longitude || '',
            is_active: site.is_active,
        });
        setModalSite(true);
    };

    const submitSite = (e) => {
        e.preventDefault();
        if (editingSite) {
            router.put(`/organization/sites/${editingSite.id}`, siteForm, { onSuccess: () => setModalSite(false) });
        } else {
            router.post('/organization/sites', siteForm, { onSuccess: () => setModalSite(false) });
        }
    };

    const deleteSite = async (site) => {
        const ok = await confirm({
            title: `Hapus Site: ${site.name}?`,
            message: 'Tindakan ini tidak dapat dibatalkan jika site tidak memiliki unit atau karyawan terkait.',
            confirmButtonText: 'Ya, Hapus Site',
        });
        if (ok) router.delete(`/organization/sites/${site.id}`);
    };

    // Department Handlers
    const openCreateDept = () => {
        setEditingDept(null);
        setDeptForm({ company_id: companies[0]?.id || '1', code: '', name: '', description: '', is_active: true });
        setModalDept(true);
    };

    const openEditDept = (dept) => {
        setEditingDept(dept);
        setDeptForm({
            company_id: dept.company_id || '1',
            code: dept.code,
            name: dept.name,
            description: dept.description || '',
            is_active: dept.is_active,
        });
        setModalDept(true);
    };

    const submitDept = (e) => {
        e.preventDefault();
        if (editingDept) {
            router.put(`/organization/departments/${editingDept.id}`, deptForm, { onSuccess: () => setModalDept(false) });
        } else {
            router.post('/organization/departments', deptForm, { onSuccess: () => setModalDept(false) });
        }
    };

    const deleteDept = async (dept) => {
        const ok = await confirm({
            title: `Hapus Departemen: ${dept.name}?`,
            message: 'Pastikan departemen tidak memiliki posisi atau karyawan.',
        });
        if (ok) router.delete(`/organization/departments/${dept.id}`);
    };

    // Position Handlers
    const openCreatePos = () => {
        setEditingPos(null);
        setPosForm({ department_id: departments?.data[0]?.id || '1', parent_id: '', code: '', title: '', level: 2, is_active: true });
        setModalPos(true);
    };

    const openEditPos = (pos) => {
        setEditingPos(pos);
        setPosForm({
            department_id: pos.department_id,
            parent_id: pos.parent_id || '',
            code: pos.code,
            title: pos.title,
            level: pos.level,
            is_active: pos.is_active,
        });
        setModalPos(true);
    };

    const submitPos = (e) => {
        e.preventDefault();
        if (editingPos) {
            router.put(`/organization/positions/${editingPos.id}`, posForm, { onSuccess: () => setModalPos(false) });
        } else {
            router.post('/organization/positions', posForm, { onSuccess: () => setModalPos(false) });
        }
    };

    const deletePos = async (pos) => {
        const ok = await confirm({
            title: `Hapus Jabatan: ${pos.title}?`,
            message: 'Pastikan jabatan tidak memiliki bawahan struktural atau karyawan aktif.',
        });
        if (ok) router.delete(`/organization/positions/${pos.id}`);
    };

    return (
        <DashboardLayout title="Manajemen Organisasi & Site" breadcrumbs={['Organisasi']}>
            {/* Header Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => handleTabChange('sites')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                            currentTab === 'sites'
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                    >
                        <MapPin className="w-4 h-4" />
                        <span>Site / Proyek ({sites?.total || 0})</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => handleTabChange('departments')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                            currentTab === 'departments'
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                    >
                        <Network className="w-4 h-4" />
                        <span>Departemen ({departments?.total || 0})</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => handleTabChange('positions')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                            currentTab === 'positions'
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                    >
                        <Briefcase className="w-4 h-4" />
                        <span>Jabatan & Hirarki ({positions?.total || 0})</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => handleTabChange('company')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                            currentTab === 'company'
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                    >
                        <Building2 className="w-4 h-4" />
                        <span>Profil Entitas TAP</span>
                    </button>
                </div>

                {currentTab !== 'company' && (
                    <div className="flex items-center gap-3">
                        <div className="w-64">
                            <SearchBar
                                value={search}
                                onChange={handleSearch}
                                onClear={() => handleSearch('')}
                                placeholder="Cari nama atau kode..."
                            />
                        </div>
                        {currentTab === 'sites' && (
                            <Button variant="primary" size="sm" icon={Plus} onClick={openCreateSite}>
                                Tambah Site
                            </Button>
                        )}
                        {currentTab === 'departments' && (
                            <Button variant="primary" size="sm" icon={Plus} onClick={openCreateDept}>
                                Tambah Departemen
                            </Button>
                        )}
                        {currentTab === 'positions' && (
                            <Button variant="primary" size="sm" icon={Plus} onClick={openCreatePos}>
                                Tambah Jabatan
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {/* TAB 1: SITES */}
            {currentTab === 'sites' && (
                <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 dark:bg-slate-800/40 uppercase font-semibold text-slate-500 border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="py-3 px-4">Kode & Nama Site</th>
                                    <th className="py-3 px-4">Lokasi Administratif</th>
                                    <th className="py-3 px-4">Armada Terdaftar</th>
                                    <th className="py-3 px-4">Karyawan</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                {sites.data.map((site) => (
                                    <tr key={site.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                        <td className="py-3 px-4">
                                            <p className="font-bold text-slate-900 dark:text-white">{site.name}</p>
                                            <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-mono">{site.code}</p>
                                        </td>
                                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{site.location || '-'}</td>
                                        <td className="py-3 px-4">
                                            <Badge variant="primary">{site.units_count || 0} Unit</Badge>
                                        </td>
                                        <td className="py-3 px-4">
                                            <Badge variant="default">{site.employees_count || 0} Orang</Badge>
                                        </td>
                                        <td className="py-3 px-4">
                                            <Badge variant={site.is_active ? 'success' : 'warning'} dot>
                                                {site.is_active ? 'Aktif' : 'Nonaktif'}
                                            </Badge>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="inline-flex items-center gap-1.5">
                                                <button onClick={() => openEditSite(site)} className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800">
                                                    <Edit3 className="w-3.5 h-3.5" />
                                                </button>
                                                <button onClick={() => deleteSite(site)} className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <PaginationControls links={sites.links} from={sites.from} to={sites.to} total={sites.total} />
                </div>
            )}

            {/* TAB 2: DEPARTMENTS */}
            {currentTab === 'departments' && (
                <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 dark:bg-slate-800/40 uppercase font-semibold text-slate-500 border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="py-3 px-4">Kode & Departemen</th>
                                    <th className="py-3 px-4">Tanggung Jawab / Deskripsi</th>
                                    <th className="py-3 px-4">Jumlah Jabatan</th>
                                    <th className="py-3 px-4">Jumlah Karyawan</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                {departments.data.map((dept) => (
                                    <tr key={dept.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                        <td className="py-3 px-4">
                                            <p className="font-bold text-slate-900 dark:text-white">{dept.name}</p>
                                            <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-mono">{dept.code}</p>
                                        </td>
                                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300 max-w-xs truncate">{dept.description || '-'}</td>
                                        <td className="py-3 px-4"><Badge variant="purple">{dept.positions_count || 0} Jabatan</Badge></td>
                                        <td className="py-3 px-4"><Badge variant="default">{dept.employees_count || 0} Orang</Badge></td>
                                        <td className="py-3 px-4">
                                            <Badge variant={dept.is_active ? 'success' : 'warning'} dot>
                                                {dept.is_active ? 'Aktif' : 'Nonaktif'}
                                            </Badge>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="inline-flex items-center gap-1.5">
                                                <button onClick={() => openEditDept(dept)} className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800">
                                                    <Edit3 className="w-3.5 h-3.5" />
                                                </button>
                                                <button onClick={() => deleteDept(dept)} className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <PaginationControls links={departments.links} from={departments.from} to={departments.to} total={departments.total} />
                </div>
            )}

            {/* TAB 3: POSITIONS & HIERARCHY */}
            {currentTab === 'positions' && (
                <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 dark:bg-slate-800/40 uppercase font-semibold text-slate-500 border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="py-3 px-4">Jabatan (Title)</th>
                                    <th className="py-3 px-4">Departemen</th>
                                    <th className="py-3 px-4">Level & Atasan Langsung</th>
                                    <th className="py-3 px-4">Jumlah Karyawan</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                {positions.data.map((pos) => (
                                    <tr key={pos.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                        <td className="py-3 px-4">
                                            <p className="font-bold text-slate-900 dark:text-white">{pos.title}</p>
                                            <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-mono">{pos.code}</p>
                                        </td>
                                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{pos.department?.name || '-'}</td>
                                        <td className="py-3 px-4">
                                            <span className="font-semibold text-indigo-600 dark:text-indigo-400">Level {pos.level}</span>
                                            {pos.parent && <span className="text-slate-400 text-[11px] block">Lapor ke: {pos.parent.title}</span>}
                                        </td>
                                        <td className="py-3 px-4"><Badge variant="default">{pos.employees_count || 0} Karyawan</Badge></td>
                                        <td className="py-3 px-4">
                                            <Badge variant={pos.is_active ? 'success' : 'warning'} dot>
                                                {pos.is_active ? 'Aktif' : 'Nonaktif'}
                                            </Badge>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="inline-flex items-center gap-1.5">
                                                <button onClick={() => openEditPos(pos)} className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800">
                                                    <Edit3 className="w-3.5 h-3.5" />
                                                </button>
                                                <button onClick={() => deletePos(pos)} className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <PaginationControls links={positions.links} from={positions.from} to={positions.to} total={positions.total} />
                </div>
            )}

            {/* TAB 4: COMPANY PROFILE */}
            {currentTab === 'company' && companies[0] && (
                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs max-w-4xl space-y-6">
                    <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                        <div className="p-3 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 text-white shadow-md">
                            <Building2 className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{companies[0].name}</h2>
                            <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold uppercase tracking-wider">
                                Kode: {companies[0].code} | Entitas Induk Kontraktor Hauling
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                            <span className="text-slate-400 font-semibold uppercase text-[10px]">Alamat Kantor Pusat / Operasional</span>
                            <p className="font-semibold text-slate-800 dark:text-slate-200 mt-1">{companies[0].address}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                            <span className="text-slate-400 font-semibold uppercase text-[10px]">Nomor Pokok Wajib Pajak (NPWP)</span>
                            <p className="font-semibold text-slate-800 dark:text-slate-200 mt-1 font-mono">{companies[0].npwp}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                            <span className="text-slate-400 font-semibold uppercase text-[10px]">Kontak Telepon</span>
                            <p className="font-semibold text-slate-800 dark:text-slate-200 mt-1">{companies[0].phone}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                            <span className="text-slate-400 font-semibold uppercase text-[10px]">Alamat Email Resmi</span>
                            <p className="font-semibold text-slate-800 dark:text-slate-200 mt-1 font-mono">{companies[0].email}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL SITE */}
            {modalSite && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setModalSite(false)} />
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                                <h3 className="font-bold text-sm text-slate-900 dark:text-white">{editingSite ? 'Edit Site Proyek' : 'Tambah Site Proyek'}</h3>
                                <button onClick={() => setModalSite(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                            </div>
                            <form onSubmit={submitSite} className="mt-4 space-y-3">
                                <FormField label="Kode Site (Unik)" required>
                                    <Input value={siteForm.code} onChange={(e) => setSiteForm({ ...siteForm, code: e.target.value })} placeholder="cth. SITE-MTW" required />
                                </FormField>
                                <FormField label="Nama Site / Proyek" required>
                                    <Input value={siteForm.name} onChange={(e) => setSiteForm({ ...siteForm, name: e.target.value })} placeholder="cth. Site Muara Teweh" required />
                                </FormField>
                                <FormField label="Lokasi Geografis">
                                    <Input value={siteForm.location} onChange={(e) => setSiteForm({ ...siteForm, location: e.target.value })} placeholder="Kabupaten Barito Utara, Kalteng" />
                                </FormField>
                                <div className="grid grid-cols-2 gap-3">
                                    <FormField label="Latitude">
                                        <Input value={siteForm.latitude} onChange={(e) => setSiteForm({ ...siteForm, latitude: e.target.value })} placeholder="-0.96324" />
                                    </FormField>
                                    <FormField label="Longitude">
                                        <Input value={siteForm.longitude} onChange={(e) => setSiteForm({ ...siteForm, longitude: e.target.value })} placeholder="114.88765" />
                                    </FormField>
                                </div>
                                <div className="pt-3 flex justify-end gap-2">
                                    <Button variant="secondary" onClick={() => setModalSite(false)}>Batal</Button>
                                    <Button variant="primary" type="submit">Simpan Site</Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL DEPT */}
            {modalDept && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setModalDept(false)} />
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                                <h3 className="font-bold text-sm text-slate-900 dark:text-white">{editingDept ? 'Edit Departemen' : 'Tambah Departemen'}</h3>
                                <button onClick={() => setModalDept(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                            </div>
                            <form onSubmit={submitDept} className="mt-4 space-y-3">
                                <FormField label="Kode Departemen" required>
                                    <Input value={deptForm.code} onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })} placeholder="cth. OPS" required />
                                </FormField>
                                <FormField label="Nama Departemen" required>
                                    <Input value={deptForm.name} onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })} placeholder="cth. Operations & Hauling" required />
                                </FormField>
                                <FormField label="Deskripsi / Tugas Utama">
                                    <Input value={deptForm.description} onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })} placeholder="Manajemen rute hauling dan ritase" />
                                </FormField>
                                <div className="pt-3 flex justify-end gap-2">
                                    <Button variant="secondary" onClick={() => setModalDept(false)}>Batal</Button>
                                    <Button variant="primary" type="submit">Simpan Departemen</Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL POSITION */}
            {modalPos && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setModalPos(false)} />
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                                <h3 className="font-bold text-sm text-slate-900 dark:text-white">{editingPos ? 'Edit Jabatan' : 'Tambah Jabatan Baru'}</h3>
                                <button onClick={() => setModalPos(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                            </div>
                            <form onSubmit={submitPos} className="mt-4 space-y-3">
                                <FormField label="Departemen" required>
                                    <Select
                                        value={posForm.department_id}
                                        onChange={(e) => setPosForm({ ...posForm, department_id: e.target.value })}
                                        options={departments.data.map((d) => ({ value: d.id, label: d.name }))}
                                        placeholder=""
                                    />
                                </FormField>
                                <FormField label="Kode Jabatan" required>
                                    <Input value={posForm.code} onChange={(e) => setPosForm({ ...posForm, code: e.target.value })} placeholder="POS-SPV-HAUL" required />
                                </FormField>
                                <FormField label="Nama Jabatan" required>
                                    <Input value={posForm.title} onChange={(e) => setPosForm({ ...posForm, title: e.target.value })} placeholder="Supervisor Hauling" required />
                                </FormField>
                                <div className="grid grid-cols-2 gap-3">
                                    <FormField label="Level Hirarki">
                                        <Input type="number" value={posForm.level} onChange={(e) => setPosForm({ ...posForm, level: e.target.value })} min="1" max="10" />
                                    </FormField>
                                    <FormField label="Atasan Langsung">
                                        <Select
                                            value={posForm.parent_id}
                                            onChange={(e) => setPosForm({ ...posForm, parent_id: e.target.value })}
                                            options={[
                                                { value: '', label: 'Tidak Ada (Top Level)' },
                                                ...positions.data.map((p) => ({ value: p.id, label: p.title })),
                                            ]}
                                            placeholder=""
                                        />
                                    </FormField>
                                </div>
                                <div className="pt-3 flex justify-end gap-2">
                                    <Button variant="secondary" onClick={() => setModalPos(false)}>Batal</Button>
                                    <Button variant="primary" type="submit">Simpan Jabatan</Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
