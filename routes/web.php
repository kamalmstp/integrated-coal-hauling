<?php

use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DailyDispatchController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DriverController;
use App\Http\Controllers\DumpingTicketController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\HaulingActivityController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\MaterialController;
use App\Http\Controllers\OrganizationController;
use App\Http\Controllers\ProductionDashboardController;
use App\Http\Controllers\ProductionRecapController;
use App\Http\Controllers\ProductionTargetController;
use App\Http\Controllers\RolePermissionController;
use App\Http\Controllers\ShiftController;
use App\Http\Controllers\SystemSettingController;
use App\Http\Controllers\TicketImportController;
use App\Http\Controllers\TicketReconciliationController;
use App\Http\Controllers\UnitController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\VendorController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Root redirect to Dashboard
Route::get('/', function () {
    return redirect()->route('dashboard');
});

// 1. Dashboard
Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
Route::post('/dashboard/notify-test', [DashboardController::class, 'triggerNotify'])->name('notify.test');

// 2. Organization Management
Route::prefix('organization')->name('organization.')->group(function () {
    Route::get('/', [OrganizationController::class, 'index'])->name('index');

    // Sites
    Route::post('/sites', [OrganizationController::class, 'storeSite'])->name('sites.store');
    Route::put('/sites/{site}', [OrganizationController::class, 'updateSite'])->name('sites.update');
    Route::delete('/sites/{site}', [OrganizationController::class, 'destroySite'])->name('sites.destroy');

    // Departments
    Route::post('/departments', [OrganizationController::class, 'storeDepartment'])->name('departments.store');
    Route::put('/departments/{department}', [OrganizationController::class, 'updateDepartment'])->name('departments.update');
    Route::delete('/departments/{department}', [OrganizationController::class, 'destroyDepartment'])->name('departments.destroy');

    // Positions
    Route::post('/positions', [OrganizationController::class, 'storePosition'])->name('positions.store');
    Route::put('/positions/{position}', [OrganizationController::class, 'updatePosition'])->name('positions.update');
    Route::delete('/positions/{position}', [OrganizationController::class, 'destroyPosition'])->name('positions.destroy');
});

// 3. Master Data
Route::prefix('master')->name('master.')->group(function () {
    // Employees
    Route::get('/employees', [EmployeeController::class, 'index'])->name('employees.index');
    Route::post('/employees', [EmployeeController::class, 'store'])->name('employees.store');
    Route::put('/employees/{employee}', [EmployeeController::class, 'update'])->name('employees.update');
    Route::delete('/employees/{employee}', [EmployeeController::class, 'destroy'])->name('employees.destroy');

    // Drivers
    Route::get('/drivers', [DriverController::class, 'index'])->name('drivers.index');
    Route::post('/drivers', [DriverController::class, 'store'])->name('drivers.store');
    Route::put('/drivers/{driver}', [DriverController::class, 'update'])->name('drivers.update');
    Route::delete('/drivers/{driver}', [DriverController::class, 'destroy'])->name('drivers.destroy');

    // Units
    Route::get('/units', [UnitController::class, 'index'])->name('units.index');
    Route::post('/units', [UnitController::class, 'store'])->name('units.store');
    Route::put('/units/{unit}', [UnitController::class, 'update'])->name('units.update');
    Route::delete('/units/{unit}', [UnitController::class, 'destroy'])->name('units.destroy');

    // Locations
    Route::get('/locations', [LocationController::class, 'index'])->name('locations.index');
    Route::post('/locations', [LocationController::class, 'store'])->name('locations.store');
    Route::put('/locations/{location}', [LocationController::class, 'update'])->name('locations.update');
    Route::delete('/locations/{location}', [LocationController::class, 'destroy'])->name('locations.destroy');

    // Shifts
    Route::get('/shifts', [ShiftController::class, 'index'])->name('shifts.index');
    Route::post('/shifts', [ShiftController::class, 'store'])->name('shifts.store');
    Route::put('/shifts/{shift}', [ShiftController::class, 'update'])->name('shifts.update');
    Route::delete('/shifts/{shift}', [ShiftController::class, 'destroy'])->name('shifts.destroy');

    // Vendors
    Route::get('/vendors', [VendorController::class, 'index'])->name('vendors.index');
    Route::post('/vendors', [VendorController::class, 'store'])->name('vendors.store');
    Route::put('/vendors/{vendor}', [VendorController::class, 'update'])->name('vendors.update');
    Route::delete('/vendors/{vendor}', [VendorController::class, 'destroy'])->name('vendors.destroy');

    // Customers
    Route::get('/customers', [CustomerController::class, 'index'])->name('customers.index');
    Route::post('/customers', [CustomerController::class, 'store'])->name('customers.store');
    Route::put('/customers/{customer}', [CustomerController::class, 'update'])->name('customers.update');
    Route::delete('/customers/{customer}', [CustomerController::class, 'destroy'])->name('customers.destroy');

    // Materials
    Route::get('/materials', [MaterialController::class, 'index'])->name('materials.index');
    Route::post('/materials', [MaterialController::class, 'store'])->name('materials.store');
    Route::put('/materials/{material}', [MaterialController::class, 'update'])->name('materials.update');
    Route::delete('/materials/{material}', [MaterialController::class, 'destroy'])->name('materials.destroy');
});

// 4. User Management
Route::get('/users', [UserController::class, 'index'])->name('users.index');
Route::post('/users', [UserController::class, 'store'])->name('users.store');
Route::put('/users/{user}', [UserController::class, 'update'])->name('users.update');
Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');

// 5. Role & Permission Management & Activity Logs
Route::prefix('security')->name('security.')->group(function () {
    Route::get('/roles', [RolePermissionController::class, 'index'])->name('roles.index');
    Route::post('/roles', [RolePermissionController::class, 'storeRole'])->name('roles.store');
    Route::put('/roles/{role}', [RolePermissionController::class, 'updateRolePermissions'])->name('roles.update');
    Route::delete('/roles/{role}', [RolePermissionController::class, 'destroyRole'])->name('roles.destroy');

    Route::get('/activity-logs', [RolePermissionController::class, 'activityLogs'])->name('activity-logs.index');
});

// 6. System Settings & Configuration
Route::get('/settings', function () {
    return Inertia::render('Settings/Index');
})->name('settings');

Route::get('/settings/configuration', [SystemSettingController::class, 'index'])->name('settings.configuration');
Route::post('/settings/configuration', [SystemSettingController::class, 'update'])->name('settings.configuration.update');

// 7. Analytics & Architecture
Route::get('/analytics', function () {
    return Inertia::render('Analytics/Index');
})->name('analytics');

// 8. Phase 2: Coal Hauling Production Management
Route::prefix('production')->name('production.')->group(function () {
    // Production Dashboard
    Route::get('/dashboard', [ProductionDashboardController::class, 'index'])->name('dashboard');

    // Daily Dispatch
    Route::get('/dispatch', [DailyDispatchController::class, 'index'])->name('dispatch.index');
    Route::post('/dispatch', [DailyDispatchController::class, 'store'])->name('dispatch.store');
    Route::post('/dispatch/{dispatch}/assignments', [DailyDispatchController::class, 'addAssignment'])->name('dispatch.assignments.store');
    Route::put('/assignments/{assignment}/status', [DailyDispatchController::class, 'updateAssignmentStatus'])->name('dispatch.assignments.status');
    Route::put('/assignments/{assignment}/swap', [DailyDispatchController::class, 'swapUnitOrDriver'])->name('dispatch.assignments.swap');

    // Loading & Hauling Activity Log
    Route::get('/hauling', [HaulingActivityController::class, 'index'])->name('hauling.index');
    Route::post('/hauling', [HaulingActivityController::class, 'store'])->name('hauling.store');
    Route::put('/hauling/{activity}/status', [HaulingActivityController::class, 'updateStatus'])->name('hauling.status');

    // Dumping Ticket Management & Workflow
    Route::get('/tickets', [DumpingTicketController::class, 'index'])->name('tickets.index');
    Route::post('/tickets', [DumpingTicketController::class, 'store'])->name('tickets.store');
    Route::get('/tickets/verification-queue', [DumpingTicketController::class, 'verificationQueue'])->name('tickets.verification-queue');
    Route::get('/tickets/{ticket}', [DumpingTicketController::class, 'show'])->name('tickets.show');
    Route::post('/tickets/{ticket}/verify', [DumpingTicketController::class, 'verify'])->name('tickets.verify');
    Route::post('/tickets/batch-verify', [DumpingTicketController::class, 'batchVerify'])->name('tickets.batch-verify');
    Route::post('/tickets/{ticket}/reject', [DumpingTicketController::class, 'reject'])->name('tickets.reject');
    Route::post('/tickets/{ticket}/correct', [DumpingTicketController::class, 'correct'])->name('tickets.correct');

    // Bulk Import (Excel/CSV)
    Route::get('/import', [TicketImportController::class, 'index'])->name('import.index');
    Route::post('/import/preview', [TicketImportController::class, 'preview'])->name('import.preview');
    Route::post('/import/execute', [TicketImportController::class, 'execute'])->name('import.execute');
    Route::get('/import/template', [TicketImportController::class, 'downloadTemplate'])->name('import.template');

    // Production Recap
    Route::get('/recap', [ProductionRecapController::class, 'index'])->name('recap.index');

    // Production Targets
    Route::get('/targets', [ProductionTargetController::class, 'index'])->name('targets.index');
    Route::post('/targets', [ProductionTargetController::class, 'store'])->name('targets.store');

    // JSI Reconciliation
    Route::get('/reconciliation', [TicketReconciliationController::class, 'index'])->name('reconciliation.index');
    Route::post('/reconciliation', [TicketReconciliationController::class, 'store'])->name('reconciliation.store');
    Route::get('/reconciliation/{reconciliation}', [TicketReconciliationController::class, 'show'])->name('reconciliation.show');
    Route::put('/reconciliation/items/{item}', [TicketReconciliationController::class, 'resolveItem'])->name('reconciliation.items.resolve');
    Route::post('/reconciliation/{reconciliation}/settle', [TicketReconciliationController::class, 'settle'])->name('reconciliation.settle');
});
