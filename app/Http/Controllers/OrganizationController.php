<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Company;
use App\Models\Department;
use App\Models\Position;
use App\Models\Site;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrganizationController extends Controller
{
    /**
     * Display Organization Master overview & tabs
     */
    public function index(Request $request): Response
    {
        $tab = $request->input('tab', 'sites');
        $search = $request->input('search');

        $companies = Company::withCount(['sites', 'departments', 'employees'])->latest()->get();

        $sitesQuery = Site::with('company')->withCount(['units', 'locations', 'employees']);
        if ($search && $tab === 'sites') {
            $sitesQuery->where('name', 'like', "%{$search}%")->orWhere('code', 'like', "%{$search}%");
        }
        $sites = $sitesQuery->paginate(10)->withQueryString();

        $departmentsQuery = Department::with('company')->withCount(['positions', 'employees']);
        if ($search && $tab === 'departments') {
            $departmentsQuery->where('name', 'like', "%{$search}%")->orWhere('code', 'like', "%{$search}%");
        }
        $departments = $departmentsQuery->paginate(10)->withQueryString();

        $positionsQuery = Position::with(['department', 'parent'])->withCount('employees');
        if ($search && $tab === 'positions') {
            $positionsQuery->where('title', 'like', "%{$search}%")->orWhere('code', 'like', "%{$search}%");
        }
        $positions = $positionsQuery->paginate(10)->withQueryString();

        return Inertia::render('Organization/Index', [
            'tab' => $tab,
            'companies' => $companies,
            'sites' => $sites,
            'departments' => $departments,
            'positions' => $positions,
            'filters' => ['search' => $search ?? ''],
        ]);
    }

    /**
     * Store Site
     */
    public function storeSite(Request $request)
    {
        $validated = $request->validate([
            'company_id' => 'required|exists:companies,id',
            'code' => 'required|string|max:50|unique:sites,code',
            'name' => 'required|string|max:255',
            'location' => 'nullable|string|max:255',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'is_active' => 'boolean',
        ]);

        $site = Site::create($validated);
        ActivityLog::log('create', 'site', "Membuat site baru: {$site->name} ({$site->code})");

        notify()->success('Site Berhasil Dibuat!', "Site {$site->name} telah ditambahkan.");
        return redirect()->back();
    }

    /**
     * Update Site
     */
    public function updateSite(Request $request, Site $site)
    {
        $validated = $request->validate([
            'company_id' => 'required|exists:companies,id',
            'code' => "required|string|max:50|unique:sites,code,{$site->id}",
            'name' => 'required|string|max:255',
            'location' => 'nullable|string|max:255',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'is_active' => 'boolean',
        ]);

        $site->update($validated);
        ActivityLog::log('update', 'site', "Memperbarui site: {$site->name} ({$site->code})");

        notify()->success('Site Diperbarui!', "Data site {$site->name} berhasil diperbarui.");
        return redirect()->back();
    }

    /**
     * Delete Site
     */
    public function destroySite(Site $site)
    {
        if ($site->units()->exists() || $site->employees()->exists()) {
            notify()->error('Gagal Menghapus!', 'Site masih memiliki unit atau karyawan terkait.');
            return redirect()->back();
        }

        $name = $site->name;
        $site->delete();
        ActivityLog::log('delete', 'site', "Menghapus site: {$name}");

        notify()->success('Site Dihapus!', "Site {$name} berhasil dihapus.");
        return redirect()->back();
    }

    /**
     * Store Department
     */
    public function storeDepartment(Request $request)
    {
        $validated = $request->validate([
            'company_id' => 'nullable|exists:companies,id',
            'code' => 'required|string|max:50|unique:departments,code',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $dept = Department::create($validated);
        ActivityLog::log('create', 'department', "Membuat departemen baru: {$dept->name}");

        notify()->success('Departemen Dibuat!', "Departemen {$dept->name} berhasil ditambahkan.");
        return redirect()->back();
    }

    /**
     * Update Department
     */
    public function updateDepartment(Request $request, Department $department)
    {
        $validated = $request->validate([
            'company_id' => 'nullable|exists:companies,id',
            'code' => "required|string|max:50|unique:departments,code,{$department->id}",
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $department->update($validated);
        ActivityLog::log('update', 'department', "Memperbarui departemen: {$department->name}");

        notify()->success('Departemen Diperbarui!', "Departemen {$department->name} berhasil diperbarui.");
        return redirect()->back();
    }

    /**
     * Delete Department
     */
    public function destroyDepartment(Department $department)
    {
        if ($department->positions()->exists() || $department->employees()->exists()) {
            notify()->error('Gagal Menghapus!', 'Departemen masih memiliki jabatan atau karyawan terkait.');
            return redirect()->back();
        }

        $name = $department->name;
        $department->delete();
        ActivityLog::log('delete', 'department', "Menghapus departemen: {$name}");

        notify()->success('Departemen Dihapus!', "Departemen {$name} berhasil dihapus.");
        return redirect()->back();
    }

    /**
     * Store Position
     */
    public function storePosition(Request $request)
    {
        $validated = $request->validate([
            'department_id' => 'required|exists:departments,id',
            'parent_id' => 'nullable|exists:positions,id',
            'code' => 'required|string|max:50|unique:positions,code',
            'title' => 'required|string|max:255',
            'level' => 'required|integer|min:1|max:10',
            'is_active' => 'boolean',
        ]);

        $pos = Position::create($validated);
        ActivityLog::log('create', 'position', "Membuat jabatan baru: {$pos->title}");

        notify()->success('Jabatan Dibuat!', "Jabatan {$pos->title} berhasil ditambahkan.");
        return redirect()->back();
    }

    /**
     * Update Position
     */
    public function updatePosition(Request $request, Position $position)
    {
        $validated = $request->validate([
            'department_id' => 'required|exists:departments,id',
            'parent_id' => 'nullable|exists:positions,id',
            'code' => "required|string|max:50|unique:positions,code,{$position->id}",
            'title' => 'required|string|max:255',
            'level' => 'required|integer|min:1|max:10',
            'is_active' => 'boolean',
        ]);

        $position->update($validated);
        ActivityLog::log('update', 'position', "Memperbarui jabatan: {$position->title}");

        notify()->success('Jabatan Diperbarui!', "Jabatan {$position->title} berhasil diperbarui.");
        return redirect()->back();
    }

    /**
     * Delete Position
     */
    public function destroyPosition(Position $position)
    {
        if ($position->employees()->exists() || $position->subordinates()->exists()) {
            notify()->error('Gagal Menghapus!', 'Jabatan masih memiliki bawahan atau karyawan terkait.');
            return redirect()->back();
        }

        $title = $position->title;
        $position->delete();
        ActivityLog::log('delete', 'position', "Menghapus jabatan: {$title}");

        notify()->success('Jabatan Dihapus!', "Jabatan {$title} berhasil dihapus.");
        return redirect()->back();
    }
}
