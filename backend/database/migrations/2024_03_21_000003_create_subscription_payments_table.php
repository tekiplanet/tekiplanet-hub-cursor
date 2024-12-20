<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subscription_payments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('subscription_id')->constrained('workstation_subscriptions');
            $table->decimal('amount', 10, 2);
            $table->enum('type', ['full', 'installment']);
            $table->integer('installment_number')->nullable();
            $table->dateTime('due_date');
            $table->enum('status', ['paid', 'pending', 'overdue']);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscription_payments');
    }
}; 