<?php

namespace App\Http\Controllers;

use App\Models\ConsultingBooking;
use App\Models\ConsultingTimeSlot;
use App\Models\ConsultingSetting;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ConsultingController extends Controller
{
    public function getAvailableSlots(Request $request)
    {
        try {
            $settings = ConsultingSetting::first();
            $slots = ConsultingTimeSlot::where('date', '>=', now()->toDateString())
                ->where('is_available', true)
                ->where('is_booked', false)
                ->orderBy('date')
                ->orderBy('time')
                ->get()
                ->groupBy('date')
                ->map(function ($dateSlots) {
                    return $dateSlots->pluck('time');
                });

            return response()->json([
                'slots' => $slots,
                'hourly_rate' => $settings ? $settings->hourly_rate : 10000,
                'overtime_rate' => $settings ? $settings->overtime_rate : 15000,
                'cancellation_hours' => $settings ? $settings->cancellation_hours : 24
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch available slots',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function createBooking(Request $request)
    {
        $request->validate([
            'hours' => 'required|integer|min:1|max:10',
            'selected_date' => 'required|date|after:today',
            'selected_time' => 'required',
            'requirements' => 'nullable|string',
            'payment_method' => 'required|in:wallet'
        ]);

        try {
            DB::beginTransaction();

            // Check if slot is available
            $slot = ConsultingTimeSlot::where('date', $request->selected_date)
                ->where('time', $request->selected_time)
                ->where('is_available', true)
                ->where('is_booked', false)
                ->firstOrFail();

            // Get settings for pricing
            $settings = ConsultingSetting::firstOrFail();
            $totalCost = $settings->hourly_rate * $request->hours;

            // Check wallet balance
            $user = $request->user();
            if ($user->wallet_balance < $totalCost) {
                return response()->json([
                    'message' => 'Insufficient wallet balance',
                    'required_amount' => $totalCost,
                    'current_balance' => $user->wallet_balance
                ], 422);
            }

            // Create booking
            $booking = ConsultingBooking::create([
                'user_id' => $user->id,
                'hours' => $request->hours,
                'total_cost' => $totalCost,
                'selected_date' => $request->selected_date,
                'selected_time' => $request->selected_time,
                'requirements' => $request->requirements,
                'status' => 'confirmed',
                'payment_status' => 'paid',
                'payment_method' => $request->payment_method
            ]);

            // Update slot status
            $slot->update([
                'is_booked' => true,
                'booking_id' => $booking->id
            ]);

            // Process payment
            $user->decrement('wallet_balance', $totalCost);

            // Create transaction record
            Transaction::create([
                'user_id' => $user->id,
                'amount' => $totalCost,
                'type' => 'debit',
                'description' => "Consulting Session Booking ({$request->hours} hours)",
                'status' => 'completed',
                'payment_method' => 'wallet'
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Booking created successfully',
                'booking' => $booking
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to create booking',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getUserBookings(Request $request)
    {
        $bookings = ConsultingBooking::where('user_id', $request->user()->id)
            ->with(['timeSlot', 'review'])
            ->latest()
            ->get();

        return response()->json([
            'bookings' => $bookings
        ]);
    }

    public function cancelBooking(Request $request, ConsultingBooking $booking)
    {
        if (!$booking->canBeCancelled()) {
            return response()->json([
                'message' => 'Booking cannot be cancelled'
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Update booking status
            $booking->update([
                'status' => 'cancelled',
                'cancellation_reason' => $request->reason,
                'cancelled_at' => now()
            ]);

            // Free up the time slot
            if ($booking->timeSlot) {
                $booking->timeSlot->update([
                    'is_booked' => false,
                    'booking_id' => null
                ]);
            }

            DB::commit();

            return response()->json([
                'message' => 'Booking cancelled successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to cancel booking',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 