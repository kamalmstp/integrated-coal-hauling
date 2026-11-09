import React, { useState, useRef, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import {
    ChevronDown,
    Sun,
    Moon,
    Settings,
    User as UserIcon,
    LogOut,
    Shield,
    Key,
    X,
    Eye,
    EyeOff,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import { useThemeStore } from '../../stores/useThemeStore';
import Avatar from '../atoms/Avatar';

export default function UserProfileDropdown({ user = null, className = '' }) {
    const { auth } = usePage().props;
    const [isOpen, setIsOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const dropdownRef = useRef(null);
    const { theme, toggleTheme } = useThemeStore();

    // Password change form state
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        password: '',
        password_confirmation: '',
    });
    const [showCurrentPass, setShowCurrentPass] = useState(false);
    const [showNewPass, setShowNewPass] = useState(false);
    const [passwordErrors, setPasswordErrors] = useState({});
    const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

    const currentUser = user || auth?.user || {
        name: 'Pengguna TAP',
        email: 'user@tap-mining.com',
        role: 'user',
        roles: ['user'],
        avatar: null,
    };

    const primaryRole = currentUser.roles?.[0] || currentUser.role || 'User';

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        setIsOpen(false);
        router.post('/logout');
    };

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        setIsSubmittingPassword(true);
        setPasswordErrors({});

        router.put('/profile/password', passwordData, {
            onSuccess: () => {
                setIsSubmittingPassword(false);
                setIsPasswordModalOpen(false);
                setPasswordData({
                    current_password: '',
                    password: '',
                    password_confirmation: '',
                });
            },
            onError: (errors) => {
                setIsSubmittingPassword(false);
                setPasswordErrors(errors);
            },
        });
    };

    return (
        <>
            <div className={`relative ${className}`} ref={dropdownRef}>
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none cursor-pointer"
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
                            {primaryRole.replace(/_/g, ' ')}
                        </p>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
                </button>

                {isOpen && (
                    <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50 py-1.5 z-50 text-xs">
                        <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                            <p className="font-semibold text-slate-900 dark:text-white truncate">
                                {currentUser.name}
                            </p>
                            <p className="text-slate-500 dark:text-slate-400 truncate mt-0.5 text-[11px]">
                                {currentUser.email}
                            </p>
                            {auth?.active_site && (
                                <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-medium">
                                    <span>{auth.active_site.name}</span>
                                </div>
                            )}
                        </div>

                        <div className="py-1">
                            <button
                                type="button"
                                onClick={() => {
                                    toggleTheme();
                                    setIsOpen(false);
                                }}
                                className="w-full flex items-center justify-between px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
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

                            <button
                                type="button"
                                onClick={() => {
                                    setIsOpen(false);
                                    setIsPasswordModalOpen(true);
                                }}
                                className="w-full flex items-center gap-2.5 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            >
                                <Key className="w-4 h-4 text-slate-400" />
                                <span>Ganti Kata Sandi</span>
                            </button>

                            {(currentUser.is_super_admin || currentUser.roles?.includes('super_admin')) && (
                                <>
                                    <Link
                                        href="/users"
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center gap-2.5 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        <Shield className="w-4 h-4 text-slate-400" />
                                        <span>Kelola Pengguna</span>
                                    </Link>
                                    <Link
                                        href="/security/login-logs"
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center gap-2.5 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        <UserIcon className="w-4 h-4 text-slate-400" />
                                        <span>Log Aktivitas Login</span>
                                    </Link>
                                </>
                            )}
                        </div>

                        <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="w-full flex items-center gap-2.5 px-4 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Keluar (Logout)</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Change Password Modal */}
            {isPasswordModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
                    <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
                                <Key className="w-4 h-4 text-amber-500" />
                                <span>Perbarui Kata Sandi</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsPasswordModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {passwordErrors.current_password && (
                            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 text-xs flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span>{passwordErrors.current_password}</span>
                            </div>
                        )}

                        <form onSubmit={handlePasswordSubmit} className="space-y-3.5">
                            <div className="space-y-1">
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    Password Saat Ini
                                </label>
                                <div className="relative">
                                    <input
                                        type={showCurrentPass ? 'text' : 'password'}
                                        value={passwordData.current_password}
                                        onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                                        className="w-full px-3 py-2 pr-10 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPass(!showCurrentPass)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 cursor-pointer"
                                    >
                                        {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    Password Baru (Minimal 8 Karakter)
                                </label>
                                <div className="relative">
                                    <input
                                        type={showNewPass ? 'text' : 'password'}
                                        value={passwordData.password}
                                        onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                                        className="w-full px-3 py-2 pr-10 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPass(!showNewPass)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 cursor-pointer"
                                    >
                                        {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {passwordErrors.password && (
                                    <p className="text-[11px] text-rose-500">{passwordErrors.password}</p>
                                )}
                            </div>

                            <div className="space-y-1">
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    Konfirmasi Password Baru
                                </label>
                                <input
                                    type={showNewPass ? 'text' : 'password'}
                                    value={passwordData.password_confirmation}
                                    onChange={(e) => setPasswordData({ ...passwordData, password_confirmation: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    required
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsPasswordModalOpen(false)}
                                    className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmittingPassword}
                                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                                >
                                    {isSubmittingPassword ? 'Menyimpan...' : 'Simpan Password Baru'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
