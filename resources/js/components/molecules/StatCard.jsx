import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import * as Icons from 'lucide-react';

export default function StatCard({
    title,
    value,
    change,
    trend = 'up', // 'up' | 'down' | 'neutral'
    description = '',
    iconName = 'Users',
    color = 'indigo',
    className = '',
}) {
    const IconComponent = Icons[iconName] || Icons.Activity;

    const colorMap = {
        indigo: {
            bg: 'bg-indigo-50 dark:bg-indigo-950/50',
            text: 'text-indigo-600 dark:text-indigo-400',
            border: 'border-indigo-100 dark:border-indigo-900/50',
        },
        emerald: {
            bg: 'bg-emerald-50 dark:bg-emerald-950/50',
            text: 'text-emerald-600 dark:text-emerald-400',
            border: 'border-emerald-100 dark:border-emerald-900/50',
        },
        purple: {
            bg: 'bg-purple-50 dark:bg-purple-950/50',
            text: 'text-purple-600 dark:text-purple-400',
            border: 'border-purple-100 dark:border-purple-900/50',
        },
        rose: {
            bg: 'bg-rose-50 dark:bg-rose-950/50',
            text: 'text-rose-600 dark:text-rose-400',
            border: 'border-rose-100 dark:border-rose-900/50',
        },
    };

    const activeColor = colorMap[color] || colorMap.indigo;

    return (
        <div
            className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all duration-200 ${className}`}
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        {title}
                    </p>
                    <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                        {value}
                    </h3>
                </div>
                <div className={`p-3 rounded-xl ${activeColor.bg} ${activeColor.text}`}>
                    <IconComponent className="w-5 h-5" />
                </div>
            </div>

            {(change || description) && (
                <div className="mt-4 flex items-center gap-2 text-xs">
                    {change && (
                        <span
                            className={`inline-flex items-center font-semibold px-1.5 py-0.5 rounded-md ${
                                trend === 'up'
                                    ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950/60'
                                    : trend === 'down'
                                    ? 'text-rose-700 bg-rose-50 dark:text-rose-300 dark:bg-rose-950/60'
                                    : 'text-slate-600 bg-slate-100 dark:text-slate-300 dark:bg-slate-800'
                            }`}
                        >
                            {trend === 'up' && <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />}
                            {trend === 'down' && <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
                            {trend === 'neutral' && <Minus className="w-3 h-3 mr-0.5" />}
                            {change}
                        </span>
                    )}
                    {description && (
                        <span className="text-slate-500 dark:text-slate-400 truncate">
                            {description}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}
