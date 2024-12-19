<?php

namespace Database\Seeders;

use App\Models\ConsultingTimeSlot;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class ConsultingTimeSlotsSeeder extends Seeder
{
    public function run(): void
    {
        $startDate = Carbon::now()->startOfDay();
        $endDate = Carbon::now()->addDays(30)->endOfDay();

        $timeSlots = [
            '09:00', '10:00', '11:00', '12:00', 
            '13:00', '14:00', '15:00', '16:00'
        ];

        $currentDate = $startDate->copy();

        while ($currentDate <= $endDate) {
            // Skip weekends
            if ($currentDate->isWeekday()) {
                foreach ($timeSlots as $time) {
                    ConsultingTimeSlot::create([
                        'date' => $currentDate->toDateString(),
                        'time' => $time,
                        'is_available' => true,
                        'is_booked' => false
                    ]);
                }
            }
            $currentDate->addDay();
        }
    }
} 