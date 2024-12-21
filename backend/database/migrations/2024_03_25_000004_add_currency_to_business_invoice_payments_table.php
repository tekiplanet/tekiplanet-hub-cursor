<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        Schema::table('business_invoice_payments', function (Blueprint $table) {
            $table->string('currency', 3)->default('NGN')->after('amount');
        });

        // Update existing payments to use their invoice's currency
        DB::statement('
            UPDATE business_invoice_payments p
            INNER JOIN business_invoices i ON p.invoice_id = i.id
            SET p.currency = i.currency
            WHERE p.currency IS NULL
        ');
    }

    public function down()
    {
        Schema::table('business_invoice_payments', function (Blueprint $table) {
            $table->dropColumn('currency');
        });
    }
}; 