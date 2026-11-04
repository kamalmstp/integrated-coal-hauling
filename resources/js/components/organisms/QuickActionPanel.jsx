import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import {
    CheckCircle2,
    AlertCircle,
    AlertTriangle,
    Info,
    HelpCircle,
    BellRing,
    Sparkles,
} from 'lucide-react';
import Button from '../atoms/Button';
import { useAlertStore } from '../../stores/useAlertStore';

export default function QuickActionPanel() {
    const [loadingType, setLoadingType] = useState(null);
    const { confirm, addAlert } = useAlertStore();

    // Trigger Laravel Notify via server POST request to test backend session flash
    const triggerServerNotify = (type) => {
        setLoadingType(type);
        router.post(
            '/dashboard/notify-test',
            { type },
            {
                preserveScroll: true,
                onFinish: () => setLoadingType(null),
            }
        );
    };

    // Client-side confirm modal demo via Zustand
    const triggerClientConfirm = async () => {
        const confirmed = await confirm({
            title: 'Konfirmasi Penghapusan Cache?',
            message: 'Tindakan ini akan membersihkan semua temporary view dan cache sesi pengguna.',
            confirmButtonText: 'Ya, Bersihkan Sekarang',
            cancelButtonText: 'Batalkan',
            type: 'warning',
        });

        if (confirmed) {
            addAlert({
                type: 'success',
                title: 'Cache Dibersihkan!',
                message: 'Operasi konfirmasi lokal berhasil diproses.',
            });
        } else {
            addAlert({
                type: 'info',
                title: 'Dibatalkan',
                message: 'Tindakan konfirmasi dibatalkan oleh pengguna.',
            });
        }
    };

    return (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                        <BellRing className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            Pusat Pengujian Laravel Notify & Alert Confirm
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Uji langsung interaksi notifikasi server-side Laravel Notify dan dialog konfirmasi.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-full">
                    <Sparkles className="w-3 h-3" />
                    <span>Inertia Flash Integrated</span>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                {/* 1. Server Success */}
                <Button
                    variant="success"
                    size="sm"
                    icon={CheckCircle2}
                    isLoading={loadingType === 'success'}
                    onClick={() => triggerServerNotify('success')}
                    className="w-full justify-center"
                >
                    Notify Success
                </Button>

                {/* 2. Server Error */}
                <Button
                    variant="danger"
                    size="sm"
                    icon={AlertCircle}
                    isLoading={loadingType === 'error'}
                    onClick={() => triggerServerNotify('error')}
                    className="w-full justify-center"
                >
                    Notify Error
                </Button>

                {/* 3. Server Warning */}
                <Button
                    variant="secondary"
                    size="sm"
                    icon={AlertTriangle}
                    isLoading={loadingType === 'warning'}
                    onClick={() => triggerServerNotify('warning')}
                    className="w-full justify-center !text-amber-700 dark:!text-amber-400 !bg-amber-50 dark:!bg-amber-950/40 hover:!bg-amber-100"
                >
                    Notify Warning
                </Button>

                {/* 4. Server Info */}
                <Button
                    variant="outline"
                    size="sm"
                    icon={Info}
                    isLoading={loadingType === 'info'}
                    onClick={() => triggerServerNotify('info')}
                    className="w-full justify-center"
                >
                    Notify Info
                </Button>

                {/* 5. Server Confirm */}
                <Button
                    variant="primary"
                    size="sm"
                    icon={HelpCircle}
                    isLoading={loadingType === 'confirm'}
                    onClick={() => triggerServerNotify('confirm')}
                    className="w-full justify-center"
                >
                    Server Confirm
                </Button>

                {/* 6. Client Confirm with Zustand */}
                <Button
                    variant="secondary"
                    size="sm"
                    icon={AlertTriangle}
                    onClick={triggerClientConfirm}
                    className="w-full justify-center !border-indigo-200 dark:!border-indigo-800"
                >
                    Client Confirm
                </Button>
            </div>
        </div>
    );
}
