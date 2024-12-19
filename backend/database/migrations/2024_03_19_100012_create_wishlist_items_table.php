<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wishlist_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('wishlist_id')->constrained()->onDelete('cascade');
            $table->foreignUuid('product_id')->constrained()->onDelete('cascade');
            $table->timestamps();

            // Ensure unique product per wishlist
            $table->unique(['wishlist_id', 'product_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wishlist_items');
    }
}; 