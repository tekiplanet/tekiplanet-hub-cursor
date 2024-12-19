<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('consulting_time_slots', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->date('date');
            $table->time('time');
            $table->boolean('is_available')->default(true);
            $table->boolean('is_booked')->default(false);
            $table->foreignUuid('booking_id')->nullable()->constrained('consulting_bookings')->onDelete('set null');
            $table->timestamps();

            // Unique constraint to prevent double booking
            $table->unique(['date', 'time']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('consulting_time_slots');
    }
}; 