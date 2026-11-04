<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Root redirect to Dashboard
Route::get('/', function () {
    return redirect()->route('dashboard');
});

// Dashboard panel
Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
Route::post('/dashboard/notify-test', [DashboardController::class, 'triggerNotify'])->name('notify.test');

// User Management with Server-Side Processing (Search, Filter, Pagination, CRUD)
Route::get('/users', [UserController::class, 'index'])->name('users.index');
Route::post('/users', [UserController::class, 'store'])->name('users.store');
Route::put('/users/{user}', [UserController::class, 'update'])->name('users.update');
Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');

// Settings Page
Route::get('/settings', function () {
    return Inertia::render('Settings/Index');
})->name('settings');

// Analytics Page
Route::get('/analytics', function () {
    return Inertia::render('Analytics/Index');
})->name('analytics');
