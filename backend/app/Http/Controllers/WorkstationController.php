<?php

namespace App\Http\Controllers;

use App\Models\WorkstationSubscription;
use App\Models\WorkstationPlan;
use App\Models\User;
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
            \Log::info('Creating subscription with data:', $request->all());

            $request->validate([
                'plan_id' => 'required|exists:workstation_plans,id',
                'payment_type' => 'required|in:full,installment',
                'start_date' => 'nullable|date|after_or_equal:today',
            ]);

            $user = auth()->user();
            \Log::info('User found:', ['user_id' => $user->id, 'wallet_balance' => $user->wallet_balance]);

            $plan = WorkstationPlan::findOrFail($request->plan_id);
            \Log::info('Plan found:', $plan->toArray());
            
            // Calculate amount based on payment type
            $amount = $request->payment_type === 'full' 
                ? $plan->price 
                : $plan->installment_amount;

            // Check wallet balance
            if ($user->wallet_balance < $amount) {
                \Log::warning('Insufficient balance', [
                    'required' => $amount,
                    'available' => $user->wallet_balance
                ]);
                return response()->json([
                    'message' => 'Insufficient wallet balance'
                ], 400);
            }

            \DB::beginTransaction();
            try {
                // Deduct from wallet
                $user->wallet_balance -= $amount;
                $user->save();

                // Create subscription
                $subscription = WorkstationSubscription::create([
                    'user_id' => $user->id,
                    'plan_id' => $plan->id,
                    'tracking_code' => strtoupper(Str::random(10)),
                    'start_date' => $request->start_date ?? now(),
                    'end_date' => $request->start_date 
                        ? date('Y-m-d', strtotime($request->start_date . " + {$plan->duration_days} days"))
                        : date('Y-m-d', strtotime("+ {$plan->duration_days} days")),
                    'total_amount' => $plan->price,
                    'payment_type' => $request->payment_type,
                    'status' => 'active',
                    'auto_renew' => false,
                ]);

                \Log::info('Subscription created:', $subscription->toArray());

                // Create payment record
                $payment = $subscription->payments()->create([
                    'amount' => $amount,
                    'type' => $request->payment_type,
                    'installment_number' => $request->payment_type === 'installment' ? 1 : null,
                    'due_date' => now(),
                    'status' => 'paid'
                ]);

                \Log::info('Payment created:', $payment->toArray());

                \DB::commit();

                return response()->json([
                    'message' => 'Subscription created successfully',
                    'subscription' => $subscription->load('plan', 'payments')
                ]);
            } catch (\Exception $e) {
                \DB::rollBack();
                \Log::error('Transaction failed:', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
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
} 