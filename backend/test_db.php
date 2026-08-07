<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use App\Models\Product;
use App\Models\ProductFitment;

try {
    $count = Product::count();
    $fitmentCount = ProductFitment::count();
    echo "DB Connected! Total Products: {$count}, Total Fitments: {$fitmentCount}\n";
} catch (\Exception $e) {
    echo "DB Exception: " . $e->getMessage() . "\n";
}
