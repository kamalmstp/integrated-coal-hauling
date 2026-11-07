import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import DashboardLayout from '../../../components/templates/DashboardLayout';
import Card from '../../../components/molecules/Card';
import Button from '../../../components/atoms/Button';
import {
    Activity,
    Calendar,
    Filter,
    RefreshCw,
    TrendingUp,
    Clock,
    AlertTriangle,
    Wrench,
    CheckCircle2,
    Info,
    HelpCircle,
    ChevronDown,
    ChevronUp,
    Truck,
    Percent,
    ShieldCheck,
} from 'lucide-react';

export default function FleetKpiIndex({
    metrics = {},
    formulas = {},
    dailyTrends = [],
    unitBreakdown = [],
    filters = {},
    master = {},
}) {
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const [siteId, setSiteId] = useState(filters.site_id || '');
    const [unitId, setUnitId] = useState(filters.unit_id || '');

    const [isFormulaOpen, setIsFormulaOpen] = useState(true);

    const handleFilter = (e) => {
        e?.preventDefault();
        router.get('/fleet/kpi', {
            date_from: dateFrom,
            date_to: dateTo,
            site_id: siteId,
            unit_id: unitId,
        }, { preserveState: true, preserveScroll: true });
    };

    const handleReset = () => {
        setDateFrom('');
        setDateTo('');
        setSiteId('');
        setUnitId('');
        router.get('/fleet/kpi');
    };

    const getKpiColor = (val, thresholdGood = 85, thresholdWarn = 70) => {
        if (val >= thresholdGood) return 'text-emerald-600 dark:text-emerald-400';
        if (val >= thresholdWarn) return 'text-amber-600 dark:text-amber-400';
        return 'text-rose-600 dark:text-rose-400';
    };

    const getKpiBg = (val, thresholdGood = 85, thresholdWarn = 70) => {
        if (val >= thresholdGood) return 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800';
        if (val >= thresholdWarn) return 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800';
        return 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800';
    };

    return (
        <DashboardLayout>
            <Head title="Fleet KPI Dashboard (PA, MA, UA, MTTR, MTBF) - TAP" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div>
                        <div className="flex items-center space-x-3">
                            <div className="p-2.5 rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400">
                                <Activity className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                                    Fleet KPI & Availability Dashboard
                                </h1>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Analisis kehandalan armada: Physical Availability (PA), Mechanical Availability (MA), Utilization (UA), MTTR & MTBF
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3 w-full sm:w-auto">
                        <Button
                            variant="secondary"
                            onClick={() => router.get('/fleet/kpi')}
                            className="flex items-center space-x-2"
                        >
                            <RefreshCw className="w-4 h-4" />
                            <span>Segarkan</span>
                        </Button>
                    </div>
                </div>

                {/* Filter Bar */}
                <Card className="p-5 bg-white dark:bg-slate-800">
                    <form onSubmit={handleFilter} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Dari Tanggal</label>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Sampai Tanggal</label>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Site Proyek</label>
                            <select
                                value={siteId}
                                onChange={(e) => setSiteId(e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            >
                                <option value="">Semua Site</option>
                                {master.sites?.map((s) => (
                                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Pilih Unit Spesifik</label>
                            <select
                                value={unitId}
                                onChange={(e) => setUnitId(e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            >
                                <option value="">Seluruh Armada Fleet</option>
                                {master.units?.map((u) => (
                                    <option key={u.id} value={u.id}>{u.unit_code} - {u.registration_number}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-end space-x-2">
                            <Button type="submit" variant="primary" className="flex-1 flex items-center justify-center space-x-1">
                                <Filter className="w-4 h-4" />
                                <span>Filter</span>
                            </Button>
                            <Button type="button" variant="secondary" onClick={handleReset}>
                                Reset
                            </Button>
                        </div>
                    </form>
                </Card>

                {/* Primary Fleet KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {/* PA */}
                    <div className={`p-6 rounded-2xl border transition-all ${getKpiBg(metrics.physical_availability)}`}>
                        <div className="flex justify-between items-start">
                            <div>
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                                    Physical Availability (PA)
                                </span>
                                <div className="flex items-baseline space-x-2 mt-2">
                                    <span className={`text-4xl font-black ${getKpiColor(metrics.physical_availability)}`}>
                                        {metrics.physical_availability}%
                                    </span>
                                    <span className="text-xs text-slate-500 font-medium">Target &ge; 85%</span>
                                </div>
                            </div>
                            <div className="p-3 rounded-xl bg-white dark:bg-slate-800 shadow-sm">
                                <ShieldCheck className="w-6 h-6 text-emerald-600" />
                            </div>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-4 border-t border-slate-200 dark:border-slate-700/60 pt-3">
                            Tingkat kesiapan fisik unit untuk dioperasikan terhadap seluruh jam kalender ({metrics.total_calendar_hours} Jam TH).
                        </p>
                    </div>

                    {/* MA */}
                    <div className={`p-6 rounded-2xl border transition-all ${getKpiBg(metrics.mechanical_availability)}`}>
                        <div className="flex justify-between items-start">
                            <div>
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                                    Mechanical Availability (MA)
                                </span>
                                <div className="flex items-baseline space-x-2 mt-2">
                                    <span className={`text-4xl font-black ${getKpiColor(metrics.mechanical_availability)}`}>
                                        {metrics.mechanical_availability}%
                                    </span>
                                    <span className="text-xs text-slate-500 font-medium">Target &ge; 90%</span>
                                </div>
                            </div>
                            <div className="p-3 rounded-xl bg-white dark:bg-slate-800 shadow-sm">
                                <Wrench className="w-6 h-6 text-amber-600" />
                            </div>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-4 border-t border-slate-200 dark:border-slate-700/60 pt-3">
                            Efektivitas mekanikal unit tanpa memperhitungkan idle/standby: OH / (OH + DT).
                        </p>
                    </div>

                    {/* UA */}
                    <div className={`p-6 rounded-2xl border transition-all ${getKpiBg(metrics.utilization_ua, 70, 50)}`}>
                        <div className="flex justify-between items-start">
                            <div>
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                                    Utilization of Availability (UA)
                                </span>
                                <div className="flex items-baseline space-x-2 mt-2">
                                    <span className={`text-4xl font-black ${getKpiColor(metrics.utilization_ua, 70, 50)}`}>
                                        {metrics.utilization_ua}%
                                    </span>
                                    <span className="text-xs text-slate-500 font-medium">Target &ge; 70%</span>
                                </div>
                            </div>
                            <div className="p-3 rounded-xl bg-white dark:bg-slate-800 shadow-sm">
                                <TrendingUp className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-4 border-t border-slate-200 dark:border-slate-700/60 pt-3">
                            Optimalisasi armada siap pakai (RFU) yang benar-benar aktif mengangkut batubara.
                        </p>
                    </div>
                </div>

                {/* Secondary Metrics: Hours Breakdown & Reliability */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                    <Card className="p-4 bg-white dark:bg-slate-800">
                        <span className="text-xs font-medium text-slate-500 block">Calendar Hours (TH)</span>
                        <div className="flex items-baseline justify-between mt-1">
                            <span className="text-xl font-black text-slate-900 dark:text-white">{metrics.total_calendar_hours}</span>
                            <span className="text-xs text-slate-400">Jam Total</span>
                        </div>
                    </Card>

                    <Card className="p-4 bg-white dark:bg-slate-800">
                        <span className="text-xs font-medium text-emerald-600 block">Operating Hours (OH)</span>
                        <div className="flex items-baseline justify-between mt-1">
                            <span className="text-xl font-black text-emerald-600">{metrics.total_operating_hours}</span>
                            <span className="text-xs text-emerald-500">Jam Kerja</span>
                        </div>
                    </Card>

                    <Card className="p-4 bg-white dark:bg-slate-800">
                        <span className="text-xs font-medium text-blue-600 block">Standby Hours (SB)</span>
                        <div className="flex items-baseline justify-between mt-1">
                            <span className="text-xl font-black text-blue-600">{metrics.total_standby_hours}</span>
                            <span className="text-xs text-blue-500">Jam Idle</span>
                        </div>
                    </Card>

                    <Card className="p-4 bg-white dark:bg-slate-800">
                        <span className="text-xs font-medium text-rose-600 block">Downtime Hours (DT)</span>
                        <div className="flex items-baseline justify-between mt-1">
                            <span className="text-xl font-black text-rose-600">{metrics.total_downtime_hours}</span>
                            <span className="text-xs text-rose-500">Jam Rusak</span>
                        </div>
                    </Card>

                    <Card className="p-4 bg-white dark:bg-slate-800">
                        <span className="text-xs font-medium text-amber-600 block">MTTR (Rata-rata Servis)</span>
                        <div className="flex items-baseline justify-between mt-1">
                            <span className="text-xl font-black text-amber-600">{metrics.mttr_hours}</span>
                            <span className="text-xs text-amber-500">Jam/Breakdown</span>
                        </div>
                    </Card>

                    <Card className="p-4 bg-white dark:bg-slate-800">
                        <span className="text-xs font-medium text-purple-600 block">MTBF (Antar Kerusakan)</span>
                        <div className="flex items-baseline justify-between mt-1">
                            <span className="text-xl font-black text-purple-600">{metrics.mtbf_hours}</span>
                            <span className="text-xs text-purple-500">Jam/Failure</span>
                        </div>
                    </Card>
                </div>

                {/* Explicit Formulas Accordion / Infobox */}
                <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm border border-slate-800">
                    <div
                        onClick={() => setIsFormulaOpen(!isFormulaOpen)}
                        className="flex justify-between items-center cursor-pointer select-none"
                    >
                        <div className="flex items-center space-x-3">
                            <Info className="w-5 h-5 text-cyan-400" />
                            <h3 className="font-bold text-base text-slate-100">
                                Definisi Formula & Dasar Perhitungan Ketersediaan Armada Tambang (Explicit Standards)
                            </h3>
                        </div>
                        <button className="text-slate-400 hover:text-white transition">
                            {isFormulaOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                    </div>

                    {isFormulaOpen && (
                        <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div className="p-3 bg-slate-800/80 rounded-xl space-y-1">
                                <span className="font-bold text-cyan-400 block text-sm">1. Total Calendar Hours (TH)</span>
                                <p className="text-slate-300 font-mono">{formulas.calendar_hours}</p>
                                <p className="text-slate-400 text-[11px]">
                                    Dasar waktu absolut 24 jam sehari dikalikan jumlah unit dalam populasi fleet aktif ({metrics.fleet_size} Unit × {metrics.days_count} Hari = {metrics.total_calendar_hours} Jam).
                                </p>
                            </div>

                            <div className="p-3 bg-slate-800/80 rounded-xl space-y-1">
                                <span className="font-bold text-emerald-400 block text-sm">2. Physical Availability (PA)</span>
                                <p className="text-slate-300 font-mono">{formulas.physical_availability}</p>
                                <p className="text-slate-400 text-[11px]">
                                    Pembagi adalah TH (Total Calendar Hours). Menghitung persentase unit berada dalam kondisi siap operasi (RFU = OH + SB) terhadap jam kalender.
                                </p>
                            </div>

                            <div className="p-3 bg-slate-800/80 rounded-xl space-y-1">
                                <span className="font-bold text-amber-400 block text-sm">3. Mechanical Availability (MA)</span>
                                <p className="text-slate-300 font-mono">{formulas.mechanical_availability}</p>
                                <p className="text-slate-400 text-[11px]">
                                    Pembagi adalah OH + DT. Mengabaikan waktu standby (misal hujan, antre, jalan licin), khusus mengukur murni kehandalan teknis mesin dan kecepatan bengkel.
                                </p>
                            </div>

                            <div className="p-3 bg-slate-800/80 rounded-xl space-y-1">
                                <span className="font-bold text-blue-400 block text-sm">4. Utilization of Availability (UA)</span>
                                <p className="text-slate-300 font-mono">{formulas.utilization_ua}</p>
                                <p className="text-slate-400 text-[11px]">
                                    Pembagi adalah Jam RFU (OH + SB). Mengukur seberapa efisien unit yang sehat dan siap jalan benar-benar dioperasikan untuk pengangkutan.
                                </p>
                            </div>

                            <div className="p-3 bg-slate-800/80 rounded-xl space-y-1">
                                <span className="font-bold text-purple-400 block text-sm">5. MTTR (Mean Time to Repair)</span>
                                <p className="text-slate-300 font-mono">{formulas.mttr}</p>
                                <p className="text-slate-400 text-[11px]">
                                    Rata-rata waktu yang dibutuhkan mekanik untuk menyelesaikan satu perbaikan hingga unit kembali RFU.
                                </p>
                            </div>

                            <div className="p-3 bg-slate-800/80 rounded-xl space-y-1">
                                <span className="font-bold text-pink-400 block text-sm">6. MTBF (Mean Time Between Failures)</span>
                                <p className="text-slate-300 font-mono">{formulas.mtbf}</p>
                                <p className="text-slate-400 text-[11px]">
                                    Rata-rata durasi jam kerja operasi (OH) sebelum unit mengalami kegagalan / breakdown berikutnya.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Daily Trends Table & Bar Chart Representation */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden p-6 space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center space-x-2">
                            <TrendingUp className="w-5 h-5 text-emerald-600" />
                            <span>Tren Harian Availability Armada (PA, MA, UA)</span>
                        </h3>
                        <span className="text-xs text-slate-500">Rentang Periode Terpilih</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                                    <th className="py-3 px-4">Tanggal</th>
                                    <th className="py-3 px-4">Operating (OH)</th>
                                    <th className="py-3 px-4">Standby (SB)</th>
                                    <th className="py-3 px-4">Downtime (DT)</th>
                                    <th className="py-3 px-4">PA (%)</th>
                                    <th className="py-3 px-4">MA (%)</th>
                                    <th className="py-3 px-4">UA (%)</th>
                                    <th className="py-3 px-4">Breakdowns</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-xs font-mono">
                                {dailyTrends.map((trend, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                        <td className="py-3 px-4 font-sans font-bold text-slate-900 dark:text-white">
                                            {trend.date}
                                        </td>
                                        <td className="py-3 px-4 text-emerald-600 font-bold">{trend.operating_hours} Jam</td>
                                        <td className="py-3 px-4 text-blue-600">{trend.standby_hours} Jam</td>
                                        <td className="py-3 px-4 text-rose-600">{trend.downtime_hours} Jam</td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-0.5 rounded font-bold ${getKpiColor(trend.pa)}`}>
                                                {trend.pa}%
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-0.5 rounded font-bold ${getKpiColor(trend.ma)}`}>
                                                {trend.ma}%
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-0.5 rounded font-bold ${getKpiColor(trend.ua, 70, 50)}`}>
                                                {trend.ua}%
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            {trend.breakdowns > 0 ? (
                                                <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-bold">
                                                    {trend.breakdowns} Kali
                                                </span>
                                            ) : (
                                                <span className="text-slate-400">0</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Unit-by-Unit KPI Breakdown */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden p-6 space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center space-x-2">
                            <Truck className="w-5 h-5 text-blue-600" />
                            <span>Kinerja & Availability Per Armada Unit</span>
                        </h3>
                        <span className="text-xs text-slate-500">Evaluasi Individu Dump Truck</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                                    <th className="py-3 px-4">Armada</th>
                                    <th className="py-3 px-4">Tipe</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4">Operating (OH)</th>
                                    <th className="py-3 px-4">Standby (SB)</th>
                                    <th className="py-3 px-4">Downtime (DT)</th>
                                    <th className="py-3 px-4">PA</th>
                                    <th className="py-3 px-4">MA</th>
                                    <th className="py-3 px-4">UA</th>
                                    <th className="py-3 px-4">Breakdown</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-xs">
                                {unitBreakdown.map((u) => (
                                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                        <td className="py-3 px-4">
                                            <span className="font-bold text-slate-900 dark:text-white block">{u.unit_code}</span>
                                            <span className="text-[11px] text-slate-500 font-mono">{u.registration_number}</span>
                                        </td>
                                        <td className="py-3 px-4 capitalize text-slate-700 dark:text-slate-300">
                                            {u.unit_type.replace('_', ' ')}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                                u.status === 'operating' ? 'bg-emerald-100 text-emerald-800' :
                                                u.status === 'standby' ? 'bg-blue-100 text-blue-800' :
                                                u.status === 'breakdown' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                                            }`}>
                                                {u.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 font-mono font-bold text-emerald-600">{u.operating_hours} Jam</td>
                                        <td className="py-3 px-4 font-mono text-blue-600">{u.standby_hours} Jam</td>
                                        <td className="py-3 px-4 font-mono text-rose-600">{u.downtime_hours} Jam</td>
                                        <td className="py-3 px-4 font-mono font-bold">
                                            <span className={getKpiColor(u.pa)}>{u.pa}%</span>
                                        </td>
                                        <td className="py-3 px-4 font-mono font-bold">
                                            <span className={getKpiColor(u.ma)}>{u.ma}%</span>
                                        </td>
                                        <td className="py-3 px-4 font-mono font-bold">
                                            <span className={getKpiColor(u.ua, 70, 50)}>{u.ua}%</span>
                                        </td>
                                        <td className="py-3 px-4 font-mono">
                                            {u.breakdown_count > 0 ? (
                                                <span className="text-rose-600 font-bold">{u.breakdown_count}×</span>
                                            ) : (
                                                <span className="text-slate-400">0</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
