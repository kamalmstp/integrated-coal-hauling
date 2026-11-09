import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import DashboardLayout from '@/components/templates/DashboardLayout';

export default function FuelInventoryIndex({ tanks, suppliers, receipts, transfers, metrics, filters, master }) {
    const [activeModal, setActiveModal] = useState(null); // 'receipt' | 'transfer' | 'tank' | 'supplier'
    const [selectedTankChart, setSelectedTankChart] = useState(null);

    const receiptForm = useForm({
        site_id: master?.sites?.[0]?.id || '',
        receipt_type: 'fuel_receiving',
        receipt_date: new Date().toISOString().slice(0, 10),
        fuel_supplier_id: suppliers?.[0]?.id || '',
        po_number: '',
        do_number: '',
        invoice_number: '',
        invoice_date: new Date().toISOString().slice(0, 10),
        transport_vehicle_no: '',
        driver_name: '',
        received_by: '',
        remarks: '',
        items: [
            {
                fuel_tank_id: tanks?.[0]?.id || '',
                do_volume_liters: 8000,
                received_volume_liters: 8000,
                unit_price: 14850,
            },
        ],
    });

    const transferForm = useForm({
        site_id: master?.sites?.[0]?.id || '',
        source_tank_id: tanks?.[0]?.id || '',
        destination_tank_id: tanks?.[1]?.id || '',
        transaction_date: new Date().toISOString().slice(0, 10),
        transaction_time: '08:00:00',
        fuelman_id: '',
        liters: 2000,
        remarks: 'Transfer stok solar ke Mobile Bowser operasional',
    });

    const tankForm = useForm({
        tank_number: '',
        tank_name: '',
        site_id: master?.sites?.[0]?.id || '',
        tank_type: 'stationary_tank',
        shape_type: 'calibrated_chart',
        capacity_liters: 30000,
        minimum_alert_liters: 5000,
        max_height_cm: 250,
        diameter_cm: 250,
        length_cm: 615,
        average_cost_per_liter: 14850,
    });

    const supplierForm = useForm({
        supplier_code: '',
        name: '',
        contact_person: '',
        phone: '',
        fuel_type: 'Biosolar B35 Industri',
        contract_number: '',
        contract_price_per_liter: 14850,
        payment_terms: 'TOP 30 Days',
    });

    const formatNumber = (val, digits = 0) =>
        Number(val || 0).toLocaleString('id-ID', { minimumFractionDigits: digits, maximumFractionDigits: digits });

    const formatIDR = (val) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(val || 0));

    return (
        <DashboardLayout title="Fuel Inventory, Multi-Tank, Receiving & Transfer">
            <Head title="Fuel Inventory - TAP Fuel Management" />

            <div className="space-y-6">
                {/* Navigation & Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                        <Link href="/fuel/dashboard" className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            Dashboard BBM
                        </Link>
                        <Link href="/fuel/inventory" className="px-3.5 py-2 rounded-xl bg-amber-600 text-white">
                            1. Fuel Inventory & Tangki
                        </Link>
                        <Link href="/fuel/soundings" className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            2. Daily Sounding & Rekonsiliasi
                        </Link>
                        <Link href="/fuel/dispensing" className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            3. Fuel Dispensing & Digital Ticket
                        </Link>
                        <Link href="/fuel/analytics" className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            4. Analisis Konsumsi & Rasio BBM
                        </Link>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => setActiveModal('receipt')}
                            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black"
                        >
                            + Fuel Receiving / Opening Stock
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveModal('transfer')}
                            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black"
                        >
                            ⇄ Transfer Antar-Tangki
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveModal('tank')}
                            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold"
                        >
                            + Tangki Baru
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveModal('supplier')}
                            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold"
                        >
                            + Supplier BBM
                        </button>
                    </div>
                </div>

                {/* Summary Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <div className="text-[10px] font-black uppercase text-slate-400">Total Tangki Aktif</div>
                        <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{metrics?.total_tanks || 0}</div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <div className="text-[10px] font-black uppercase text-slate-400">Opening Stock</div>
                        <div className="text-xl font-black text-slate-900 dark:text-white mt-1">{formatNumber(metrics?.opening_stock_liters)} L</div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <div className="text-[10px] font-black uppercase text-emerald-500">Total Fuel Received</div>
                        <div className="text-xl font-black text-emerald-600 mt-1">{formatNumber(metrics?.total_received_liters)} L</div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <div className="text-[10px] font-black uppercase text-amber-500">Closing Stock Saat Ini</div>
                        <div className="text-xl font-black text-amber-600 mt-1">{formatNumber(metrics?.closing_stock_liters)} L</div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <div className="text-[10px] font-black uppercase text-indigo-500">Kapasitas Penyimpanan</div>
                        <div className="text-xl font-black text-indigo-600 mt-1">{formatNumber(metrics?.total_capacity_liters)} L</div>
                    </div>
                </div>

                {/* Multi-Tank per Site & Calibration Chart */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white mb-3">
                        Daftar Tangki Penyimpanan BBM & Mobile Bowser per Site
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase text-[10px]">
                                <tr>
                                    <th className="py-2.5 px-3 text-left">Nomor & Nama Tangki</th>
                                    <th className="py-2.5 px-3 text-left">Site & Tipe</th>
                                    <th className="py-2.5 px-3 text-right">Kapasitas / Tinggi Maks</th>
                                    <th className="py-2.5 px-3 text-right">Opening Stock</th>
                                    <th className="py-2.5 px-3 text-right">Closing Stock (Saat Ini)</th>
                                    <th className="py-2.5 px-3 text-right">Harga Rata-Rata/L</th>
                                    <th className="py-2.5 px-3 text-center">Tabel Kalibrasi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {(tanks || []).map((t) => (
                                    <tr key={t.id}>
                                        <td className="py-3 px-3">
                                            <div className="font-black text-slate-900 dark:text-white">{t.tank_number}</div>
                                            <div className="text-[11px] text-slate-500">{t.tank_name}</div>
                                        </td>
                                        <td className="py-3 px-3">
                                            <div className="font-bold text-slate-800 dark:text-slate-200">{t.site?.name} ({t.site?.code})</div>
                                            <div className="text-[10px] uppercase text-slate-500">{t.tank_type.replace('_', ' ')}</div>
                                        </td>
                                        <td className="py-3 px-3 text-right">
                                            <div className="font-bold">{formatNumber(t.capacity_liters)} L</div>
                                            <div className="text-[10px] text-slate-500">Max Height: {t.max_height_cm} cm</div>
                                        </td>
                                        <td className="py-3 px-3 text-right font-semibold">{formatNumber(t.opening_stock_liters)} L</td>
                                        <td className="py-3 px-3 text-right font-black text-emerald-600">{formatNumber(t.current_stock_liters)} L</td>
                                        <td className="py-3 px-3 text-right">{formatIDR(t.average_cost_per_liter)}</td>
                                        <td className="py-3 px-3 text-center">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedTankChart(t)}
                                                className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold"
                                            >
                                                Lihat Chart ({t.calibrations?.length || 0} Titik)
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Fuel Receiving / Invoices & Inter-Tank Transfers */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                        <h3 className="text-sm font-black text-slate-900 dark:text-white mb-3">
                            Histori Fuel Purchase, Receiving, Invoice & Opening Stock
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                                <thead className="bg-slate-50 dark:bg-slate-800 text-[10px] uppercase text-slate-500">
                                    <tr>
                                        <th className="p-2.5 text-left">No. Receipt & Tgl</th>
                                        <th className="p-2.5 text-left">Supplier / PO / Invoice</th>
                                        <th className="p-2.5 text-right">Volume Diterima</th>
                                        <th className="p-2.5 text-right">Nilai Pembelian</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                    {(receipts?.data || []).map((rec) => (
                                        <tr key={rec.id}>
                                            <td className="p-2.5">
                                                <div className="font-black text-slate-900 dark:text-white">{rec.receipt_number}</div>
                                                <div className="text-[10px] text-slate-500">
                                                    {rec.receipt_date?.slice(0, 10)} • {rec.receipt_type}
                                                </div>
                                            </td>
                                            <td className="p-2.5">
                                                <div className="font-semibold">{rec.supplier?.name || 'Internal Opening Stock'}</div>
                                                <div className="text-[10px] text-slate-500">
                                                    PO: {rec.po_number || '-'} • DO: {rec.do_number || '-'} • Inv: {rec.invoice_number || '-'} ({rec.invoice_status})
                                                </div>
                                            </td>
                                            <td className="p-2.5 text-right font-black text-emerald-600">
                                                +{formatNumber(rec.total_received_liters)} L
                                            </td>
                                            <td className="p-2.5 text-right font-bold">{formatIDR(rec.total_amount)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                        <h3 className="text-sm font-black text-slate-900 dark:text-white mb-3">
                            Histori Transfer Solar Antar-Tangki & Supplier Master
                        </h3>
                        <div className="space-y-2 mb-4">
                            {(transfers || []).map((trf) => (
                                <div key={trf.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs flex justify-between items-center">
                                    <div>
                                        <div className="font-black text-slate-900 dark:text-white">{trf.transaction_number}</div>
                                        <div className="text-[11px] text-slate-500">
                                            {trf.source_tank?.tank_number} → {trf.destination_tank?.tank_number}
                                        </div>
                                    </div>
                                    <div className="text-right font-black text-indigo-600">
                                        {formatNumber(trf.liters)} L
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-slate-200 dark:border-slate-800 pt-3">
                            <div className="text-[11px] font-black uppercase text-slate-400 mb-2">Kontrak Supplier Solar Aktif</div>
                            {(suppliers || []).map((s) => (
                                <div key={s.id} className="text-xs py-1.5 flex justify-between border-b border-slate-100 dark:border-slate-800">
                                    <div>
                                        <span className="font-bold">{s.name}</span>
                                        <span className="text-[10px] text-slate-400 ml-1">({s.contract_number || s.supplier_code})</span>
                                    </div>
                                    <span className="font-bold text-emerald-600">{formatIDR(s.contract_price_per_liter)}/L</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Calibration Strapping Chart Viewer */}
            {selectedTankChart && (
                <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full p-6 space-y-4 shadow-xl text-xs max-h-[85vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                            <div>
                                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                                    Tabel Kalibrasi Tangki Tervalidasi — {selectedTankChart.tank_number}
                                </h3>
                                <p className="text-[11px] text-slate-500">
                                    Tinggi Sounding (cm) dikonversi menggunakan interpolasi non-linear (Bukan 1 cm = 1 Liter)
                                </p>
                            </div>
                            <button type="button" onClick={() => setSelectedTankChart(null)} className="font-bold text-slate-400">✕</button>
                        </div>
                        <table className="w-full text-xs">
                            <thead className="bg-slate-100 dark:bg-slate-800 text-[10px] uppercase">
                                <tr>
                                    <th className="p-2 text-left">Tinggi Sounding (cm)</th>
                                    <th className="p-2 text-right">Volume Terkalibrasi (Liter)</th>
                                    <th className="p-2 text-right">Faktor Inkremental (L / mm)</th>
                                    <th className="p-2 text-left">No. Sertifikat</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {(selectedTankChart.calibrations || []).map((c) => (
                                    <tr key={c.id}>
                                        <td className="p-2 font-bold">{c.height_cm} cm</td>
                                        <td className="p-2 text-right font-black text-indigo-600">{formatNumber(c.volume_liters, 2)} L</td>
                                        <td className="p-2 text-right">{c.mm_increment_factor} L/mm</td>
                                        <td className="p-2 text-slate-500">{c.calibration_certificate_no}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal Fuel Receiving */}
            {activeModal === 'receipt' && (
                <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            receiptForm.post('/fuel/receipts', { onSuccess: () => setActiveModal(null) });
                        }}
                        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-xl w-full p-6 space-y-4 shadow-xl text-xs"
                    >
                        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
                            <h3 className="text-sm font-black">Catat Fuel Receiving / Invoice / Opening Stock</h3>
                            <button type="button" onClick={() => setActiveModal(null)}>✕</button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="font-bold">Site</label>
                                <select
                                    value={receiptForm.data.site_id}
                                    onChange={(e) => receiptForm.setData('site_id', e.target.value)}
                                    className="w-full mt-1 rounded-xl border-slate-300 dark:bg-slate-800 text-xs"
                                >
                                    {(master?.sites || []).map((s) => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="font-bold">Tipe Penerimaan</label>
                                <select
                                    value={receiptForm.data.receipt_type}
                                    onChange={(e) => receiptForm.setData('receipt_type', e.target.value)}
                                    className="w-full mt-1 rounded-xl border-slate-300 dark:bg-slate-800 text-xs"
                                >
                                    <option value="fuel_receiving">Fuel Purchase Receiving</option>
                                    <option value="opening_stock">Opening Stock</option>
                                </select>
                            </div>
                            <div>
                                <label className="font-bold">Tangki Tujuan</label>
                                <select
                                    value={receiptForm.data.items[0].fuel_tank_id}
                                    onChange={(e) =>
                                        receiptForm.setData('items', [{ ...receiptForm.data.items[0], fuel_tank_id: e.target.value }])
                                    }
                                    className="w-full mt-1 rounded-xl border-slate-300 dark:bg-slate-800 text-xs"
                                >
                                    {(tanks || []).map((t) => (
                                        <option key={t.id} value={t.id}>{t.tank_number} - {t.tank_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="font-bold">Volume Diterima (Liter)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={receiptForm.data.items[0].received_volume_liters}
                                    onChange={(e) =>
                                        receiptForm.setData('items', [
                                            {
                                                ...receiptForm.data.items[0],
                                                do_volume_liters: e.target.value,
                                                received_volume_liters: e.target.value,
                                            },
                                        ])
                                    }
                                    className="w-full mt-1 rounded-xl border-slate-300 dark:bg-slate-800 text-xs font-black text-emerald-600"
                                />
                            </div>
                            <div>
                                <label className="font-bold">Nomor PO / DO</label>
                                <input
                                    type="text"
                                    placeholder="DO-PTM-2026-009"
                                    value={receiptForm.data.do_number}
                                    onChange={(e) => receiptForm.setData('do_number', e.target.value)}
                                    className="w-full mt-1 rounded-xl border-slate-300 dark:bg-slate-800 text-xs"
                                />
                            </div>
                            <div>
                                <label className="font-bold">Nomor Invoice Supplier</label>
                                <input
                                    type="text"
                                    placeholder="INV-FUEL-2026-009"
                                    value={receiptForm.data.invoice_number}
                                    onChange={(e) => receiptForm.setData('invoice_number', e.target.value)}
                                    className="w-full mt-1 rounded-xl border-slate-300 dark:bg-slate-800 text-xs"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                            <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold">
                                Batal
                            </button>
                            <button type="submit" className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-black">
                                Simpan Penerimaan Solar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Modal Inter-Tank Transfer */}
            {activeModal === 'transfer' && (
                <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            transferForm.post('/fuel/transfers', { onSuccess: () => setActiveModal(null) });
                        }}
                        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 space-y-4 shadow-xl text-xs"
                    >
                        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
                            <h3 className="text-sm font-black">Transfer Solar Antar-Tangki (Main Tank → Bowser)</h3>
                            <button type="button" onClick={() => setActiveModal(null)}>✕</button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="font-bold">Tangki Asal</label>
                                <select
                                    value={transferForm.data.source_tank_id}
                                    onChange={(e) => transferForm.setData('source_tank_id', e.target.value)}
                                    className="w-full mt-1 rounded-xl border-slate-300 dark:bg-slate-800 text-xs"
                                >
                                    {(tanks || []).map((t) => (
                                        <option key={t.id} value={t.id}>{t.tank_number} ({formatNumber(t.current_stock_liters)} L)</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="font-bold">Tangki Tujuan</label>
                                <select
                                    value={transferForm.data.destination_tank_id}
                                    onChange={(e) => transferForm.setData('destination_tank_id', e.target.value)}
                                    className="w-full mt-1 rounded-xl border-slate-300 dark:bg-slate-800 text-xs"
                                >
                                    {(tanks || []).map((t) => (
                                        <option key={t.id} value={t.id}>{t.tank_number} ({formatNumber(t.current_stock_liters)} L)</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="font-bold">Volume Transfer (Liter)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={transferForm.data.liters}
                                    onChange={(e) => transferForm.setData('liters', e.target.value)}
                                    className="w-full mt-1 rounded-xl border-slate-300 dark:bg-slate-800 text-xs font-black text-indigo-600"
                                />
                            </div>
                            <div>
                                <label className="font-bold">Tanggal Transfer</label>
                                <input
                                    type="date"
                                    required
                                    value={transferForm.data.transaction_date}
                                    onChange={(e) => transferForm.setData('transaction_date', e.target.value)}
                                    className="w-full mt-1 rounded-xl border-slate-300 dark:bg-slate-800 text-xs"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                            <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold">
                                Batal
                            </button>
                            <button type="submit" className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-black">
                                Proses Transfer Solar
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </DashboardLayout>
    );
}
