<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('business_profiles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained()->onDelete('cascade');
            $table->string('business_name');
            $table->string('business_email');
            $table->string('phone_number');
            $table->text('address');
            $table->string('city');
            $table->string('state');
            $table->string('country');
            $table->string('business_type');
            $table->string('registration_number')->nullable();
            $table->string('tax_number')->nullable();
            $table->string('logo')->nullable();
            $table->string('website')->nullable();
            $table->text('description');
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->boolean('is_verified')->default(false);
            $table->timestamp('verified_at')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('business_profiles');
    }
}; 