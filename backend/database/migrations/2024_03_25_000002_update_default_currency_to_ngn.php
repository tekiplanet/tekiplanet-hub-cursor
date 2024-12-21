<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        Schema::table('business_invoices', function (Blueprint $table) {
            $table->string('currency', 3)->default('NGN')->change();
        });

        DB::table('business_invoices')
            ->whereNull('currency')
            ->update(['currency' => 'NGN']);
    }

    public function down()
    {
        Schema::table('business_invoices', function (Blueprint $table) {
            $table->string('currency', 3)->default('USD')->change();
        });
    }
}; 