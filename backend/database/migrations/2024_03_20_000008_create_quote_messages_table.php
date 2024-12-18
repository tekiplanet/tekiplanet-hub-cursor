<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('quote_messages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('quote_id');
            $table->uuid('user_id');
            $table->text('message');
            $table->string('sender_type')->default('user'); // 'user' or 'admin'
            $table->boolean('is_read')->default(false);
            $table->timestamps();
            
            $table->foreign('quote_id')
                  ->references('id')
                  ->on('quotes')
                  ->onDelete('cascade');
                  
            $table->foreign('user_id')
                  ->references('id')
                  ->on('users')
                  ->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('quote_messages');
    }
}; 