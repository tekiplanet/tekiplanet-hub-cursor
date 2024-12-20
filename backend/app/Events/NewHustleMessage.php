<?php

namespace App\Events;

use App\Models\HustleMessage;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewHustleMessage implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $message;

    public function __construct(HustleMessage $message)
    {
        $this->message = $message;
    }

    public function broadcastOn()
    {
        return new Channel('hustle.' . $this->message->hustle_id);
    }

    public function broadcastWith()
    {
        return [
            'message' => array_merge($this->message->toArray(), [
                'user' => $this->message->user
            ])
        ];
    }
} 