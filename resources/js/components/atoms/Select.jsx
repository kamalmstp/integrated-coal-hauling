import React from 'react';

export default function Select({
    options = [],
    value,
    onChange,
    className = '',
    error = false,
    placeholder = 'Pilih opsi...',
    ...props
}) {
    return (
        <select
            value={value}
            onChange={onChange}
            className={`w-full rounded-lg text-sm transition-colors duration-150 border bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 py-2 px-3 pr-8 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 cursor-pointer ${
                error
                    ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-200 dark:focus:ring-rose-950'
                    : 'border-slate-300 dark:border-slate-700 focus:border-indigo-500 focus:ring-indigo-100 dark:focus:ring-indigo-950'
            } ${className}`}
            {...props}
        >
            {placeholder && (
                <option value="" disabled>
                    {placeholder}
                </option>
            )}
            {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
    );
}
