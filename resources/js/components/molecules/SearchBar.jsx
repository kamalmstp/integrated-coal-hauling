import React from 'react';
import { Search } from 'lucide-react';
import Input from '../atoms/Input';

export default function SearchBar({
    value = '',
    onChange,
    onClear,
    placeholder = 'Cari data...',
    className = '',
    autoFocus = false,
}) {
    return (
        <div className={`relative ${className}`}>
            <Input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onClear={onClear}
                clearable={Boolean(value)}
                icon={Search}
                placeholder={placeholder}
                autoFocus={autoFocus}
            />
        </div>
    );
}
