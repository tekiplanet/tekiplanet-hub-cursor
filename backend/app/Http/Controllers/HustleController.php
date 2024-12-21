<?php

namespace App\Http\Controllers;

use App\Models\Hustle;
use App\Models\Professional;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class HustleController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Hustle::with(['category', 'applications'])
                ->where('status', 'open');

            // Filter by category if provided
            if ($request->has('category_id')) {
                $query->where('category_id', $request->category_id);
            }

            // Search functionality
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            }

            // Get professional for checking application status
            $professional = Professional::where('user_id', Auth::id())->first();

            $hustles = $query->latest()->paginate(10)->through(function($hustle) use ($professional) {
                return [
                    'id' => $hustle->id,
                    'title' => $hustle->title,
                    'description' => $hustle->description,
                    'category' => [
                        'id' => $hustle->category->id,
                        'name' => $hustle->category->name
                    ],
                    'budget' => $hustle->budget,
                    'deadline' => $hustle->deadline->format('M d, Y'),
                    'requirements' => $hustle->requirements,
                    'applications_count' => $hustle->applications->count(),
                    'has_applied' => $professional ? $hustle->applications()
                        ->where('professional_id', $professional->id)
                        ->exists() : false,
                    'can_apply' => $professional ? $professional->canApplyForHustle($hustle) : false
                ];
            });

            return response()->json($hustles);

        } catch (\Exception $e) {
            Log::error('Error fetching hustles:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Failed to fetch hustles'
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $hustle = Hustle::with([
                'category',
                'applications',
                'assignedProfessional.user',
                'messages' => function($query) {
                    $query->orderBy('created_at', 'asc');
                },
                'messages.user',
                'payments'
            ])->findOrFail($id);

            $professional = Professional::where('user_id', Auth::id())->first();

            // Check if user has applied
            $application = $professional ? $hustle->applications()
                ->where('professional_id', $professional->id)
                ->first() : null;

            return response()->json([
                'hustle' => [
                    'id' => $hustle->id,
                    'title' => $hustle->title,
                    'description' => $hustle->description,
                    'category' => [
                        'id' => $hustle->category->id,
                        'name' => $hustle->category->name
                    ],
                    'budget' => $hustle->budget,
                    'deadline' => $hustle->deadline->format('M d, Y'),
                    'requirements' => $hustle->requirements,
                    'status' => $hustle->status,
                    'applications_count' => $hustle->applications->count(),
                    'application_status' => $application ? $application->status : null,
                    'can_apply' => $professional ? $professional->canApplyForHustle($hustle) : false,
                    'assigned_professional' => $hustle->assignedProfessional ? [
                        'id' => $hustle->assignedProfessional->id,
                        'name' => $hustle->assignedProfessional->user->name,
                        'title' => $hustle->assignedProfessional->title
                    ] : null,
                    'initial_payment_released' => $hustle->initial_payment_released,
                    'final_payment_released' => $hustle->final_payment_released,
                    'messages' => $hustle->status === 'approved' ? $hustle->messages->map(function($message) {
                        return [
                            'id' => $message->id,
                            'message' => $message->message,
                            'sender_type' => $message->sender_type,
                            'user' => [
                                'name' => $message->user->name,
                                'avatar' => $message->user->avatar
                            ],
                            'created_at' => $message->created_at->format('Y-m-d H:i:s')
                        ];
                    }) : [],
                    'payments' => $hustle->payments->map(function($payment) {
                        return [
                            'id' => $payment->id,
                            'amount' => $payment->amount,
                            'payment_type' => $payment->payment_type,
                            'status' => $payment->status,
                            'paid_at' => $payment->paid_at ? $payment->paid_at->format('M d, Y') : null
                        ];
                    }),
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching hustle details:', [
                'id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Failed to fetch hustle details'
            ], 500);
        }
    }
} 