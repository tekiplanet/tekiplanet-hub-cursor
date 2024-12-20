<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('workstation_subscriptions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained()->onDelete('cascade');
            $table->foreignUuid('plan_id')->constrained('workstation_plans');
            $table->string('tracking_code')->unique();
            $table->dateTime('start_date');
            $table->dateTime('end_date');
            $table->decimal('total_amount', 10, 2);
            $table->enum('payment_type', ['full', 'installment']);
            $table->enum('status', ['active', 'expired', 'cancelled', 'pending']);
            $table->boolean('auto_renew')->default(false);
            $table->dateTime('last_check_in')->nullable();
            $table->dateTime('last_check_out')->nullable();
            $table->dateTime('cancelled_at')->nullable();
            $table->text('cancellation_reason')->nullable();
            $table->decimal('refund_amount', 10, 2)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('workstation_subscriptions');
    }
}; 