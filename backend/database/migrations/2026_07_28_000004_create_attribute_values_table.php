<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attribute_values', function (Blueprint $table) {
            $table->id();
            $table->foreignId('attribute_id')->constrained('attributes')->onDelete('cascade');
            $table->string('value'); // Raw value e.g. "180/55ZR17" or "#FF0000"
            $table->string('label')->nullable(); // Display label e.g. "180/55 ZR17 Rear"
            $table->string('meta')->nullable(); // Color hex or additional meta string
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->index(['attribute_id', 'value']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attribute_values');
    }
};
