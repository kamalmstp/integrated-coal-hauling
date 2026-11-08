<?php

use App\Http\Controllers\BreakdownManagementController;
use App\Http\Controllers\CorrectiveMaintenanceController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DailyDispatchController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DigitalP2hController;
use App\Http\Controllers\DriverController;
use App\Http\Controllers\DumpingTicketController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\FleetKpiController;
use App\Http\Controllers\FleetRegistryController;
use App\Http\Controllers\HaulingActivityController;
use App\Http\Controllers\HmKmMonitoringController;
use App\Http\Controllers\InventoryItemController;
use App\Http\Controllers\InventoryReportController;
use App\Http\Controllers\InventoryTransactionController;
use App\Http\Controllers\JobCardController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\MaintenanceCostController;
use App\Http\Controllers\MaintenanceDashboardController;
use App\Http\Controllers\MaintenanceRequestController;
use App\Http\Controllers\MechanicManagementController;
use App\Http\Controllers\PreventiveMaintenanceController;
use App\Http\Controllers\RfuManagementController;
use App\Http\Controllers\SparepartRequestController;
use App\Http\Controllers\StockCardController;
use App\Http\Controllers\StockOpnameController;
use App\Http\Controllers\WarehouseDashboardController;
use App\Http\Controllers\WarehouseManagementController;
use App\Http\Controllers\WarehouseSparepartFulfillmentController;
use App\Http\Controllers\WorkOrderManagementController;

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
use App\Http\Controllers\WorkOrderController;
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

// 9. Phase 3: Fleet & Unit Management
Route::prefix('fleet')->name('fleet.')->group(function () {
    // A. Unit Registry & Real-Time Status Monitoring
    Route::get('/registry', [FleetRegistryController::class, 'index'])->name('registry.index');
    Route::post('/registry', [FleetRegistryController::class, 'store'])->name('registry.store');
    Route::put('/registry/{unit}', [FleetRegistryController::class, 'update'])->name('registry.update');
    Route::put('/registry/{unit}/status', [FleetRegistryController::class, 'updateStatus'])->name('registry.status');
    Route::get('/registry/{unit}', [FleetRegistryController::class, 'show'])->name('registry.show');

    // B. Digital P2H (Pemeriksaan Pra-Operasi Harian)
    Route::get('/p2h', [DigitalP2hController::class, 'index'])->name('p2h.index');
    Route::post('/p2h', [DigitalP2hController::class, 'store'])->name('p2h.store');
    Route::get('/p2h/{p2h}', [DigitalP2hController::class, 'show'])->name('p2h.show');

    // C. HM & KM Monitoring & Maintenance Service Intervals
    Route::get('/hm-km', [HmKmMonitoringController::class, 'index'])->name('hm-km.index');
    Route::post('/hm-km', [HmKmMonitoringController::class, 'store'])->name('hm-km.store');

    // D. Work Orders & Maintenance
    Route::get('/work-orders', [WorkOrderController::class, 'index'])->name('work-orders.index');
    Route::post('/work-orders', [WorkOrderController::class, 'store'])->name('work-orders.store');
    Route::put('/work-orders/{workOrder}/status', [WorkOrderController::class, 'updateStatus'])->name('work-orders.status');

    // E. Fleet KPI Dashboard
    Route::get('/kpi', [FleetKpiController::class, 'index'])->name('kpi.index');
});

// 10. Phase 4: Maintenance & Workshop Management
Route::prefix('maintenance')->name('maintenance.')->group(function () {
    // 1. Maintenance Dashboard
    Route::get('/', [MaintenanceDashboardController::class, 'index'])->name('index');
    Route::get('/dashboard', [MaintenanceDashboardController::class, 'index'])->name('dashboard');

    // 2. Breakdown Management
    Route::get('/breakdown', [BreakdownManagementController::class, 'index']);
    Route::post('/breakdown', [BreakdownManagementController::class, 'store']);
    Route::get('/breakdowns', [BreakdownManagementController::class, 'index'])->name('breakdowns.index');
    Route::post('/breakdowns', [BreakdownManagementController::class, 'store'])->name('breakdowns.store');
    Route::put('/breakdowns/{report}/review', [BreakdownManagementController::class, 'review'])->name('breakdowns.review');
    Route::post('/breakdowns/{report}/convert-request', [BreakdownManagementController::class, 'convertToRequest'])->name('breakdowns.convert-request');
    Route::post('/breakdowns/{report}/convert-wo', [BreakdownManagementController::class, 'convertToWorkOrder'])->name('breakdowns.convert-wo');

    // 3. Maintenance Requests
    Route::get('/requests', [MaintenanceRequestController::class, 'index'])->name('requests.index');
    Route::post('/requests', [MaintenanceRequestController::class, 'store'])->name('requests.store');
    Route::put('/requests/{mRequest}/approve', [MaintenanceRequestController::class, 'approve'])->name('requests.approve');
    Route::put('/requests/{mRequest}/reject', [MaintenanceRequestController::class, 'reject'])->name('requests.reject');
    Route::post('/requests/{mRequest}/convert-wo', [MaintenanceRequestController::class, 'convertToWorkOrder'])->name('requests.convert-wo');

    // 4. Work Order Management
    Route::get('/work-orders', [WorkOrderManagementController::class, 'index'])->name('work-orders.index');
    Route::post('/work-orders', [WorkOrderManagementController::class, 'store'])->name('work-orders.store');
    Route::get('/work-orders/{workOrder}', [WorkOrderManagementController::class, 'show'])->name('work-orders.show');
    Route::match(['put', 'post'], '/work-orders/{workOrder}/status', [WorkOrderManagementController::class, 'updateStatus'])->name('work-orders.status');
    Route::post('/work-orders/{workOrder}/assign-mechanic', [WorkOrderManagementController::class, 'assignMechanic'])->name('work-orders.assign-mechanic');
    Route::post('/work-orders/{workOrder}/tasks', [WorkOrderManagementController::class, 'addTask'])->name('work-orders.tasks.store');
    Route::match(['put', 'post'], '/work-order-tasks/{task}/toggle', [WorkOrderManagementController::class, 'toggleTask'])->name('work-orders.tasks.toggle');
    Route::match(['put', 'post'], '/work-orders/tasks/{task}/toggle', [WorkOrderManagementController::class, 'toggleTask']);

    // 5. Preventive Maintenance (PM)
    Route::get('/preventive', [PreventiveMaintenanceController::class, 'index'])->name('preventive.index');
    Route::post('/preventive/schedules', [PreventiveMaintenanceController::class, 'storeSchedule'])->name('preventive.schedules.store');
    Route::post('/preventive/schedules/{schedule}/generate-wo', [PreventiveMaintenanceController::class, 'generateWorkOrder'])->name('preventive.generate-wo');

    // 6. Corrective Maintenance (CM)
    Route::get('/corrective', [CorrectiveMaintenanceController::class, 'index'])->name('corrective.index');

    // 7. Mechanic Management & Mobile HP Portal
    Route::get('/mechanics', [MechanicManagementController::class, 'index'])->name('mechanics.index');
    Route::get('/mechanic-portal', [MechanicManagementController::class, 'portal'])->name('mechanics.portal');
    Route::post('/mechanic-portal/work-log', [MechanicManagementController::class, 'storeWorkLog'])->name('mechanics.work-log');

    // 8. Job Card Management & Print
    Route::get('/job-cards', [JobCardController::class, 'index'])->name('job-cards.index');
    Route::get('/job-cards/{jobCard}', [JobCardController::class, 'show'])->name('job-cards.show');
    Route::match(['put', 'post'], '/job-cards/checklists/{checklist}', [JobCardController::class, 'updateChecklist'])->name('job-cards.checklist.update');
    Route::match(['put', 'post'], '/job-cards/{jobCard}/sign-off', [JobCardController::class, 'supervisorSignOff'])->name('job-cards.sign-off');
    Route::get('/job-cards/{jobCard}/print', [JobCardController::class, 'print'])->name('job-cards.print');

    // 9. Sparepart Requests (Warehouse Integration)
    Route::get('/spareparts', [SparepartRequestController::class, 'index'])->name('spareparts.index');
    Route::post('/spareparts', [SparepartRequestController::class, 'store'])->name('spareparts.store');
    Route::match(['put', 'post'], '/spareparts/{sparepartRequest}/approve', [SparepartRequestController::class, 'approve'])->name('spareparts.approve');
    Route::post('/spareparts/{sparepartRequest}/issue', [SparepartRequestController::class, 'issueParts'])->name('spareparts.issue');

    // 10. RFU Management (Inspection & Final Approval)
    Route::get('/rfu', [RfuManagementController::class, 'index'])->name('rfu.index');
    Route::post('/rfu/inspect', [RfuManagementController::class, 'submitInspection']);
    Route::post('/rfu/{workOrder}/inspect', [RfuManagementController::class, 'submitInspection'])->name('rfu.inspect');
    Route::post('/rfu/approve', [RfuManagementController::class, 'approveRfu']);
    Route::post('/rfu/{workOrder}/approve', [RfuManagementController::class, 'approveRfu'])->name('rfu.approve');

    // 11. Maintenance Cost Management
    Route::get('/costs', [MaintenanceCostController::class, 'index'])->name('costs.index');
    Route::post('/costs', [MaintenanceCostController::class, 'store'])->name('costs.store');
});

// 11. Phase 5: Warehouse & Sparepart Management
Route::prefix('warehouse')->name('warehouse.')->group(function () {
    // 1. Warehouse Dashboard & Reorder Alerts
    Route::get('/', [WarehouseDashboardController::class, 'index'])->name('index');
    Route::get('/dashboard', [WarehouseDashboardController::class, 'index'])->name('dashboard');

    // 2. Item Master & Categories
    Route::get('/items', [InventoryItemController::class, 'index'])->name('items.index');
    Route::post('/items', [InventoryItemController::class, 'store'])->name('items.store');
    Route::put('/items/{inventoryItem}', [InventoryItemController::class, 'update'])->name('items.update');

    // 3. Multi-Warehouse, Rack/Bin Locations & Inter-Warehouse Transfers
    Route::get('/warehouses', [WarehouseManagementController::class, 'index'])->name('warehouses.index');
    Route::post('/warehouses', [WarehouseManagementController::class, 'storeWarehouse'])->name('warehouses.store');
    Route::put('/warehouses/{warehouse}', [WarehouseManagementController::class, 'updateWarehouse'])->name('warehouses.update');
    Route::post('/locations', [WarehouseManagementController::class, 'storeLocation'])->name('locations.store');
    Route::post('/transfers', [WarehouseManagementController::class, 'storeTransfer'])->name('transfers.store');
    Route::post('/transfers/{stockTransfer}/dispatch', [WarehouseManagementController::class, 'dispatchTransfer'])->name('transfers.dispatch');
    Route::post('/transfers/{stockTransfer}/receive', [WarehouseManagementController::class, 'receiveTransfer'])->name('transfers.receive');

    // 4. Inventory Transactions (Stock In & Stock Out)
    Route::get('/transactions', [InventoryTransactionController::class, 'index'])->name('transactions.index');
    Route::post('/transactions/stock-in', [InventoryTransactionController::class, 'storeStockIn'])->name('transactions.stock-in');
    Route::post('/transactions/stock-out', [InventoryTransactionController::class, 'storeStockOut'])->name('transactions.stock-out');

    // 5. Stock Card (Immutable Ledger & Moving Weighted Average Progression)
    Route::get('/stock-card', [StockCardController::class, 'index'])->name('stock-card.index');

    // 6. Sparepart Request Fulfillment (Picking, Full/Partial Issue, Backorder, Return)
    Route::get('/fulfillment', [WarehouseSparepartFulfillmentController::class, 'index'])->name('fulfillment.index');
    Route::post('/fulfillment/{sparepartRequest}/pick', [WarehouseSparepartFulfillmentController::class, 'pick'])->name('fulfillment.pick');
    Route::post('/fulfillment/{sparepartRequest}/issue', [WarehouseSparepartFulfillmentController::class, 'issue'])->name('fulfillment.issue');
    Route::post('/fulfillment/{sparepartRequest}/reject', [WarehouseSparepartFulfillmentController::class, 'reject'])->name('fulfillment.reject');
    Route::post('/fulfillment/{sparepartRequest}/return', [WarehouseSparepartFulfillmentController::class, 'returnItem'])->name('fulfillment.return');

    // 7. Stock Opname, Investigation & Adjustment Approval
    Route::get('/opname', [StockOpnameController::class, 'index'])->name('opname.index');
    Route::post('/opname', [StockOpnameController::class, 'storeOpname'])->name('opname.store');
    Route::post('/opname/{stockOpname}/counts', [StockOpnameController::class, 'submitCounts'])->name('opname.counts');
    Route::post('/adjustments', [StockOpnameController::class, 'storeAdjustment'])->name('adjustments.store');
    Route::post('/adjustments/{stockAdjustment}/approve', [StockOpnameController::class, 'approveAdjustment'])->name('adjustments.approve');

    // 8. Inventory Reports (9 Reports) & Procurement PR Proposals
    Route::get('/reports', [InventoryReportController::class, 'index'])->name('reports.index');
    Route::post('/purchase-requests', [InventoryReportController::class, 'storePurchaseRequestProposal'])->name('purchase-requests.store');
});



