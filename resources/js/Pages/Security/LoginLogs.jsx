import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import {
    ShieldCheck,
    ShieldAlert,
    User,
    Clock,
    Laptop,
    MapPin,
    AlertCircle,
    CheckCircle2,
    Lock,
    Search
} from 'lucide-react';
import DashboardLayout from '../../components/templates/DashboardLayout';
import SearchBar from '../../components/molecules/SearchBar';
import Select from '../../components/atoms/Select';
import Badge from '../../components/atoms/Badge';
import PaginationControls from '../../components/molecules/PaginationControls';

export default function LoginLogs({ logs, filters = {}, statistics = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');

    const applyFilters = (overrides = {}) => {
        const queryParams = {
            search: overrides.search !== undefined ? overrides.search : search,
            status: overrides.status !== undefined ? overrides.status : status,
        };
        if (!queryParams.search) delete queryParams.search;
        if (queryParams.status === 'all') delete queryParams.status;

        router.get('/security/login-logs', queryParams, { preserveState: true, replace: true });
    };

    const getStatusBadge = (statusVal) => {
        switch (statusVal) {
            case 'success':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>SUCCESS</span>
                    </span>
                );
            case 'failed':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/20">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>FAILED</span>
                    </span>
                );
            case 'locked':
            case 'inactive_blocked':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                        <Lock className="w-3.5 h-3.5" />
                        <span>{statusVal === 'locked' ? 'LOCKED (THROTTLED)' : 'BLOCKED (INACTIVE)'}</span>
                    </span>
                );
            default:
                return <Badge variant="default">{statusVal}</Badge>;
        }
    };

    return (
        <DashboardLayout title="Audit Log Aktivitas Login & Keamanan (RBAC)" breadcrumbs={['Keamanan', 'Log Login']}>
            
            {/* Metric Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Sesi Login</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{statistics.total || 0}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                        <ShieldCheck className="w-5 h-5" />
                    </div>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Login Berhasil</p>
                        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{statistics.success || 0}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Percobaan Gagal</p>
                        <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">{statistics.failed || 0}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
                        <AlertCircle className="w-5 h-5" />
                    </div>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Terkunci / Diblokir</p>
                        <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{statistics.locked || 0}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                        <Lock className="w-5 h-5" />
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
                <div className="w-full sm:max-w-xs">
                    <SearchBar
                        value={search}
                        onChange={(val) => { setSearch(val); applyFilters({ search: val }); }}
                        onClear={() => { setSearch(''); applyFilters({ search: '' }); }}
                        placeholder="Cari user, input login, atau IP..."
                    />
                </div>
                <div className="w-full sm:w-56">
                    <Select
                        value={status}
                        onChange={(e) => { setStatus(e.target.value); applyFilters({ status: e.target.value }); }}
                        options={[
                            { value: 'all', label: 'Semua Status Login' },
                            { value: 'success', label: 'Success (Berhasil)' },
                            { value: 'failed', label: 'Failed (Gagal)' },
                            { value: 'locked', label: 'Locked / Blocked' },
                        ]}
                    />
                </div>
            </div>

            {/* Data Table */}
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-semibold">
                                <th className="p-4">WAKTU LOGIN</th>
                                <th className="p-4">PENGGUNA</th>
                                <th className="p-4">INPUT LOGIN</th>
                                <th className="p-4">STATUS</th>
                                <th className="p-4">ALAMAT IP</th>
                                <th className="p-4">PERANGKAT & BROWSER</th>
                                <th className="p-4">SITE AKTIF</th>
                                <th className="p-4">WAKTU LOGOUT</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                            {logs.data?.length > 0 ? (
                                logs.data.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="p-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                                            {log.login_at ? new Date(log.login_at).toLocaleString('id-ID') : '-'}
                                        </td>
                                        <td className="p-4">
                                            {log.user ? (
                                                <div>
                                                    <span className="font-semibold text-slate-800 dark:text-slate-200 block">{log.user.name}</span>
                                                    <span className="text-[11px] text-slate-400 block">{log.user.email}</span>
                                                </div>
                                            ) : (
                                                <span className="italic text-slate-400 text-xs">Pengguna Tidak Ditemukan</span>
                                            )}
                                        </td>
                                        <td className="p-4 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                                            {log.login_input}
                                        </td>
                                        <td className="p-4 whitespace-nowrap">
                                            {getStatusBadge(log.status)}
                                            {log.failure_reason && (
                                                <span className="block text-[10px] text-rose-400 mt-1 max-w-xs truncate" title={log.failure_reason}>
                                                    {log.failure_reason}
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 font-mono text-xs text-slate-600 dark:text-slate-300">
                                            {log.ip_address || '-'}
                                        </td>
                                        <td className="p-4 max-w-xs truncate text-slate-500 dark:text-slate-400 text-[11px]" title={log.user_agent}>
                                            <div className="flex items-center gap-1.5">
                                                <Laptop className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                                                <span className="truncate">{log.user_agent || '-'}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-slate-600 dark:text-slate-400">
                                            {log.active_site ? (
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="w-3 h-3 text-amber-500" />
                                                    <span className="font-medium text-xs">{log.active_site.name}</span>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 text-xs">-</span>
                                            )}
                                        </td>
                                        <td className="p-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                                            {log.logout_at ? new Date(log.logout_at).toLocaleString('id-ID') : '-'}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="p-8 text-center text-slate-400">
                                        Belum ada riwayat aktivitas login yang tercatat.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {logs.links && (
                    <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                        <PaginationControls pagination={logs} />
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
