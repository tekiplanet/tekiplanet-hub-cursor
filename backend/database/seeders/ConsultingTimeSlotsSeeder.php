<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ConsultingTimeSlot;
use Carbon\Carbon;

class ConsultingTimeSlotsSeeder extends Seeder
{
    public function run()
    {
        $startDate = Carbon::now()->startOfDay();
        $endDate = Carbon::now()->addMonths(3)->endOfDay();
        
        $timeSlots = [
            '09:00:00' => 3,  // 9 AM with capacity of 3
            '11:00:00' => 2,  // 11 AM with capacity of 2
            '13:00:00' => 4,  // 1 PM with capacity of 4
            '15:00:00' => 2,  // 3 PM with capacity of 2
            '17:00:00' => 3,  // 5 PM with capacity of 3
        ];

        $currentDate = $startDate->copy();

        while ($currentDate <= $endDate) {
            // Skip weekends
            if ($currentDate->isWeekday()) {
                foreach ($timeSlots as $time => $capacity) {
                    ConsultingTimeSlot::create([
                        'date' => $currentDate->format('Y-m-d'),
                        'time' => $time,
                        'is_available' => true,
                        'capacity' => $capacity,
                        'booked_slots' => 0
                    ]);
                }
            }
            $currentDate->addDay();
        }
    }
} 