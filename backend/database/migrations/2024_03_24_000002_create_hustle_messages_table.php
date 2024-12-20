<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('hustle_messages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('hustle_id')->constrained()->onDelete('cascade');
            $table->foreignUuid('user_id')->constrained();
            $table->text('message');
            $table->enum('sender_type', ['admin', 'professional']);
            $table->boolean('is_read')->default(false);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('hustle_messages');
    }
}; 