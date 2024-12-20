<?php

namespace Database\Seeders;

use App\Models\ConsultingBooking;
use App\Models\ConsultingReview;
use Illuminate\Database\Seeder;

class ConsultingReviewsSeeder extends Seeder
{
    public function run()
    {
        // Only create reviews for completed bookings
        $completedBookings = ConsultingBooking::where('status', 'completed')->get();

        foreach ($completedBookings as $booking) {
            ConsultingReview::create([
                'booking_id' => $booking->id,
                'user_id' => $booking->user_id,
                'rating' => rand(3, 5),
                'comment' => fake()->paragraph()
            ]);

            // Update the expert's rating
            if ($booking->expert) {
                $booking->expert->updateRating();
            }
        }
    }
} 