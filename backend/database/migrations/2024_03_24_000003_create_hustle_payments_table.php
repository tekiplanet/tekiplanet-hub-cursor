<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('hustle_payments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('hustle_id')->constrained()->onDelete('cascade');
            $table->foreignUuid('professional_id')->constrained();
            $table->decimal('amount', 10, 2);
            $table->enum('payment_type', ['initial', 'final']);
            $table->enum('status', ['pending', 'completed', 'failed'])->default('pending');
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('hustle_payments');
    }
}; 