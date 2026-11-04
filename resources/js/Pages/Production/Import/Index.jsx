import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import DashboardLayout from '../../../components/templates/DashboardLayout';
import Card from '../../../components/molecules/Card';
import Badge from '../../../components/atoms/Badge';
import Button from '../../../components/atoms/Button';
import Pagination from '../../../components/molecules/Pagination';
import {
    UploadCloud,
    Download,
    FileSpreadsheet,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    ArrowRight,
    RefreshCw,
    Database,
} from 'lucide-react';

export default function ImportIndex({
    batches = { data: [] },
}) {
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [previewData, setPreviewData] = useState(null);
    const [isExecuting, setIsExecuting] = useState(false);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setPreviewData(null);
        }
    };

    const handlePreview = async (e) => {
        e.preventDefault();
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/production/import/preview', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'Accept': 'application/json',
                },
                body: formData,
            });

            const data = await res.json();
            if (res.ok && data.success) {
                setPreviewData(data);
            } else {
                alert(data.message || 'Gagal memproses file. Pastikan format kolom sesuai template.');
            }
        } catch (err) {
            alert('Terjadi kesalahan saat mengunggah file: ' + err.message);
        } finally {
            setIsUploading(false);
        }
    };

    const handleExecuteImport = () => {
        if (!previewData || !previewData.rows) return;
        setIsExecuting(true);

        router.post('/production/import/execute', {
            file_name: previewData.file_name,
            rows: previewData.rows,
        }, {
            onSuccess: () => {
                setFile(null);
                setPreviewData(null);
                setIsExecuting(false);
            },
            onError: () => {
                setIsExecuting(false);
            },
        });
    };

    return (
        <DashboardLayout>
            <Head title="Bulk Import Tiket Dumping — TAP Coal Hauling" />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="p-2 rounded-lg bg-teal-600 text-white shadow-sm">
                            <UploadCloud className="w-5 h-5" />
                        </span>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Bulk Import Tiket Dumping (Excel / CSV)
                            </h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Unggah massal rekap tiket timbangan JSI dengan validasi duplikasi, master data, dan preview interaktif
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <a
                        href="/production/import/template"
                        className="inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                    >
                        <Download className="w-4 h-4 mr-2 text-indigo-600" />
                        Unduh Template CSV
                    </a>
                </div>
            </div>

            {/* Upload Box */}
            <Card className="p-6 mb-6">
                <form onSubmit={handlePreview} className="space-y-4">
                    <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 text-center hover:border-indigo-500 transition-colors bg-slate-50/50 dark:bg-slate-800/30">
                        <FileSpreadsheet className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                            {file ? file.name : 'Pilih atau Drag & Drop Berkas CSV / Excel (.xlsx)'}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Maksimal ukuran file 10MB. File wajib memiliki kolom: ticket_number, ticket_date, dumping_time, unit_code, driver_code, dsb.
                        </p>
                        <div className="mt-4">
                            <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm">
                                <span>Pilih Berkas Komputer</span>
                                <input
                                    type="file"
                                    accept=".csv,.txt,.xlsx"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    </div>

                    {file && (
                        <div className="flex items-center justify-between pt-2">
                            <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                                File terpilih: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(1)} KB)
                            </span>
                            <Button type="submit" disabled={isUploading}>
                                <RefreshCw className={`w-4 h-4 mr-2 ${isUploading ? 'animate-spin' : ''}`} />
                                {isUploading ? 'Memvalidasi Berkas...' : 'Proses & Tampilkan Preview'}
                            </Button>
                        </div>
                    )}
                </form>
            </Card>

            {/* Preview Section */}
            {previewData && (
                <Card className="p-5 mb-6 border-2 border-indigo-500/40">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                        <div>
                            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Database className="w-4 h-4 text-indigo-600" />
                                Hasil Validasi Preview: {previewData.file_name}
                            </h2>
                            <p className="text-xs text-slate-500">
                                Periksa baris data sebelum menyimpannya ke database produksi.
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                onClick={handleExecuteImport}
                                disabled={isExecuting || previewData.summary.valid_count === 0}
                                className="bg-emerald-600 hover:bg-emerald-700"
                            >
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                {isExecuting ? 'Menyimpan ke Database...' : `Simpan ${previewData.summary.valid_count} Baris Valid`}
                            </Button>
                        </div>
                    </div>

                    {/* Preview Statistics Ribbon */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                        <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs">
                            <span className="text-slate-500 block">Total Baris File</span>
                            <span className="text-lg font-bold text-slate-900 dark:text-white">{previewData.summary.total_rows}</span>
                        </div>
                        <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-xs text-emerald-800 dark:text-emerald-300">
                            <span className="block">Baris Valid (Siap Simpan)</span>
                            <span className="text-lg font-bold text-emerald-600">{previewData.summary.valid_count}</span>
                        </div>
                        <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-xs text-amber-800 dark:text-amber-300">
                            <span className="block">Tiket Duplikat Dideteksi</span>
                            <span className="text-lg font-bold text-amber-600">{previewData.summary.duplicate_count}</span>
                        </div>
                        <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-xs text-rose-800 dark:text-rose-300">
                            <span className="block">Baris Gagal / Error</span>
                            <span className="text-lg font-bold text-rose-600">{previewData.summary.error_count}</span>
                        </div>
                    </div>

                    {/* Preview Rows Table */}
                    <div className="overflow-x-auto max-h-96">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase tracking-wider font-semibold sticky top-0">
                                <tr>
                                    <th className="py-2.5 px-3">Baris</th>
                                    <th className="py-2.5 px-3">No. Tiket</th>
                                    <th className="py-2.5 px-3">Tanggal & Jam</th>
                                    <th className="py-2.5 px-3">Unit</th>
                                    <th className="py-2.5 px-3">Driver</th>
                                    <th className="py-2.5 px-3">Tonase</th>
                                    <th className="py-2.5 px-3">Shift</th>
                                    <th className="py-2.5 px-3">Validasi</th>
                                    <th className="py-2.5 px-3">Keterangan Error</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {previewData.rows.map((row) => (
                                    <tr key={row.row_number} className={row.is_valid ? 'hover:bg-slate-50 dark:hover:bg-slate-800/40' : 'bg-rose-50/50 dark:bg-rose-950/20'}>
                                        <td className="py-2 px-3 font-mono font-bold text-slate-400">{row.row_number}</td>
                                        <td className="py-2 px-3 font-mono font-bold text-slate-800 dark:text-slate-200">{row.ticket_number || '-'}</td>
                                        <td className="py-2 px-3 text-slate-600 dark:text-slate-400">{row.ticket_date} {row.dumping_time}</td>
                                        <td className="py-2 px-3 font-semibold">{row.unit_code}</td>
                                        <td className="py-2 px-3 text-slate-600 dark:text-slate-400">{row.driver_code}</td>
                                        <td className="py-2 px-3 font-bold text-emerald-600">{row.tonnage} T</td>
                                        <td className="py-2 px-3">{row.shift_code}</td>
                                        <td className="py-2 px-3">
                                            {row.is_valid ? (
                                                <Badge variant="success">Valid</Badge>
                                            ) : (
                                                <Badge variant="danger">Gagal</Badge>
                                            )}
                                        </td>
                                        <td className="py-2 px-3 text-rose-600 text-[11px]">
                                            {row.errors?.join('; ') || '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {/* Riwayat Batch Import */}
            <Card className="overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                        Riwayat Batch Bulk Import
                    </h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
                            <tr>
                                <th className="py-3 px-4">Kode Batch</th>
                                <th className="py-3 px-4">Nama Berkas</th>
                                <th className="py-3 px-4 text-center">Total Baris</th>
                                <th className="py-3 px-4 text-center">Berhasil</th>
                                <th className="py-3 px-4 text-center">Duplikat</th>
                                <th className="py-3 px-4 text-center">Gagal</th>
                                <th className="py-3 px-4">Diimpor Oleh</th>
                                <th className="py-3 px-4">Waktu</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {batches.data.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="py-6 text-center text-slate-400">
                                        Belum ada riwayat berkas bulk import.
                                    </td>
                                </tr>
                            ) : (
                                batches.data.map((b) => (
                                    <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                        <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                                            {b.batch_code}
                                        </td>
                                        <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                                            {b.file_name}
                                        </td>
                                        <td className="py-3 px-4 text-center font-semibold">{b.total_rows}</td>
                                        <td className="py-3 px-4 text-center text-emerald-600 font-bold">{b.successful_rows}</td>
                                        <td className="py-3 px-4 text-center text-amber-600 font-bold">{b.duplicate_rows}</td>
                                        <td className="py-3 px-4 text-center text-rose-600 font-bold">{b.failed_rows}</td>
                                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{b.user?.name || 'Sistem'}</td>
                                        <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{b.created_at}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                    <Pagination links={batches.links} />
                </div>
            </Card>
        </DashboardLayout>
    );
}
