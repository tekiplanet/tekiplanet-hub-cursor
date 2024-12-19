<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateShippingMethodsTable extends Migration
{
    // public function up()
    // {
    //     Schema::create('shipping_methods', function (Blueprint $table) {
    //         $table->id();
    //         $table->string('name');
    //         $table->string('description')->nullable();
    //         $table->decimal('base_cost', 10, 2); // Base shipping cost
    //         $table->integer('estimated_days_min');
    //         $table->integer('estimated_days_max');
    //         $table->boolean('is_active')->default(true);
    //         $table->integer('priority')->default(0);
    //         $table->timestamps();
    //     });
    // }

    // public function down()
    // {
    //     Schema::dropIfExists('shipping_methods');
    // }
} 