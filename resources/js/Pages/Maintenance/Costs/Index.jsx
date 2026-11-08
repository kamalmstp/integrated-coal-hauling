import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import DashboardLayout from '../../../components/templates/DashboardLayout';
import Card from '../../../components/molecules/Card';
import Button from '../../../components/atoms/Button';
import Modal from '../../../components/molecules/Modal';
import Pagination from '../../../components/molecules/Pagination';
import {
    DollarSign,
    Plus,
    Filter,
    RefreshCw,
    Search,
    Truck,
    Clock,
    FileText,
    TrendingDown,
    Layers,
    PieChart,
    BarChart3,
    Package,
    Users,
    Activity,
} from 'lucide-react';

export default function MaintenanceCostIndex({
    costs = { data: [], links: [] },
    costPerUnitTable = [],
    summary = {},
    filters = {},
    master = {},
}) {
    const [siteId, setSiteId] = useState(filters.site_id || '');
    const [unitId, setUnitId] = useState(filters.unit_id || '');
    const [costType, setCostType] = useState(filters.cost_type || '');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');

    // Modals
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    // Form: Create Cost Record
    const createForm = useForm({
        site_id: master.sites?.[0]?.id || '',
        unit_id: master.units?.[0]?.id || '',
        work_order_id: master.workOrders?.[0]?.id || '',
        cost_date: new Date().toISOString().slice(0, 10),
        cost_type: 'sparepart',
        description: '',
        estimated_amount: 0,
        actual_amount: '',
        invoice_number: '',
    });

    const handleFilter = (e) => {
        e.preventDefault();
        router.get('/maintenance/costs', {
            site_id: siteId || undefined,
            unit_id: unitId || undefined,
            cost_type: costType || undefined,
            date_from: dateFrom || undefined,
            date_to: dateTo || undefined,
        }, { preserveState: true });
    };

    const handleReset = () => {
        setSiteId('');
        setUnitId('');
        setCostType('');
        setDateFrom('');
        setDateTo('');
        router.get('/maintenance/costs');
    };

    const submitCreate = (e) => {
        e.preventDefault();
        createForm.post('/maintenance/costs', {
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
            },
        });
    };

    const getCostTypeBadge = (ct) => {
        const map = {
            sparepart: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
            material: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
            third_party_service: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
            consumable: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300',
            mechanic_labor: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
            other: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
        };
        const labels = {
            sparepart: 'Sparepart',
            material: 'Material',
            third_party_service: 'Pihak Ketiga (Vendor)',
            consumable: 'Consumable / Pelumas',
            mechanic_labor: 'Mechanic Labor',
            other: 'Lain-lain',
        };
        return <span className={`px-2.5 py-1 text-xs font-semibold rounded-full uppercase tracking-wider ${map[ct] || 'bg-gray-100 text-gray-700'}`}>{labels[ct] || ct}</span>;
    };

    return (
        <DashboardLayout>
            <Head title="Maintenance Cost Management — TAP Workshop" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                            <DollarSign className="w-7 h-7 text-emerald-500" />
                            Maintenance Cost & Financial Analytics
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Pengendalian biaya perawatan armada: rincian suku cadang, labor mekanik, vendor pihak ketiga, dan normalisasi biaya per HM, per KM, serta per Ton batubara.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            onClick={() => setIsCreateOpen(true)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 shadow-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Catat Biaya Pemeliharaan
                        </Button>
                    </div>
                </div>

                {/* Operational Unit-Cost Normalization KPIs */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    <Card className="p-3 border-l-4 border-l-emerald-500 text-center">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Total Biaya Aktual</p>
                        <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                            Rp {Number(summary.total_actual || 0).toLocaleString('id-ID')}
                        </p>
                        <p className="text-[10px] text-gray-400">Periode Terpilih</p>
                    </Card>

                    <Card className="p-3 border-l-4 border-l-blue-500 text-center">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Cost Per HM</p>
                        <p className="text-xl font-black text-blue-600 dark:text-blue-400 mt-1">
                            Rp {Number(summary.cost_per_hm || 0).toLocaleString('id-ID')} / HM
                        </p>
                        <p className="text-[10px] text-gray-400 font-mono">{summary.total_hm || 0} Total Jam Operasi</p>
                    </Card>

                    <Card className="p-3 border-l-4 border-l-cyan-500 text-center">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Cost Per KM</p>
                        <p className="text-xl font-black text-cyan-600 dark:text-cyan-400 mt-1">
                            Rp {Number(summary.cost_per_km || 0).toLocaleString('id-ID')} / KM
                        </p>
                        <p className="text-[10px] text-gray-400 font-mono">{summary.total_km || 0} Total Jarak Tempuh</p>
                    </Card>

                    <Card className="p-3 border-l-4 border-l-amber-500 text-center">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Cost Per Ton Hauling</p>
                        <p className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">
                            Rp {Number(summary.cost_per_ton || 0).toLocaleString('id-ID')} / Ton
                        </p>
                        <p className="text-[10px] text-gray-400 font-mono">{Number(summary.total_tonnage || 0).toLocaleString('id-ID')} Ton Verified</p>
                    </Card>

                    <Card className="p-3 border-l-4 border-l-purple-500 text-center">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Cost Variance</p>
                        <p className="text-xl font-black text-purple-600 dark:text-purple-400 mt-1">
                            Rp {Number((summary.total_actual || 0) - (summary.total_estimated || 0)).toLocaleString('id-ID')}
                        </p>
                        <p className="text-[10px] text-gray-400">Aktual vs Estimasi</p>
                    </Card>
                </div>

                {/* Cost Breakdown by Type Cards */}
                <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                    <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-center">
                        <p className="text-gray-500 font-medium">Sparepart</p>
                        <p className="font-bold text-orange-600 mt-0.5">Rp {Number(summary.by_type?.sparepart || 0).toLocaleString('id-ID')}</p>
                    </div>
                    <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-center">
                        <p className="text-gray-500 font-medium">Material</p>
                        <p className="font-bold text-blue-600 mt-0.5">Rp {Number(summary.by_type?.material || 0).toLocaleString('id-ID')}</p>
                    </div>
                    <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-center">
                        <p className="text-gray-500 font-medium">Pihak ke-3 / Vendor</p>
                        <p className="font-bold text-purple-600 mt-0.5">Rp {Number(summary.by_type?.third_party || 0).toLocaleString('id-ID')}</p>
                    </div>
                    <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-center">
                        <p className="text-gray-500 font-medium">Consumable & Oli</p>
                        <p className="font-bold text-cyan-600 mt-0.5">Rp {Number(summary.by_type?.consumables || 0).toLocaleString('id-ID')}</p>
                    </div>
                    <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-center">
                        <p className="text-gray-500 font-medium">Labor Mekanik</p>
                        <p className="font-bold text-amber-600 mt-0.5">Rp {Number(summary.by_type?.labor || 0).toLocaleString('id-ID')}</p>
                    </div>
                    <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-center">
                        <p className="text-gray-500 font-medium">Biaya Lainnya</p>
                        <p className="font-bold text-gray-600 mt-0.5">Rp {Number(summary.by_type?.other || 0).toLocaleString('id-ID')}</p>
                    </div>
                </div>

                {/* Filters */}
                <Card className="p-4">
                    <form onSubmit={handleFilter} className="grid grid-cols-1 md:grid-cols-6 gap-3">
                        <div>
                            <select
                                value={siteId}
                                onChange={(e) => setSiteId(e.target.value)}
                                className="w-full py-2 px-3 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            >
                                <option value="">Semua Site / Project</option>
                                {master.sites?.map((s) => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <select
                                value={unitId}
                                onChange={(e) => setUnitId(e.target.value)}
                                className="w-full py-2 px-3 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            >
                                <option value="">Semua Unit</option>
                                {master.units?.map((u) => (
                                    <option key={u.id} value={u.id}>{u.unit_code} - {u.unit_type}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <select
                                value={costType}
                                onChange={(e) => setCostType(e.target.value)}
                                className="w-full py-2 px-3 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            >
                                <option value="">Semua Jenis Biaya</option>
                                <option value="sparepart">Sparepart / Suku Cadang</option>
                                <option value="material">Material Perbaikan</option>
                                <option value="third_party_service">Jasa Pihak Ketiga</option>
                                <option value="consumable">Consumable & Pelumas</option>
                                <option value="mechanic_labor">Labor Mekanik</option>
                                <option value="other">Lain-lain</option>
                            </select>
                        </div>

                        <div>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="w-full py-2 px-3 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            />
                        </div>

                        <div>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="w-full py-2 px-3 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            />
                        </div>

                        <div className="flex gap-2">
                            <Button type="submit" className="flex-1 bg-gray-900 hover:bg-gray-800 text-white text-sm">
                                <Filter className="w-3.5 h-3.5 mr-1" /> Filter
                            </Button>
                            <Button type="button" onClick={handleReset} variant="outline" className="px-3 text-gray-600">
                                <RefreshCw className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                    </form>
                </Card>

                {/* Cost Per Unit Ranking Table */}
                <Card className="overflow-hidden">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-emerald-500" />
                            Akumulasi Biaya Per Unit (Cost per Unit Ranking)
                        </h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    <th className="py-3 px-4">Nomor Unit</th>
                                    <th className="py-3 px-4">Jenis Unit & Status</th>
                                    <th className="py-3 px-4 text-center">Jumlah Servis (WO)</th>
                                    <th className="py-3 px-4 text-right">Estimasi Biaya</th>
                                    <th className="py-3 px-4 text-right">Biaya Aktual</th>
                                    <th className="py-3 px-4 text-right">Variansi Selisih</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                                {costPerUnitTable?.length > 0 ? (
                                    costPerUnitTable.map((u) => (
                                        <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition">
                                            <td className="py-3 px-4 font-bold text-gray-900 dark:text-white">
                                                {u.unit_code}
                                                <div className="text-xs text-gray-400 font-normal">{u.registration_number}</div>
                                            </td>

                                            <td className="py-3 px-4 text-xs text-gray-600 dark:text-gray-300">
                                                {u.unit_type}
                                                <div className="text-[10px] text-gray-400 mt-0.5">Status: {u.status}</div>
                                            </td>

                                            <td className="py-3 px-4 text-center font-bold font-mono">
                                                {u.wo_count} WO
                                            </td>

                                            <td className="py-3 px-4 text-right font-mono text-xs text-gray-600 dark:text-gray-400">
                                                Rp {Number(u.estimated_cost || 0).toLocaleString('id-ID')}
                                            </td>

                                            <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                                                Rp {Number(u.actual_cost || 0).toLocaleString('id-ID')}
                                            </td>

                                            <td className={`py-3 px-4 text-right font-mono text-xs font-semibold ${u.variance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                {u.variance > 0 ? '+' : ''}Rp {Number(u.variance || 0).toLocaleString('id-ID')}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="py-8 text-center text-gray-500">
                                            Tidak ada data pengeluaran untuk unit pada periode ini.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Cost Ledger Details Table */}
                <Card className="overflow-hidden">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <FileText className="w-4 h-4 text-blue-500" />
                            Buku Besar Transaksi Biaya Pemeliharaan (Maintenance Cost Ledger)
                        </h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    <th className="py-3 px-4">Nomor & Tanggal</th>
                                    <th className="py-3 px-4">Unit & WO Terkait</th>
                                    <th className="py-3 px-4">Jenis Biaya</th>
                                    <th className="py-3 px-4">Uraian Transaksi</th>
                                    <th className="py-3 px-4 text-right">Jumlah Biaya</th>
                                    <th className="py-3 px-4">Dicatat Oleh</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                                {costs.data?.length > 0 ? (
                                    costs.data.map((c) => (
                                        <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition">
                                            <td className="py-3 px-4 whitespace-nowrap">
                                                <div className="font-bold text-gray-900 dark:text-white font-mono text-xs">
                                                    {c.cost_number}
                                                </div>
                                                <div className="text-[11px] text-gray-500 font-mono">
                                                    {c.cost_date}
                                                </div>
                                            </td>

                                            <td className="py-3 px-4 whitespace-nowrap">
                                                <div className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                                                    <Truck className="w-3.5 h-3.5 text-blue-500" />
                                                    {c.unit?.unit_code}
                                                </div>
                                                <div className="text-xs text-amber-600 font-mono">
                                                    {c.work_order?.wo_number || '-'}
                                                </div>
                                            </td>

                                            <td className="py-3 px-4 whitespace-nowrap">
                                                {getCostTypeBadge(c.cost_type)}
                                            </td>

                                            <td className="py-3 px-4 max-w-xs text-xs">
                                                <p className="font-medium text-gray-900 dark:text-white">{c.description}</p>
                                                {c.invoice_number && (
                                                    <p className="text-[11px] text-gray-400 font-mono mt-0.5">Inv: {c.invoice_number}</p>
                                                )}
                                            </td>

                                            <td className="py-3 px-4 whitespace-nowrap text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                                                Rp {Number(c.actual_amount || 0).toLocaleString('id-ID')}
                                            </td>

                                            <td className="py-3 px-4 whitespace-nowrap text-xs text-gray-700 dark:text-gray-300">
                                                {c.creator?.name || 'Sistem TAP'}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="py-8 text-center text-gray-500 dark:text-gray-400">
                                            Tidak ada catatan biaya yang sesuai kriteria filter.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {costs.links && (
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                            <Pagination links={costs.links} />
                        </div>
                    )}
                </Card>

                {/* MODAL: CREATE COST RECORD */}
                <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Catat Pengeluaran Biaya Pemeliharaan" maxWidth="max-w-md">
                    <form onSubmit={submitCreate} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1">Site / Project *</label>
                            <select
                                value={createForm.data.site_id}
                                onChange={(e) => createForm.setData('site_id', e.target.value)}
                                className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                required
                            >
                                {master.sites?.map((s) => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1">Unit Alat Berat *</label>
                            <select
                                value={createForm.data.unit_id}
                                onChange={(e) => createForm.setData('unit_id', e.target.value)}
                                className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                required
                            >
                                {master.units?.map((u) => (
                                    <option key={u.id} value={u.id}>{u.unit_code} - {u.unit_type}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1">Work Order Terkait</label>
                            <select
                                value={createForm.data.work_order_id}
                                onChange={(e) => createForm.setData('work_order_id', e.target.value)}
                                className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            >
                                <option value="">Tanpa Work Order (Pengeluaran Umum Unit)</option>
                                {master.workOrders?.map((w) => (
                                    <option key={w.id} value={w.id}>{w.wo_number}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1">Jenis Biaya *</label>
                                <select
                                    value={createForm.data.cost_type}
                                    onChange={(e) => createForm.setData('cost_type', e.target.value)}
                                    className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                    required
                                >
                                    <option value="sparepart">Sparepart / Suku Cadang</option>
                                    <option value="material">Material Perbaikan</option>
                                    <option value="third_party_service">Jasa Pihak Ketiga</option>
                                    <option value="consumable">Consumable & Pelumas</option>
                                    <option value="mechanic_labor">Labor Mekanik</option>
                                    <option value="other">Lain-lain</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1">Tanggal *</label>
                                <input
                                    type="date"
                                    value={createForm.data.cost_date}
                                    onChange={(e) => createForm.setData('cost_date', e.target.value)}
                                    className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1">Uraian Transaksi *</label>
                            <input
                                type="text"
                                placeholder="Contoh: Penggantian brake chamber dan selang fleksibel"
                                value={createForm.data.description}
                                onChange={(e) => createForm.setData('description', e.target.value)}
                                className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1">Biaya Aktual (Rp) *</label>
                                <input
                                    type="number"
                                    value={createForm.data.actual_amount}
                                    onChange={(e) => createForm.setData('actual_amount', e.target.value)}
                                    className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-emerald-600 font-bold font-mono"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1">Nomor Invoice / Kuitansi</label>
                                <input
                                    type="text"
                                    placeholder="INV/2026/..."
                                    value={createForm.data.invoice_number}
                                    onChange={(e) => createForm.setData('invoice_number', e.target.value)}
                                    className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={createForm.processing} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                {createForm.processing ? 'Menyimpan...' : 'Simpan Transaksi Biaya'}
                            </Button>
                        </div>
                    </form>
                </Modal>
            </div>
        </DashboardLayout>
    );
}
