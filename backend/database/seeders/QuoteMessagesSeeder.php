<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Quote;
use App\Models\QuoteMessage;
use Carbon\Carbon;

class QuoteMessagesSeeder extends Seeder
{
    public function run()
    {
        // Get all quotes
        $quotes = Quote::all();

        foreach ($quotes as $quote) {
            // Create a conversation flow for each quote
            $this->createConversation($quote);
        }
    }

    private function createConversation($quote)
    {
        // Initial message from user
        QuoteMessage::create([
            'quote_id' => $quote->id,
            'user_id' => $quote->user_id,
            'message' => "Hi, I've submitted a quote request for {$quote->service->name}. Looking forward to discussing this project.",
            'sender_type' => 'user',
            'created_at' => Carbon::now()->subDays(3),
        ]);

        // Admin response
        QuoteMessage::create([
            'quote_id' => $quote->id,
            'user_id' => $quote->assigned_to ?? $quote->user_id, // Use assigned admin or fallback to user
            'message' => "Thank you for your quote request. I've reviewed your requirements and would like to discuss some details. When would be a good time to schedule a call?",
            'sender_type' => 'admin',
            'created_at' => Carbon::now()->subDays(3)->addHours(2),
        ]);

        // User reply
        QuoteMessage::create([
            'quote_id' => $quote->id,
            'user_id' => $quote->user_id,
            'message' => "I'm available tomorrow afternoon between 2-5 PM. Would that work for you?",
            'sender_type' => 'user',
            'created_at' => Carbon::now()->subDays(2),
        ]);

        // Admin confirmation
        QuoteMessage::create([
            'quote_id' => $quote->id,
            'user_id' => $quote->assigned_to ?? $quote->user_id,
            'message' => "Perfect! I'll schedule a call for tomorrow at 2:30 PM. I'll send you a calendar invite shortly.",
            'sender_type' => 'admin',
            'created_at' => Carbon::now()->subDays(2)->addHours(1),
        ]);

        // Additional user message
        QuoteMessage::create([
            'quote_id' => $quote->id,
            'user_id' => $quote->user_id,
            'message' => "Great, I've received the calendar invite. By the way, I wanted to ask if the timeline mentioned in my request seems feasible?",
            'sender_type' => 'user',
            'created_at' => Carbon::now()->subDay(),
        ]);
    }
} 