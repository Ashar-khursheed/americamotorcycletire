<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            if (!Schema::hasColumn('products', 'vehicle_type')) {
                $table->string('vehicle_type')->nullable()->after('brand');
            }
            if (!Schema::hasColumn('products', 'product_type')) {
                $table->string('product_type')->nullable()->after('vehicle_type');
            }
            if (!Schema::hasColumn('products', 'compatible_makes')) {
                $table->text('compatible_makes')->nullable()->after('product_type');
            }
            if (!Schema::hasColumn('products', 'compatible_models')) {
                $table->text('compatible_models')->nullable()->after('compatible_makes');
            }
            if (!Schema::hasColumn('products', 'fitment_year_range')) {
                $table->string('fitment_year_range')->nullable()->after('compatible_models');
            }
            if (!Schema::hasColumn('products', 'item_number')) {
                $table->string('item_number')->nullable()->after('fitment_year_range');
            }
            if (!Schema::hasColumn('products', 'was_price')) {
                $table->decimal('was_price', 10, 2)->nullable()->after('price');
            }
            if (!Schema::hasColumn('products', 'savings')) {
                $table->string('savings')->nullable()->after('was_price');
            }
            if (!Schema::hasColumn('products', 'rating')) {
                $table->decimal('rating', 3, 2)->default(0.00)->after('savings');
            }
            if (!Schema::hasColumn('products', 'review_count')) {
                $table->integer('review_count')->default(0)->after('rating');
            }
            if (!Schema::hasColumn('products', 'front_tire_fitment')) {
                $table->string('front_tire_fitment')->nullable()->after('review_count');
            }
            if (!Schema::hasColumn('products', 'rear_tire_fitment')) {
                $table->string('rear_tire_fitment')->nullable()->after('front_tire_fitment');
            }
            if (!Schema::hasColumn('products', 'wheel_locations')) {
                $table->string('wheel_locations')->nullable()->after('rear_tire_fitment');
            }
            if (!Schema::hasColumn('products', 'available_sizes_count')) {
                $table->integer('available_sizes_count')->default(0)->after('wheel_locations');
            }
            if (!Schema::hasColumn('products', 'available_sizes')) {
                $table->text('available_sizes')->nullable()->after('available_sizes_count');
            }
            if (!Schema::hasColumn('products', 'total_part_numbers')) {
                $table->integer('total_part_numbers')->default(0)->after('available_sizes');
            }
            if (!Schema::hasColumn('products', 'specs_and_features')) {
                $table->longText('specs_and_features')->nullable()->after('description');
            }
            if (!Schema::hasColumn('products', 'fitment_vehicle')) {
                $table->string('fitment_vehicle')->nullable()->after('specs_and_features');
            }
            if (!Schema::hasColumn('products', 'fitment_disclaimer')) {
                $table->text('fitment_disclaimer')->nullable()->after('fitment_vehicle');
            }
            if (!Schema::hasColumn('products', 'source_url')) {
                $table->string('source_url')->nullable()->after('canonical_url');
            }
        });

        Schema::table('product_fitments', function (Blueprint $table) {
            if (!Schema::hasColumn('product_fitments', 'tire_size')) {
                $table->string('tire_size')->nullable()->after('position');
            }
            if (!Schema::hasColumn('product_fitments', 'sku_number')) {
                $table->string('sku_number')->nullable()->after('tire_size');
            }
            if (!Schema::hasColumn('product_fitments', 'item_number')) {
                $table->string('item_number')->nullable()->after('sku_number');
            }
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn([
                'vehicle_type',
                'product_type',
                'compatible_makes',
                'compatible_models',
                'fitment_year_range',
                'item_number',
                'was_price',
                'savings',
                'rating',
                'review_count',
                'front_tire_fitment',
                'rear_tire_fitment',
                'wheel_locations',
                'available_sizes_count',
                'available_sizes',
                'total_part_numbers',
                'specs_and_features',
                'fitment_vehicle',
                'fitment_disclaimer',
                'source_url',
            ]);
        });

        Schema::table('product_fitments', function (Blueprint $table) {
            $table->dropColumn([
                'tire_size',
                'sku_number',
                'item_number',
            ]);
        });
    }
};
