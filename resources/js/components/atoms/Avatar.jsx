import React, { useState } from 'react';

export default function Avatar({
    src,
    name = '',
    size = 'md',
    status = null, // 'online' | 'offline' | 'busy'
    className = '',
}) {
    const [hasError, setHasError] = useState(false);

    const sizes = {
        sm: 'w-7 h-7 text-xs',
        md: 'w-9 h-9 text-sm',
        lg: 'w-12 h-12 text-base',
        xl: 'w-16 h-16 text-xl',
    };

    const statusColors = {
        online: 'bg-emerald-500',
        offline: 'bg-slate-400',
        busy: 'bg-rose-500',
    };

    const getInitials = (str) => {
        if (!str) return 'U';
        const parts = str.trim().split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return str.substring(0, 2).toUpperCase();
    };

    return (
        <div className={`relative inline-block shrink-0 ${className}`}>
            {src && !hasError ? (
                <img
                    src={src}
                    alt={name}
                    onError={() => setHasError(true)}
                    className={`rounded-full object-cover ring-2 ring-white dark:ring-slate-800 ${sizes[size] || sizes.md}`}
                />
            ) : (
                <div
                    className={`rounded-full flex items-center justify-center font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 ring-2 ring-white dark:ring-slate-800 select-none ${
                        sizes[size] || sizes.md
                    }`}
                >
                    {getInitials(name)}
                </div>
            )}
            {status && (
                <span
                    className={`absolute bottom-0 right-0 block rounded-full ring-2 ring-white dark:ring-slate-900 w-2.5 h-2.5 ${
                        statusColors[status] || statusColors.online
                    }`}
                />
            )}
        </div>
    );
}
