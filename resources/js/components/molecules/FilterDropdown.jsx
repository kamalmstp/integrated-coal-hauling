import React from 'react';
import { Filter } from 'lucide-react';
import Select from '../atoms/Select';

export default function FilterDropdown({
    role = 'all',
    status = 'all',
    perPage = 10,
    onRoleChange,
    onStatusChange,
    onPerPageChange,
    className = '',
}) {
    const roleOptions = [
        { value: 'all', label: 'Semua Role' },
        { value: 'admin', label: 'Administrator' },
        { value: 'manager', label: 'Manager' },
        { value: 'editor', label: 'Editor' },
        { value: 'user', label: 'User Biasa' },
    ];

    const statusOptions = [
        { value: 'all', label: 'Semua Status' },
        { value: 'active', label: 'Aktif' },
        { value: 'inactive', label: 'Nonaktif' },
        { value: 'suspended', label: 'Ditangguhkan' },
    ];

    const perPageOptions = [
        { value: 5, label: '5 per hal' },
        { value: 10, label: '10 per hal' },
        { value: 25, label: '25 per hal' },
        { value: 50, label: '50 per hal' },
    ];

    return (
        <div className={`flex flex-wrap items-center gap-2.5 ${className}`}>
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                <Filter className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Filter:</span>
            </div>

            <div className="w-36">
                <Select
                    value={role}
                    onChange={(e) => onRoleChange(e.target.value)}
                    options={roleOptions}
                    placeholder=""
                />
            </div>

            <div className="w-36">
                <Select
                    value={status}
                    onChange={(e) => onStatusChange(e.target.value)}
                    options={statusOptions}
                    placeholder=""
                />
            </div>

            <div className="w-28">
                <Select
                    value={perPage}
                    onChange={(e) => onPerPageChange(Number(e.target.value))}
                    options={perPageOptions}
                    placeholder=""
                />
            </div>
        </div>
    );
}
