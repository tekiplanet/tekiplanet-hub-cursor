<?php

namespace Database\Seeders;

use App\Models\ConsultingBooking;
use App\Models\User;
use App\Models\Professional;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class ConsultingBookingsSeeder extends Seeder
{
    public function run()
    {
        $users = User::where('account_type', '!=', 'professional')->take(5)->get();
        $professionals = Professional::with('user')->get();
        $statuses = ['pending', 'confirmed', 'ongoing', 'completed', 'cancelled'];
        
        foreach ($users as $user) {
            // Create 3 bookings per user
            for ($i = 0; $i < 3; $i++) {
                $status = $statuses[array_rand($statuses)];
                $date = Carbon::now()->addDays(rand(-30, 30));
                $hours = rand(1, 4);
                
                $booking = ConsultingBooking::create([
                    'user_id' => $user->id,
                    'hours' => $hours,
                    'total_cost' => $hours * 10000, // Using base rate of 10,000
                    'selected_date' => $date->format('Y-m-d'),
                    'selected_time' => $date->format('H:i:s'),
                    'requirements' => fake()->paragraph(),
                    'status' => $status,
                    'payment_status' => 'paid',
                    'payment_method' => 'wallet',
                    'assigned_expert_id' => $professionals->random()->id,
                    'expert_assigned_at' => $status !== 'pending' ? Carbon::now() : null,
                    'cancelled_at' => $status === 'cancelled' ? Carbon::now() : null,
                    'cancellation_reason' => $status === 'cancelled' ? fake()->sentence() : null
                ]);
            }
        }
    }
} 