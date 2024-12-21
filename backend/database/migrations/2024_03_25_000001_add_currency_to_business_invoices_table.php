<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        // First, modify the status column to varchar temporarily
        Schema::table('business_invoices', function (Blueprint $table) {
            $table->string('status', 20)->change();
        });

        // Add the currency column
        Schema::table('business_invoices', function (Blueprint $table) {
            $table->string('currency', 3)->default('USD')->after('amount');
        });

        // Convert status back to ENUM
        DB::statement("ALTER TABLE business_invoices MODIFY status ENUM('draft', 'pending', 'sent', 'partially_paid', 'paid', 'overdue', 'cancelled') NOT NULL DEFAULT 'draft'");
    }

    public function down()
    {
        Schema::table('business_invoices', function (Blueprint $table) {
            $table->dropColumn('currency');
        });
    }
}; 