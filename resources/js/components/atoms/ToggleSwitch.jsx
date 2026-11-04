import React from 'react';

export default function ToggleSwitch({
    checked = false,
    onChange,
    label = '',
    disabled = false,
    className = '',
}) {
    return (
        <label className={`inline-flex items-center gap-3 cursor-pointer select-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
            <div className="relative">
                <input
                    type="checkbox"
                    className="sr-only"
                    checked={checked}
                    disabled={disabled}
                    onChange={(e) => !disabled && onChange && onChange(e.target.checked)}
                />
                <div
                    className={`block w-11 h-6 rounded-full transition-colors duration-200 ease-in-out ${
                        checked ? 'bg-indigo-600 dark:bg-indigo-500' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                />
                <div
                    className={`absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full transition-transform duration-200 ease-in-out shadow-sm ${
                        checked ? 'transform translate-x-5' : ''
                    }`}
                />
            </div>
            {label && <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>}
        </label>
    );
}
