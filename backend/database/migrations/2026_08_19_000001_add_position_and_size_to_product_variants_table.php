<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('product_variants', function (Blueprint $table) {
            if (!Schema::hasColumn('product_variants', 'position')) {
                $table->string('position')->nullable()->after('name');
            }
            if (!Schema::hasColumn('product_variants', 'tire_size')) {
                $table->string('tire_size')->nullable()->after('position');
            }
            if (!Schema::hasColumn('product_variants', 'item_number')) {
                $table->string('item_number')->nullable()->after('tire_size');
            }
            if (!Schema::hasColumn('product_variants', 'store_sku')) {
                $table->string('store_sku')->nullable()->after('item_number');
            }
            if (!Schema::hasColumn('product_variants', 'mfr_part_number')) {
                $table->string('mfr_part_number')->nullable()->after('store_sku');
            }
        });
    }

    public function down(): void
    {
        Schema::table('product_variants', function (Blueprint $table) {
            $table->dropColumn([
                'position',
                'tire_size',
                'item_number',
                'store_sku',
                'mfr_part_number',
            ]);
        });
    }
};
