import React, { useState, useRef, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import { ChevronDown, Sun, Moon, Settings, User as UserIcon, LogOut, Shield } from 'lucide-react';
import { useThemeStore } from '../../stores/useThemeStore';
import Avatar from '../atoms/Avatar';

export default function UserProfileDropdown({ user = null, className = '' }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const { theme, toggleTheme } = useThemeStore();

    const currentUser = user || {
        name: 'Mustapa Ahmad Kamal',
        email: 'admin@example.com',
        role: 'Administrator',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
            >
                <Avatar
                    src={currentUser.avatar}
                    name={currentUser.name}
                    size="sm"
                    status="online"
                />
                <div className="hidden md:block text-left text-xs leading-tight">
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                        {currentUser.name}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 capitalize">
                        {currentUser.role || 'Super Admin'}
                    </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50 py-1.5 z-50 text-xs">
                    <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                        <p className="font-semibold text-slate-900 dark:text-white truncate">
                            {currentUser.name}
                        </p>
                        <p className="text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {currentUser.email}
                        </p>
                    </div>

                    <div className="py-1">
                        <button
                            type="button"
                            onClick={() => {
                                toggleTheme();
                                setIsOpen(false);
                            }}
                            className="w-full flex items-center justify-between px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            <span className="flex items-center gap-2.5">
                                {theme === 'dark' ? (
                                    <Sun className="w-4 h-4 text-amber-500" />
                                ) : (
                                    <Moon className="w-4 h-4 text-indigo-500" />
                                )}
                                <span>{theme === 'dark' ? 'Mode Terang (Light)' : 'Mode Gelap (Dark)'}</span>
                            </span>
                            <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                {theme}
                            </span>
                        </button>

                        <Link
                            href="/settings"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            <Settings className="w-4 h-4 text-slate-400" />
                            <span>Pengaturan Akun</span>
                        </Link>

                        <Link
                            href="/users"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            <Shield className="w-4 h-4 text-slate-400" />
                            <span>Kelola Pengguna</span>
                        </Link>
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
                        <button
                            type="button"
                            onClick={() => {
                                setIsOpen(false);
                                alert('Contoh logout');
                            }}
                            className="w-full flex items-center gap-2.5 px-4 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Keluar (Logout)</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
