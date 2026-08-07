<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Product;

$total = Product::count();
$nullGallery = Product::whereNull('gallery_images')->orWhere('gallery_images', '')->orWhere('gallery_images', '[]')->orWhere('gallery_images', 'null')->count();
$hasPrimary = Product::whereNotNull('primary_image')->where('primary_image', '!=', '')->count();

echo "Total Products: {$total}\n";
echo "Products with Null/Empty gallery_images: {$nullGallery}\n";
echo "Products with primary_image: {$hasPrimary}\n";

$sample = Product::whereNotNull('primary_image')->first();
if ($sample) {
    echo "Sample Product ID: {$sample->id}\n";
    echo "Primary Image: {$sample->primary_image}\n";
    echo "Gallery Images: " . json_encode($sample->gallery_images) . "\n";
}
