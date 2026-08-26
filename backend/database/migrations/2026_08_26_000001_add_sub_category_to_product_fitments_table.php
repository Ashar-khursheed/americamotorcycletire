<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('product_fitments', function (Blueprint $table) {
            if (!Schema::hasColumn('product_fitments', 'sub_category')) {
                $table->string('sub_category')->nullable()->after('model');
            }
        });

        Schema::table('products', function (Blueprint $table) {
            if (!Schema::hasColumn('products', 'sub_category')) {
                $table->string('sub_category')->nullable()->after('product_type');
            }
        });
    }

    public function down(): void
    {
        Schema::table('product_fitments', function (Blueprint $table) {
            if (Schema::hasColumn('product_fitments', 'sub_category')) {
                $table->dropColumn('sub_category');
            }
        });

        Schema::table('products', function (Blueprint $table) {
            if (Schema::hasColumn('products', 'sub_category')) {
                $table->dropColumn('sub_category');
            }
        });
    }
};
