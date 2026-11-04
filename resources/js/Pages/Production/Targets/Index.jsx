import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import DashboardLayout from '../../../components/templates/DashboardLayout';
import Card from '../../../components/molecules/Card';
import Badge from '../../../components/atoms/Badge';
import Button from '../../../components/atoms/Button';
import Input from '../../../components/atoms/Input';
import Select from '../../../components/atoms/Select';
import Modal from '../../../components/molecules/Modal';
import Pagination from '../../../components/molecules/Pagination';
import {
    Target,
    Plus,
    Filter,
    Calendar,
    TrendingUp,
    Scale,
    AlertCircle,
    CheckCircle2,
} from 'lucide-react';

export default function TargetsIndex({
    filters = {},
    daily_kpi = {},
    monthly_kpi = {},
    targets_list = { data: [] },
    sites = [],
}) {
    const [selectedSite, setSelectedSite] = useState(filters.site_id || '');
    const [selectedYear, setSelectedYear] = useState(filters.year || new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(filters.month || new Date().getMonth() + 1);

    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const form = useForm({
        site_id: filters.site_id || sites[0]?.id || '',
        period_type: 'daily',
        target_date: new Date().toISOString().split('T')[0],
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        target_tonnage: '',
        target_ritase: '',
        working_days: 30,
        remarks: '',
    });

    const handleFilter = (e) => {
        e.preventDefault();
        router.get('/production/targets', {
            site_id: selectedSite,
            year: selectedYear,
            month: selectedMonth,
        }, { preserveState: true });
    };

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        form.post('/production/targets', {
            onSuccess: () => {
                setIsCreateOpen(false);
                form.reset();
            },
        });
    };

    return (
        <DashboardLayout>
            <Head title="Target & Realisasi Produksi — TAP Coal Hauling" />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="p-2 rounded-lg bg-blue-600 text-white shadow-sm">
                            <Target className="w-5 h-5" />
                        </span>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Target & Realisasi Produksi Hauling
                            </h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Penetapan target tonase harian & bulanan serta evaluasi pencapaian real-time
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button onClick={() => setIsCreateOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Tetapkan Target Baru
                    </Button>
                </div>
            </div>

            {/* Filter Bar */}
            <Card className="p-4 mb-6">
                <form onSubmit={handleFilter} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Site Tambang</label>
                        <Select
                            value={selectedSite}
                            onChange={(e) => setSelectedSite(e.target.value)}
                            options={sites.map((s) => ({ value: s.id, label: s.name }))}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Tahun</label>
                        <Input
                            type="number"
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Bulan</label>
                        <Select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            options={[
                                { value: 1, label: 'Januari' },
                                { value: 2, label: 'Februari' },
                                { value: 3, label: 'Maret' },
                                { value: 4, label: 'April' },
                                { value: 5, label: 'Mei' },
                                { value: 6, label: 'Juni' },
                                { value: 7, label: 'Juli' },
                                { value: 8, label: 'Agustus' },
                                { value: 9, label: 'September' },
                                { value: 10, label: 'Oktober' },
                                { value: 11, label: 'November' },
                                { value: 12, label: 'Desember' },
                            ]}
                        />
                    </div>
                    <div>
                        <Button type="submit" variant="secondary" className="w-full">
                            <Filter className="w-4 h-4 mr-1" />
                            Terapkan Filter
                        </Button>
                    </div>
                </form>
            </Card>

            {/* KPI Target vs Aktual Comparison Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* 1. Target Harian Hari Ini */}
                <Card className="p-5 border-t-4 border-t-blue-500">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <span className="p-2 rounded-md bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300">
                                <Calendar className="w-4 h-4" />
                            </span>
                            <div>
                                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Pencapaian Target Harian</h2>
                                <p className="text-xs text-slate-400">Tanggal: {daily_kpi.target_date}</p>
                            </div>
                        </div>
                        <Badge variant={daily_kpi.achievement_percent >= 100 ? 'success' : 'warning'}>
                            {daily_kpi.achievement_percent}% Tercapai
                        </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 my-4 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
                        <div>
                            <span className="text-xs text-slate-500 block">Target Tonase</span>
                            <span className="text-xl font-bold text-slate-900 dark:text-white">
                                {Number(daily_kpi.target_tonnage || 0).toLocaleString('id-ID')} T
                            </span>
                            <span className="text-[11px] text-slate-400 block mt-0.5">{daily_kpi.target_ritase} Rit Ditargetkan</span>
                        </div>
                        <div className="text-right">
                            <span className="text-xs text-slate-500 block">Realisasi (Verified)</span>
                            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                                {Number(daily_kpi.actual_tonnage || 0).toLocaleString('id-ID')} T
                            </span>
                            <span className="text-[11px] text-emerald-600 block mt-0.5">{daily_kpi.actual_ritase} Rit Tercapai</span>
                        </div>
                    </div>

                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full ${daily_kpi.achievement_percent >= 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                            style={{ width: `${Math.min(daily_kpi.achievement_percent || 0, 100)}%` }}
                        />
                    </div>

                    <div className="flex justify-between items-center mt-3 text-xs">
                        <span className="text-slate-500">Selisih (Variance):</span>
                        <span className={`font-bold ${daily_kpi.variance_tonnage >= 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {daily_kpi.variance_tonnage >= 0 ? `+${daily_kpi.variance_tonnage} Ton (Surplus)` : `${daily_kpi.variance_tonnage} Ton (Kurang)`}
                        </span>
                    </div>
                </Card>

                {/* 2. Target Bulanan */}
                <Card className="p-5 border-t-4 border-t-purple-500">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <span className="p-2 rounded-md bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-300">
                                <TrendingUp className="w-4 h-4" />
                            </span>
                            <div>
                                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Pencapaian Target Bulanan (RKAB)</h2>
                                <p className="text-xs text-slate-400">Bulan {monthly_kpi.month} / {monthly_kpi.year}</p>
                            </div>
                        </div>
                        <Badge variant={monthly_kpi.achievement_percent >= 100 ? 'success' : 'primary'}>
                            {monthly_kpi.achievement_percent}% Tercapai
                        </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 my-4 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
                        <div>
                            <span className="text-xs text-slate-500 block">Target Bulanan</span>
                            <span className="text-xl font-bold text-slate-900 dark:text-white">
                                {Number(monthly_kpi.target_tonnage || 0).toLocaleString('id-ID')} T
                            </span>
                            <span className="text-[11px] text-slate-400 block mt-0.5">{monthly_kpi.target_ritase} Rit Ditargetkan</span>
                        </div>
                        <div className="text-right">
                            <span className="text-xs text-slate-500 block">Realisasi Bulanan</span>
                            <span className="text-xl font-black text-purple-600 dark:text-purple-400">
                                {Number(monthly_kpi.actual_tonnage || 0).toLocaleString('id-ID')} T
                            </span>
                            <span className="text-[11px] text-purple-600 block mt-0.5">{monthly_kpi.actual_ritase} Rit Tercapai</span>
                        </div>
                    </div>

                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full ${monthly_kpi.achievement_percent >= 100 ? 'bg-emerald-500' : 'bg-purple-500'}`}
                            style={{ width: `${Math.min(monthly_kpi.achievement_percent || 0, 100)}%` }}
                        />
                    </div>

                    <div className="flex justify-between items-center mt-3 text-xs">
                        <span className="text-slate-500">Selisih (Variance):</span>
                        <span className={`font-bold ${monthly_kpi.variance_tonnage >= 0 ? 'text-emerald-600' : 'text-purple-600'}`}>
                            {monthly_kpi.variance_tonnage >= 0 ? `+${monthly_kpi.variance_tonnage} Ton` : `${monthly_kpi.variance_tonnage} Ton`}
                        </span>
                    </div>
                </Card>
            </div>

            {/* Target Records Table */}
            <Card className="overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                        Daftar Target Operasional Terdaftar
                    </h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
                            <tr>
                                <th className="py-3 px-4">Tipe Periode</th>
                                <th className="py-3 px-4">Tanggal / Bulan</th>
                                <th className="py-3 px-4 text-right">Target Tonase</th>
                                <th className="py-3 px-4 text-center">Target Ritase</th>
                                <th className="py-3 px-4">Site Tambang</th>
                                <th className="py-3 px-4">Keterangan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {targets_list.data.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-6 text-center text-slate-400">Belum ada target terdaftar pada filter ini.</td>
                                </tr>
                            ) : (
                                targets_list.data.map((tgt) => (
                                    <tr key={tgt.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                        <td className="py-3 px-4 font-bold">
                                            <Badge variant={tgt.period_type === 'daily' ? 'primary' : 'outline'}>
                                                {tgt.period_type === 'daily' ? 'HARIAN' : 'BULANAN'}
                                            </Badge>
                                        </td>
                                        <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                                            {tgt.period_type === 'daily' ? tgt.target_date : `Bulan ${tgt.month} / ${tgt.year}`}
                                        </td>
                                        <td className="py-3 px-4 text-right font-black text-slate-900 dark:text-white">
                                            {Number(tgt.target_tonnage).toLocaleString('id-ID')} Ton
                                        </td>
                                        <td className="py-3 px-4 text-center font-semibold">
                                            {tgt.target_ritase} Rit
                                        </td>
                                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                                            {tgt.site?.name}
                                        </td>
                                        <td className="py-3 px-4 text-slate-500">
                                            {tgt.remarks || '-'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                    <Pagination links={targets_list.links} />
                </div>
            </Card>

            {/* Modal Tetapkan Target Baru */}
            <Modal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                title="Tetapkan Target Produksi Baru"
            >
                <form onSubmit={handleCreateSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Site Proyek</label>
                            <Select
                                value={form.data.site_id}
                                onChange={(e) => form.setData('site_id', e.target.value)}
                                options={sites.map((s) => ({ value: s.id, label: s.name }))}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Tipe Periode Target</label>
                            <Select
                                value={form.data.period_type}
                                onChange={(e) => form.setData('period_type', e.target.value)}
                                options={[
                                    { value: 'daily', label: 'Target Harian (Daily)' },
                                    { value: 'monthly', label: 'Target Bulanan (Monthly)' },
                                ]}
                                required
                            />
                        </div>
                    </div>

                    {form.data.period_type === 'daily' ? (
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Tanggal Target</label>
                            <Input
                                type="date"
                                value={form.data.target_date}
                                onChange={(e) => form.setData('target_date', e.target.value)}
                                required
                            />
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Bulan</label>
                                <Select
                                    value={form.data.month}
                                    onChange={(e) => form.setData('month', e.target.value)}
                                    options={[
                                        { value: 1, label: 'Januari' },
                                        { value: 2, label: 'Februari' },
                                        { value: 3, label: 'Maret' },
                                        { value: 4, label: 'April' },
                                        { value: 5, label: 'Mei' },
                                        { value: 6, label: 'Juni' },
                                        { value: 7, label: 'Juli' },
                                        { value: 8, label: 'Agustus' },
                                        { value: 9, label: 'September' },
                                        { value: 10, label: 'Oktober' },
                                        { value: 11, label: 'November' },
                                        { value: 12, label: 'Desember' },
                                    ]}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Tahun</label>
                                <Input
                                    type="number"
                                    value={form.data.year}
                                    onChange={(e) => form.setData('year', e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Tonase (Ton)</label>
                            <Input
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={form.data.target_tonnage}
                                onChange={(e) => form.setData('target_tonnage', e.target.value)}
                                placeholder="Misal: 15000"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Ritase</label>
                            <Input
                                type="number"
                                min="1"
                                value={form.data.target_ritase}
                                onChange={(e) => form.setData('target_ritase', e.target.value)}
                                placeholder="Misal: 500"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Keterangan / Parameter Target</label>
                        <textarea
                            value={form.data.remarks}
                            onChange={(e) => form.setData('remarks', e.target.value)}
                            className="w-full text-xs rounded-lg border-slate-300 dark:border-slate-700 dark:bg-slate-800 p-2"
                            rows={2}
                            placeholder="Catatan asumsi armada, cuaca, dll..."
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="secondary" onClick={() => setIsCreateOpen(false)}>Batal</Button>
                        <Button type="submit" disabled={form.processing}>Simpan Target</Button>
                    </div>
                </form>
            </Modal>
        </DashboardLayout>
    );
}
