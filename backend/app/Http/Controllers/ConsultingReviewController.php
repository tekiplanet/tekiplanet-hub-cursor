<?php

namespace App\Http\Controllers;

use App\Models\ConsultingBooking;
use App\Models\ConsultingReview;
use Illuminate\Http\Request;

class ConsultingReviewController extends Controller
{
    public function store(Request $request, ConsultingBooking $booking)
    {
        // Verify booking belongs to user and is completed
        if ($booking->user_id !== $request->user()->id || $booking->status !== 'completed') {
            return response()->json([
                'message' => 'Unauthorized or booking not completed'
            ], 403);
        }

        // Verify no existing review
        if ($booking->review()->exists()) {
            return response()->json([
                'message' => 'Review already exists for this booking'
            ], 422);
        }

        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000'
        ]);

        $review = ConsultingReview::create([
            'booking_id' => $booking->id,
            'user_id' => $request->user()->id,
            'rating' => $request->rating,
            'comment' => $request->comment
        ]);

        return response()->json([
            'message' => 'Review submitted successfully',
            'review' => $review
        ], 201);
    }
} 