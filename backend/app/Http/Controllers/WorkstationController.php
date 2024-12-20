<?php

namespace App\Http\Controllers;

use App\Models\WorkstationSubscription;
use App\Models\WorkstationPlan;
use App\Models\User;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class WorkstationController extends Controller
{
    public function getPlans()
    {
        try {
            $plans = WorkstationPlan::all();
            return response()->json([
                'plans' => $plans
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error fetching plans',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getCurrentSubscription()
    {
        try {
            $subscription = WorkstationSubscription::with(['plan', 'payments'])
                ->where('user_id', auth()->id())
                ->where('status', 'active')
                ->first();

            return response()->json([
                'subscription' => $subscription
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error fetching subscription',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function createSubscription(Request $request)
    {
        try {
            $request->validate([
                'plan_id' => 'required|exists:workstation_plans,id',
                'payment_type' => 'required|in:full,installment',
                'start_date' => 'nullable|date|after_or_equal:today',
                'is_upgrade' => 'boolean'
            ]);

            $user = auth()->user();
            $plan = WorkstationPlan::findOrFail($request->plan_id);

            // Get current subscription if exists
            $currentSubscription = WorkstationSubscription::where('user_id', $user->id)
                ->where('status', 'active')
                ->first();

            if ($currentSubscription) {
                // Handle upgrade/downgrade
                $currentPlan = $currentSubscription->plan;
                
                // Calculate remaining value of current subscription
                $remainingDays = now()->diffInDays($currentSubscription->end_date);
                $dailyRate = $currentSubscription->total_amount / $currentPlan->duration_days;
                $remainingValue = $dailyRate * $remainingDays;

                // Calculate new subscription cost
                $newAmount = $request->payment_type === 'full' 
                    ? $plan->price 
                    : $plan->installment_amount;

                // Adjust amount based on remaining value
                $finalAmount = max(0, $newAmount - $remainingValue);

                \DB::beginTransaction();
                try {
                    // Update existing subscription
                    $currentSubscription->update([
                        'plan_id' => $plan->id,
                        'total_amount' => $newAmount,
                        'payment_type' => $request->payment_type,
                        'end_date' => $request->start_date 
                            ? date('Y-m-d', strtotime($request->start_date . " + {$plan->duration_days} days"))
                            : date('Y-m-d', strtotime("+ {$plan->duration_days} days")),
                    ]);

                    // Create payment record for the difference
                    if ($finalAmount > 0) {
                        // Deduct from wallet
                        $user->wallet_balance -= $finalAmount;
                        $user->save();

                        // Create payment record
                        $payment = $currentSubscription->payments()->create([
                            'amount' => $finalAmount,
                            'type' => $request->payment_type,
                            'installment_number' => $request->payment_type === 'installment' ? 1 : null,
                            'due_date' => now(),
                            'status' => 'paid'
                        ]);

                        // Create transaction record for the upgrade/downgrade
                        Transaction::create([
                            'user_id' => $user->id,
                            'amount' => $finalAmount,
                            'type' => 'debit',
                            'description' => "Plan " . ($finalAmount > 0 ? "upgrade" : "downgrade") . " to {$plan->name}",
                            'category' => 'workstation_subscription',
                            'status' => 'completed',
                            'payment_method' => 'wallet',
                            'reference_number' => $currentSubscription->tracking_code,
                            'notes' => json_encode([
                                'subscription_id' => $currentSubscription->id,
                                'old_plan' => $currentPlan->name,
                                'new_plan' => $plan->name,
                                'payment_type' => $request->payment_type,
                                'duration' => $plan->duration_days . ' days',
                                'start_date' => $currentSubscription->start_date,
                                'end_date' => $currentSubscription->end_date
                            ])
                        ]);
                    }

                    \DB::commit();

                    return response()->json([
                        'message' => 'Subscription updated successfully',
                        'subscription' => $currentSubscription->load('plan', 'payments')
                    ]);
                } catch (\Exception $e) {
                    \DB::rollBack();
                    throw $e;
                }
            }

            // Handle new subscription creation (existing code)
        } catch (\Exception $e) {
            \Log::error('Subscription creation failed:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Error creating subscription',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function renewSubscription(WorkstationSubscription $subscription, Request $request)
    {
        try {
            if ($subscription->user_id !== auth()->id()) {
                return response()->json([
                    'message' => 'Unauthorized'
                ], 403);
            }

            if ($subscription->status !== 'active') {
                return response()->json([
                    'message' => 'Only active subscriptions can be renewed'
                ], 400);
            }

            $request->validate([
                'duration' => 'nullable|string|in:same,3,6,12'
            ]);

            // Calculate new end date based on duration
            $durationDays = match($request->duration) {
                '3' => 90,
                '6' => 180,
                '12' => 365,
                default => $subscription->plan->duration_days
            };

            $newEndDate = date('Y-m-d', strtotime($subscription->end_date . " + {$durationDays} days"));

            // Calculate price with discount
            $basePrice = $subscription->plan->price;
            $discount = match($request->duration) {
                '3' => 0.10, // 10% off
                '6' => 0.15, // 15% off
                '12' => 0.20, // 20% off
                default => 0
            };
            
            $finalPrice = $basePrice * (1 - $discount);

            $subscription->update([
                'end_date' => $newEndDate,
                'total_amount' => $finalPrice,
                'status' => 'active'
            ]);

            // Create a payment record for the renewal
            $subscription->payments()->create([
                'amount' => $finalPrice,
                'type' => 'full',
                'status' => 'paid',
                'due_date' => now(),
            ]);

            return response()->json([
                'message' => 'Subscription renewed successfully',
                'subscription' => $subscription->load('plan', 'payments')
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error renewing subscription',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function cancelSubscription(WorkstationSubscription $subscription, Request $request)
    {
        try {
            if ($subscription->user_id !== auth()->id()) {
                return response()->json([
                    'message' => 'Unauthorized'
                ], 403);
            }

            if ($subscription->status !== 'active') {
                return response()->json([
                    'message' => 'Only active subscriptions can be cancelled'
                ], 400);
            }

            $request->validate([
                'reason' => 'required|string',
                'feedback' => 'nullable|string'
            ]);

            $subscription->update([
                'status' => 'cancelled',
                'cancelled_at' => now(),
                'cancellation_reason' => $request->reason,
                'cancellation_feedback' => $request->feedback
            ]);

            return response()->json([
                'message' => 'Subscription cancelled successfully',
                'subscription' => $subscription->load('plan')
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error cancelling subscription',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getSubscriptionHistory(Request $request)
    {
        try {
            $query = WorkstationSubscription::with(['plan'])
                ->where('user_id', auth()->id());

            // Handle filtering
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            if ($request->has('date_range')) {
                $dates = explode(',', $request->date_range);
                if (count($dates) === 2) {
                    $query->whereBetween('created_at', $dates);
                }
            }

            // Handle sorting
            $sortField = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $allowedSortFields = ['created_at', 'start_date', 'end_date', 'total_amount'];
            
            if (in_array($sortField, $allowedSortFields)) {
                $query->orderBy($sortField, $sortOrder);
            }

            $history = $query->paginate($request->get('per_page', 10));

            return response()->json([
                'history' => $history
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error fetching subscription history',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 