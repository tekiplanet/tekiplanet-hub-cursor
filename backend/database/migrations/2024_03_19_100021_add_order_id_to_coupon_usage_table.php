<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('coupon_usage', function (Blueprint $table) {
            $table->foreignUuid('order_id')->constrained()->onDelete('cascade');
            $table->timestamp('used_at')->nullable();
            
            // Add unique constraint
            $table->unique(['coupon_id', 'order_id']);
        });
    }

    public function down(): void
    {
        Schema::table('coupon_usage', function (Blueprint $table) {
            $table->dropForeign(['order_id']);
            $table->dropColumn(['order_id', 'used_at']);
        });
    }
}; 