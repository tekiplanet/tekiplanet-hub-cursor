<?php

namespace App\Http\Controllers;

use App\Models\Hustle;
use App\Models\HustleMessage;
use App\Events\NewHustleMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class HustleMessageController extends Controller
{
    public function sendMessage(Request $request, $hustleId)
    {
        $request->validate([
            'message' => 'required|string'
        ]);

        try {
            $hustle = Hustle::findOrFail($hustleId);
            $professional = $hustle->assignedProfessional;

            // Verify user is the assigned professional
            if ($professional && $professional->user_id !== Auth::id()) {
                return response()->json([
                    'message' => 'Unauthorized to send messages for this hustle'
                ], 403);
            }

            // Create message
            $message = HustleMessage::create([
                'hustle_id' => $hustleId,
                'user_id' => Auth::id(),
                'message' => $request->message,
                'sender_type' => 'professional'
            ]);

            // Load user relationship for the response
            $message->load('user:id,first_name,last_name,avatar');

            // Broadcast the new message
            broadcast(new NewHustleMessage($message))->toOthers();

            return response()->json([
                'success' => true,
                'message' => [
                    'id' => $message->id,
                    'message' => $message->message,
                    'sender_type' => $message->sender_type,
                    'user' => [
                        'name' => $message->user->first_name . ' ' . $message->user->last_name,
                        'avatar' => $message->user->avatar
                    ],
                    'created_at' => $message->created_at->format('Y-m-d H:i:s')
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Hustle Message Error:', [
                'hustle_id' => $hustleId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to send message'
            ], 500);
        }
    }

    public function markMessagesAsRead($hustleId)
    {
        try {
            $hustle = Hustle::findOrFail($hustleId);
            $professional = $hustle->assignedProfessional;

            // Verify user is the assigned professional
            if ($professional && $professional->user_id !== Auth::id()) {
                return response()->json([
                    'message' => 'Unauthorized'
                ], 403);
            }

            // Mark all admin messages as read
            HustleMessage::where('hustle_id', $hustleId)
                ->where('sender_type', 'admin')
                ->where('is_read', false)
                ->update(['is_read' => true]);

            return response()->json([
                'success' => true,
                'message' => 'Messages marked as read'
            ]);

        } catch (\Exception $e) {
            Log::error('Error marking messages as read:', [
                'hustle_id' => $hustleId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to mark messages as read'
            ], 500);
        }
    }

    public function getMessages($hustleId)
    {
        try {
            $hustle = Hustle::findOrFail($hustleId);
            $professional = $hustle->assignedProfessional;

            // Verify user is the assigned professional
            if ($professional && $professional->user_id !== Auth::id()) {
                return response()->json([
                    'message' => 'Unauthorized'
                ], 403);
            }

            $messages = HustleMessage::with('user:id,first_name,last_name,avatar')
                ->where('hustle_id', $hustleId)
                ->orderBy('created_at', 'asc')
                ->get()
                ->map(function($message) {
                    return [
                        'id' => $message->id,
                        'message' => $message->message,
                        'sender_type' => $message->sender_type,
                        'user' => [
                            'name' => $message->user->first_name . ' ' . $message->user->last_name,
                            'avatar' => $message->user->avatar
                        ],
                        'created_at' => $message->created_at->format('Y-m-d H:i:s')
                    ];
                });

            return response()->json([
                'success' => true,
                'messages' => $messages
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching messages:', [
                'hustle_id' => $hustleId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch messages'
            ], 500);
        }
    }
} 