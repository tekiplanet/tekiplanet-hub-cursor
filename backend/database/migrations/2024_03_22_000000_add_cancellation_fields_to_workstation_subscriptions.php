<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('workstation_subscriptions', function (Blueprint $table) {
            // $table->string('cancellation_reason')->nullable();
            $table->text('cancellation_feedback')->nullable();
            // $table->timestamp('cancelled_at')->nullable();
        });
    }

    public function down()
    {
        Schema::table('workstation_subscriptions', function (Blueprint $table) {
            $table->dropColumn(['cancellation_feedback']);
            // $table->dropColumn(['cancellation_reason', 'cancellation_feedback', 'cancelled_at']);
        });
    }
}; 