import React from 'react';
import Label from '../atoms/Label';

export default function FormField({
    label,
    htmlFor,
    error,
    required = false,
    children,
    helpText,
    className = '',
}) {
    return (
        <div className={`space-y-1 ${className}`}>
            {label && (
                <Label htmlFor={htmlFor} required={required}>
                    {label}
                </Label>
            )}
            {children}
            {error && <p className="text-xs text-rose-500 font-medium mt-1">{error}</p>}
            {!error && helpText && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{helpText}</p>}
        </div>
    );
}
