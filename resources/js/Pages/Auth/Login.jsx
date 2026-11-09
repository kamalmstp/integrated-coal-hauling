import React, { useState } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import {
    Truck,
    Lock,
    User,
    Eye,
    EyeOff,
    ShieldCheck,
    AlertCircle,
    ArrowRight,
    CheckCircle2,
    HardHat,
    Layers,
    MapPin,
    Cpu,
    HelpCircle
} from 'lucide-react';

export default function Login() {
    const { flash, errors } = usePage().props;
    const [showPassword, setShowPassword] = useState(false);
    const [showDemoAccounts, setShowDemoAccounts] = useState(false);

    const { data, setData, post, processing, reset } = useForm({
        login: '',
        password: '',
        remember: false,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/login', {
            onFinish: () => reset('password'),
        });
    };

    const handleSelectDemo = (username, password) => {
        setData({
            ...data,
            login: username,
            password: password,
        });
    };

    const demoAccounts = [
        { role: 'Super Admin', username: 'superadmin', name: 'Mustapa Ahmad Kamal', site: 'Semua Site (Global)' },
        { role: 'Management', username: 'management', name: 'Ir. Bambang Soedirman', site: 'Semua Site (Lintas Proyek)' },
        { role: 'Project Manager', username: 'pm_teweh', name: 'Dharmawan Wicaksono', site: 'Site Muara Teweh & Lahat' },
        { role: 'PJO', username: 'pjo_teweh', name: 'Budi Santoso, S.T.', site: 'Site Muara Teweh' },
        { role: 'SVP Hauling', username: 'svp_hauling', name: 'Hendra Saputra', site: 'Site Muara Teweh' },
        { role: 'Admin Produksi', username: 'admin_prod', name: 'Wahyu Hidayat', site: 'Site Muara Teweh' },
        { role: 'SVP Plant & Maint', username: 'svp_plant', name: 'Ahmad Fauzi', site: 'Site Muara Teweh' },
        { role: 'Maintenance Planner', username: 'maint_planner', name: 'Rian Pratama', site: 'Site Muara Teweh' },
        { role: 'Mekanik', username: 'mekanik_agus', name: 'Agus Riyadi', site: 'Site Muara Teweh' },
        { role: 'Admin SCM', username: 'admin_scm', name: 'Surya Wijaya', site: 'Site Muara Teweh & Lahat' },
        { role: 'Admin Procurement', username: 'admin_proc', name: 'Dewi Lestari', site: 'Site Muara Teweh' },
        { role: 'Storeman Gudang', username: 'storeman', name: 'Joko Susilo', site: 'Site Muara Teweh' },
        { role: 'Fuelman', username: 'fuelman_andi', name: 'Andi Wijaya', site: 'Site Muara Teweh' },
        { role: 'HR/GA', username: 'hr_ga', name: 'Siti Nurhaliza', site: 'Site Muara Teweh' },
        { role: 'Driver DT', username: 'driver_budi', name: 'Budi Santoso', site: 'Site Muara Teweh' },
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center relative overflow-hidden font-sans selection:bg-amber-500 selection:text-slate-950">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 -left-40 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

            <div className="container mx-auto px-4 py-8 relative z-10 max-w-5xl">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    
                    {/* Left Column: Branding & Operational Hero */}
                    <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider">
                            <Truck className="w-4 h-4 text-amber-400" />
                            <span>Enterprise Mining Management System</span>
                        </div>

                        <div className="space-y-3">
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
                                PT TEKNINDO <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500">ADHYA PANE</span>
                            </h1>
                            <p className="text-base sm:text-lg text-slate-400 font-medium">
                                Integrated Coal Hauling Management System (TAP-CMS)
                            </p>
                        </div>

                        <p className="text-sm text-slate-400 leading-relaxed max-w-xl">
                            Platform operasional terpadu pengelolaan armada pengangkutan batubara: Daily Dispatch, Tiket Timbangan, Workshop & Pemeliharaan, Gudang Sparepart, Manajemen BBM Solar, dan Personalia Lintas Site.
                        </p>

                        {/* Operational Highlights */}
                        <div className="grid grid-cols-3 gap-3 pt-2">
                            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 text-left">
                                <div className="text-amber-400 text-lg font-bold">Multi-Site</div>
                                <div className="text-[11px] text-slate-400">MTW & Lahat Project</div>
                            </div>
                            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 text-left">
                                <div className="text-emerald-400 text-lg font-bold">15 Roles</div>
                                <div className="text-[11px] text-slate-400">3-Tier RBAC Security</div>
                            </div>
                            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 text-left">
                                <div className="text-cyan-400 text-lg font-bold">Real-Time</div>
                                <div className="text-[11px] text-slate-400">Dispatch & Telematics</div>
                            </div>
                        </div>

                        {/* Quick Demo Accounts Drawer Toggle */}
                        <div className="pt-2">
                            <button
                                type="button"
                                onClick={() => setShowDemoAccounts(!showDemoAccounts)}
                                className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
                            >
                                <Cpu className="w-3.5 h-3.5" />
                                <span>{showDemoAccounts ? 'Tutup Daftar Akun Cepat' : 'Lihat Akun Percontohan (Demo 15 Roles)'}</span>
                            </button>

                            {showDemoAccounts && (
                                <div className="mt-3 p-3.5 rounded-2xl bg-slate-900/95 border border-slate-800 text-left space-y-2 max-h-56 overflow-y-auto custom-scrollbar">
                                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 pb-1 border-b border-slate-800">
                                        <span>Pilih akun untuk mengisi form otomatis (Password: password123)</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {demoAccounts.map((acc) => (
                                            <button
                                                key={acc.username}
                                                type="button"
                                                onClick={() => handleSelectDemo(acc.username, 'password123')}
                                                className="p-2 rounded-lg bg-slate-800/70 hover:bg-amber-500/20 hover:border-amber-500/40 border border-slate-700/50 text-left transition-all group"
                                            >
                                                <div className="text-xs font-bold text-white group-hover:text-amber-300 flex items-center justify-between">
                                                    <span>{acc.role}</span>
                                                    <span className="text-[10px] font-mono text-slate-400 group-hover:text-amber-200">@{acc.username}</span>
                                                </div>
                                                <div className="text-[10px] text-slate-400 truncate">{acc.name}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Login Card */}
                    <div className="lg:col-span-6 flex justify-center">
                        <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80">
                            
                            {/* Card Header */}
                            <div className="text-center mb-6">
                                <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/20 mb-3">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                                <h2 className="text-xl font-bold text-white tracking-tight">Otentikasi Pengguna</h2>
                                <p className="text-xs text-slate-400 mt-1">Masukkan kredensial akun terdaftar TAP Anda</p>
                            </div>

                            {/* Flash Alert Messages */}
                            {flash?.success && (
                                <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                                    <span>{flash.success}</span>
                                </div>
                            )}

                            {flash?.info && (
                                <div className="mb-4 p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <span>{flash.info}</span>
                                </div>
                            )}

                            {errors?.login && (
                                <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                    <span>{errors.login}</span>
                                </div>
                            )}

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                
                                {/* Username or Email Field */}
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-semibold text-slate-300">
                                        Username atau Alamat Email
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                                            <User className="w-4 h-4" />
                                        </div>
                                        <input
                                            type="text"
                                            value={data.login}
                                            onChange={(e) => setData('login', e.target.value)}
                                            placeholder="contoh: admin@tap-mining.com atau superadmin"
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                                            required
                                            autoFocus
                                            autoComplete="username"
                                        />
                                    </div>
                                </div>

                                {/* Password Field with Show/Hide Toggle */}
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <label className="block text-xs font-semibold text-slate-300">
                                            Kata Sandi (Password)
                                        </label>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                                            <Lock className="w-4 h-4" />
                                        </div>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            placeholder="Masukkan kata sandi Anda"
                                            className="w-full pl-10 pr-10 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                                            required
                                            autoComplete="current-password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 focus:outline-none cursor-pointer"
                                            title={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Remember Me & Support */}
                                <div className="flex items-center justify-between pt-1 text-xs">
                                    <label className="flex items-center gap-2 cursor-pointer select-none text-slate-400 hover:text-slate-200">
                                        <input
                                            type="checkbox"
                                            checked={data.remember}
                                            onChange={(e) => setData('remember', e.target.checked)}
                                            className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-amber-500/20 focus:ring-offset-0 cursor-pointer"
                                        />
                                        <span>Ingat Saya di Perangkat Ini</span>
                                    </label>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    {processing ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                                            <span>Memvalidasi Akses...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Masuk ke Sistem TAP</span>
                                            <ArrowRight className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </form>

                            {/* Footer Help */}
                            <div className="mt-6 pt-4 border-t border-slate-800/80 text-center text-[11px] text-slate-500 space-y-1">
                                <p className="flex items-center justify-center gap-1">
                                    <HelpCircle className="w-3 h-3 text-slate-400" />
                                    <span>Kendala akses atau reset password?</span>
                                </p>
                                <p className="text-slate-400 font-medium">Hubungi IT & Security Administrator Site MTW / LHT</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom System Info */}
                <div className="mt-12 text-center text-xs text-slate-500">
                    <p>© 2026 PT Teknindo Adhya Pane. All Rights Reserved. • Mining Fleet & Coal Hauling Operation v2.4</p>
                </div>
            </div>
        </div>
    );
}
