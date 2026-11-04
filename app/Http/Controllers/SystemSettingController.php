<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Site;
use App\Models\SystemSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SystemSettingController extends Controller
{
    public function index(): Response
    {
        $settings = SystemSetting::all()->groupBy('group');
        $sites = Site::where('is_active', true)->get();

        return Inertia::render('Settings/Configuration', [
            'settingsGrouped' => $settings,
            'sites' => $sites,
        ]);
    }

    public function update(Request $request)
    {
        $data = $request->input('settings', []);

        foreach ($data as $key => $value) {
            SystemSetting::where('key', $key)->update([
                'value' => is_array($value) ? json_encode($value) : $value,
                'updated_by' => auth()->id(),
            ]);
        }

        ActivityLog::log('config', 'system_setting', 'Memperbarui parameter konfigurasi sistem operasional.');

        notify()->success('Konfigurasi Disimpan!', 'Pengaturan operasional dan penomoran otomatis berhasil disimpan.');
        return redirect()->back();
    }
}
