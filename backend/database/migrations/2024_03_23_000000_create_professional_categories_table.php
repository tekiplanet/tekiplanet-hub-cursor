<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('professional_categories', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->text('description');
            $table->string('icon'); // Will store Lucide icon name
            $table->boolean('is_active')->default(true);
            $table->integer('order')->default(0);
            $table->timestamps();
        });

        // Add category_id to professionals table
        Schema::table('professionals', function (Blueprint $table) {
            $table->foreignUuid('category_id')->nullable()->constrained('professional_categories');
        });
    }

    public function down()
    {
        Schema::table('professionals', function (Blueprint $table) {
            $table->dropForeign(['category_id']);
            $table->dropColumn('category_id');
        });
        
        Schema::dropIfExists('professional_categories');
    }
}; 