<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$controller = new App\Http\Controllers\Api\AdminProductController(new App\Services\ProductFilterService());
$response = $controller->export();

file_put_contents(__DIR__ . '/../all_products_live_export.csv', $response->getContent());
echo "Successfully exported " . strlen($response->getContent()) . " bytes to all_products_live_export.csv\n";
