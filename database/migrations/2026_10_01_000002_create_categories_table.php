<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\DB;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 50)->unique();
            $table->string('name', 100);
            $table->string('icon', 20)->nullable();
            $table->timestamps();
        });

        DB::table('categories')->insert([
            ['slug' => 'housing', 'name' => 'Жильё', 'icon' => '🏠', 'created_at' => now(), 'updated_at' => now()],
            ['slug' => 'scooter', 'name' => 'Скутеры', 'icon' => '🛵', 'created_at' => now(), 'updated_at' => now()],
            ['slug' => 'motorcycle', 'name' => 'Мотоциклы', 'icon' => '🏍️', 'created_at' => now(), 'updated_at' => now()],
            ['slug' => 'car', 'name' => 'Авто', 'icon' => '🚗', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    public function down(): void { Schema::dropIfExists('categories'); }
};
