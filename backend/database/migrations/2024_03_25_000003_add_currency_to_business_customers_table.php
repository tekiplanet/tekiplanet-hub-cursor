<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        Schema::table('business_customers', function (Blueprint $table) {
            $table->string('currency', 3)->default('NGN')->after('country');
        });

        // Update existing customers to use NGN as their currency
        DB::table('business_customers')
            ->whereNull('currency')
            ->update(['currency' => 'NGN']);
    }

    public function down()
    {
        Schema::table('business_customers', function (Blueprint $table) {
            $table->dropColumn('currency');
        });
    }
}; 