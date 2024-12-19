<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('zone_shipping_rates', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('zone_id')->constrained('shipping_zones')->onDelete('cascade');
            $table->foreignUuid('shipping_method_id')->constrained()->onDelete('cascade');
            $table->decimal('rate', 10, 2);
            $table->integer('estimated_days');
            $table->timestamps();

            // Ensure unique combination of zone and shipping method
            $table->unique(['zone_id', 'shipping_method_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('zone_shipping_rates');
    }
}; 