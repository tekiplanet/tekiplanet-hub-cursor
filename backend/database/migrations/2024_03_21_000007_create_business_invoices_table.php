<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('business_invoices', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('business_id')->constrained('business_profiles')->cascadeOnDelete();
            $table->foreignUuid('customer_id')->constrained('business_customers')->cascadeOnDelete();
            $table->string('invoice_number');
            $table->decimal('amount', 10, 2);
            $table->decimal('paid_amount', 10, 2)->default(0);
            $table->dateTime('due_date');
            $table->enum('status', [
                'draft',
                'pending',
                'sent',
                'partially_paid',
                'paid',
                'overdue',
                'cancelled'
            ])->default('draft');
            $table->boolean('payment_reminder_sent')->default(false);
            $table->string('theme_color')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('business_invoices');
    }
}; 