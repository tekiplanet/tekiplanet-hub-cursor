<?php

namespace Database\Migrations;

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('professionals', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained()->onDelete('cascade');
            $table->foreignUuid('category_id')->constrained('professional_categories');
            $table->string('title');
            $table->string('specialization');
            $table->json('expertise_areas')->nullable();
            $table->integer('years_of_experience');
            $table->decimal('hourly_rate', 10, 2);
            $table->enum('availability_status', ['available', 'busy', 'on_leave', 'inactive'])
                ->default('available');
            $table->text('bio')->nullable();
            $table->json('certifications')->nullable();
            $table->string('linkedin_url')->nullable();
            $table->string('github_url')->nullable();
            $table->string('portfolio_url')->nullable();
            $table->enum('preferred_contact_method', ['email', 'phone', 'whatsapp'])
                ->default('email');
            $table->string('timezone')->default('Africa/Lagos');
            $table->json('languages')->nullable();
            $table->decimal('rating', 3, 2)->nullable();
            $table->integer('total_sessions')->default(0);
            $table->enum('status', ['active', 'inactive', 'suspended'])
                ->default('active');
            $table->timestamp('verified_at')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('professionals');
    }
}; 