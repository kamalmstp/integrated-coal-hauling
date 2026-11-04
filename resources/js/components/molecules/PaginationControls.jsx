import React from 'react';
import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function PaginationControls({
    links = [],
    from = 0,
    to = 0,
    total = 0,
    className = '',
}) {
    if (!links || links.length <= 3) {
        // Less than 2 pages, only show summary if items exist
        if (total === 0) return null;
        return (
            <div className={`flex items-center justify-between py-3 px-4 text-xs text-slate-500 dark:text-slate-400 ${className}`}>
                <span>Total {total} data ditemukan</span>
            </div>
        );
    }

    return (
        <div
            className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-4 sm:px-6 border-t border-slate-200 dark:border-slate-800 ${className}`}
        >
            <div className="text-xs text-slate-500 dark:text-slate-400">
                Menampilkan <span className="font-semibold text-slate-800 dark:text-slate-200">{from || 0}</span> sampai{' '}
                <span className="font-semibold text-slate-800 dark:text-slate-200">{to || 0}</span> dari{' '}
                <span className="font-semibold text-slate-800 dark:text-slate-200">{total}</span> data
            </div>

            <nav className="flex items-center gap-1" aria-label="Pagination">
                {links.map((link, idx) => {
                    const isPrev = idx === 0;
                    const isNext = idx === links.length - 1;
                    const isActive = link.active;
                    const isDisabled = !link.url;

                    // Clean label from &laquo; and &raquo; HTML entities
                    let cleanLabel = link.label
                        .replace(/&laquo;/g, '')
                        .replace(/&raquo;/g, '')
                        .trim();

                    if (isPrev) {
                        return (
                            <Link
                                key={idx}
                                href={link.url || '#'}
                                preserveScroll
                                preserveState
                                className={`inline-flex items-center justify-center px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                    isDisabled
                                        ? 'text-slate-300 dark:text-slate-700 pointer-events-none'
                                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                                title="Halaman Sebelumnya"
                            >
                                <ChevronLeft className="w-4 h-4 mr-1" />
                                <span>Sebelumnya</span>
                            </Link>
                        );
                    }

                    if (isNext) {
                        return (
                            <Link
                                key={idx}
                                href={link.url || '#'}
                                preserveScroll
                                preserveState
                                className={`inline-flex items-center justify-center px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                    isDisabled
                                        ? 'text-slate-300 dark:text-slate-700 pointer-events-none'
                                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                                title="Halaman Selanjutnya"
                            >
                                <span>Selanjutnya</span>
                                <ChevronRight className="w-4 h-4 ml-1" />
                            </Link>
                        );
                    }

                    return (
                        <Link
                            key={idx}
                            href={link.url || '#'}
                            preserveScroll
                            preserveState
                            className={`min-w-8 h-8 inline-flex items-center justify-center rounded-lg text-xs font-medium transition-colors ${
                                isActive
                                    ? 'bg-indigo-600 text-white font-semibold shadow-xs dark:bg-indigo-500'
                                    : isDisabled
                                    ? 'text-slate-400 dark:text-slate-600 pointer-events-none'
                                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                        >
                            {cleanLabel}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
