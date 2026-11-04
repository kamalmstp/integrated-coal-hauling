import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import DashboardLayout from '../../../components/templates/DashboardLayout';
import Card from '../../../components/molecules/Card';
import Badge from '../../../components/atoms/Badge';
import Button from '../../../components/atoms/Button';
import Input from '../../../components/atoms/Input';
import Select from '../../../components/atoms/Select';
import {
    BarChart3,
    Calendar,
    Filter,
    Truck,
    Users,
    MapPin,
    Clock,
    Scale,
    TrendingUp,
    FileSpreadsheet,
} from 'lucide-react';

export default function RecapIndex({
    filters = {},
    summary = {},
    by_shift = [],
    by_unit = [],
    by_driver = [],
    by_loading_point = [],
    by_dumping_point = [],
    daily_trend = [],
    weekly_breakdown = [],
    monthly_breakdown = [],
    master = {},
}) {
    const [activeTab, setActiveTab] = useState('shift');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const [shiftId, setShiftId] = useState(filters.shift_id || '');
    const [loadingPointId, setLoadingPointId] = useState(filters.loading_point_id || '');
    const [dumpingPointId, setDumpingPointId] = useState(filters.dumping_point_id || '');

    const handleFilter = (e) => {
        e.preventDefault();
        router.get('/production/recap', {
            date_from: dateFrom,
            date_to: dateTo,
            shift_id: shiftId,
            loading_point_id: loadingPointId,
            dumping_point_id: dumpingPointId,
        }, { preserveState: true });
    };

    return (
        <DashboardLayout>
            <Head title="Rekapitulasi Produksi Resmi — TAP Coal Hauling" />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="p-2 rounded-lg bg-purple-600 text-white shadow-sm">
                            <BarChart3 className="w-5 h-5" />
                        </span>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Rekapitulasi Produksi Resmi (Verified)
                            </h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Perhitungan agregasi ritase & tonase resmi yang telah disetujui (100% data audit verified)
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <Card className="p-4 border-l-4 border-l-purple-500">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Tonase Periode</span>
                    <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                        {Number(summary.total_tonnage || 0).toLocaleString('id-ID', { minimumFractionDigits: 2 })}
                        <span className="text-xs font-semibold text-slate-400 ml-1">Ton</span>
                    </div>
                    <span className="text-xs text-purple-600 font-medium mt-1 block">Tiket Terverifikasi</span>
                </Card>

                <Card className="p-4 border-l-4 border-l-blue-500">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Ritase Periode</span>
                    <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                        {Number(summary.total_ritase || 0).toLocaleString('id-ID')}
                        <span className="text-xs font-semibold text-slate-400 ml-1">Rit</span>
                    </div>
                    <span className="text-xs text-blue-600 font-medium mt-1 block">Perjalanan Hauling</span>
                </Card>

                <Card className="p-4 border-l-4 border-l-emerald-500">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase">Rata-Rata Muatan</span>
                    <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                        {Number(summary.avg_tonnage_per_rit || 0).toFixed(2)}
                        <span className="text-xs font-semibold text-slate-400 ml-1">Ton / Rit</span>
                    </div>
                    <span className="text-xs text-emerald-600 font-medium mt-1 block">Rasio Efisiensi DT</span>
                </Card>

                <Card className="p-4 border-l-4 border-l-amber-500">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase">Produksi Hari Ini</span>
                    <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                        {Number(summary.today_tonnage || 0).toFixed(2)}
                        <span className="text-xs font-semibold text-slate-400 ml-1">Ton</span>
                    </div>
                    <span className="text-xs text-amber-600 font-medium mt-1 block">({summary.today_ritase || 0} Rit Hari Ini)</span>
                </Card>
            </div>

            {/* Filter Bar */}
            <Card className="p-4 mb-6">
                <form onSubmit={handleFilter} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Dari Tanggal</label>
                        <Input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Sampai Tanggal</label>
                        <Input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Shift</label>
                        <Select
                            value={shiftId}
                            onChange={(e) => setShiftId(e.target.value)}
                            options={[
                                { value: '', label: 'Semua Shift' },
                                ...(master.shifts?.map((s) => ({ value: s.id, label: s.name })) || []),
                            ]}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Loading Point</label>
                        <Select
                            value={loadingPointId}
                            onChange={(e) => setLoadingPointId(e.target.value)}
                            options={[
                                { value: '', label: 'Semua Loading' },
                                ...(master.loading_points?.map((l) => ({ value: l.id, label: l.name })) || []),
                            ]}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Dumping Point</label>
                        <Select
                            value={dumpingPointId}
                            onChange={(e) => setDumpingPointId(e.target.value)}
                            options={[
                                { value: '', label: 'Semua Dumping' },
                                ...(master.dumping_points?.map((d) => ({ value: d.id, label: d.name })) || []),
                            ]}
                        />
                    </div>
                    <div>
                        <Button type="submit" variant="secondary" className="w-full">
                            <Filter className="w-4 h-4 mr-1" />
                            Hitung Rekap
                        </Button>
                    </div>
                </form>
            </Card>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6 gap-2 overflow-x-auto">
                <button
                    onClick={() => setActiveTab('shift')}
                    className={`px-4 py-2.5 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${activeTab === 'shift' ? 'border-purple-600 text-purple-600 dark:text-purple-400' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    <Clock className="w-4 h-4" />
                    Per Shift Kerja
                </button>
                <button
                    onClick={() => setActiveTab('unit')}
                    className={`px-4 py-2.5 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${activeTab === 'unit' ? 'border-purple-600 text-purple-600 dark:text-purple-400' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    <Truck className="w-4 h-4" />
                    Per Armada Unit (DT)
                </button>
                <button
                    onClick={() => setActiveTab('driver')}
                    className={`px-4 py-2.5 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${activeTab === 'driver' ? 'border-purple-600 text-purple-600 dark:text-purple-400' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    <Users className="w-4 h-4" />
                    Per Driver
                </button>
                <button
                    onClick={() => setActiveTab('route')}
                    className={`px-4 py-2.5 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${activeTab === 'route' ? 'border-purple-600 text-purple-600 dark:text-purple-400' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    <MapPin className="w-4 h-4" />
                    Per Titik Loading & Dumping
                </button>
                <button
                    onClick={() => setActiveTab('weekly_monthly')}
                    className={`px-4 py-2.5 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${activeTab === 'weekly_monthly' ? 'border-purple-600 text-purple-600 dark:text-purple-400' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    <Calendar className="w-4 h-4" />
                    Mingguan & Bulanan
                </button>
            </div>

            {/* Tab 1: Per Shift */}
            {activeTab === 'shift' && (
                <Card className="overflow-hidden">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                        <h2 className="text-sm font-bold text-slate-900 dark:text-white">Rekapitulasi Produksi Berdasarkan Shift</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
                                <tr>
                                    <th className="py-3 px-4">Nama Shift</th>
                                    <th className="py-3 px-4 text-center">Total Ritase</th>
                                    <th className="py-3 px-4 text-right">Total Tonase Resmi</th>
                                    <th className="py-3 px-4 text-right">Rata-Rata Tonase / Rit</th>
                                    <th className="py-3 px-4 text-right">Kontribusi (%)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {by_shift.map((s, idx) => {
                                    const pct = summary.total_tonnage > 0 ? ((s.total_tonnage / summary.total_tonnage) * 100).toFixed(1) : 0;
                                    const avg = s.ritase > 0 ? (s.total_tonnage / s.ritase).toFixed(2) : 0;
                                    return (
                                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                            <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">{s.shift_name}</td>
                                            <td className="py-3 px-4 text-center font-semibold">{s.ritase} Rit</td>
                                            <td className="py-3 px-4 text-right font-black text-purple-600 dark:text-purple-400">{Number(s.total_tonnage).toFixed(2)} Ton</td>
                                            <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-300">{avg} Ton</td>
                                            <td className="py-3 px-4 text-right font-semibold text-slate-700 dark:text-slate-200">{pct}%</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {/* Tab 2: Per Unit */}
            {activeTab === 'unit' && (
                <Card className="overflow-hidden">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                        <h2 className="text-sm font-bold text-slate-900 dark:text-white">Rekapitulasi Produksi Berdasarkan Armada Dump Truck</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
                                <tr>
                                    <th className="py-3 px-4">#</th>
                                    <th className="py-3 px-4">No. Lambung</th>
                                    <th className="py-3 px-4">Tipe Armada</th>
                                    <th className="py-3 px-4 text-center">Total Ritase</th>
                                    <th className="py-3 px-4 text-right">Total Tonase</th>
                                    <th className="py-3 px-4 text-right">Rata-Rata Ton / Rit</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {by_unit.map((u, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                        <td className="py-3 px-4 text-slate-400 font-bold">{idx + 1}</td>
                                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                            <Truck className="w-3.5 h-3.5 text-slate-400" />
                                            {u.unit_code}
                                        </td>
                                        <td className="py-3 px-4 text-slate-500">
                                            {u.unit_type === 'dump_truck_10' ? 'DT 10 Roda' : u.unit_type === 'dump_truck_12' ? 'DT 12 Roda' : u.unit_type}
                                        </td>
                                        <td className="py-3 px-4 text-center font-semibold">{u.ritase} Rit</td>
                                        <td className="py-3 px-4 text-right font-black text-emerald-600 dark:text-emerald-400">
                                            {Number(u.total_tonnage).toFixed(2)} Ton
                                        </td>
                                        <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-300">
                                            {Number(u.avg_tonnage).toFixed(2)} Ton
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {/* Tab 3: Per Driver */}
            {activeTab === 'driver' && (
                <Card className="overflow-hidden">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                        <h2 className="text-sm font-bold text-slate-900 dark:text-white">Rekapitulasi Produksi Berdasarkan Driver Hauling</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
                                <tr>
                                    <th className="py-3 px-4">#</th>
                                    <th className="py-3 px-4">Nama Driver</th>
                                    <th className="py-3 px-4">ID Driver</th>
                                    <th className="py-3 px-4 text-center">Total Ritase</th>
                                    <th className="py-3 px-4 text-right">Total Tonase</th>
                                    <th className="py-3 px-4 text-right">Rata-Rata Ton / Rit</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {by_driver.map((d, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                        <td className="py-3 px-4 text-slate-400 font-bold">{idx + 1}</td>
                                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{d.driver_name}</td>
                                        <td className="py-3 px-4 font-mono text-slate-500">{d.driver_code}</td>
                                        <td className="py-3 px-4 text-center font-semibold">{d.ritase} Rit</td>
                                        <td className="py-3 px-4 text-right font-black text-purple-600 dark:text-purple-400">
                                            {Number(d.total_tonnage).toFixed(2)} Ton
                                        </td>
                                        <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-300">
                                            {Number(d.avg_tonnage).toFixed(2)} Ton
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {/* Tab 4: Per Route */}
            {activeTab === 'route' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="overflow-hidden">
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Per Loading Point (Front / Pit)</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
                                    <tr>
                                        <th className="py-3 px-4">Lokasi Loading</th>
                                        <th className="py-3 px-4 text-center">Ritase</th>
                                        <th className="py-3 px-4 text-right">Total Tonase</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {by_loading_point.map((l, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                            <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">{l.loading_name}</td>
                                            <td className="py-3 px-4 text-center font-semibold">{l.ritase}</td>
                                            <td className="py-3 px-4 text-right font-bold text-emerald-600">{Number(l.total_tonnage).toFixed(2)} T</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    <Card className="overflow-hidden">
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Per Dumping Point (Stockpile / Jetty)</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
                                    <tr>
                                        <th className="py-3 px-4">Lokasi Dumping</th>
                                        <th className="py-3 px-4 text-center">Ritase</th>
                                        <th className="py-3 px-4 text-right">Total Tonase</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {by_dumping_point.map((d, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                            <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">{d.dumping_name}</td>
                                            <td className="py-3 px-4 text-center font-semibold">{d.ritase}</td>
                                            <td className="py-3 px-4 text-right font-bold text-blue-600">{Number(d.total_tonnage).toFixed(2)} T</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            )}

            {/* Tab 5: Weekly & Monthly */}
            {activeTab === 'weekly_monthly' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="overflow-hidden">
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Produksi Mingguan (Weekly Recap)</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
                                    <tr>
                                        <th className="py-3 px-4">Periode Minggu</th>
                                        <th className="py-3 px-4 text-center">Ritase</th>
                                        <th className="py-3 px-4 text-right">Tonase Resmi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {weekly_breakdown.map((w, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                            <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                                                {w.start_of_week} s/d {w.end_of_week}
                                            </td>
                                            <td className="py-3 px-4 text-center font-semibold">{w.ritase} Rit</td>
                                            <td className="py-3 px-4 text-right font-black text-purple-600">{Number(w.total_tonnage).toFixed(2)} Ton</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    <Card className="overflow-hidden">
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Produksi Bulanan (Monthly Recap)</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
                                    <tr>
                                        <th className="py-3 px-4">Bulan (YYYY-MM)</th>
                                        <th className="py-3 px-4 text-center">Ritase</th>
                                        <th className="py-3 px-4 text-right">Tonase Resmi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {monthly_breakdown.map((m, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                            <td className="py-3 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">{m.month_year}</td>
                                            <td className="py-3 px-4 text-center font-semibold">{m.ritase} Rit</td>
                                            <td className="py-3 px-4 text-right font-black text-emerald-600">{Number(m.total_tonnage).toFixed(2)} Ton</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            )}
        </DashboardLayout>
    );
}
