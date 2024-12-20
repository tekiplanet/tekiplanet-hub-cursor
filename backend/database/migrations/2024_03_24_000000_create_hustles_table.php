<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('hustles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title');
            $table->text('description');
            $table->foreignUuid('category_id')->constrained('professional_categories');
            $table->decimal('budget', 10, 2);
            $table->date('deadline');
            $table->text('requirements')->nullable();
            $table->enum('status', ['open', 'approved', 'in_progress', 'completed', 'cancelled'])->default('open');
            $table->foreignUuid('assigned_professional_id')->nullable()->constrained('professionals');
            $table->boolean('initial_payment_released')->default(false);
            $table->boolean('final_payment_released')->default(false);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('hustles');
    }
}; 