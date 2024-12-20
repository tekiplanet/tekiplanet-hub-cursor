<?php

namespace Database\Seeders;

use App\Models\ConsultingBooking;
use App\Models\ConsultingNotification;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class ConsultingNotificationsSeeder extends Seeder
{
    public function run()
    {
        $bookings = ConsultingBooking::where('status', '!=', 'cancelled')->get();
        $notificationTypes = ['booking_confirmation', 'reminder_24h', 'reminder_1h'];

        foreach ($bookings as $booking) {
            // Booking confirmation for all bookings
            ConsultingNotification::create([
                'booking_id' => $booking->id,
                'user_id' => $booking->user_id,
                'type' => 'booking_confirmation',
                'sent_at' => $booking->created_at
            ]);

            // Add reminders for upcoming or past sessions
            if (in_array($booking->status, ['confirmed', 'completed', 'ongoing'])) {
                ConsultingNotification::create([
                    'booking_id' => $booking->id,
                    'user_id' => $booking->user_id,
                    'type' => 'reminder_24h',
                    'sent_at' => Carbon::parse($booking->selected_date)->subHours(24)
                ]);

                ConsultingNotification::create([
                    'booking_id' => $booking->id,
                    'user_id' => $booking->user_id,
                    'type' => 'reminder_1h',
                    'sent_at' => Carbon::parse($booking->selected_date)->subHour()
                ]);
            }
        }
    }
} 