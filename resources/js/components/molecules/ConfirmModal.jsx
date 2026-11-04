import React, { useEffect } from 'react';
import { AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { useAlertStore } from '../../stores/useAlertStore';
import Button from '../atoms/Button';

export default function ConfirmModal() {
    const { confirmState, closeConfirm } = useAlertStore();
    const { isOpen, title, message, confirmButtonText, cancelButtonText, type } = confirmState;

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) {
                closeConfirm(false);
            }
        };

        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, closeConfirm]);

    if (!isOpen) return null;

    const icons = {
        danger: {
            icon: AlertTriangle,
            iconClass: 'text-rose-600 bg-rose-100 dark:bg-rose-950/60 dark:text-rose-400',
            buttonVariant: 'danger',
        },
        warning: {
            icon: AlertTriangle,
            iconClass: 'text-amber-600 bg-amber-100 dark:bg-amber-950/60 dark:text-amber-400',
            buttonVariant: 'primary',
        },
        info: {
            icon: Info,
            iconClass: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-400',
            buttonVariant: 'primary',
        },
    };

    const currentConfig = icons[type] || icons.danger;
    const Icon = currentConfig.icon;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
                onClick={() => closeConfirm(false)}
            />

            {/* Modal Dialog */}
            <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                <div
                    className="relative transform overflow-hidden rounded-2xl bg-white dark:bg-slate-900 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-md border border-slate-200 dark:border-slate-800 p-6"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-full shrink-0 ${currentConfig.iconClass}`}>
                            <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1 mt-0.5">
                            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                                {title}
                            </h3>
                            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                {message}
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
                        <Button
                            variant="secondary"
                            onClick={() => closeConfirm(false)}
                            className="w-full sm:w-auto"
                        >
                            {cancelButtonText}
                        </Button>
                        <Button
                            variant={currentConfig.buttonVariant}
                            onClick={() => closeConfirm(true)}
                            className="w-full sm:w-auto"
                        >
                            {confirmButtonText}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
