<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Material;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MaterialController extends Controller
{
    public function index(Request $request): Response
    {
        $materials = Material::latest()->paginate(10);

        return Inertia::render('Materials/Index', [
            'materials' => $materials,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:materials,code',
            'name' => 'required|string|max:255',
            'unit_of_measure' => 'required|string|max:20',
            'density' => 'required|numeric|min:0.001',
            'is_active' => 'boolean',
        ]);

        $validated['created_by'] = auth()->id();
        $material = Material::create($validated);
        ActivityLog::log('create', 'material', "Menambahkan jenis material: {$material->name}");

        notify()->success('Material Ditambahkan!', "Jenis material {$material->name} berhasil disimpan.");
        return redirect()->back();
    }

    public function update(Request $request, Material $material)
    {
        $validated = $request->validate([
            'code' => "required|string|max:50|unique:materials,code,{$material->id}",
            'name' => 'required|string|max:255',
            'unit_of_measure' => 'required|string|max:20',
            'density' => 'required|numeric|min:0.001',
            'is_active' => 'boolean',
        ]);

        $validated['updated_by'] = auth()->id();
        $material->update($validated);
        ActivityLog::log('update', 'material', "Memperbarui jenis material: {$material->name}");

        notify()->success('Material Diperbarui!', "Data material {$material->name} berhasil diperbarui.");
        return redirect()->back();
    }

    public function destroy(Material $material)
    {
        $name = $material->name;
        $material->delete();
        ActivityLog::log('delete', 'material', "Menghapus material: {$name}");

        notify()->success('Material Dihapus!', "Material {$name} berhasil dihapus.");
        return redirect()->back();
    }
}
