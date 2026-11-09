import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Printer, ArrowLeft } from 'lucide-react';

export default function PrintableAnalyticsReport({
    dataset = {},
    reportType = 'executive',
    format = 'printable',
    exportCode = '',
    filters = {},
}) {
    const headers = dataset.headers || [];
    const rows = dataset.rows || [];
    const summary = dataset.summary || {};

    return (
        <div className="min-h-screen bg-white text-slate-900 p-8">
            <Head title={`${dataset.title || 'Analytics Report'} - ${exportCode}`} />

            {/* Top Action Bar (Hidden on Print) */}
            <div className="print:hidden flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
                <Link
                    href="/analytics/dashboard"
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold inline-flex items-center gap-1.5"
                >
                    <ArrowLeft className="w-4 h-4" /> Kembali ke Analytics Center
                </Link>

                <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold inline-flex items-center gap-1.5"
                >
                    <Printer className="w-4 h-4" /> Cetak / Simpan sebagai PDF
                </button>
            </div>

            {/* Official Report Header */}
            <div className="border-b-2 border-slate-900 pb-4 mb-6 flex items-start justify-between">
                <div>
                    <p className="text-xs font-extrabold uppercase tracking-widest text-amber-600">
                        PT TEKNINDO ADHYA PANE — INTEGRATED COAL HAULING MANAGEMENT SYSTEM
                    </p>
                    <h1 className="text-xl font-black text-slate-900 mt-1">
                        {dataset.title || 'Official Operational & Management Report'}
                    </h1>
                    <p className="text-xs text-slate-600 mt-1">
                        Periode Laporan: <strong>{filters.date_from}</strong> s/d <strong>{filters.date_to}</strong> •
                        Site Filter: <strong>{filters.site_id ? `Site ID #${filters.site_id}` : 'All Authorized Sites'}</strong>
                    </p>
                </div>
                <div className="text-right text-xs">
                    <div className="font-mono font-bold text-slate-800">{exportCode}</div>
                    <div className="text-slate-500 uppercase">Mode: {format} ({reportType})</div>
                    <div className="text-slate-500">Total Baris: {rows.length}</div>
                </div>
            </div>

            {/* Summary Key-Value Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
                {Object.entries(summary).slice(0, 6).map(([k, v]) => (
                    <div key={k} className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                        <span className="text-[10px] font-bold uppercase text-slate-500 block">
                            {k.replace(/_/g, ' ')}
                        </span>
                        <span className="text-sm font-extrabold text-slate-900 mt-0.5 block">
                            {typeof v === 'number' ? v.toLocaleString('id-ID') : String(v ?? '-')}
                        </span>
                    </div>
                ))}
            </div>

            {/* Main Data Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse border border-slate-300">
                    <thead>
                        <tr className="bg-slate-100 text-slate-800">
                            {headers.map((h, i) => (
                                <th key={i} className="border border-slate-300 px-3 py-2 font-bold">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.length === 0 ? (
                            <tr>
                                <td colSpan={headers.length || 1} className="border border-slate-300 px-3 py-6 text-center text-slate-400">
                                    Tidak ada baris transaksi untuk filter yang dipilih.
                                </td>
                            </tr>
                        ) : (
                            rows.map((row, rIdx) => (
                                <tr key={rIdx} className="even:bg-slate-50/50">
                                    {row.map((cell, cIdx) => (
                                        <td key={cIdx} className="border border-slate-300 px-3 py-1.5">
                                            {cell ?? '-'}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
