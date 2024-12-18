<?php

namespace App\Http\Controllers;

use App\Models\Quote;
use App\Models\Service;
use App\Models\QuoteMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use App\Events\NewQuoteMessage;

class QuoteController extends Controller
{
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'service_id' => 'required|exists:services,id',
            'industry' => 'required|string',
            'budget_range' => 'required|string',
            'contact_method' => 'required|string',
            'project_description' => 'required|string',
            'project_deadline' => 'required|date|after:today',
        ], [
            'service_id.required' => 'Service selection is required.',
            'service_id.exists' => 'Selected service is invalid.',
            'industry.required' => 'Industry is required.',
            'budget_range.required' => 'Budget range is required.',
            'contact_method.required' => 'Contact method is required.',
            'project_description.required' => 'Project description is required.',
            'project_deadline.required' => 'Project deadline is required.',
            'project_deadline.after' => 'Project deadline must be a future date.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $quote = Quote::create([
                'service_id' => $request->service_id,
                'user_id' => Auth::id(),
                'industry' => $request->industry,
                'budget_range' => $request->budget_range,
                'contact_method' => $request->contact_method,
                'project_description' => $request->project_description,
                'project_deadline' => $request->project_deadline,
                'quote_fields' => $request->quote_fields ?? null,
                'submitted_ip' => $request->ip()
            ]);

            // Create initial message with project description
            QuoteMessage::create([
                'quote_id' => $quote->id,
                'user_id' => Auth::id(),
                'message' => $request->project_description,
                'sender_type' => 'user',
                'is_read' => false
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Quote submitted successfully',
                'quote_id' => $quote->id
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to submit quote',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function index()
    {
        $quotes = Quote::with(['service', 'user'])
            ->select('quotes.*')
            ->where('user_id', Auth::id())
            ->latest()
            ->get()
            ->map(function ($quote) {
                $quote->unread_messages_count = $quote->messages()
                    ->where('sender_type', 'admin')
                    ->where('is_read', false)
                    ->count();
                return $quote;
            });

        return response()->json([
            'success' => true,
            'quotes' => $quotes
        ]);
    }

    public function show($id)
    {
        try {
            $quote = Quote::with([
                'service',
                'service.quoteFields',
                'user',
                'messages' => function($query) {
                    $query->orderBy('created_at', 'asc');
                },
                'messages.user:id,first_name,last_name,avatar'
            ])->findOrFail($id);

            if ($quote->quote_fields) {
                $formattedFields = [];
                foreach ($quote->quote_fields as $fieldId => $value) {
                    $field = $quote->service->quoteFields->where('id', $fieldId)->first();
                    if ($field) {
                        $formattedFields[$field->label] = $value;
                    }
                }
                $quote->quote_fields = $formattedFields;
            }

            $quote->unread_messages_count = $quote->messages()
                ->where('sender_type', 'admin')
                ->where('is_read', false)
                ->count();

            return response()->json([
                'success' => true,
                'quote' => $quote
            ]);
        } catch (\Exception $e) {
            \Log::error('Quote show error:', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Quote not found'
            ], 404);
        }
    }

    public function sendMessage(Request $request, $quoteId)
    {
        $request->validate([
            'message' => 'required|string'
        ]);

        try {
            $quote = Quote::findOrFail($quoteId);
            
            $message = QuoteMessage::create([
                'quote_id' => $quoteId,
                'user_id' => auth()->id(),
                'message' => $request->message,
                'sender_type' => 'user'
            ]);

            // Load the user relationship for the response
            $message->load('user:id,first_name,last_name,avatar');

            // Broadcast the new message
            broadcast(new NewQuoteMessage($message))->toOthers();

            return response()->json([
                'success' => true,
                'message' => $message
            ]);
        } catch (\Exception $e) {
            \Log::error('Quote Message Error: ' . $e->getMessage());
            \Log::error($e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to send message',
                'error' => $e->getMessage() // Include this in development
            ], 500);
        }
    }

    public function markMessagesAsRead($quoteId)
    {
        try {
            QuoteMessage::where('quote_id', $quoteId)
                ->where('sender_type', 'admin')
                ->where('is_read', false)
                ->update(['is_read' => true]);

            return response()->json([
                'success' => true
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to mark messages as read'
            ], 500);
        }
    }
}
