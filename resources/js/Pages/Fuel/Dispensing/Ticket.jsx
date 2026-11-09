import React from 'react';
import { Head, Link } from '@inertiajs/react';

export default function FuelDispensingTicket({ transaction }) {
    const tx = transaction;
    const formatNumber = (val, digits = 2) =>
        Number(val || 0).toLocaleString('id-ID', { minimumFractionDigits: digits, maximumFractionDigits: digits });
    const formatIDR = (val) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(val || 0));

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-950 py-8 px-4 print:bg-white print:p-0">
            <Head title={`Digital Fuel Ticket - ${tx?.digital_ticket_code || tx?.transaction_number}`} />

            {/* Action Bar */}
            <div className="max-w-xl mx-auto mb-6 flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm print:hidden">
                <Link
                    href="/fuel/dispensing"
                    className="px-3.5 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200"
                >
                    ← Kembali ke Fuel Dispensing
                </Link>
                <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-black"
                >
                    Cetak Digital Fuel Ticket (Ctrl+P)
                </button>
            </div>

            {/* Ticket Voucher Card */}
            <div className="max-w-xl mx-auto bg-white text-slate-900 p-6 md:p-8 rounded-2xl border-2 border-slate-900 shadow-lg print:shadow-none print:rounded-none">
                <div className="flex items-start justify-between border-b-2 border-dashed border-slate-300 pb-4">
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-amber-600">
                            PT TEKNINDO ADHYA PANE
                        </div>
                        <h1 className="text-lg font-black text-slate-900">DIGITAL FUEL DISPENSING TICKET</h1>
                        <p className="text-xs text-slate-500">
                            Site: <span className="font-bold text-slate-800">{tx.site?.name} ({tx.site?.code})</span>
                        </p>
                    </div>
                    <div className="text-right">
                        <span className="inline-block px-2.5 py-0.5 rounded bg-slate-900 text-white text-[10px] font-black">
                            {tx.digital_ticket_code}
                        </span>
                        <div className="text-xs font-bold text-slate-700 mt-1">{tx.transaction_number}</div>
                        <div className="text-[11px] text-slate-500">
                            {tx.transaction_date?.slice(0, 10)} • {tx.transaction_time}
                        </div>
                    </div>
                </div>

                {/* Main Volume Highlight */}
                <div className="my-5 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                    <div>
                        <div className="text-[10px] font-black uppercase text-amber-800">VOLUME SOLAR B35 DITERIMA UNIT</div>
                        <div className="text-3xl font-black text-slate-900 mt-0.5">
                            {formatNumber(tx.liters)} <span className="text-sm font-bold text-amber-700">LITER</span>
                        </div>
                    </div>
                    <div className="text-right text-xs">
                        <div className="text-slate-500">Unit Cost: {formatIDR(tx.unit_cost)}/L</div>
                        <div className="font-black text-slate-900 text-sm mt-0.5">{formatIDR(tx.total_cost)}</div>
                        <div className="text-[10px] font-bold text-emerald-700 uppercase mt-0.5">STATUS: {tx.status}</div>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs border-b-2 border-dashed border-slate-300 pb-5">
                    <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Nomor Lambung Unit</span>
                        <span className="font-black text-sm text-slate-900">{tx.unit?.unit_code}</span>
                        <span className="block text-[11px] text-slate-500">{tx.unit?.brand} {tx.unit?.model}</span>
                    </div>
                    <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Driver Penerima</span>
                        <span className="font-bold text-slate-900">{tx.driver?.employee?.name || 'Driver Operasional'}</span>
                    </div>
                    <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Sumber Pengisian (Fuel Source)</span>
                        <span className="font-bold text-slate-900">{tx.source_tank?.tank_number}</span>
                        <span className="block text-[11px] text-slate-500">{tx.source_tank?.tank_name}</span>
                    </div>
                    <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Petugas Fuelman</span>
                        <span className="font-bold text-slate-900">{tx.fuelman?.name || 'Fuelman Duty'}</span>
                    </div>
                    <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Pembacaan Hour Meter (HM)</span>
                        <span className="font-bold text-slate-900">{tx.current_hm} HM (Δ +{tx.hm_delta})</span>
                    </div>
                    <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Pembacaan Odometer (KM)</span>
                        <span className="font-bold text-slate-900">{tx.current_km} KM (Δ +{tx.km_delta})</span>
                    </div>
                    <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Flowmeter Start → End</span>
                        <span className="font-semibold text-slate-800">
                            {tx.flowmeter_start || '-'} → {tx.flowmeter_end || '-'}
                        </span>
                    </div>
                    <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Referensi Tiket Produksi</span>
                        <span className="font-semibold text-indigo-700">
                            {tx.dumping_ticket?.ticket_number || tx.reference_ticket_number || '-'}
                        </span>
                    </div>
                </div>

                {/* Signatures */}
                <div className="grid grid-cols-2 gap-4 pt-5 text-center text-xs">
                    <div className="border border-slate-200 rounded-xl p-3">
                        <div className="text-slate-500 text-[11px]">Diserahkan Oleh (Fuelman)</div>
                        <div className="h-10 flex items-center justify-center text-[10px] font-bold text-emerald-700">
                            VERIFIED DISPENSER
                        </div>
                        <div className="font-bold border-t border-slate-200 pt-1">{tx.fuelman?.name || 'Fuelman'}</div>
                    </div>
                    <div className="border border-slate-200 rounded-xl p-3">
                        <div className="text-slate-500 text-[11px]">Diterima Oleh (Driver Unit)</div>
                        <div className="h-10 flex items-center justify-center text-[10px] font-bold text-indigo-700">
                            CONFIRMED BY DRIVER
                        </div>
                        <div className="font-bold border-t border-slate-200 pt-1">
                            {tx.driver?.employee?.name || tx.unit?.unit_code}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
