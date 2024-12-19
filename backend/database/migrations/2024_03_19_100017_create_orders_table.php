<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained()->onDelete('cascade');
            $table->foreignUuid('shipping_address_id')->constrained()->onDelete('restrict');
            $table->foreignUuid('shipping_method_id')->constrained()->onDelete('restrict');
            $table->decimal('subtotal', 10, 2);
            $table->decimal('shipping_cost', 10, 2);
            $table->decimal('discount', 10, 2)->default(0);
            $table->decimal('total', 10, 2);
            $table->enum('status', [
                'pending',
                'confirmed',
                'processing',
                'shipped',
                'in_transit',
                'out_for_delivery',
                'delivered',
                'cancelled'
            ])->default('pending');
            $table->enum('payment_status', ['pending', 'paid', 'failed'])->default('pending');
            $table->enum('refund_status', [
                'none',
                'requested',
                'approved',
                'rejected',
                'processed'
            ])->default('none');
            $table->foreignUuid('coupon_id')->nullable()->constrained()->onDelete('set null');
            $table->integer('delivery_attempts')->default(0);
            $table->integer('max_delivery_attempts')->default(3);
            $table->timestamp('delivered_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
}; 