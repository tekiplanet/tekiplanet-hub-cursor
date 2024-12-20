<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('workstation_plans', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('slug')->unique();
            $table->decimal('price', 10, 2);
            $table->integer('duration_days');
            $table->integer('print_pages_limit');
            $table->integer('meeting_room_hours');
            $table->boolean('has_locker');
            $table->boolean('has_dedicated_support');
            $table->boolean('allows_installments');
            $table->integer('installment_months')->nullable();
            $table->decimal('installment_amount', 10, 2)->nullable();
            $table->json('features');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('workstation_plans');
    }
}; 