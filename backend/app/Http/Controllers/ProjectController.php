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
                ->with(['stages', 'teamMembers', 'teamMembers.user'])
                ->latest()
                ->get()
                ->map(function ($project) {
                    return [
                        'id' => $project->id,
                        'name' => $project->name,
                        'client_name' => $project->client_name,
                        'status' => $project->status,
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
} 