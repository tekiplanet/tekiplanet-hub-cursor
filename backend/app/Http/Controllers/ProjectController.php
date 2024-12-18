<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProjectController extends Controller
{
    public function index()
    {
        try {
            // Get user's business profile and their projects
            $businessProfile = Auth::user()->businessProfile;
            
            if (!$businessProfile) {
                return response()->json([
                    'success' => false,
                    'message' => 'Business profile not found'
                ], 404);
            }

            $projects = Project::where('business_id', $businessProfile->id)
                ->with(['stages', 'teamMembers', 'teamMembers.user', 'businessProfile'])
                ->latest()
                ->get()
                ->map(function ($project) {
                    return [
                        'id' => $project->id,
                        'name' => $project->name,
                        'business_name' => $project->businessProfile->business_name,
                        'status' => strtolower($project->status),
                        'start_date' => $project->start_date->format('M d, Y'),
                        'end_date' => $project->end_date ? $project->end_date->format('M d, Y') : 'Not set',
                        'progress' => $project->progress,
                        'budget' => '₦' . number_format($project->budget, 2),
                    ];
                });

            return response()->json([
                'success' => true,
                'projects' => $projects
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch projects',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $project = Project::with([
                'businessProfile',
                'stages',
                'teamMembers.user',
                'files',
                'invoices'
            ])->findOrFail($id);

            // Check if project belongs to user's business
            if ($project->business_id !== Auth::user()->businessProfile->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access'
                ], 403);
            }

            // Add this to debug
            \Log::info('Project invoices:', ['invoices' => $project->invoices]);

            return response()->json([
                'success' => true,
                'project' => [
                    'id' => $project->id,
                    'name' => $project->name,
                    'business_name' => $project->businessProfile->business_name,
                    'description' => $project->description,
                    'status' => $project->status,
                    'start_date' => $project->start_date->format('M d, Y'),
                    'end_date' => $project->end_date ? $project->end_date->format('M d, Y') : 'Not set',
                    'progress' => $project->progress,
                    'budget' => '₦' . number_format($project->budget, 2),
                    'stages' => $project->stages->map(fn($stage) => [
                        'id' => $stage->id,
                        'name' => $stage->name,
                        'description' => $stage->description,
                        'status' => $stage->status,
                        'order' => $stage->order,
                        'start_date' => $stage->start_date->format('M d, Y'),
                        'end_date' => $stage->end_date ? $stage->end_date->format('M d, Y') : null,
                    ]),
                    'team_members' => $project->teamMembers->map(fn($member) => [
                        'id' => $member->id,
                        'user' => [
                            'id' => $member->user->id,
                            'name' => $member->user->first_name . ' ' . $member->user->last_name,
                            'avatar' => $member->user->avatar,
                        ],
                        'role' => $member->role,
                        'status' => $member->status,
                        'joined_at' => $member->joined_at->format('M d, Y'),
                        'left_at' => $member->left_at ? $member->left_at->format('M d, Y') : null,
                    ]),
                    'files' => $project->files->map(fn($file) => [
                        'id' => $file->id,
                        'name' => $file->name,
                        'file_path' => $file->file_path,
                        'file_size' => $file->file_size,
                        'file_type' => $file->file_type,
                    ]),
                    'invoices' => $project->invoices->map(fn($invoice) => [
                        'id' => $invoice->id,
                        'invoice_number' => $invoice->invoice_number,
                        'amount' => '₦' . number_format($invoice->amount, 2),
                        'status' => $invoice->status,
                        'due_date' => $invoice->due_date->format('M d, Y'),
                        'paid_at' => $invoice->paid_at ? $invoice->paid_at->format('M d, Y') : null,
                    ]),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch project details',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 