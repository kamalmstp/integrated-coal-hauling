import { create } from 'zustand';

export const useAlertStore = create((set, get) => ({
    alerts: [],
    confirmState: {
        isOpen: false,
        title: '',
        message: '',
        confirmButtonText: 'Ya, Lanjutkan',
        cancelButtonText: 'Batal',
        type: 'danger', // 'danger' | 'warning' | 'info' | 'primary'
        resolve: null,
    },

    /**
     * Add a notification toast to queue
     */
    addAlert: (alert) => {
        const id = alert.id || `toast_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const newAlert = {
            id,
            type: alert.type || 'info', // 'success' | 'error' | 'warning' | 'info'
            title: alert.title || 'Notifikasi',
            message: alert.message || '',
            duration: alert.duration || 4500,
        };

        set((state) => ({
            alerts: [...state.alerts, newAlert],
        }));

        if (newAlert.duration > 0) {
            setTimeout(() => {
                get().removeAlert(id);
            }, newAlert.duration);
        }

        return id;
    },

    /**
     * Remove an alert by its ID
     */
    removeAlert: (id) => {
        set((state) => ({
            alerts: state.alerts.filter((a) => a.id !== id),
        }));
    },

    /**
     * Open confirmation modal - returns a Promise resolving to boolean
     */
    confirm: (options) => {
        return new Promise((resolve) => {
            set({
                confirmState: {
                    isOpen: true,
                    title: options.title || 'Konfirmasi Tindakan',
                    message: options.message || 'Apakah Anda yakin ingin melanjutkan tindakan ini?',
                    confirmButtonText: options.confirmButtonText || 'Ya, Lanjutkan',
                    cancelButtonText: options.cancelButtonText || 'Batal',
                    type: options.type || 'danger',
                    resolve,
                },
            });
        });
    },

    /**
     * Confirm modal action chosen
     */
    closeConfirm: (result = false) => {
        const { resolve } = get().confirmState;
        if (typeof resolve === 'function') {
            resolve(result);
        }
        set((state) => ({
            confirmState: {
                ...state.confirmState,
                isOpen: false,
                resolve: null,
            },
        }));
    },

    /**
     * Process Laravel Notify payload passed from Inertia flash props
     */
    processLaravelNotify: (notifyPayload) => {
        if (!notifyPayload) return;

        // If it's a server-triggered confirm dialog
        if (notifyPayload.type === 'confirm') {
            get().confirm({
                title: notifyPayload.title,
                message: notifyPayload.message,
                confirmButtonText: notifyPayload.confirmButtonText,
                cancelButtonText: notifyPayload.cancelButtonText,
                type: 'warning',
            });
            return;
        }

        // Standard notification toast
        get().addAlert({
            id: notifyPayload.id,
            type: notifyPayload.type,
            title: notifyPayload.title,
            message: notifyPayload.message,
            duration: notifyPayload.duration || 5000,
        });
    },
}));
