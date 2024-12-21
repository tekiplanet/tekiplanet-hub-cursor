<?php

namespace App\Http\Controllers;

use App\Models\Hustle;
use App\Models\HustleApplication;
use App\Models\Professional;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class HustleApplicationController extends Controller
{
    public function index()
    {
        try {
            // Check if professional profile exists
            $professional = Professional::where('user_id', Auth::id())->first();

            // If no professional profile, return empty applications
            if (!$professional) {
                return response()->json([
                    'applications' => [],
                    'message' => 'No professional profile found'
                ]);
            }

            $applications = HustleApplication::with(['hustle.category'])
                ->where('professional_id', $professional->id)
                ->latest()
                ->get()
                ->map(function($application) {
                    return [
                        'id' => $application->id,
                        'hustle' => [
                            'id' => $application->hustle->id,
                            'title' => $application->hustle->title,
                            'category' => $application->hustle->category->name,
                            'budget' => $application->hustle->budget,
                            'deadline' => $application->hustle->deadline->format('Y-m-d'),
                            'status' => $application->hustle->status
                        ],
                        'status' => $application->status,
                        'applied_at' => $application->created_at->format('M d, Y'),
                        'created_at' => $application->created_at->toISOString(),
                        'can_withdraw' => $application->canBeWithdrawn()
                    ];
                });

            return response()->json([
                'applications' => $applications
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching applications:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Failed to fetch applications'
            ], 500);
        }
    }

    public function store(Request $request, $hustleId)
    {
        try {
            $professional = Professional::where('user_id', Auth::id())->firstOrFail();
            $hustle = Hustle::findOrFail($hustleId);

            // Check if professional can apply
            if (!$professional->canApplyForHustle($hustle)) {
                return response()->json([
                    'message' => 'Cannot apply for this hustle'
                ], 422);
            }

            // Create application
            $application = HustleApplication::create([
                'hustle_id' => $hustleId,
                'professional_id' => $professional->id,
                'status' => 'pending'
            ]);

            return response()->json([
                'message' => 'Application submitted successfully',
                'application' => [
                    'id' => $application->id,
                    'status' => $application->status,
                    'applied_at' => $application->created_at->format('M d, Y')
                ]
            ], 201);

        } catch (\Exception $e) {
            Log::error('Error submitting application:', [
                'hustle_id' => $hustleId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Failed to submit application'
            ], 500);
        }
    }

    public function withdraw($applicationId)
    {
        try {
            $professional = Professional::where('user_id', Auth::id())->firstOrFail();
            
            $application = HustleApplication::where('professional_id', $professional->id)
                ->findOrFail($applicationId);

            // Check if application can be withdrawn
            if (!$application->canBeWithdrawn()) {
                return response()->json([
                    'message' => 'Application cannot be withdrawn'
                ], 422);
            }

            // Update application status
            $application->update(['status' => 'withdrawn']);

            return response()->json([
                'message' => 'Application withdrawn successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Error withdrawing application:', [
                'application_id' => $applicationId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Failed to withdraw application'
            ], 500);
        }
    }

    public function getMyHustles()
    {
        try {
            $professional = Professional::where('user_id', Auth::id())->firstOrFail();
            
            // Add debug logging
            Log::info('Getting hustles for professional:', [
                'professional_id' => $professional->id,
                'user_id' => Auth::id()
            ]);

            $hustles = Hustle::with(['category', 'messages'])
                ->where('assigned_professional_id', $professional->id)
                ->whereIn('status', ['approved', 'in_progress', 'completed'])
                ->latest()
                ->get();

            // Add debug logging
            Log::info('Found hustles:', [
                'count' => $hustles->count(),
                'hustles' => $hustles->toArray()
            ]);

            $mappedHustles = $hustles->map(function($hustle) {
                return [
                    'id' => $hustle->id,
                    'title' => $hustle->title,
                    'category' => $hustle->category->name,
                    'budget' => $hustle->budget,
                    'deadline' => $hustle->deadline->format('M d, Y'),
                    'status' => $hustle->status,
                    'initial_payment_released' => $hustle->initial_payment_released,
                    'final_payment_released' => $hustle->final_payment_released,
                    'unread_messages' => $hustle->messages()
                        ->where('sender_type', 'admin')
                        ->where('is_read', false)
                        ->count()
                ];
            });

            return response()->json([
                'hustles' => $mappedHustles
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching my hustles:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Failed to fetch hustles'
            ], 500);
        }
    }
} 