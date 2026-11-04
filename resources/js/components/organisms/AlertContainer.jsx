import React, { useEffect, useRef } from 'react';
import { usePage } from '@inertiajs/react';
import { useAlertStore } from '../../stores/useAlertStore';
import NotificationToast from '../molecules/NotificationToast';
import ConfirmModal from '../molecules/ConfirmModal';

export default function AlertContainer() {
    const { alerts, removeAlert, processLaravelNotify } = useAlertStore();
    const { flash } = usePage().props;
    const lastFlashIdRef = useRef(null);

    // Auto-detect Laravel Notify session flash from Inertia props
    useEffect(() => {
        if (!flash) return;

        // Structured notify object
        if (flash.notify && flash.notify.id !== lastFlashIdRef.current) {
            lastFlashIdRef.current = flash.notify.id;
            processLaravelNotify(flash.notify);
            return;
        }

        // Standard flash messages fallback
        ['success', 'error', 'warning', 'info'].forEach((type) => {
            if (flash[type] && typeof flash[type] === 'string') {
                const uniqueKey = `${type}_${flash[type]}`;
                if (lastFlashIdRef.current !== uniqueKey) {
                    lastFlashIdRef.current = uniqueKey;
                    processLaravelNotify({
                        id: uniqueKey,
                        type,
                        title: type === 'success' ? 'Berhasil' : type === 'error' ? 'Gagal' : 'Pemberitahuan',
                        message: flash[type],
                    });
                }
            }
        });
    }, [flash, processLaravelNotify]);

    return (
        <>
            {/* Confirmation Dialog Modal */}
            <ConfirmModal />

            {/* Notification Toasts Floating Viewport */}
            <div
                aria-live="assertive"
                className="fixed top-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
            >
                {alerts.map((alert) => (
                    <div key={alert.id} className="pointer-events-auto">
                        <NotificationToast alert={alert} onDismiss={removeAlert} />
                    </div>
                ))}
            </div>
        </>
    );
}
