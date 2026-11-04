import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { FileText, Shield, User, Clock, Terminal } from 'lucide-react';
import DashboardLayout from '../../components/templates/DashboardLayout';
import SearchBar from '../../components/molecules/SearchBar';
import Select from '../../components/atoms/Select';
import Badge from '../../components/atoms/Badge';
import PaginationControls from '../../components/molecules/PaginationControls';

export default function ActivityLogsIndex({ logs, filters = {}, modules = [] }) {
    const [search, setSearch] = useState(filters.search || '');
    const [module, setModule] = useState(filters.module || 'all');

    const applyFilters = (overrides = {}) => {
        const queryParams = {
            search: overrides.search !== undefined ? overrides.search : search,
            module: overrides.module !== undefined ? overrides.module : module,
        };
        if (!queryParams.search) delete queryParams.search;
        if (queryParams.module === 'all') delete queryParams.module;

        router.get('/security/activity-logs', queryParams, { preserveState: true, replace: true });
    };

    const getActionBadge = (action) => {
        switch (action) {
            case 'create':
                return <Badge variant="success">CREATE</Badge>;
            case 'update':
                return <Badge variant="primary">UPDATE</Badge>;
            case 'delete':
                return <Badge variant="danger">DELETE</Badge>;
            case 'config':
                return <Badge variant="purple">CONFIG</Badge>;
            case 'login':
                return <Badge variant="warning">LOGIN</Badge>;
            default:
                return <Badge variant="default">{action.toUpperCase()}</Badge>;
        }
    };

    return (
        <DashboardLayout title="Audit Trail & Log Aktivitas Pengguna (SSR)" breadcrumbs={['Keamanan', 'Log Aktivitas']}>
            {/* Filter Bar */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="w-full sm:max-w-xs">
                    <SearchBar
                        value={search}
                        onChange={(val) => { setSearch(val); applyFilters({ search: val }); }}
                        onClear={() => { setSearch(''); applyFilters({ search: '' }); }}
                        placeholder="Cari deskripsi, aksi, atau IP..."
                    />
                </div>
                <div className="w-48">
                    <Select
                        value={module}
                        onChange={(e) => { setModule(e.target.value); applyFilters({ module: e.target.value }); }}
                        options={[
                            { value: 'all', label: 'Semua Modul' },
                            ...modules.map((m) => ({ value: m, label: m.toUpperCase() })),
                        ]}
                        placeholder=""
                    />
                </div>
            </div>

            {/* Table */}
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-slate-800/40 uppercase font-semibold text-slate-500 border-b border-slate-200 dark:border-slate-800">
                            <tr>
                                <th className="py-3 px-4">Waktu Kejadian</th>
                                <th className="py-3 px-4">Pengguna (User)</th>
                                <th className="py-3 px-4">Jenis Aksi</th>
                                <th className="py-3 px-4">Modul Target</th>
                                <th className="py-3 px-4">Deskripsi Aktivitas</th>
                                <th className="py-3 px-4">Alamat IP & Sesi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                            {logs.data.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-slate-400">
                                        Tidak ada catatan aktivitas.
                                    </td>
                                </tr>
                            ) : (
                                logs.data.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                        <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 font-mono">
                                            {new Date(log.created_at).toLocaleString('id-ID')}
                                        </td>
                                        <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                                            {log.user?.name || 'Sistem Otomatis'}
                                        </td>
                                        <td className="py-3.5 px-4">{getActionBadge(log.action)}</td>
                                        <td className="py-3.5 px-4 font-mono uppercase text-indigo-600 dark:text-indigo-400 font-semibold">
                                            {log.module}
                                        </td>
                                        <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 max-w-md">
                                            {log.description}
                                        </td>
                                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                                            {log.ip_address || '127.0.0.1'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <PaginationControls links={logs.links} from={logs.from} to={logs.to} total={logs.total} />
            </div>
        </DashboardLayout>
    );
}
