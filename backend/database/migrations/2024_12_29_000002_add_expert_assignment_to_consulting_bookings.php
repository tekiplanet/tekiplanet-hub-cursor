<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('consulting_bookings', function (Blueprint $table) {
            $table->uuid('assigned_expert_id')->nullable()->after('payment_method');
            $table->timestamp('expert_assigned_at')->nullable()->after('assigned_expert_id');
            $table->foreign('assigned_expert_id')
                  ->references('id')
                  ->on('professionals')
                  ->onDelete('set null');
        });
    }

    public function down()
    {
        Schema::table('consulting_bookings', function (Blueprint $table) {
            $table->dropForeign(['assigned_expert_id']);
            $table->dropColumn(['assigned_expert_id', 'expert_assigned_at']);
        });
    }
}; 