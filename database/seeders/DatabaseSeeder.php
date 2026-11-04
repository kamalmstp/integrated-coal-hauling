<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Default Super Administrator
        User::create([
            'name' => 'Ahmad Fauzi (Administrator)',
            'email' => 'admin@example.com',
            'role' => 'admin',
            'status' => 'active',
            'phone' => '+62 812-3456-7890',
            'avatar' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            'email_verified_at' => now(),
            'password' => Hash::make('password123'),
        ]);

        User::create([
            'name' => 'Siti Rahma (Manager)',
            'email' => 'manager@example.com',
            'role' => 'manager',
            'status' => 'active',
            'phone' => '+62 813-9876-5432',
            'avatar' => 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
            'email_verified_at' => now(),
            'password' => Hash::make('password123'),
        ]);

        User::create([
            'name' => 'Budi Santoso (Editor)',
            'email' => 'editor@example.com',
            'role' => 'editor',
            'status' => 'inactive',
            'phone' => '+62 856-1122-3344',
            'avatar' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
            'email_verified_at' => now(),
            'password' => Hash::make('password123'),
        ]);

        User::create([
            'name' => 'Dewi Lestari (Customer)',
            'email' => 'dewi@example.com',
            'role' => 'user',
            'status' => 'suspended',
            'phone' => '+62 878-5566-7788',
            'avatar' => 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
            'email_verified_at' => now(),
            'password' => Hash::make('password123'),
        ]);

        // 45 additional realistic sample users for server pagination and search
        User::factory(45)->create();
    }
}
