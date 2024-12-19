<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('consulting_settings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->decimal('hourly_rate', 10, 2);
            $table->decimal('overtime_rate', 10, 2);
            $table->integer('cancellation_hours')->default(24);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('consulting_settings');
    }
}; 