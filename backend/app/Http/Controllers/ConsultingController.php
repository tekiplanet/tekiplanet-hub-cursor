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
                    return $dateSlots->map(function ($slot) {
                        return [
                            'id' => $slot->id,
                            'time' => Carbon::parse($slot->time)->format('h:i A')
                        ];
                    });
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
        try {
            $validated = $request->validate([
                'hours' => 'required|integer|min:1|max:10',
                'slot_id' => 'required|exists:consulting_time_slots,id',
                'requirements' => 'nullable|string',
                'payment_method' => 'required|in:wallet'
            ]);

            DB::beginTransaction();

            // Check if slot is available
            $slot = ConsultingTimeSlot::where('id', $request->slot_id)
                ->where('is_available', true)
                ->where('is_booked', false)
                ->first();

            if (!$slot) {
                return response()->json([
                    'message' => 'Selected time slot is no longer available'
                ], 422);
            }

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
                'selected_date' => $slot->date,
                'selected_time' => $slot->time,
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

        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::warning('Booking Validation Error:', [
                'user_id' => auth()->id(),
                'errors' => $e->errors()
            ]);
            throw $e;
        } catch (\Exception $e) {
            \Log::error('Booking Error:', [
                'user_id' => auth()->id(),
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
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

    public function getBookingDetails($id)
    {
        try {
            $booking = ConsultingBooking::with(['review'])
                ->where('user_id', auth()->id())
                ->findOrFail($id);

            return response()->json([
                'booking' => $booking
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch booking details',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getBookingReview($id)
    {
        try {
            $booking = ConsultingBooking::with(['review'])
                ->where('user_id', auth()->id())
                ->findOrFail($id);

            if (!$booking->review) {
                return response()->json([
                    'message' => 'No review found for this booking'
                ], 404);
            }

            return response()->json([
                'review' => $booking->review
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch review',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 