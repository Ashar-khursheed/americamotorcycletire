<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use App\Models\Product;
use App\Models\ProductFitment;

try {
    // Test scenario: ADVENTURE + 2012
    $req = new \Illuminate\Http\Request(['type' => 'ADVENTURE', 'year' => '2012']);
    $controller = app(\App\Http\Controllers\Api\ProductController::class);
    $res = $controller->getFitmentOptions($req)->getData(true);
    echo "Makes for ADVENTURE + 2012: " . json_encode($res['makes']) . "\n";

    // Test scenario: Only year 2012 (no type selected)
    $req2 = new \Illuminate\Http\Request(['year' => '2012']);
    $res2 = $controller->getFitmentOptions($req2)->getData(true);
    echo "Makes for year 2012 (no type): " . json_encode($res2['makes']) . "\n";

    // Test scenario: ADVENTURE + 2012 + Honda
    $req3 = new \Illuminate\Http\Request(['type' => 'ADVENTURE', 'year' => '2012', 'make' => 'Honda']);
    $res3 = $controller->getFitmentOptions($req3)->getData(true);
    echo "Models for ADVENTURE + 2012 + Honda: " . json_encode($res3['models']) . "\n";

} catch (\Exception $e) {
    echo "DB Exception: " . $e->getMessage() . "\n";
}
