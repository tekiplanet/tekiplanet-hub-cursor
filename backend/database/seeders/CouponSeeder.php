<?php

namespace Database\Seeders;

use App\Models\Coupon;
use App\Models\ProductCategory;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class CouponSeeder extends Seeder
{
    public function run(): void
    {
        $categories = ProductCategory::all();
        
        // Create order-based coupons
        Coupon::create([
            'code' => 'WELCOME2024',
            'type' => 'order',
            'value_type' => 'percentage',
            'value' => 10.00,
            'min_order_amount' => 50000.00,
            'max_discount' => 10000.00,
            'usage_limit_per_user' => 1,
            'usage_limit_total' => 100,
            'starts_at' => Carbon::now(),
            'expires_at' => Carbon::now()->addMonths(3),
            'is_active' => true
        ]);

        Coupon::create([
            'code' => 'FLASH50',
            'type' => 'order',
            'value_type' => 'fixed',
            'value' => 5000.00,
            'min_order_amount' => 20000.00,
            'max_discount' => 5000.00,
            'usage_limit_per_user' => 1,
            'usage_limit_total' => 50,
            'starts_at' => Carbon::now(),
            'expires_at' => Carbon::now()->addWeek(),
            'is_active' => true
        ]);

        // Create category-based coupons
        foreach ($categories as $category) {
            Coupon::create([
                'code' => 'CAT' . strtoupper(substr($category->name, 0, 3)) . '20',
                'type' => 'category',
                'value_type' => 'percentage',
                'value' => 20.00,
                'min_order_amount' => 10000.00,
                'max_discount' => 5000.00,
                'category_id' => $category->id,
                'usage_limit_per_user' => 2,
                'usage_limit_total' => 100,
                'starts_at' => Carbon::now(),
                'expires_at' => Carbon::now()->addMonths(2),
                'is_active' => true
            ]);
        }
    }
} 