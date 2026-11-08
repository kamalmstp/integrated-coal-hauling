import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Printer, ArrowLeft, CheckSquare, Square, Wrench, Truck, ShieldCheck, Check } from 'lucide-react';

export default function JobCardPrint({ jobCard }) {
    const handlePrint = () => {
        window.print();
    };

    const wo = jobCard.workOrder || {};
    const unit = jobCard.unit || wo.unit || {};
    const site = jobCard.site || wo.site || {};
    const checklists = jobCard.checklists || [];
    const assignments = wo.assignments || [];
    const sparepartRequests = wo.sparepart_requests || [];

    // Collect all sparepart items
    const sparepartItems = [];
    sparepartRequests.forEach((sr) => {
        if (sr.items) {
            sr.items.forEach((item) => sparepartItems.push(item));
        }
    });

    return (
        <div className="min-h-screen bg-gray-100 py-8 text-black print:bg-white print:py-0 print:m-0">
            <Head title={`Cetak Job Card - ${jobCard.job_card_number}`} />

            {/* Print action toolbar (hidden on print) */}
            <div className="max-w-4xl mx-auto mb-4 px-4 flex justify-between items-center print:hidden">
                <Link
                    href="/maintenance/job-cards"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 shadow-sm"
                >
                    <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar
                </Link>

                <button
                    onClick={handlePrint}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition"
                >
                    <Printer className="w-4 h-4" /> Cetak Job Card (Print / PDF)
                </button>
            </div>

            {/* Document sheet container */}
            <div className="max-w-4xl mx-auto bg-white p-8 border border-gray-300 shadow-xl rounded-lg print:border-none print:shadow-none print:rounded-none print:p-0 print:max-w-full">
                {/* Official TAP Header */}
                <div className="border-b-2 border-black pb-4 mb-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-xl font-black tracking-tight text-gray-900 uppercase">
                                PT TEKNINDO ADHYA PANE
                            </h1>
                            <p className="text-xs font-bold text-gray-700 uppercase tracking-widest mt-0.5">
                                COAL HAULING MANAGEMENT SYSTEM — PLANT & WORKSHOP DIVISION
                            </p>
                            <p className="text-[11px] text-gray-600">
                                Site: <span className="font-semibold">{site.name || 'Site Muara Teweh'}</span> • Kode: {site.code || 'MTW'}
                            </p>
                        </div>

                        <div className="text-right">
                            <span className="inline-block border-2 border-black px-3 py-1 font-mono font-black text-sm uppercase">
                                JOB CARD
                            </span>
                            <p className="font-mono text-xs font-bold mt-1 text-gray-900">
                                NO: {jobCard.job_card_number}
                            </p>
                            <p className="text-[10px] text-gray-600 font-mono">
                                Tgl Terbit: {jobCard.issue_date || '-'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Reference & Unit Details */}
                <div className="grid grid-cols-2 gap-4 border border-black p-3 mb-4 text-xs">
                    <div>
                        <table className="w-full">
                            <tbody>
                                <tr>
                                    <td className="w-32 py-0.5 font-bold text-gray-600">No. Work Order</td>
                                    <td className="py-0.5 font-mono font-bold text-gray-900">: {wo.wo_number || '-'}</td>
                                </tr>
                                <tr>
                                    <td className="py-0.5 font-bold text-gray-600">Jenis Servis</td>
                                    <td className="py-0.5 font-bold text-gray-900 uppercase">: {wo.job_type?.replace('_', ' ') || '-'}</td>
                                </tr>
                                <tr>
                                    <td className="py-0.5 font-bold text-gray-600">Prioritas</td>
                                    <td className="py-0.5 font-bold uppercase">: {wo.priority || '-'}</td>
                                </tr>
                                <tr>
                                    <td className="py-0.5 font-bold text-gray-600">Status Terakhir</td>
                                    <td className="py-0.5 font-bold uppercase">: {jobCard.status?.replace('_', ' ') || '-'}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div>
                        <table className="w-full">
                            <tbody>
                                <tr>
                                    <td className="w-32 py-0.5 font-bold text-gray-600">Nomor Lambung</td>
                                    <td className="py-0.5 font-bold text-gray-900 font-mono">: {unit.unit_code || '-'}</td>
                                </tr>
                                <tr>
                                    <td className="py-0.5 font-bold text-gray-600">Nomor Polisi</td>
                                    <td className="py-0.5 text-gray-900">: {unit.registration_number || '-'}</td>
                                </tr>
                                <tr>
                                    <td className="py-0.5 font-bold text-gray-600">Jenis / Merek Unit</td>
                                    <td className="py-0.5 text-gray-900">: {unit.unit_type || '-'}</td>
                                </tr>
                                <tr>
                                    <td className="py-0.5 font-bold text-gray-600">HM / KM Masuk</td>
                                    <td className="py-0.5 font-mono">: HM {wo.hm_at_service || unit.last_hm || 0} / KM {wo.km_at_service || unit.last_km || 0}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Complaint & Diagnostic Findings */}
                <div className="border border-black p-3 mb-4 text-xs space-y-2">
                    <div>
                        <span className="font-bold text-gray-800 uppercase block text-[11px]">1. Keluhan Awal Operator / Driver:</span>
                        <p className="mt-0.5 text-gray-900 bg-gray-50 print:bg-white p-1.5 border border-gray-200">
                            {jobCard.initial_complaint || wo.defect_summary || 'Tidak ada catatan keluhan'}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <span className="font-bold text-gray-800 uppercase block text-[11px]">2. Diagnosa Mekanik & Akar Masalah:</span>
                            <p className="mt-0.5 text-gray-900 bg-gray-50 print:bg-white p-1.5 border border-gray-200 min-h-[40px]">
                                {wo.diagnosis || '-'}<br />
                                <span className="font-semibold text-gray-700">Root Cause:</span> {wo.root_cause || '-'}
                            </p>
                        </div>
                        <div>
                            <span className="font-bold text-gray-800 uppercase block text-[11px]">3. Tindakan Perbaikan (Work Performed):</span>
                            <p className="mt-0.5 text-gray-900 bg-gray-50 print:bg-white p-1.5 border border-gray-200 min-h-[40px]">
                                {jobCard.work_performed || 'Dalam proses pengerjaan workshop'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Technical Checklists Table */}
                <div className="mb-4">
                    <h3 className="text-xs font-bold uppercase text-gray-800 mb-1">
                        4. Checklist Item Pekerjaan & Verifikasi Komponen
                    </h3>
                    <table className="w-full border-collapse border border-black text-xs">
                        <thead>
                            <tr className="bg-gray-100 print:bg-gray-200 text-left">
                                <th className="border border-black p-1.5 w-10 text-center">No</th>
                                <th className="border border-black p-1.5 w-36">Kategori</th>
                                <th className="border border-black p-1.5">Deskripsi Item Pemeriksaan / Pekerjaan</th>
                                <th className="border border-black p-1.5 w-16 text-center">Hasil</th>
                                <th className="border border-black p-1.5 w-44">Keterangan / Notes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {checklists.length > 0 ? (
                                checklists.map((item, idx) => (
                                    <tr key={item.id}>
                                        <td className="border border-black p-1 text-center font-mono">{idx + 1}</td>
                                        <td className="border border-black p-1 font-semibold text-gray-700">{item.category}</td>
                                        <td className="border border-black p-1 text-gray-900">{item.item_name}</td>
                                        <td className="border border-black p-1 text-center font-bold">
                                            {item.is_checked ? 'V' : '-'}
                                        </td>
                                        <td className="border border-black p-1 text-gray-600 text-[11px]">{item.notes || '-'}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="border border-black p-2 text-center text-gray-500 italic">
                                        Checklist standar belum dibuat.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Assigned Mechanics */}
                <div className="mb-4">
                    <h3 className="text-xs font-bold uppercase text-gray-800 mb-1">
                        5. Tim Mekanik Pelaksana
                    </h3>
                    <table className="w-full border-collapse border border-black text-xs">
                        <thead>
                            <tr className="bg-gray-100 print:bg-gray-200 text-left">
                                <th className="border border-black p-1.5 w-10 text-center">No</th>
                                <th className="border border-black p-1.5">Nama Mekanik</th>
                                <th className="border border-black p-1.5 w-32">NIK / ID</th>
                                <th className="border border-black p-1.5 w-36">Peran Penugasan</th>
                                <th className="border border-black p-1.5 w-24 text-center">Shift</th>
                            </tr>
                        </thead>
                        <tbody>
                            {assignments.length > 0 ? (
                                assignments.map((a, idx) => (
                                    <tr key={a.id}>
                                        <td className="border border-black p-1 text-center font-mono">{idx + 1}</td>
                                        <td className="border border-black p-1 font-semibold">{a.mechanic?.name}</td>
                                        <td className="border border-black p-1 font-mono">{a.mechanic?.employee_code}</td>
                                        <td className="border border-black p-1 capitalize">{a.assignment_role?.replace('_', ' ')}</td>
                                        <td className="border border-black p-1 text-center uppercase">{a.shift}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="border border-black p-2 text-center text-gray-500 italic">
                                        Lead Mekanik: {jobCard.lead_mechanic?.name || '-'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Spareparts Used */}
                <div className="mb-4">
                    <h3 className="text-xs font-bold uppercase text-gray-800 mb-1">
                        6. Pemakaian Sparepart & Suku Cadang (Gudang Logistik)
                    </h3>
                    <table className="w-full border-collapse border border-black text-xs">
                        <thead>
                            <tr className="bg-gray-100 print:bg-gray-200 text-left">
                                <th className="border border-black p-1.5 w-10 text-center">No</th>
                                <th className="border border-black p-1.5 w-32">Part Number</th>
                                <th className="border border-black p-1.5">Nama Barang / Part Name</th>
                                <th className="border border-black p-1.5 w-20 text-center">Jumlah</th>
                                <th className="border border-black p-1.5 w-28 text-right">Harga Satuan</th>
                                <th className="border border-black p-1.5 w-32 text-right">Total Biaya</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sparepartItems.length > 0 ? (
                                sparepartItems.map((item, idx) => (
                                    <tr key={item.id}>
                                        <td className="border border-black p-1 text-center font-mono">{idx + 1}</td>
                                        <td className="border border-black p-1 font-mono text-gray-700">{item.part_number || '-'}</td>
                                        <td className="border border-black p-1 font-medium">{item.part_name}</td>
                                        <td className="border border-black p-1 text-center font-mono">{item.quantity} {item.unit}</td>
                                        <td className="border border-black p-1 text-right font-mono">Rp {Number(item.unit_price || 0).toLocaleString('id-ID')}</td>
                                        <td className="border border-black p-1 text-right font-mono font-semibold">Rp {Number(item.total_price || 0).toLocaleString('id-ID')}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="border border-black p-2 text-center text-gray-500 italic">
                                        Tidak ada pemakaian sparepart baru / jasa perbaikan saja.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Official Signatures Block */}
                <div className="mt-8 pt-4 border-t-2 border-black">
                    <div className="grid grid-cols-3 gap-4 text-center text-xs">
                        {/* Lead Mechanic */}
                        <div className="flex flex-col justify-between h-36 border border-gray-400 p-2">
                            <div>
                                <p className="font-bold text-gray-700 uppercase">Dikerjakan Oleh</p>
                                <p className="text-[10px] text-gray-500">Lead Mekanik Pelaksana</p>
                            </div>
                            <div className="my-auto">
                                <span className="text-gray-300 italic text-[10px]">(Tanda Tangan)</span>
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 underline">{jobCard.lead_mechanic?.name || '____________________'}</p>
                                <p className="text-[10px] text-gray-500 font-mono">NIK: {jobCard.lead_mechanic?.employee_code || '-'}</p>
                            </div>
                        </div>

                        {/* Workshop Supervisor */}
                        <div className="flex flex-col justify-between h-36 border border-gray-400 p-2">
                            <div>
                                <p className="font-bold text-gray-700 uppercase">Diperiksa & Disetujui</p>
                                <p className="text-[10px] text-gray-500">Workshop Supervisor</p>
                            </div>
                            <div className="my-auto">
                                {jobCard.supervisor_inspected_at ? (
                                    <div className="text-emerald-700 font-bold text-[11px] border border-emerald-500 p-1 rounded inline-block bg-emerald-50">
                                        SIGNED-OFF<br />
                                        <span className="text-[9px] font-normal">{new Date(jobCard.supervisor_inspected_at).toLocaleDateString('id-ID')}</span>
                                    </div>
                                ) : (
                                    <span className="text-gray-300 italic text-[10px]">(Tanda Tangan)</span>
                                )}
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 underline">{jobCard.supervisor?.name || '____________________'}</p>
                                <p className="text-[10px] text-gray-500 font-mono">Supervisor Plant & WS</p>
                            </div>
                        </div>

                        {/* Plant Superintendent / Manager */}
                        <div className="flex flex-col justify-between h-36 border border-gray-400 p-2">
                            <div>
                                <p className="font-bold text-gray-700 uppercase">Mengetahui</p>
                                <p className="text-[10px] text-gray-500">Plant & Maintenance Manager</p>
                            </div>
                            <div className="my-auto">
                                <span className="text-gray-300 italic text-[10px]">(Tanda Tangan)</span>
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 underline">Ir. H. Syarifudin, MT</p>
                                <p className="text-[10px] text-gray-500">SVP Plant & Maintenance</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 text-[10px] text-gray-500 flex justify-between items-center">
                        <span>Dokumen Resmi Sistem Manajemen Hauling Batubara TAP.</span>
                        <span className="font-mono">Dicetak pada: {new Date().toLocaleString('id-ID')}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
