<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('business_financial_transactions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('business_id')->constrained('business_profiles')->onDelete('cascade');
            $table->foreignUuid('category_id')->constrained('business_financial_categories');
            $table->decimal('amount', 15, 2);
            $table->enum('type', ['income', 'expense']);
            $table->text('description')->nullable();
            $table->date('date');
            $table->string('reference_number')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('business_financial_transactions');
    }
}; 