<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('listing_views', function (Blueprint $table) {
            $table->id();
            $table->foreignId('listing_id')->constrained('listings')->cascadeOnDelete();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->ipAddress('ip_address')->nullable();
            $table->timestamp('viewed_at')->useCurrent();
            $table->index(['listing_id', 'viewed_at']);
            $table->index(['user_id', 'viewed_at']);
        });
    }

    public function down(): void { Schema::dropIfExists('listing_views'); }
};
