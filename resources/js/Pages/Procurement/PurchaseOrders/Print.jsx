import React from 'react';
import { Head, Link } from '@inertiajs/react';

export default function PurchaseOrderPrint({ purchaseOrder }) {
    const po = purchaseOrder;
    const formatIDR = (val) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(val || 0));

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-950 py-8 px-4 print:bg-white print:p-0">
            <Head title={`Print PO - ${po?.po_number || 'Purchase Order'}`} />

            {/* Top Action Bar (Hidden in Print/PDF) */}
            <div className="max-w-4xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm print:hidden">
                <div className="flex items-center gap-3">
                    <Link
                        href="/procurement/purchase-orders"
                        className="px-3.5 py-2 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
                    >
                        ← Kembali ke Daftar PO
                    </Link>
                    <div>
                        <div className="text-sm font-black text-slate-900 dark:text-white">{po.po_number}</div>
                        <div className="text-xs text-slate-500">Official Purchase Order Document • Print / Save as PDF</div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => window.print()}
                        className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-sm transition"
                    >
                        Cetak / Simpan PDF (Ctrl+P)
                    </button>
                </div>
            </div>

            {/* Printable A4 Sheet */}
            <div className="max-w-4xl mx-auto bg-white text-slate-900 p-8 md:p-10 rounded-2xl shadow-lg border border-slate-200 print:shadow-none print:border-none print:rounded-none print:p-4">
                {/* Company Header */}
                <div className="flex flex-col md:flex-row justify-between items-start border-b-2 border-slate-900 pb-6 gap-4">
                    <div>
                        <div className="text-xs font-black tracking-widest uppercase text-indigo-700">
                            TAP INTEGRATED COAL HAULING MANAGEMENT
                        </div>
                        <h1 className="text-2xl font-black tracking-tight text-slate-900 mt-0.5">
                            PT TEKNINDO ADHYA PANE
                        </h1>
                        <p className="text-xs text-slate-600 mt-1">
                            Coal Hauling Operations & Fleet Maintenance Division
                        </p>
                        <p className="text-xs text-slate-600">
                            Site Project: <span className="font-bold text-slate-900">{po.site?.name} ({po.site?.code})</span>
                        </p>
                    </div>
                    <div className="text-left md:text-right">
                        <div className="inline-block px-3 py-1 rounded bg-slate-900 text-white text-xs font-black uppercase tracking-widest">
                            PURCHASE ORDER
                        </div>
                        <div className="mt-2 text-lg font-black text-slate-900">{po.po_number}</div>
                        <div className="text-xs text-slate-600">
                            Tanggal PO: <span className="font-bold text-slate-900">{po.po_date?.slice(0, 10)}</span>
                        </div>
                        <div className="text-xs text-slate-600">
                            Status Approval:{' '}
                            <span className="font-bold uppercase text-emerald-700">
                                {po.approval_status} ({po.status})
                            </span>
                        </div>
                    </div>
                </div>

                {/* Vendor & Delivery Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6 border-b border-slate-200 text-xs">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                            KEPADA VENDOR / SUPPLIER:
                        </div>
                        <div className="text-sm font-black text-slate-900">
                            {po.vendor?.name} ({po.vendor?.vendor_code})
                        </div>
                        {po.vendor?.address && <div className="text-slate-600 mt-1">{po.vendor.address}</div>}
                        <div className="mt-2 space-y-0.5 text-slate-600">
                            {po.vendor?.contact_person && (
                                <div>UP / PIC: <span className="font-semibold text-slate-800">{po.vendor.contact_person}</span></div>
                            )}
                            {po.vendor?.phone && <div>Telp: {po.vendor.phone}</div>}
                            {po.vendor?.email && <div>Email: {po.vendor.email}</div>}
                            {po.vendor?.npwp && <div>NPWP: {po.vendor.npwp}</div>}
                        </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                            INSTRUKSI PENGIRIMAN & PEMBAYARAN:
                        </div>
                        <div className="space-y-1 text-slate-700">
                            <div>
                                <span className="text-slate-500">Lokasi Pengiriman:</span>{' '}
                                <span className="font-bold text-slate-900">
                                    {po.delivery_location || po.warehouse?.name || po.site?.name}
                                </span>
                            </div>
                            <div>
                                <span className="text-slate-500">Gudang Tujuan:</span>{' '}
                                <span className="font-semibold text-slate-900">
                                    {po.warehouse ? `${po.warehouse.name} (${po.warehouse.code})` : '-'}
                                </span>
                            </div>
                            <div>
                                <span className="text-slate-500">Target Pengiriman:</span>{' '}
                                <span className="font-bold text-slate-900">{po.expected_delivery_date?.slice(0, 10) || '-'}</span>
                            </div>
                            <div>
                                <span className="text-slate-500">Termin Pembayaran:</span>{' '}
                                <span className="font-bold text-indigo-700">{po.payment_terms}</span>
                            </div>
                            <div>
                                <span className="text-slate-500">Referensi PR:</span>{' '}
                                <span className="font-semibold">{po.purchase_request?.pr_number || '-'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Line Items Table */}
                <div className="my-6">
                    <table className="w-full text-xs border-collapse">
                        <thead>
                            <tr className="bg-slate-900 text-white uppercase text-[10px] tracking-wider">
                                <th className="py-2.5 px-3 text-left">No</th>
                                <th className="py-2.5 px-3 text-left">Kode / Deskripsi Barang</th>
                                <th className="py-2.5 px-3 text-left">Spesifikasi</th>
                                <th className="py-2.5 px-3 text-right">Qty</th>
                                <th className="py-2.5 px-3 text-center">UOM</th>
                                <th className="py-2.5 px-3 text-right">Harga Satuan</th>
                                <th className="py-2.5 px-3 text-right">Diskon</th>
                                <th className="py-2.5 px-3 text-right">PPN</th>
                                <th className="py-2.5 px-3 text-right">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 border-b border-slate-300">
                            {(po.items || []).map((item, idx) => (
                                <tr key={item.id || idx}>
                                    <td className="py-3 px-3 font-semibold text-slate-700">{idx + 1}</td>
                                    <td className="py-3 px-3">
                                        <div className="font-bold text-slate-900">{item.item_name}</div>
                                        {item.inventory_item && (
                                            <div className="text-[11px] text-slate-500">
                                                {item.inventory_item.item_code} • PN: {item.inventory_item.part_number || '-'}
                                            </div>
                                        )}
                                    </td>
                                    <td className="py-3 px-3 text-slate-600">{item.specification || '-'}</td>
                                    <td className="py-3 px-3 text-right font-bold text-slate-900">
                                        {Number(item.quantity_ordered).toLocaleString('id-ID')}
                                    </td>
                                    <td className="py-3 px-3 text-center text-slate-600">{item.unit}</td>
                                    <td className="py-3 px-3 text-right text-slate-800">{formatIDR(item.unit_price)}</td>
                                    <td className="py-3 px-3 text-right text-slate-600">{formatIDR(item.discount_amount)}</td>
                                    <td className="py-3 px-3 text-right text-slate-600">{formatIDR(item.tax_amount)}</td>
                                    <td className="py-3 px-3 text-right font-bold text-slate-900">{formatIDR(item.total_price)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totals & Terms */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                    <div className="md:col-span-7 space-y-3 text-xs">
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                            <div className="text-[10px] font-black uppercase text-slate-500 mb-1">
                                SYARAT & KETENTUAN (TERMS & CONDITIONS):
                            </div>
                            <p className="text-slate-700 whitespace-pre-line leading-relaxed">
                                {po.terms_and_conditions ||
                                    '1. Barang harus sesuai spesifikasi PO dan disertai Surat Jalan resmi.\n2. Barang rusak atau tidak sesuai spesifikasi akan ditolak pada saat Goods Receipt.\n3. Tagihan (Invoice) wajib melampirkan PO asli dan Berita Acara Penerimaan Barang (GRN).'}
                            </p>
                        </div>
                        {po.notes && (
                            <div className="p-3 rounded-xl border border-slate-200 text-slate-600">
                                <span className="font-bold text-slate-800">Catatan PO:</span> {po.notes}
                            </div>
                        )}
                    </div>

                    <div className="md:col-span-5 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
                        <div className="flex justify-between text-slate-600">
                            <span>Subtotal</span>
                            <span className="font-semibold text-slate-900">{formatIDR(po.subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                            <span>Total Diskon</span>
                            <span className="font-semibold text-rose-600">- {formatIDR(po.discount_amount)}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                            <span>PPN ({Number(po.tax_percent || 0)}%)</span>
                            <span className="font-semibold text-slate-900">{formatIDR(po.tax_amount)}</span>
                        </div>
                        <div className="border-t border-slate-300 pt-2 flex justify-between items-center text-sm font-black text-slate-900">
                            <span>GRAND TOTAL</span>
                            <span className="text-base text-indigo-700">{formatIDR(po.grand_total)}</span>
                        </div>
                    </div>
                </div>

                {/* Approval History & Signatures */}
                <div className="mt-8 pt-6 border-t border-slate-200">
                    <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-3">
                        HISTORI OTORISASI & TANDA TANGAN PEJABAT BERWENANG
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                        <div className="border border-slate-200 rounded-xl p-4 text-center">
                            <div className="text-slate-500 font-semibold">Dibuat Oleh (Procurement)</div>
                            <div className="h-14 flex items-center justify-center">
                                <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-bold text-slate-600">
                                    DIGITALLY ISSUED
                                </span>
                            </div>
                            <div className="font-bold text-slate-900 border-t border-slate-200 pt-2">
                                {po.creator?.name || 'Procurement Officer'}
                            </div>
                        </div>

                        <div className="border border-slate-200 rounded-xl p-4 text-center">
                            <div className="text-slate-500 font-semibold">Disetujui Oleh (Management)</div>
                            <div className="h-14 flex flex-col items-center justify-center">
                                <span className="px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                                    {po.approval_status}
                                </span>
                                {po.approved_at && (
                                    <span className="text-[10px] text-slate-500 mt-1">{po.approved_at.slice(0, 16)}</span>
                                )}
                            </div>
                            <div className="font-bold text-slate-900 border-t border-slate-200 pt-2">
                                {po.approver?.name || 'Authorized Approver'}
                            </div>
                        </div>

                        <div className="border border-slate-200 rounded-xl p-4 text-center">
                            <div className="text-slate-500 font-semibold">Konfirmasi Penerimaan Vendor</div>
                            <div className="h-14 flex items-center justify-center text-[11px] text-slate-400 italic">
                                Cap & Tanda Tangan Vendor
                            </div>
                            <div className="font-bold text-slate-900 border-t border-slate-200 pt-2">
                                {po.vendor?.name}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
