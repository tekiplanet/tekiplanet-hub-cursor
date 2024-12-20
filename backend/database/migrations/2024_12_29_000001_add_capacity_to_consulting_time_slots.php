<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('consulting_time_slots', function (Blueprint $table) {
            $table->integer('capacity')->default(1)->after('is_booked');
            $table->integer('booked_slots')->default(0)->after('capacity');
            // Remove the is_booked column since we'll determine availability based on capacity
            $table->dropColumn('is_booked');
        });
    }

    public function down()
    {
        Schema::table('consulting_time_slots', function (Blueprint $table) {
            $table->boolean('is_booked')->default(false);
            $table->dropColumn(['capacity', 'booked_slots']);
        });
    }
}; 