<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Support\Facades\Log;

class DownloadProductImages extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'products:download-images';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Download all remote product & variant images to local storage and update database URLs.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info("Starting download of remote product images...");

        $folderPath = public_path('storage/products');
        if (!file_exists($folderPath)) {
            mkdir($folderPath, 0777, true);
        }

        $downloadedCount = 0;
        $failedCount = 0;
        $skippedCount = 0;

        $downloadAndSave = function ($imageUrl) use ($folderPath, &$downloadedCount, &$failedCount, &$skippedCount) {
            if (empty($imageUrl)) {
                return asset('storage/products/default.jpg');
            }

            // Skip if already local path
            if (str_contains($imageUrl, '/storage/products/') && !str_starts_with($imageUrl, 'http://americamotorcycletire.com') && !str_starts_with($imageUrl, 'https://americamotorcycletire.com')) {
                $skippedCount++;
                return $imageUrl;
            }

            $hash = md5($imageUrl);
            $webpFilename = 'prod_' . $hash . '.webp';
            $webpPath = $folderPath . '/' . $webpFilename;
            $webpAssetUrl = asset('storage/products/' . $webpFilename);

            if (file_exists($webpPath) && filesize($webpPath) > 0) {
                $skippedCount++;
                return $webpAssetUrl;
            }

            $jpgFilename = 'prod_' . $hash . '.jpg';
            $jpgPath = $folderPath . '/' . $jpgFilename;
            $jpgAssetUrl = asset('storage/products/' . $jpgFilename);

            if (file_exists($jpgPath) && filesize($jpgPath) > 0) {
                $skippedCount++;
                return $jpgAssetUrl;
            }

            try {
                $context = stream_context_create([
                    'http' => [
                        'timeout' => 10,
                        'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                        'header' => "Accept: image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8\r\n"
                    ],
                    'ssl' => [
                        'verify_peer' => false,
                        'verify_peer_name' => false
                    ]
                ]);

                $rawBinary = @file_get_contents($imageUrl, false, $context);

                if (!empty($rawBinary)) {
                    // Try converting bitmap to WebP via GD
                    if (function_exists('imagecreatefromstring') && function_exists('imagewebp')) {
                        $imgRes = @imagecreatefromstring($rawBinary);
                        if ($imgRes !== false) {
                            imagealphablending($imgRes, true);
                            imagesavealpha($imgRes, true);
                            if (@imagewebp($imgRes, $webpPath, 85)) {
                                imagedestroy($imgRes);
                                $downloadedCount++;
                                return $webpAssetUrl;
                            }
                            imagedestroy($imgRes);
                        }
                    }

                    // Fallback to direct JPG save
                    file_put_contents($jpgPath, $rawBinary);
                    $downloadedCount++;
                    return $jpgAssetUrl;
                }
            } catch (\Throwable $e) {
                Log::error("Failed downloading image {$imageUrl}: " . $e->getMessage());
            }

            $failedCount++;
            return $imageUrl;
        };

        // 1. Process Products Primary & Gallery Images
        $products = Product::all();
        $this->info("Processing " . $products->count() . " Products...");

        foreach ($products as $p) {
            $updated = false;

            if (!empty($p->primary_image) && (str_starts_with($p->primary_image, 'http://') || str_starts_with($p->primary_image, 'https://'))) {
                $localPrimary = $downloadAndSave($p->primary_image);
                if ($localPrimary !== $p->primary_image) {
                    $p->primary_image = $localPrimary;
                    $updated = true;
                }
            }

            if (!empty($p->gallery_images) && is_array($p->gallery_images)) {
                $newGallery = [];
                foreach ($p->gallery_images as $gUrl) {
                    if (str_starts_with($gUrl, 'http://') || str_starts_with($gUrl, 'https://')) {
                        $localG = $downloadAndSave($gUrl);
                        $newGallery[] = $localG;
                        if ($localG !== $gUrl) $updated = true;
                    } else {
                        $newGallery[] = $gUrl;
                    }
                }
                if ($updated) {
                    $p->gallery_images = $newGallery;
                }
            }

            if ($updated) {
                $p->save();
                $this->line("  ✓ Downloaded images for Product: {$p->name} (ID: {$p->id})");
            }
        }

        // 2. Process Product Variants Images
        $variants = ProductVariant::all();
        $this->info("Processing " . $variants->count() . " Product Variants...");

        foreach ($variants as $v) {
            if (!empty($v->image_url) && (str_starts_with($v->image_url, 'http://') || str_starts_with($v->image_url, 'https://'))) {
                $localUrl = $downloadAndSave($v->image_url);
                if ($localUrl !== $v->image_url) {
                    $v->image_url = $localUrl;
                    $v->save();
                }
            }
        }

        $this->info("------------------------------------------------");
        $this->info("DOWNLOAD COMPLETE!");
        $this->info("Downloaded: {$downloadedCount} new images");
        $this->info("Skipped: {$skippedCount} (already downloaded)");
        $this->info("Failed: {$failedCount}");
        $this->info("------------------------------------------------");

        return 0;
    }
}
