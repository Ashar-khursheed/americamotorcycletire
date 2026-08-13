<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Product;

echo "Distinct vehicle_type values in products table:\n";
print_r(Product::distinct()->pluck('vehicle_type')->toArray());

echo "\nDistinct product_type values in products table (first 20):\n";
print_r(Product::distinct()->pluck('product_type')->take(20)->toArray());
