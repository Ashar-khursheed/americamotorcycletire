<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Product;

echo "Fixing null gallery_images in database...\n";

$products = Product::all();
$updated = 0;

foreach ($products as $p) {
    $rawGallery = $p->getRawOriginal('gallery_images');
    $primary = $p->getRawOriginal('primary_image');

    $galleryList = [];
    if (!empty($rawGallery)) {
        $decoded = json_decode($rawGallery, true);
        if (is_array($decoded)) {
            $galleryList = $decoded;
        }
    }

    if (empty($galleryList) && !empty($primary)) {
        $galleryList = [$primary];
    }

    if (!empty($galleryList)) {
        $p->gallery_images = $galleryList;
        $p->save();
        $updated++;
    }
}

echo "Successfully updated {$updated} products with populated gallery_images JSON!\n";
