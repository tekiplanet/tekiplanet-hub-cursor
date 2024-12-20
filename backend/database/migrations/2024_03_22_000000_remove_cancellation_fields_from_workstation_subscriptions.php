<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('workstation_subscriptions', function (Blueprint $table) {
            $table->dropColumn([
                'cancelled_at',
                'cancellation_reason',
                'cancellation_feedback'
            ]);
        });
    }

    public function down()
    {
        Schema::table('workstation_subscriptions', function (Blueprint $table) {
            $table->timestamp('cancelled_at')->nullable();
            $table->string('cancellation_reason')->nullable();
            $table->text('cancellation_feedback')->nullable();
        });
    }
}; 