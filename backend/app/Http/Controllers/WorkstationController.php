<?php

namespace App\Http\Controllers;

use App\Models\WorkstationSubscription;
use App\Models\WorkstationPlan;
use App\Models\User;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Services\AccessCardGenerator;
use Illuminate\Support\Facades\DB;

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
                ->latest()
                ->first();

            // Check if subscription has expired
            if ($subscription && $subscription->status === 'active' && now()->startOfDay()->gt($subscription->end_date)) {
                $subscription->update(['status' => 'expired']);
                $subscription->refresh();
            }

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
            $now = now();

            // Get current subscription if exists
            $currentSubscription = WorkstationSubscription::where('user_id', $user->id)
                ->where('status', 'active')
                ->first();

            \DB::beginTransaction();
            try {
                if ($currentSubscription) {
                    // Handle upgrade/downgrade logic
                    $currentPlan = $currentSubscription->plan;
                    $currentStartDate = new \DateTime($currentSubscription->start_date);
                    $currentEndDate = new \DateTime($currentSubscription->end_date);

                    // Determine start and end dates
                    if ($request->start_date) {
                        // If user selected a future date, use it
                        $startDate = new \DateTime($request->start_date);
                        $endDate = clone $startDate;
                        $endDate->modify("+ {$plan->duration_days} days");

                        // Calculate remaining value from current subscription
                        if ($currentStartDate > $now) {
                            // If current subscription hasn't started, use full amount
                            $remainingValue = $currentSubscription->total_amount;
                        } else {
                            // Calculate prorated remaining value
                            $remainingDuration = $currentEndDate->getTimestamp() - $now->getTimestamp();
                            $totalDuration = $currentEndDate->getTimestamp() - $currentStartDate->getTimestamp();
                            $remainingDays = $remainingDuration / (24 * 60 * 60);
                            $totalDays = $totalDuration / (24 * 60 * 60);
                            $remainingValue = ($remainingDays / $totalDays) * $currentSubscription->total_amount;
                        }
                    } else {
                        // If no start date selected, use existing logic
                        if ($currentStartDate > $now) {
                            $startDate = $currentStartDate;
                            $endDate = clone $currentEndDate;
                            $endDate->modify("+ {$plan->duration_days} days");
                            $remainingValue = $currentSubscription->total_amount;
                        } elseif ($currentEndDate > $now) {
                            $startDate = $currentEndDate;
                            $endDate = clone $startDate;
                            $endDate->modify("+ {$plan->duration_days} days");
                            $remainingValue = ($currentEndDate->getTimestamp() - $now->getTimestamp()) / (24 * 60 * 60) * ($currentSubscription->total_amount / $currentPlan->duration_days);
                        } else {
                            $startDate = $now;
                            $endDate = clone $startDate;
                            $endDate->modify("+ {$plan->duration_days} days");
                            $remainingValue = 0;
                        }
                    }

                    // Calculate new subscription cost
                    $newAmount = $request->payment_type === 'full' 
                        ? $plan->price 
                        : $plan->installment_amount;

                    // Calculate final amount
                    $finalAmount = $newAmount - $remainingValue;

                    // Handle wallet adjustment
                    if ($finalAmount > 0) {
                        if ($user->wallet_balance < $finalAmount) {
                            return response()->json([
                                'message' => 'Insufficient wallet balance',
                                'error' => 'Please top up your wallet to continue'
                            ], 400);
                        }
                        $user->wallet_balance -= $finalAmount;
                    } else {
                        $user->wallet_balance += abs($finalAmount);
                    }
                    $user->save();

                    // Update existing subscription
                    $currentSubscription->update([
                        'plan_id' => $plan->id,
                        'total_amount' => $newAmount,
                        'payment_type' => $request->payment_type,
                        'start_date' => $startDate->format('Y-m-d'),
                        'end_date' => $endDate->format('Y-m-d'),
                    ]);

                    $subscription = $currentSubscription;

                    // Create transaction record
                    $transaction = Transaction::create([
                        'user_id' => $user->id,
                        'amount' => abs($finalAmount),
                        'type' => $finalAmount > 0 ? 'debit' : 'credit',
                        'description' => "Plan " . ($finalAmount > 0 ? "upgrade" : "downgrade") . " to {$plan->name}",
                        'category' => 'workstation_subscription',
                        'status' => 'completed',
                        'payment_method' => 'wallet',
                        'reference_number' => $subscription->tracking_code,
                        'notes' => json_encode([
                            'subscription_id' => $subscription->id,
                            'old_plan' => $currentPlan->name,
                            'new_plan' => $plan->name,
                            'payment_type' => $request->payment_type,
                            'duration' => $plan->duration_days . ' days',
                            'start_date' => $startDate->format('Y-m-d'),
                            'end_date' => $endDate->format('Y-m-d'),
                            'remaining_value' => $remainingValue,
                            'final_amount' => $finalAmount
                        ])
                    ]);

                    // Create payment record only if there's a debit
                    if ($finalAmount > 0) {
                        $payment = $subscription->payments()->create([
                            'amount' => $finalAmount,
                            'type' => $request->payment_type,
                            'installment_number' => $request->payment_type === 'installment' ? 1 : null,
                            'due_date' => now(),
                            'status' => 'paid'
                        ]);
                    }
                } else {
                    // Create new subscription
                    $startDate = $request->start_date ? new \DateTime($request->start_date) : now();
                    $endDate = clone $startDate;
                    $endDate->modify("+ {$plan->duration_days} days");

                    $amount = $request->payment_type === 'full' ? $plan->price : $plan->installment_amount;

                    // Create subscription
                    $subscription = WorkstationSubscription::create([
                        'user_id' => $user->id,
                        'plan_id' => $plan->id,
                        'tracking_code' => Str::random(10),
                        'start_date' => $startDate->format('Y-m-d'),
                        'end_date' => $endDate->format('Y-m-d'),
                        'total_amount' => $amount,
                        'payment_type' => $request->payment_type,
                        'status' => 'active',
                        'auto_renew' => false
                    ]);

                    // Deduct from wallet
                    $user->wallet_balance -= $amount;
                    $user->save();

                    // Create payment record
                    $payment = $subscription->payments()->create([
                        'amount' => $amount,
                        'type' => $request->payment_type,
                        'installment_number' => $request->payment_type === 'installment' ? 1 : null,
                        'due_date' => now(),
                        'status' => 'paid'
                    ]);

                    // Create transaction record
                    $transaction = Transaction::create([
                        'user_id' => $user->id,
                        'amount' => $amount,
                        'type' => 'debit',
                        'description' => "Workstation subscription - {$plan->name}",
                        'category' => 'workstation_subscription',
                        'status' => 'completed',
                        'payment_method' => 'wallet',
                        'reference_number' => $subscription->tracking_code,
                        'notes' => json_encode([
                            'subscription_id' => $subscription->id,
                            'plan_name' => $plan->name,
                            'payment_type' => $request->payment_type,
                            'duration' => $plan->duration_days . ' days',
                            'start_date' => $startDate->format('Y-m-d'),
                            'end_date' => $endDate->format('Y-m-d')
                        ])
                    ]);
                }

                \DB::commit();

                return response()->json([
                    'message' => 'Subscription ' . ($currentSubscription ? 'updated' : 'created') . ' successfully',
                    'subscription' => $subscription->load('plan', 'payments'),
                    'transaction_reference' => $transaction->reference_number ?? null
                ]);

            } catch (\Exception $e) {
                \DB::rollBack();
                throw $e;
            }
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

            // Only allow renewal for active or expired subscriptions
            if (!in_array($subscription->status, ['active', 'expired'])) {
                return response()->json([
                    'message' => 'Only active or expired subscriptions can be renewed'
                ], 400);
            }

            $request->validate([
                'plan_id' => 'required|exists:workstation_plans,id'
            ]);

            $plan = WorkstationPlan::findOrFail($request->plan_id);
            $user = auth()->user();

            // Check wallet balance
            if ($user->wallet_balance < $plan->price) {
                return response()->json([
                    'message' => 'Insufficient wallet balance',
                    'error' => 'Please top up your wallet to renew subscription'
                ], 400);
            }

            $now = now();
            $currentStartDate = new \DateTime($subscription->start_date);
            $currentEndDate = new \DateTime($subscription->end_date);

            // Determine start and end dates
            if ($subscription->status === 'active') {
                if ($currentStartDate > $now) {
                    $startDate = $currentStartDate;
                    $endDate = clone $currentEndDate;
                    $endDate->modify("+ {$plan->duration_days} days");
                } elseif ($currentEndDate > $now) {
                    $startDate = $currentEndDate;
                    $endDate = clone $startDate;
                    $endDate->modify("+ {$plan->duration_days} days");
                } else {
                    $startDate = $now;
                    $endDate = clone $startDate;
                    $endDate->modify("+ {$plan->duration_days} days");
                }
            } else {
                $startDate = $now;
                $endDate = clone $startDate;
                $endDate->modify("+ {$plan->duration_days} days");
            }

            \DB::beginTransaction();
            try {
                // Update subscription
                $subscription->update([
                    'plan_id' => $plan->id,
                    'start_date' => $startDate->format('Y-m-d'),
                    'end_date' => $endDate->format('Y-m-d'),
                    'total_amount' => $plan->price,
                    'status' => 'active'
                ]);

                // Deduct from wallet
                $user->wallet_balance -= $plan->price;
                $user->save();

                // Create payment record
                $payment = $subscription->payments()->create([
                    'amount' => $plan->price,
                    'type' => 'full',
                    'status' => 'paid',
                    'due_date' => now(),
                ]);

                // Create transaction record
                $transaction = Transaction::create([
                    'user_id' => $user->id,
                    'amount' => $plan->price,
                    'type' => 'debit',
                    'description' => "Subscription renewal - {$plan->name}",
                    'category' => 'workstation_subscription',
                    'status' => 'completed',
                    'payment_method' => 'wallet',
                    'reference_number' => $subscription->tracking_code,
                    'notes' => json_encode([
                        'subscription_id' => $subscription->id,
                        'plan_name' => $plan->name,
                        'duration' => $plan->duration_days . ' days',
                        'start_date' => $startDate->format('Y-m-d'),
                        'end_date' => $endDate->format('Y-m-d')
                    ])
                ]);

                \DB::commit();

                return response()->json([
                    'message' => 'Subscription renewed successfully',
                    'subscription' => $subscription->load('plan', 'payments')
                ]);

            } catch (\Exception $e) {
                \DB::rollBack();
                throw $e;
            }
        } catch (\Exception $e) {
            \Log::error('Subscription renewal failed:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
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

            DB::beginTransaction();
            try {
                // Delete related records first
                $subscription->payments()->delete();
                
                // Then delete the subscription
                $subscription->delete();

                DB::commit();

                return response()->json([
                    'message' => 'Subscription cancelled successfully'
                ]);

            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }
        } catch (\Exception $e) {
            \Log::error('Error cancelling subscription:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
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

    public function downloadAccessCard(WorkstationSubscription $subscription)
    {
        try {
            // Check if subscription belongs to authenticated user
            if ($subscription->user_id !== auth()->id()) {
                return response()->json([
                    'message' => 'Unauthorized access'
                ], 403);
            }

            // Debug logging
            \Log::info('Starting access card generation', [
                'subscription_id' => $subscription->id,
                'user_id' => auth()->id()
            ]);

            $generator = new AccessCardGenerator();
            
            try {
                $imageData = $generator->generate($subscription);
                
                \Log::info('Access card generated successfully');

                return response($imageData)
                    ->header('Content-Type', 'image/jpeg')
                    ->header('Content-Disposition', 'attachment; filename="access-card-' . $subscription->tracking_code . '.jpg"');
            } catch (\Exception $e) {
                \Log::error('Access card generation failed', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                
                return response()->json([
                    'message' => 'Failed to generate access card',
                    'error' => $e->getMessage()
                ], 500);
            }

        } catch (\Exception $e) {
            \Log::error('Access card download failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'message' => 'Failed to process access card download',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function reactivateSubscription(Request $request)
    {
        try {
            $request->validate([
                'plan_id' => 'required|exists:workstation_plans,id',
                'payment_type' => 'required|in:full,installment'
            ]);

            $user = auth()->user();
            $plan = WorkstationPlan::findOrFail($request->plan_id);

            // Check if user has sufficient balance
            if ($user->wallet_balance < $plan->price) {
                return response()->json([
                    'message' => 'Insufficient wallet balance',
                    'error' => 'Please top up your wallet to continue'
                ], 400);
            }

            DB::beginTransaction();
            try {
                // Deduct from wallet
                $user->wallet_balance -= $plan->price;
                $user->save();

                // Create new subscription
                $subscription = WorkstationSubscription::create([
                    'user_id' => $user->id,
                    'plan_id' => $plan->id,
                    'tracking_code' => Str::random(10),
                    'start_date' => now(),
                    'end_date' => now()->addDays($plan->duration_days),
                    'total_amount' => $plan->price,
                    'payment_type' => $request->payment_type,
                    'status' => 'active'
                ]);

                // Create transaction record
                Transaction::create([
                    'user_id' => $user->id,
                    'amount' => $plan->price,
                    'type' => 'debit',
                    'description' => "Workstation subscription reactivation - {$plan->name}",
                    'status' => 'completed'
                ]);

                DB::commit();

                return response()->json([
                    'message' => 'Subscription reactivated successfully',
                    'subscription' => $subscription->load('plan')
                ]);

            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to reactivate subscription',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 