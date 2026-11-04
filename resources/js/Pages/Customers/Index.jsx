import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { Building2, Plus, Edit3, Trash2, X, Target, Calendar } from 'lucide-react';
import DashboardLayout from '../../components/templates/DashboardLayout';
import Button from '../../components/atoms/Button';
import Input from '../../components/atoms/Input';
import Select from '../../components/atoms/Select';
import FormField from '../../components/molecules/FormField';
import Badge from '../../components/atoms/Badge';
import SearchBar from '../../components/molecules/SearchBar';
import PaginationControls from '../../components/molecules/PaginationControls';
import { useAlertStore } from '../../stores/useAlertStore';

export default function CustomersIndex({ customers, filters = {}, sites = [] }) {
    const { confirm } = useAlertStore();
    const [search, setSearch] = useState(filters.search || '');
    const [siteId, setSiteId] = useState(filters.site_id || 'all');

    const [modal, setModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({
        site_id: sites[0]?.id || '',
        customer_code: '',
        name: '',
        contract_number: '',
        contract_start_date: '2025-01-01',
        contract_end_date: '2027-12-31',
        target_tonnage: 1000000,
        contact_person: '',
        phone: '',
        email: '',
        is_active: true,
    });

    const applyFilters = (overrides = {}) => {
        const queryParams = {
            search: overrides.search !== undefined ? overrides.search : search,
            site_id: overrides.site_id !== undefined ? overrides.site_id : siteId,
        };
        if (!queryParams.search) delete queryParams.search;
        if (queryParams.site_id === 'all') delete queryParams.site_id;

        router.get('/master/customers', queryParams, { preserveState: true, replace: true });
    };

    const openCreate = () => {
        setEditing(null);
        setForm({
            site_id: sites[0]?.id || '',
            customer_code: `CUST-${Math.floor(100 + Math.random() * 900)}`,
            name: '',
            contract_number: `CTR/TAP/${new Date().getFullYear()}/${Math.floor(10 + Math.random() * 90)}`,
            contract_start_date: '2025-01-01',
            contract_end_date: '2027-12-31',
            target_tonnage: 2500000,
            contact_person: '',
            phone: '',
            email: '',
            is_active: true,
        });
        setModal(true);
    };

    const openEdit = (c) => {
        setEditing(c);
        setForm({
            site_id: c.site_id || '',
            customer_code: c.customer_code,
            name: c.name,
            contract_number: c.contract_number || '',
            contract_start_date: c.contract_start_date ? c.contract_start_date.split('T')[0] : '',
            contract_end_date: c.contract_end_date ? c.contract_end_date.split('T')[0] : '',
            target_tonnage: c.target_tonnage,
            contact_person: c.contact_person || '',
            phone: c.phone || '',
            email: c.email || '',
            is_active: c.is_active,
        });
        setModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editing) {
            router.put(`/master/customers/${editing.id}`, form, { onSuccess: () => setModal(false) });
        } else {
            router.post('/master/customers', form, { onSuccess: () => setModal(false) });
        }
    };

    const handleDelete = async (c) => {
        const ok = await confirm({
            title: `Hapus Klien: ${c.name}?`,
            message: 'Tindakan ini akan menghapus data kontrak pemilik konsesi tambang.',
        });
        if (ok) router.delete(`/master/customers/${c.id}`);
    };

    return (
        <DashboardLayout title="Klien & Pemilik Konsesi Tambang (IUP)" breadcrumbs={['Master Data', 'Klien IUP']}>
            {/* Filter Bar */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="w-full sm:max-w-xs">
                    <SearchBar
                        value={search}
                        onChange={(val) => { setSearch(val); applyFilters({ search: val }); }}
                        onClear={() => { setSearch(''); applyFilters({ search: '' }); }}
                        placeholder="Cari Klien, Kontrak, PIC..."
                    />
                </div>
                <div className="flex items-center gap-2.5">
                    <div className="w-40">
                        <Select
                            value={siteId}
                            onChange={(e) => { setSiteId(e.target.value); applyFilters({ site_id: e.target.value }); }}
                            options={[{ value: 'all', label: 'Semua Site' }, ...sites.map((s) => ({ value: s.id, label: s.name }))]}
                            placeholder=""
                        />
                    </div>
                    <Button variant="primary" icon={Plus} onClick={openCreate}>Tambah Klien IUP</Button>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-slate-800/40 uppercase font-semibold text-slate-500 border-b border-slate-200 dark:border-slate-800">
                            <tr>
                                <th className="py-3 px-4">Nama Perusahaan Klien (IUP)</th>
                                <th className="py-3 px-4">Nomor Kontrak</th>
                                <th className="py-3 px-4">Target Ritase / Tonase</th>
                                <th className="py-3 px-4">Site Proyek</th>
                                <th className="py-3 px-4">Periode Kontrak</th>
                                <th className="py-3 px-4">Status</th>
                                <th className="py-3 px-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                            {customers.data.map((c) => (
                                <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                    <td className="py-3.5 px-4">
                                        <p className="font-bold text-slate-900 dark:text-white">{c.name}</p>
                                        <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-mono">{c.customer_code}</p>
                                    </td>
                                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-700 dark:text-slate-300">
                                        {c.contract_number || '-'}
                                    </td>
                                    <td className="py-3.5 px-4">
                                        <span className="font-extrabold text-amber-600 dark:text-amber-400">
                                            {Number(c.target_tonnage).toLocaleString('id-ID')} Ton
                                        </span>
                                    </td>
                                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{c.site?.name || '-'}</td>
                                    <td className="py-3.5 px-4 text-slate-500">
                                        {c.contract_start_date ? new Date(c.contract_start_date).toLocaleDateString('id-ID') : ''} s/d{' '}
                                        {c.contract_end_date ? new Date(c.contract_end_date).toLocaleDateString('id-ID') : ''}
                                    </td>
                                    <td className="py-3.5 px-4">
                                        <Badge variant={c.is_active ? 'success' : 'warning'} dot>
                                            {c.is_active ? 'Kontrak Aktif' : 'Selesai / Nonaktif'}
                                        </Badge>
                                    </td>
                                    <td className="py-3.5 px-4 text-right">
                                        <div className="inline-flex items-center gap-1.5">
                                            <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800">
                                                <Edit3 className="w-3.5 h-3.5" />
                                            </button>
                                            <button onClick={() => handleDelete(c)} className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <PaginationControls links={customers.links} from={customers.from} to={customers.to} total={customers.total} />
            </div>

            {/* Modal */}
            {modal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setModal(false)} />
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                                <h3 className="font-bold text-sm text-slate-900 dark:text-white">{editing ? 'Edit Klien' : 'Tambah Klien IUP Baru'}</h3>
                                <button onClick={() => setModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                            </div>
                            <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-xs">
                                <div className="grid grid-cols-2 gap-3">
                                    <FormField label="Kode Klien" required>
                                        <Input value={form.customer_code} onChange={(e) => setForm({ ...form, customer_code: e.target.value })} required />
                                    </FormField>
                                    <FormField label="Site Penugasan">
                                        <Select
                                            value={form.site_id}
                                            onChange={(e) => setForm({ ...form, site_id: e.target.value })}
                                            options={sites.map((s) => ({ value: s.id, label: s.name }))}
                                            placeholder=""
                                        />
                                    </FormField>
                                </div>
                                <FormField label="Nama Perusahaan Pemilik IUP" required>
                                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="cth. PT Multi Tambangjaya Utama" required />
                                </FormField>
                                <div className="grid grid-cols-2 gap-3">
                                    <FormField label="Nomor Kontrak Kerja">
                                        <Input value={form.contract_number} onChange={(e) => setForm({ ...form, contract_number: e.target.value })} placeholder="CTR/TAP/2026/01" />
                                    </FormField>
                                    <FormField label="Target Tonase (Ton)" required>
                                        <Input type="number" value={form.target_tonnage} onChange={(e) => setForm({ ...form, target_tonnage: e.target.value })} required />
                                    </FormField>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <FormField label="Mulai Kontrak">
                                        <Input type="date" value={form.contract_start_date} onChange={(e) => setForm({ ...form, contract_start_date: e.target.value })} />
                                    </FormField>
                                    <FormField label="Selesai Kontrak">
                                        <Input type="date" value={form.contract_end_date} onChange={(e) => setForm({ ...form, contract_end_date: e.target.value })} />
                                    </FormField>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <FormField label="PIC / Narahubung">
                                        <Input value={form.contact_person} onChange={(e) => setForm({ ...form, contact_person: e.target.value })} />
                                    </FormField>
                                    <FormField label="Telepon / Email">
                                        <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+62 812-xxxx" />
                                    </FormField>
                                </div>
                                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                                    <Button variant="secondary" onClick={() => setModal(false)}>Batal</Button>
                                    <Button variant="primary" type="submit">Simpan Klien</Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
