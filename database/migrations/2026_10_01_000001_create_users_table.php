<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('telegram_id')->unique();
            $table->string('username', 100)->nullable();
            $table->string('first_name', 100)->nullable();
            $table->string('last_name', 100)->nullable();
            $table->text('photo_url')->nullable();
            $table->enum('role', ['tenant', 'landlord', 'admin'])->default('tenant');
            $table->timestamps();
        });
    }

    public function down(): void { Schema::dropIfExists('users'); }
};
