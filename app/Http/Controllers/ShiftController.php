<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Shift;
use App\Models\Site;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ShiftController extends Controller
{
    public function index(Request $request): Response
    {
        $shifts = Shift::with('site')->latest()->paginate(10);

        return Inertia::render('Shifts/Index', [
            'shifts' => $shifts,
            'sites' => Site::where('is_active', true)->select('id', 'name', 'code')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'site_id' => 'nullable|exists:sites,id',
            'code' => 'required|string|max:50|unique:shifts,code',
            'name' => 'required|string|max:255',
            'start_time' => 'required',
            'end_time' => 'required',
            'is_night_shift' => 'boolean',
            'is_active' => 'boolean',
        ]);

        $validated['created_by'] = auth()->id();
        $shift = Shift::create($validated);
        ActivityLog::log('create', 'shift', "Membuat shift baru: {$shift->name}");

        notify()->success('Shift Ditambahkan!', "Shift {$shift->name} berhasil ditambahkan.");
        return redirect()->back();
    }

    public function update(Request $request, Shift $shift)
    {
        $validated = $request->validate([
            'site_id' => 'nullable|exists:sites,id',
            'code' => "required|string|max:50|unique:shifts,code,{$shift->id}",
            'name' => 'required|string|max:255',
            'start_time' => 'required',
            'end_time' => 'required',
            'is_night_shift' => 'boolean',
            'is_active' => 'boolean',
        ]);

        $validated['updated_by'] = auth()->id();
        $shift->update($validated);
        ActivityLog::log('update', 'shift', "Memperbarui shift: {$shift->name}");

        notify()->success('Shift Diperbarui!', "Shift {$shift->name} berhasil diperbarui.");
        return redirect()->back();
    }

    public function destroy(Shift $shift)
    {
        $name = $shift->name;
        $shift->delete();
        ActivityLog::log('delete', 'shift', "Menghapus shift: {$name}");

        notify()->success('Shift Dihapus!', "Shift {$name} berhasil dihapus.");
        return redirect()->back();
    }
}
