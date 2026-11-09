<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\EmployeeDocument;
use App\Models\Site;
use App\Services\HrManagementService;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HrDocumentController extends Controller
{
    public function index(Request $request, HrManagementService $hrService)
    {
        $siteId = $request->input('site_id');
        $docType = $request->input('document_type');
        $accessLevel = $request->input('access_level');
        $search = $request->input('search');
        $currentUser = $request->user();

        $documents = EmployeeDocument::with([
            'employee:id,employee_code,name,site_id,department_id',
            'employee.department:id,code,name',
            'site:id,code,name',
            'uploader:id,name',
        ])
            ->when($siteId, fn ($q) => $q->where('site_id', $siteId))
            ->when($docType, fn ($q) => $q->where('document_type', $docType))
            ->when($accessLevel, fn ($q) => $q->where('access_level', $accessLevel))
            ->when($search, function ($q, $s) {
                $q->where(function ($sub) use ($s) {
                    $sub->where('document_code', 'like', "%{$s}%")
                        ->orWhere('document_title', 'like', "%{$s}%")
                        ->orWhere('document_number', 'like', "%{$s}%")
                        ->orWhereHas('employee', fn ($eq) => $eq->where('name', 'like', "%{$s}%")->orWhere('employee_code', 'like', "%{$s}%"));
                });
            })
            ->latest('id')
            ->get()
            ->map(function (EmployeeDocument $doc) use ($hrService, $currentUser) {
                $canAccess = $hrService->canAccessDocument($currentUser, $doc);
                $doc->setAttribute('can_access', $canAccess);

                if (!$canAccess) {
                    $doc->document_number = $doc->document_number ? 'CONFIDENTIAL-MASKED' : null;
                    $doc->file_path = null;
                    $doc->notes = 'Dokumen rahasia/sensitif — hanya dapat diakses oleh HRD Berwenang atau Karyawan Ybs.';
                }

                return $doc;
            });

        return Inertia::render('Hr/Documents/Index', [
            'documents' => $documents,
            'employees' => Employee::where('is_active', true)
                ->when($siteId, fn ($q) => $q->where('site_id', $siteId))
                ->orderBy('name')
                ->get(['id', 'employee_code', 'name', 'site_id']),
            'sites' => Site::where('is_active', true)->get(['id', 'code', 'name']),
            'filters' => [
                'site_id' => $siteId,
                'document_type' => $docType,
                'access_level' => $accessLevel,
                'search' => $search,
            ],
        ]);
    }

    public function store(Request $request, HrManagementService $hrService)
    {
        $validated = $request->validate([
            'site_id' => 'required|exists:sites,id',
            'employee_id' => 'required|exists:employees,id',
            'document_type' => 'required|in:ktp,sim,simper,mcu,employment_contract,training_certificate,npwp_bpjs,supporting_document',
            'document_title' => 'required|string|max:180',
            'document_number' => 'nullable|string|max:100',
            'issue_date' => 'nullable|date',
            'expiry_date' => 'nullable|date',
            'access_level' => 'nullable|in:public_operational,restricted_hr,confidential_personal',
            'is_sensitive' => 'nullable|boolean',
            'file_path' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:500',
        ]);

        $doc = $hrService->storeEmployeeDocument($validated);

        return back()->with('notify', [
            'type' => 'success',
            'title' => 'Dokumen Karyawan Disimpan',
            'message' => "Dokumen {$doc->document_title} ({$doc->document_code}) tersimpan dengan level akses {$doc->access_level}.",
        ]);
    }

    public function access(Request $request, EmployeeDocument $employeeDocument, HrManagementService $hrService)
    {
        try {
            $doc = $hrService->getDocumentWithAccessCheck($request->user(), $employeeDocument);
        } catch (AuthorizationException $e) {
            abort(403, $e->getMessage());
        }

        return response()->json([
            'status' => 'authorized',
            'document_code' => $doc->document_code,
            'document_title' => $doc->document_title,
            'document_type' => $doc->document_type,
            'document_number' => $doc->document_number,
            'access_level' => $doc->access_level,
            'file_path' => $doc->file_path,
            'employee' => $doc->employee?->only(['id', 'employee_code', 'name']),
        ]);
    }
}
