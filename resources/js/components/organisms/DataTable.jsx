import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Edit3, Trash2, Shield, User } from 'lucide-react';
import Avatar from '../atoms/Avatar';
import Badge from '../atoms/Badge';

export default function DataTable({
    users = [],
    sortBy = 'created_at',
    sortDirection = 'desc',
    onSort,
    onEdit,
    onDelete,
}) {
    const columns = [
        { key: 'name', label: 'Pengguna & Email', sortable: true },
        { key: 'role', label: 'Peran (Role)', sortable: true },
        { key: 'status', label: 'Status', sortable: true },
        { key: 'phone', label: 'No. Telepon', sortable: false },
        { key: 'created_at', label: 'Terdaftar Pada', sortable: true },
        { key: 'actions', label: 'Aksi', sortable: false, align: 'right' },
    ];

    const getRoleBadge = (role) => {
        switch (role) {
            case 'admin':
                return <Badge variant="purple" dot>Administrator</Badge>;
            case 'manager':
                return <Badge variant="primary" dot>Manager</Badge>;
            case 'editor':
                return <Badge variant="warning" dot>Editor</Badge>;
            case 'user':
            default:
                return <Badge variant="default" dot>User Biasa</Badge>;
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'active':
                return <Badge variant="success" dot>Aktif</Badge>;
            case 'inactive':
                return <Badge variant="warning" dot>Nonaktif</Badge>;
            case 'suspended':
                return <Badge variant="danger" dot>Ditangguhkan</Badge>;
            default:
                return <Badge variant="default">{status}</Badge>;
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        try {
            const date = new Date(dateStr);
            return new Intl.DateTimeFormat('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
            }).format(date);
        } catch (e) {
            return dateStr;
        }
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        {columns.map((col) => {
                            const isSorted = sortBy === col.key;
                            return (
                                <th
                                    key={col.key}
                                    className={`py-3.5 px-4 ${col.align === 'right' ? 'text-right' : 'text-left'}`}
                                >
                                    {col.sortable ? (
                                        <button
                                            type="button"
                                            onClick={() => onSort && onSort(col.key)}
                                            className="inline-flex items-center gap-1.5 hover:text-slate-800 dark:hover:text-slate-200 transition-colors focus:outline-none cursor-pointer"
                                        >
                                            <span>{col.label}</span>
                                            {isSorted ? (
                                                sortDirection === 'asc' ? (
                                                    <ArrowUp className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                                                ) : (
                                                    <ArrowDown className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                                                )
                                            ) : (
                                                <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-60" />
                                            )}
                                        </button>
                                    ) : (
                                        <span>{col.label}</span>
                                    )}
                                </th>
                            );
                        })}
                    </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                    {users.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length} className="py-12 text-center text-slate-400 dark:text-slate-500">
                                <div className="flex flex-col items-center justify-center gap-2">
                                    <User className="w-8 h-8 opacity-40" />
                                    <p className="font-medium">Tidak ada data pengguna yang sesuai dengan filter.</p>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        users.map((user) => (
                            <tr
                                key={user.id}
                                className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                            >
                                {/* Name and Email */}
                                <td className="py-3.5 px-4">
                                    <div className="flex items-center gap-3">
                                        <Avatar
                                            src={user.avatar}
                                            name={user.name}
                                            size="sm"
                                        />
                                        <div className="min-w-0">
                                            <p className="font-semibold text-slate-900 dark:text-white truncate">
                                                {user.name}
                                            </p>
                                            <p className="text-slate-500 dark:text-slate-400 text-[11px] truncate">
                                                {user.email}
                                            </p>
                                        </div>
                                    </div>
                                </td>

                                {/* Role */}
                                <td className="py-3.5 px-4 whitespace-nowrap">
                                    {getRoleBadge(user.role)}
                                </td>

                                {/* Status */}
                                <td className="py-3.5 px-4 whitespace-nowrap">
                                    {getStatusBadge(user.status)}
                                </td>

                                {/* Phone */}
                                <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 dark:text-slate-300">
                                    {user.phone || '-'}
                                </td>

                                {/* Created At */}
                                <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 dark:text-slate-400">
                                    {formatDate(user.created_at)}
                                </td>

                                {/* Actions */}
                                <td className="py-3.5 px-4 whitespace-nowrap text-right">
                                    <div className="inline-flex items-center gap-1.5">
                                        <button
                                            type="button"
                                            onClick={() => onEdit && onEdit(user)}
                                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors"
                                            title="Edit Pengguna"
                                        >
                                            <Edit3 className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => onDelete && onDelete(user)}
                                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                                            title="Hapus Pengguna"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
