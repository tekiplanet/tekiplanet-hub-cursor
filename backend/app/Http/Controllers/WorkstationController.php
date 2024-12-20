<?php

namespace App\Http\Controllers;

use App\Models\WorkstationPlan;
use App\Models\WorkstationSubscription;
use Illuminate\Http\Request;

class WorkstationController extends Controller
{
    public function getPlans()
    {
        \Log::info('getPlans method called');
        
        // Get raw count first
        $count = WorkstationPlan::count();
        \Log::info('Total plans in database:', ['count' => $count]);
        
        $plans = WorkstationPlan::where('is_active', true)->get();
        \Log::info('Active plans retrieved:', ['count' => $plans->count()]);
        
        if ($plans->isEmpty()) {
            \Log::warning('No active plans found in database');
        }
        
        return response()->json([
            'plans' => $plans,
            'debug' => [
                'total_count' => $count,
                'active_count' => $plans->count()
            ]
        ]);
    }

    public function getCurrentSubscription()
    {
        $subscription = WorkstationSubscription::with(['plan', 'user', 'payments', 'accessCards'])
            ->where('user_id', auth()->id())
            ->latest()
            ->first();

        return response()->json([
            'subscription' => $subscription
        ]);
    }
} 