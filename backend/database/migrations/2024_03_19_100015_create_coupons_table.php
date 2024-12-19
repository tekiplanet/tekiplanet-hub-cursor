<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('coupons', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('code')->unique();
            $table->enum('type', ['category', 'product', 'order']);
            $table->enum('value_type', ['fixed', 'percentage']);
            $table->decimal('value', 10, 2);
            $table->decimal('min_order_amount', 10, 2);
            $table->decimal('max_discount', 10, 2)->nullable();
            $table->foreignUuid('category_id')->nullable()->constrained('product_categories')->onDelete('cascade');
            $table->foreignUuid('product_id')->nullable()->constrained('products')->onDelete('cascade');
            $table->integer('usage_limit_per_user')->nullable();
            $table->integer('usage_limit_total')->nullable();
            $table->integer('times_used')->default(0);
            $table->timestamp('starts_at')->useCurrent();
            $table->timestamp('expires_at')->useCurrent();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('coupons');
    }
}; 