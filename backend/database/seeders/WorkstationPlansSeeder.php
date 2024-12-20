<?php

namespace Database\Seeders;

use App\Models\WorkstationPlan;
use Illuminate\Database\Seeder;

class WorkstationPlansSeeder extends Seeder
{
    public function run()
    {
        $plans = [
            [
                'name' => 'Daily Plan',
                'slug' => 'daily',
                'price' => 5000.00,
                'duration_days' => 1,
                'print_pages_limit' => 10,
                'meeting_room_hours' => 0,
                'has_locker' => false,
                'has_dedicated_support' => false,
                'allows_installments' => false,
                'features' => [
                    'Access to shared workspace for one business day',
                    'High-speed Wi-Fi',
                    'Printing and scanning: 10 pages per day',
                    '8-hour desk usage limit'
                ]
            ],
            [
                'name' => 'Weekly Plan',
                'slug' => 'weekly',
                'price' => 20000.00,
                'duration_days' => 7,
                'print_pages_limit' => 50,
                'meeting_room_hours' => 1,
                'has_locker' => true,
                'has_dedicated_support' => false,
                'allows_installments' => false,
                'features' => [
                    'All features from Daily Plan',
                    'Reserved desk option for 7 days',
                    'Discounted rates for additional services',
                    'Access to lockers for storing personal items',
                    'Priority booking for private meeting rooms (1 session included)',
                    'Printing and scanning: 50 pages per week'
                ]
            ],
            [
                'name' => 'Monthly Plan',
                'slug' => 'monthly',
                'price' => 50000.00,
                'duration_days' => 30,
                'print_pages_limit' => 200,
                'meeting_room_hours' => 4,
                'has_locker' => true,
                'has_dedicated_support' => true,
                'allows_installments' => false,
                'features' => [
                    'All features from Weekly Plan',
                    'Personalized desk with ergonomic seating',
                    'Complimentary 4-hour access to private meeting rooms per month',
                    'Priority networking events hosted by Tekiplanet',
                    'Dedicated customer support line',
                    'Printing and scanning: 200 pages per month'
                ]
            ],
            [
                'name' => 'Quarterly Plan',
                'slug' => 'quarterly',
                'price' => 140000.00,
                'duration_days' => 90,
                'print_pages_limit' => 600,
                'meeting_room_hours' => 8,
                'has_locker' => true,
                'has_dedicated_support' => true,
                'allows_installments' => true,
                'installment_months' => 3,
                'installment_amount' => 46667.00,
                'features' => [
                    'All features from Monthly Plan',
                    'Increased meeting room hours (8 hours per quarter)',
                    'Access to high-performance equipment',
                    'Special discounts on Tekiplanet gadgets and services',
                    'Printing and scanning: 600 pages per quarter'
                ]
            ],
            [
                'name' => 'Yearly Plan',
                'slug' => 'yearly',
                'price' => 500000.00,
                'duration_days' => 365,
                'print_pages_limit' => 2500,
                'meeting_room_hours' => -1, // -1 means unlimited
                'has_locker' => true,
                'has_dedicated_support' => true,
                'allows_installments' => true,
                'installment_months' => 12,
                'installment_amount' => 41667.00,
                'features' => [
                    'All features from Quarterly Plan',
                    'Unlimited meeting room access (upon availability)',
                    'Business mailing address and mail-handling services',
                    'Permanent locker space',
                    'Discounts on Teki Academy courses',
                    'Complimentary invitations to Tekiplanet-hosted workshops',
                    'Printing and scanning: 2,500 pages per year'
                ]
            ]
        ];

        foreach ($plans as $plan) {
            WorkstationPlan::create($plan);
        }
    }
} 