<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('workstation_payments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('workstation_subscription_id')->constrained();
            $table->decimal('amount', 10, 2);
            $table->enum('type', ['full', 'installment']);
            $table->integer('installment_number')->nullable();
            $table->date('due_date');
            $table->enum('status', ['paid', 'pending', 'overdue']);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('workstation_payments');
    }
}; 