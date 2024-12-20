<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('hustle_applications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('hustle_id')->constrained()->onDelete('cascade');
            $table->foreignUuid('professional_id')->constrained();
            $table->enum('status', ['pending', 'approved', 'rejected', 'withdrawn'])->default('pending');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('hustle_applications');
    }
}; 