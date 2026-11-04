import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { MapPin, Plus, Edit3, Trash2, X } from 'lucide-react';
import DashboardLayout from '../../components/templates/DashboardLayout';
import Button from '../../components/atoms/Button';
import Input from '../../components/atoms/Input';
import Select from '../../components/atoms/Select';
import FormField from '../../components/molecules/FormField';
import Badge from '../../components/atoms/Badge';
import SearchBar from '../../components/molecules/SearchBar';
import PaginationControls from '../../components/molecules/PaginationControls';
import { useAlertStore } from '../../stores/useAlertStore';

export default function LocationsIndex({ locations, filters = {}, sites = [] }) {
    const { confirm } = useAlertStore();
    const [search, setSearch] = useState(filters.search || '');
    const [locationType, setLocationType] = useState(filters.location_type || 'all');
    const [siteId, setSiteId] = useState(filters.site_id || 'all');

    const [modal, setModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({
        site_id: sites[0]?.id || '',
        code: '',
        name: '',
        location_type: 'hauling_road',
        km_marker: '',
        latitude: '',
        longitude: '',
        is_active: true,
    });

    const applyFilters = (overrides = {}) => {
        const queryParams = {
            search: overrides.search !== undefined ? overrides.search : search,
            location_type: overrides.location_type !== undefined ? overrides.location_type : locationType,
            site_id: overrides.site_id !== undefined ? overrides.site_id : siteId,
        };
        if (!queryParams.search) delete queryParams.search;
        if (queryParams.location_type === 'all') delete queryParams.location_type;
        if (queryParams.site_id === 'all') delete queryParams.site_id;

        router.get('/master/locations', queryParams, { preserveState: true, replace: true });
    };

    const openCreate = () => {
        setEditing(null);
        setForm({
            site_id: sites[0]?.id || '',
            code: `LOC-${Math.floor(100 + Math.random() * 900)}`,
            name: '',
            location_type: 'hauling_road',
            km_marker: 'KM 00+000',
            latitude: '',
            longitude: '',
            is_active: true,
        });
        setModal(true);
    };

    const openEdit = (loc) => {
        setEditing(loc);
        setForm({
            site_id: loc.site_id,
            code: loc.code,
            name: loc.name,
            location_type: loc.location_type,
            km_marker: loc.km_marker || '',
            latitude: loc.latitude || '',
            longitude: loc.longitude || '',
            is_active: loc.is_active,
        });
        setModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editing) {
            router.put(`/master/locations/${editing.id}`, form, { onSuccess: () => setModal(false) });
        } else {
            router.post('/master/locations', form, { onSuccess: () => setModal(false) });
        }
    };

    const handleDelete = async (loc) => {
        const ok = await confirm({
            title: `Hapus Lokasi: ${loc.name}?`,
            message: 'Tindakan ini akan menghapus data titik lokasi dan rute hauling.',
        });
        if (ok) router.delete(`/master/locations/${loc.id}`);
    };

    const getTypeLabel = (t) => {
        const map = {
            pit: 'Pit Tambang',
            front_loading: 'Front Loading',
            hauling_road: 'Jalur Hauling',
            stockpile: 'Stockpile ROM',
            jetty: 'Jetty Port',
            disposal: 'Disposal Area',
            workshop: 'Central Workshop',
            warehouse: 'Warehouse Gudang',
            fuel_station: 'Fuel Station',
        };
        return map[t] || t;
    };

    return (
        <DashboardLayout title="Master Data Lokasi & Jalur Hauling (SSR)" breadcrumbs={['Master Data', 'Lokasi']}>
            {/* Filter Bar */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="w-full sm:max-w-xs">
                    <SearchBar
                        value={search}
                        onChange={(val) => { setSearch(val); applyFilters({ search: val }); }}
                        onClear={() => { setSearch(''); applyFilters({ search: '' }); }}
                        placeholder="Cari nama lokasi atau KM..."
                    />
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                    <div className="w-44">
                        <Select
                            value={locationType}
                            onChange={(e) => { setLocationType(e.target.value); applyFilters({ location_type: e.target.value }); }}
                            options={[
                                { value: 'all', label: 'Semua Jenis Lokasi' },
                                { value: 'pit', label: 'Pit' },
                                { value: 'front_loading', label: 'Front Loading' },
                                { value: 'hauling_road', label: 'Jalur Hauling' },
                                { value: 'stockpile', label: 'Stockpile' },
                                { value: 'jetty', label: 'Jetty' },
                                { value: 'disposal', label: 'Disposal' },
                                { value: 'workshop', label: 'Workshop' },
                                { value: 'warehouse', label: 'Warehouse' },
                                { value: 'fuel_station', label: 'Fuel Station' },
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
                    <Button variant="primary" icon={Plus} onClick={openCreate}>Tambah Lokasi</Button>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-slate-800/40 uppercase font-semibold text-slate-500 border-b border-slate-200 dark:border-slate-800">
                            <tr>
                                <th className="py-3 px-4">Kode & Nama Titik Lokasi</th>
                                <th className="py-3 px-4">Jenis Lokasi</th>
                                <th className="py-3 px-4">Marker / KM Jalan</th>
                                <th className="py-3 px-4">Site Terkait</th>
                                <th className="py-3 px-4">Status</th>
                                <th className="py-3 px-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                            {locations.data.map((loc) => (
                                <tr key={loc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                    <td className="py-3.5 px-4">
                                        <p className="font-bold text-slate-900 dark:text-white">{loc.name}</p>
                                        <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-mono">{loc.code}</p>
                                    </td>
                                    <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                                        {getTypeLabel(loc.location_type)}
                                    </td>
                                    <td className="py-3.5 px-4 font-mono font-bold text-amber-600 dark:text-amber-400">
                                        {loc.km_marker || '-'}
                                    </td>
                                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{loc.site?.name || '-'}</td>
                                    <td className="py-3.5 px-4">
                                        <Badge variant={loc.is_active ? 'success' : 'warning'} dot>
                                            {loc.is_active ? 'Aktif Digunakan' : 'Nonaktif'}
                                        </Badge>
                                    </td>
                                    <td className="py-3.5 px-4 text-right">
                                        <div className="inline-flex items-center gap-1.5">
                                            <button onClick={() => openEdit(loc)} className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800">
                                                <Edit3 className="w-3.5 h-3.5" />
                                            </button>
                                            <button onClick={() => handleDelete(loc)} className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <PaginationControls links={locations.links} from={locations.from} to={locations.to} total={locations.total} />
            </div>

            {/* Modal */}
            {modal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setModal(false)} />
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                                <h3 className="font-bold text-sm text-slate-900 dark:text-white">{editing ? 'Edit Lokasi' : 'Tambah Lokasi Baru'}</h3>
                                <button onClick={() => setModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                            </div>
                            <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-xs">
                                <FormField label="Site Penempatan" required>
                                    <Select
                                        value={form.site_id}
                                        onChange={(e) => setForm({ ...form, site_id: e.target.value })}
                                        options={sites.map((s) => ({ value: s.id, label: s.name }))}
                                        placeholder=""
                                    />
                                </FormField>
                                <FormField label="Kode Lokasi" required>
                                    <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
                                </FormField>
                                <FormField label="Nama Lokasi" required>
                                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                                </FormField>
                                <div className="grid grid-cols-2 gap-3">
                                    <FormField label="Jenis Titik" required>
                                        <Select
                                            value={form.location_type}
                                            onChange={(e) => setForm({ ...form, location_type: e.target.value })}
                                            options={[
                                                { value: 'pit', label: 'Pit Tambang' },
                                                { value: 'front_loading', label: 'Front Loading' },
                                                { value: 'hauling_road', label: 'Jalur Hauling' },
                                                { value: 'stockpile', label: 'Stockpile' },
                                                { value: 'jetty', label: 'Jetty' },
                                                { value: 'disposal', label: 'Disposal' },
                                                { value: 'workshop', label: 'Workshop' },
                                                { value: 'warehouse', label: 'Warehouse' },
                                                { value: 'fuel_station', label: 'Fuel Station' },
                                            ]}
                                            placeholder=""
                                        />
                                    </FormField>
                                    <FormField label="KM Marker">
                                        <Input value={form.km_marker} onChange={(e) => setForm({ ...form, km_marker: e.target.value })} placeholder="KM 15+200" />
                                    </FormField>
                                </div>
                                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                                    <Button variant="secondary" onClick={() => setModal(false)}>Batal</Button>
                                    <Button variant="primary" type="submit">Simpan Lokasi</Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
