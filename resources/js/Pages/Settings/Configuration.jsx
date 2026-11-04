import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { Settings, Save, Sliders, Hash, Clock, MapPin, Gauge } from 'lucide-react';
import DashboardLayout from '../../components/templates/DashboardLayout';
import Button from '../../components/atoms/Button';
import Input from '../../components/atoms/Input';
import FormField from '../../components/molecules/FormField';
import Select from '../../components/atoms/Select';

export default function SystemConfiguration({ settingsGrouped = {}, sites = [] }) {
    const [settingsState, setSettingsState] = useState(() => {
        const flat = {};
        Object.values(settingsGrouped).forEach((group) => {
            group.forEach((item) => {
                flat[item.key] = item.value;
            });
        });
        return flat;
    });

    const [isSaving, setIsSaving] = useState(false);

    const handleChange = (key, value) => {
        setSettingsState((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const handleSave = (e) => {
        e.preventDefault();
        setIsSaving(true);
        router.post(
            '/settings/configuration',
            { settings: settingsState },
            {
                preserveScroll: true,
                onFinish: () => setIsSaving(false),
            }
        );
    };

    return (
        <DashboardLayout title="Konfigurasi Operasional & Penomoran Otomatis" breadcrumbs={['Pengaturan', 'Konfigurasi Sistem']}>
            <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
                {/* 1. Parameter Operasional Hauling */}
                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                            <Gauge className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Parameter Target & Kecepatan Operasional</h3>
                            <p className="text-xs text-slate-500">Standar keamanan jalan hauling (K3LH) dan target ritase harian.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <FormField label="Target Produksi Hauling Harian (Ton)" helpText="Total tonase batubara yang ditargetkan per 24 jam.">
                            <Input
                                type="number"
                                value={settingsState['app.hauling.daily_target_ton'] || '15000'}
                                onChange={(e) => handleChange('app.hauling.daily_target_ton', e.target.value)}
                            />
                        </FormField>

                        <FormField label="Durasi Jam Operasional Harian" helpText="Jam kerja operasional site per hari.">
                            <Input
                                type="number"
                                value={settingsState['app.hauling.operational_hours'] || '24'}
                                onChange={(e) => handleChange('app.hauling.operational_hours', e.target.value)}
                            />
                        </FormField>

                        <FormField label="Batas Kecepatan Muatan Penuh (KM/Jam)" helpText="Kecepatan maksimal saat DT bermuatan batubara.">
                            <Input
                                type="number"
                                value={settingsState['app.safety.speed_limit_loaded'] || '40'}
                                onChange={(e) => handleChange('app.safety.speed_limit_loaded', e.target.value)}
                            />
                        </FormField>

                        <FormField label="Batas Kecepatan Kosongan (KM/Jam)" helpText="Kecepatan maksimal saat DT kembali ke front kosongan.">
                            <Input
                                type="number"
                                value={settingsState['app.safety.speed_limit_empty'] || '50'}
                                onChange={(e) => handleChange('app.safety.speed_limit_empty', e.target.value)}
                            />
                        </FormField>
                    </div>
                </div>

                {/* 2. Format Penomoran Dokumen Otomatis */}
                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                            <Hash className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Format Penomoran Dokumen Otomatis</h3>
                            <p className="text-xs text-slate-500">Gunakan placeholder: &#123;YEAR&#125;, &#123;MONTH&#125;, &#123;SEQ&#125;.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <FormField label="Format Nomor Tiket Timbangan / Hauling" helpText="Contoh hasil: TKT/HAUL/202611/0001">
                            <Input
                                value={settingsState['app.doc_sequence.ticket'] || 'TKT/HAUL/{YEAR}{MONTH}/{SEQ}'}
                                onChange={(e) => handleChange('app.doc_sequence.ticket', e.target.value)}
                            />
                        </FormField>

                        <FormField label="Format Surat Perintah Kerja (SPK)" helpText="Contoh hasil: SPK/TAP/2026/11/001">
                            <Input
                                value={settingsState['app.doc_sequence.spk'] || 'SPK/TAP/{YEAR}/{MONTH}/{SEQ}'}
                                onChange={(e) => handleChange('app.doc_sequence.spk', e.target.value)}
                            />
                        </FormField>

                        <FormField label="Format Surat MCU Driver" helpText="Contoh hasil: MCU/TAP/2026/001">
                            <Input
                                value={settingsState['app.doc_sequence.mcu'] || 'MCU/TAP/{YEAR}/{SEQ}'}
                                onChange={(e) => handleChange('app.doc_sequence.mcu', e.target.value)}
                            />
                        </FormField>

                        <FormField label="Rasio Densitas Solar HSD (Ton / M3)" helpText="Faktor konversi liter ke metrik ton bahan bakar.">
                            <Input
                                type="number"
                                step="0.001"
                                value={settingsState['app.unit.fuel_density_ratio'] || '0.840'}
                                onChange={(e) => handleChange('app.unit.fuel_density_ratio', e.target.value)}
                            />
                        </FormField>
                    </div>
                </div>

                {/* 3. Site Default */}
                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                            <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Site Proyek Standar</h3>
                            <p className="text-xs text-slate-500">Site rujukan awal saat pertama kali pengguna masuk.</p>
                        </div>
                    </div>

                    <div className="max-w-md text-xs">
                        <FormField label="Pilih Site Default">
                            <Select
                                value={settingsState['app.site.default'] || 'SITE-MTW'}
                                onChange={(e) => handleChange('app.site.default', e.target.value)}
                                options={sites.map((s) => ({ value: s.code, label: `${s.name} (${s.code})` }))}
                                placeholder=""
                            />
                        </FormField>
                    </div>
                </div>

                <div className="flex justify-end pt-2">
                    <Button variant="primary" type="submit" icon={Save} isLoading={isSaving}>
                        Simpan Semua Konfigurasi
                    </Button>
                </div>
            </form>
        </DashboardLayout>
    );
}
