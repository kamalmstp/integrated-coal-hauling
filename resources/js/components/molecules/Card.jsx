import React from 'react';

export default function Card({ children, className = '', ...props }) {
    return (
        <div
            className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs transition-colors duration-200 ${className}`}
            {...props}
        >
            {children}
        </div>
    );
}
