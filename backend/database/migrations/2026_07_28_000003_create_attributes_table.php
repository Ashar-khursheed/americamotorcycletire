<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attributes', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g. "Tyre Size", "Speed Rating", "Rim Size", "Color"
            $table->string('slug')->unique(); // e.g. "tyre_size", "speed_rating"
            $table->enum('type', ['select', 'multiselect', 'range', 'color', 'text'])->default('select');
            $table->boolean('is_filterable')->default(true);
            $table->boolean('is_required')->default(false);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attributes');
    }
};
