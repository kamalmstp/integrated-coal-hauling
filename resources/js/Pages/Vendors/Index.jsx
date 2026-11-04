import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { Briefcase, Plus, Edit3, Trash2, X, Phone, Mail, FileText } from 'lucide-react';
import DashboardLayout from '../../components/templates/DashboardLayout';
import Button from '../../components/atoms/Button';
import Input from '../../components/atoms/Input';
import Select from '../../components/atoms/Select';
import FormField from '../../components/molecules/FormField';
import Badge from '../../components/atoms/Badge';
import SearchBar from '../../components/molecules/SearchBar';
import PaginationControls from '../../components/molecules/PaginationControls';
import { useAlertStore } from '../../stores/useAlertStore';

export default function VendorsIndex({ vendors, filters = {} }) {
    const { confirm } = useAlertStore();
    const [search, setSearch] = useState(filters.search || '');
    const [vendorType, setVendorType] = useState(filters.vendor_type || 'all');

    const [modal, setModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({
        vendor_code: '',
        name: '',
        vendor_type: 'spareparts',
        address: '',
        contact_person: '',
        phone: '',
        email: '',
        npwp: '',
        is_active: true,
    });

    const applyFilters = (overrides = {}) => {
        const queryParams = {
            search: overrides.search !== undefined ? overrides.search : search,
            vendor_type: overrides.vendor_type !== undefined ? overrides.vendor_type : vendorType,
        };
        if (!queryParams.search) delete queryParams.search;
        if (queryParams.vendor_type === 'all') delete queryParams.vendor_type;

        router.get('/master/vendors', queryParams, { preserveState: true, replace: true });
    };

    const openCreate = () => {
        setEditing(null);
        setForm({
            vendor_code: `VND-${Math.floor(100 + Math.random() * 900)}`,
            name: '',
            vendor_type: 'spareparts',
            address: '',
            contact_person: '',
            phone: '',
            email: '',
            npwp: '',
            is_active: true,
        });
        setModal(true);
    };

    const openEdit = (v) => {
        setEditing(v);
        setForm({
            vendor_code: v.vendor_code,
            name: v.name,
            vendor_type: v.vendor_type,
            address: v.address || '',
            contact_person: v.contact_person || '',
            phone: v.phone || '',
            email: v.email || '',
            npwp: v.npwp || '',
            is_active: v.is_active,
        });
        setModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editing) {
            router.put(`/master/vendors/${editing.id}`, form, { onSuccess: () => setModal(false) });
        } else {
            router.post('/master/vendors', form, { onSuccess: () => setModal(false) });
        }
    };

    const handleDelete = async (v) => {
        const ok = await confirm({
            title: `Hapus Vendor: ${v.name}?`,
            message: 'Pastikan vendor tidak memiliki kontrak unit rental yang sedang berjalan.',
        });
        if (ok) router.delete(`/master/vendors/${v.id}`);
    };

    const getTypeLabel = (t) => {
        const map = {
            spareparts: 'Spare Parts & Komponen',
            tyre: 'Ban / Tyre Dump Truck',
            fuel: 'Bahan Bakar Solar (HSD)',
            subcontractor: 'Sub-kontraktor Hauling',
            rental: 'Rental Alat Berat / Unit',
            service: 'Service & Maintenance',
        };
        return map[t] || t;
    };

    return (
        <DashboardLayout title="Master Vendor & Rekanan Bisnis (SSR)" breadcrumbs={['Master Data', 'Vendor']}>
            {/* Filter Bar */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="w-full sm:max-w-xs">
                    <SearchBar
                        value={search}
                        onChange={(val) => { setSearch(val); applyFilters({ search: val }); }}
                        onClear={() => { setSearch(''); applyFilters({ search: '' }); }}
                        placeholder="Cari Vendor, PIC, Telepon..."
                    />
                </div>
                <div className="flex items-center gap-2.5">
                    <div className="w-48">
                        <Select
                            value={vendorType}
                            onChange={(e) => { setVendorType(e.target.value); applyFilters({ vendor_type: e.target.value }); }}
                            options={[
                                { value: 'all', label: 'Semua Kategori Vendor' },
                                { value: 'spareparts', label: 'Spare Parts' },
                                { value: 'tyre', label: 'Ban / Tyre' },
                                { value: 'fuel', label: 'Fuel / Solar' },
                                { value: 'subcontractor', label: 'Subkontraktor' },
                                { value: 'rental', label: 'Rental Unit' },
                                { value: 'service', label: 'Service & Jasa' },
                            ]}
                            placeholder=""
                        />
                    </div>
                    <Button variant="primary" icon={Plus} onClick={openCreate}>Tambah Vendor</Button>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-slate-800/40 uppercase font-semibold text-slate-500 border-b border-slate-200 dark:border-slate-800">
                            <tr>
                                <th className="py-3 px-4">Kode & Nama Vendor</th>
                                <th className="py-3 px-4">Kategori Layanan</th>
                                <th className="py-3 px-4">Kontak Person (PIC)</th>
                                <th className="py-3 px-4">Unit Terkait</th>
                                <th className="py-3 px-4">Status</th>
                                <th className="py-3 px-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                            {vendors.data.map((v) => (
                                <tr key={v.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                    <td className="py-3.5 px-4">
                                        <p className="font-bold text-slate-900 dark:text-white">{v.name}</p>
                                        <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-mono">{v.vendor_code}</p>
                                    </td>
                                    <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                                        {getTypeLabel(v.vendor_type)}
                                    </td>
                                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                                        <p className="font-semibold">{v.contact_person || '-'}</p>
                                        <p className="text-[11px] text-slate-400">{v.phone || v.email || '-'}</p>
                                    </td>
                                    <td className="py-3.5 px-4">
                                        <Badge variant="primary">{v.units_count || 0} Unit</Badge>
                                    </td>
                                    <td className="py-3.5 px-4">
                                        <Badge variant={v.is_active ? 'success' : 'warning'} dot>
                                            {v.is_active ? 'Mitra Aktif' : 'Nonaktif'}
                                        </Badge>
                                    </td>
                                    <td className="py-3.5 px-4 text-right">
                                        <div className="inline-flex items-center gap-1.5">
                                            <button onClick={() => openEdit(v)} className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800">
                                                <Edit3 className="w-3.5 h-3.5" />
                                            </button>
                                            <button onClick={() => handleDelete(v)} className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <PaginationControls links={vendors.links} from={vendors.from} to={vendors.to} total={vendors.total} />
            </div>

            {/* Modal */}
            {modal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setModal(false)} />
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                                <h3 className="font-bold text-sm text-slate-900 dark:text-white">{editing ? 'Edit Vendor' : 'Tambah Vendor Rekanan'}</h3>
                                <button onClick={() => setModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                            </div>
                            <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-xs">
                                <div className="grid grid-cols-2 gap-3">
                                    <FormField label="Kode Vendor" required>
                                        <Input value={form.vendor_code} onChange={(e) => setForm({ ...form, vendor_code: e.target.value })} required />
                                    </FormField>
                                    <FormField label="Kategori Vendor" required>
                                        <Select
                                            value={form.vendor_type}
                                            onChange={(e) => setForm({ ...form, vendor_type: e.target.value })}
                                            options={[
                                                { value: 'spareparts', label: 'Spare Parts' },
                                                { value: 'tyre', label: 'Ban / Tyre' },
                                                { value: 'fuel', label: 'Fuel / Solar' },
                                                { value: 'subcontractor', label: 'Subkontraktor' },
                                                { value: 'rental', label: 'Rental Unit' },
                                                { value: 'service', label: 'Service & Jasa' },
                                            ]}
                                            placeholder=""
                                        />
                                    </FormField>
                                </div>
                                <FormField label="Nama Perusahaan Vendor" required>
                                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="cth. PT United Tractors Tbk" required />
                                </FormField>
                                <div className="grid grid-cols-2 gap-3">
                                    <FormField label="Kontak Person (PIC)">
                                        <Input value={form.contact_person} onChange={(e) => setForm({ ...form, contact_person: e.target.value })} placeholder="Nama PIC Vendor" />
                                    </FormField>
                                    <FormField label="No. Telepon / WA">
                                        <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+62 812-xxxx-xxxx" />
                                    </FormField>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <FormField label="Alamat Email">
                                        <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="vendor@example.com" />
                                    </FormField>
                                    <FormField label="NPWP">
                                        <Input value={form.npwp} onChange={(e) => setForm({ ...form, npwp: e.target.value })} placeholder="01.234.567.8-000.000" />
                                    </FormField>
                                </div>
                                <FormField label="Alamat Kantor / Workshop">
                                    <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Alamat lengkap vendor" />
                                </FormField>
                                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                                    <Button variant="secondary" onClick={() => setModal(false)}>Batal</Button>
                                    <Button variant="primary" type="submit">Simpan Vendor</Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
