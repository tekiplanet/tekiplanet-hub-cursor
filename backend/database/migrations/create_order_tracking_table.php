Schema::create('order_tracking', function (Blueprint $table) {
    $table->id();
    $table->foreignUuid('order_id')->constrained('orders')->cascadeOnDelete();
    $table->string('status')->nullable();
    $table->string('description')->nullable();
    $table->string('location')->nullable();
    $table->timestamps();
}); 