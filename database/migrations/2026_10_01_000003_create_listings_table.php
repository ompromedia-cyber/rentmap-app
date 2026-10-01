<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\DB;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('listings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('category_id')->constrained('categories')->restrictOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->decimal('price', 12, 2);
            $table->char('currency', 3)->default('VND');
            $table->enum('price_period', ['hour', 'day', 'week', 'month']);
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);
            $table->point('location', 4326)->nullable();
            $table->enum('status', ['draft', 'active', 'rented', 'archived'])->default('active');
            $table->timestamps();
            $table->index(['category_id', 'status']);
            $table->index('price');
            $table->spatialIndex('location');
        });

        DB::statement('CREATE TRIGGER listings_location_before_insert BEFORE INSERT ON listings FOR EACH ROW SET NEW.location = ST_SRID(POINT(NEW.longitude, NEW.latitude), 4326)');
        DB::statement('CREATE TRIGGER listings_location_before_update BEFORE UPDATE ON listings FOR EACH ROW SET NEW.location = ST_SRID(POINT(NEW.longitude, NEW.latitude), 4326)');
    }

    public function down(): void
    {
        DB::statement('DROP TRIGGER IF EXISTS listings_location_before_insert');
        DB::statement('DROP TRIGGER IF EXISTS listings_location_before_update');
        Schema::dropIfExists('listings');
    }
};
