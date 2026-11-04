<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the main Dashboard panel.
     */
    public function index(): Response
    {
        $totalUsers = User::count();
        $activeUsers = User::where('status', 'active')->count();
        $inactiveUsers = User::where('status', 'inactive')->count();
        $suspendedUsers = User::where('status', 'suspended')->count();
        $adminCount = User::where('role', 'admin')->count();

        // Recent users
        $recentUsers = User::latest()->take(5)->get();

        // Activity metrics
        $metrics = [
            [
                'title' => 'Total Pengguna',
                'value' => number_format($totalUsers),
                'change' => '+12.5%',
                'trend' => 'up',
                'description' => 'dibandingkan bulan lalu',
                'icon' => 'Users',
                'color' => 'indigo',
            ],
            [
                'title' => 'Pengguna Aktif',
                'value' => number_format($activeUsers),
                'change' => '+8.2%',
                'trend' => 'up',
                'description' => 'tingkat aktivitas tinggi',
                'icon' => 'UserCheck',
                'color' => 'emerald',
            ],
            [
                'title' => 'Administrator',
                'value' => number_format($adminCount),
                'change' => '0%',
                'trend' => 'neutral',
                'description' => 'hak akses istimewa',
                'icon' => 'ShieldCheck',
                'color' => 'purple',
            ],
            [
                'title' => 'Akun Ditangguhkan',
                'value' => number_format($suspendedUsers),
                'change' => '-3.1%',
                'trend' => 'down',
                'description' => 'penurunan pelanggaran',
                'icon' => 'AlertTriangle',
                'color' => 'rose',
            ],
        ];

        // Monthly stats for chart/data visualization
        $chartData = [
            ['month' => 'Jan', 'users' => 12, 'active' => 10],
            ['month' => 'Feb', 'users' => 18, 'active' => 15],
            ['month' => 'Mar', 'users' => 24, 'active' => 22],
            ['month' => 'Apr', 'users' => 32, 'active' => 28],
            ['month' => 'Mei', 'users' => 40, 'active' => 36],
            ['month' => 'Jun', 'users' => $totalUsers, 'active' => $activeUsers],
        ];

        return Inertia::render('Dashboard/Index', [
            'metrics' => $metrics,
            'recentUsers' => $recentUsers,
            'chartData' => $chartData,
            'counts' => [
                'total' => $totalUsers,
                'active' => $activeUsers,
                'inactive' => $inactiveUsers,
                'suspended' => $suspendedUsers,
            ],
        ]);
    }

    /**
     * Trigger Laravel Notify test alerts
     */
    public function triggerNotify(Request $request)
    {
        $type = $request->input('type', 'success');

        switch ($type) {
            case 'success':
                notify()->success('Berhasil!', 'Data telah berhasil disimpan ke database MySQL.');
                break;
            case 'error':
                notify()->error('Gagal!', 'Terjadi kesalahan sistem saat memproses permintaan.');
                break;
            case 'warning':
                notify()->warning('Peringatan!', 'Sesi Anda akan segera berakhir dalam 5 menit.');
                break;
            case 'info':
                notify()->info('Informasi Sistem', 'Pembaruan server Laravel 12 & React Inertia telah aktif.');
                break;
            case 'confirm':
                notify()->confirm(
                    'Konfirmasi Dari Server',
                    'Apakah Anda yakin ingin mengeksekusi operasi server ini?',
                    [
                        'confirmButtonText' => 'Ya, Jalankan',
                        'cancelButtonText' => 'Batal',
                    ]
                );
                break;
            default:
                notify()->info('Notifikasi', 'Halo dari Laravel Notify!');
        }

        return redirect()->back();
    }
}
