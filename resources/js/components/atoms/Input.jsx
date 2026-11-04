import React, { forwardRef } from 'react';

const Input = forwardRef(function Input(
    {
        type = 'text',
        error = false,
        className = '',
        icon: Icon = null,
        clearable = false,
        onClear,
        ...props
    },
    ref
) {
    return (
        <div className="relative w-full">
            {Icon && (
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                    <Icon className="w-4 h-4" />
                </div>
            )}
            <input
                ref={ref}
                type={type}
                className={`w-full rounded-lg text-sm transition-colors duration-150 border bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:cursor-not-allowed ${
                    Icon ? 'pl-9' : 'pl-3.5'
                } ${clearable ? 'pr-9' : 'pr-3.5'} py-2 ${
                    error
                        ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-200 dark:focus:ring-rose-950'
                        : 'border-slate-300 dark:border-slate-700 focus:border-indigo-500 focus:ring-indigo-100 dark:focus:ring-indigo-950'
                } ${className}`}
                {...props}
            />
            {clearable && props.value && (
                <button
                    type="button"
                    onClick={onClear}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            )}
        </div>
    );
});

export default Input;
