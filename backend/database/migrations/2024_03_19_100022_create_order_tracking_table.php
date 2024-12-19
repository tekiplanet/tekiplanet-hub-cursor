<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('order_tracking', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('order_id')->constrained()->onDelete('cascade');
            $table->string('status');
            $table->string('description');
            $table->string('location')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('order_tracking');
    }
}; 