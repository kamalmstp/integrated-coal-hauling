import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export default function NotificationToast({ alert, onDismiss }) {
    const { id, type = 'info', title, message } = alert;

    const config = {
        success: {
            icon: CheckCircle2,
            iconColor: 'text-emerald-500 dark:text-emerald-400',
            borderColor: 'border-emerald-200 dark:border-emerald-800/60',
            bgColor: 'bg-white dark:bg-slate-900',
            tag: 'Berhasil',
            tagColor: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50',
        },
        error: {
            icon: AlertCircle,
            iconColor: 'text-rose-500 dark:text-rose-400',
            borderColor: 'border-rose-200 dark:border-rose-800/60',
            bgColor: 'bg-white dark:bg-slate-900',
            tag: 'Gagal',
            tagColor: 'text-rose-600 bg-rose-50 dark:bg-rose-950/50',
        },
        warning: {
            icon: AlertTriangle,
            iconColor: 'text-amber-500 dark:text-amber-400',
            borderColor: 'border-amber-200 dark:border-amber-800/60',
            bgColor: 'bg-white dark:bg-slate-900',
            tag: 'Peringatan',
            tagColor: 'text-amber-600 bg-amber-50 dark:bg-amber-950/50',
        },
        info: {
            icon: Info,
            iconColor: 'text-indigo-500 dark:text-indigo-400',
            borderColor: 'border-indigo-200 dark:border-indigo-800/60',
            bgColor: 'bg-white dark:bg-slate-900',
            tag: 'Info',
            tagColor: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50',
        },
    };

    const current = config[type] || config.info;
    const Icon = current.icon;

    return (
        <div
            className={`w-88 max-w-full rounded-xl border ${current.borderColor} ${current.bgColor} p-4 shadow-lg shadow-slate-200/50 dark:shadow-slate-950/50 transition-all duration-300 transform translate-y-0 flex items-start gap-3 relative`}
            role="alert"
        >
            <div className={`shrink-0 mt-0.5 ${current.iconColor}`}>
                <Icon className="w-5 h-5" />
            </div>

            <div className="flex-1 min-w-0 pr-6">
                <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${current.tagColor}`}>
                        {current.tag}
                    </span>
                    <h4 className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                        {title}
                    </h4>
                </div>
                {message && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed break-words">
                        {message}
                    </p>
                )}
            </div>

            <button
                type="button"
                onClick={() => onDismiss(id)}
                className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg p-1 transition-colors"
                title="Tutup Notifikasi"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}
