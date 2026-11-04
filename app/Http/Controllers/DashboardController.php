<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Driver;
use App\Models\Employee;
use App\Models\Location;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the TAP Integrated Coal Hauling Management System Dashboard.
     */
    public function index(): Response
    {
        // Hauling Unit Stats
        $totalUnits = Unit::count();
        $operatingUnits = Unit::where('status', 'operating')->count();
        $standbyUnits = Unit::where('status', 'standby')->count();
        $breakdownUnits = Unit::where('status', 'breakdown')->count();
        $maintenanceUnits = Unit::where('status', 'maintenance')->count();

        // Driver Stats
        $totalDrivers = Driver::count();
        $fitDrivers = Driver::where('mcu_status', 'fit')->where('is_active', true)->count();
        $fitNoteDrivers = Driver::where('mcu_status', 'fit_with_note')->count();
        $unfitDrivers = Driver::where('mcu_status', 'unfit')->count();

        // Employee & Customer Stats
        $totalEmployees = Employee::where('is_active', true)->count();
        $activeCustomers = Customer::where('is_active', true)->count();
        $totalTargetTonnage = Customer::where('is_active', true)->sum('target_tonnage');

        // Recent Units
        $recentUnits = Unit::with('site')->latest()->take(5)->get();

        // Recent Drivers
        $recentDrivers = Driver::with('employee')->latest()->take(5)->get();

        // Operational Metrics Grid
        $metrics = [
            [
                'title' => 'Armada Dump Truck Siap Operasi',
                'value' => number_format($operatingUnits) . ' / ' . number_format($totalUnits) . ' Unit',
                'change' => round(($operatingUnits / max($totalUnits, 1)) * 100) . '% PA (Physical Availability)',
                'trend' => 'up',
                'description' => $breakdownUnits . ' unit breakdown, ' . $maintenanceUnits . ' service',
                'icon' => 'Truck',
                'color' => 'indigo',
            ],
            [
                'title' => 'Driver Siap Operasi (Fit)',
                'value' => number_format($fitDrivers) . ' Driver',
                'change' => '+' . number_format($fitNoteDrivers) . ' bersyarat',
                'trend' => 'up',
                'description' => 'Dari total ' . $totalDrivers . ' driver terdaftar',
                'icon' => 'UserCheck',
                'color' => 'emerald',
            ],
            [
                'title' => 'Total Tenaga Kerja Site',
                'value' => number_format($totalEmployees) . ' Karyawan',
                'change' => '100% Aktif',
                'trend' => 'neutral',
                'description' => 'Operasional, Plant, HSE & HRGA',
                'icon' => 'Users',
                'color' => 'purple',
            ],
            [
                'title' => 'Target Kontrak Hauling',
                'value' => number_format($totalTargetTonnage / 1000000, 2) . ' Juta Ton',
                'change' => $activeCustomers . ' Klien IUP',
                'trend' => 'up',
                'description' => 'MUTO Indika & Barito Coal',
                'icon' => 'Target',
                'color' => 'rose',
            ],
        ];

        // Monthly Hauling Target Visualization (Ton x 1,000)
        $chartData = [
            ['month' => 'Jan', 'users' => 280, 'active' => 260],
            ['month' => 'Feb', 'users' => 310, 'active' => 295],
            ['month' => 'Mar', 'users' => 340, 'active' => 330],
            ['month' => 'Apr', 'users' => 390, 'active' => 380],
            ['month' => 'Mei', 'users' => 420, 'active' => 410],
            ['month' => 'Jun', 'users' => 450, 'active' => 445],
        ];

        return Inertia::render('Dashboard/Index', [
            'metrics' => $metrics,
            'recentUnits' => $recentUnits,
            'recentDrivers' => $recentDrivers,
            'chartData' => $chartData,
            'unitStatusCounts' => [
                'total' => $totalUnits,
                'operating' => $operatingUnits,
                'standby' => $standbyUnits,
                'breakdown' => $breakdownUnits,
                'maintenance' => $maintenanceUnits,
            ],
            'driverStatusCounts' => [
                'total' => $totalDrivers,
                'fit' => $fitDrivers,
                'fit_with_note' => $fitNoteDrivers,
                'unfit' => $unfitDrivers,
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
                notify()->success('Berhasil!', 'Data operasional hauling berhasil diperbarui.');
                break;
            case 'error':
                notify()->error('Peringatan Error!', 'Kendala pada sinkronisasi telemetri unit.');
                break;
            case 'warning':
                notify()->warning('Peringatan HSE!', 'Masa berlaku SIMPER driver akan habis dalam 14 hari.');
                break;
            case 'info':
                notify()->info('Informasi Operasional', 'Shift 2 (Malam) telah dimulai sesuai jadwal.');
                break;
            case 'confirm':
                notify()->confirm(
                    'Konfirmasi Perubahan Status Unit',
                    'Apakah Anda yakin ingin mengubah status unit DT-101 menjadi Breakdown?',
                    [
                        'confirmButtonText' => 'Ya, Ubah Status',
                        'cancelButtonText' => 'Batalkan',
                    ]
                );
                break;
            default:
                notify()->info('Notifikasi', 'Pemberitahuan dari TAP Coal Hauling System.');
        }

        return redirect()->back();
    }
}
