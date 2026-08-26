<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attribute;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductFitment;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class AdminProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with(['category', 'fitments', 'variants']);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%")
                  ->orWhere('brand', 'like', "%{$search}%");
            });
        }

        $sort = $request->input('sort', 'latest');
        switch ($sort) {
            case 'id_desc':
                $query->orderBy('id', 'desc');
                break;
            case 'id_asc':
                $query->orderBy('id', 'asc');
                break;
            case 'created_desc':
                $query->orderBy('created_at', 'desc')->orderBy('id', 'desc');
                break;
            case 'created_asc':
                $query->orderBy('created_at', 'asc')->orderBy('id', 'asc');
                break;
            case 'name_asc':
                $query->orderBy('name', 'asc');
                break;
            case 'name_desc':
                $query->orderBy('name', 'desc');
                break;
            case 'price_asc':
                $query->orderBy('price', 'asc');
                break;
            case 'price_desc':
                $query->orderBy('price', 'desc');
                break;
            case 'latest':
            case 'updated_desc':
            default:
                $query->orderBy('updated_at', 'desc')->orderBy('id', 'desc');
                break;
        }

        $perPage = (int) $request->input('per_page', 50);
        $products = $query->paginate($perPage);

        return response()->json([
            'status' => 'success',
            'data' => $products,
        ]);
    }

    public function show($id)
    {
        $product = Product::with(['category', 'fitments', 'variants'])->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data' => $product,
        ]);
    }

    private function makeUniqueSlug($slugInput, $ignoreId = null)
    {
        return Product::generateUniqueSlug($slugInput, $ignoreId);
    }

    private function downloadAndStoreImage($imageUrl)
    {
        if (empty($imageUrl)) {
            return asset('storage/products/default.jpg');
        }

        $imageUrl = trim($imageUrl, " \t\n\r\0\x0B\"'");

        if (empty($imageUrl)) {
            return asset('storage/products/default.jpg');
        }

        try {
            // Target the real physical storage directory (storage/app/public/products)
            $storageDir = storage_path('app/public/products');
            if (!file_exists($storageDir)) {
                @mkdir($storageDir, 0755, true);
            }

            // If URL points to local storage, verify physical file existence on disk
            if (str_contains($imageUrl, '/storage/products/')) {
                $filename = basename(parse_url($imageUrl, PHP_URL_PATH));
                if (!empty($filename)) {
                    $localPath = $storageDir . '/' . $filename;
                    if (file_exists($localPath) && filesize($localPath) > 0) {
                        return asset('storage/products/' . $filename);
                    }
                }
            }

            $hash = md5($imageUrl);
            $webpFilename = 'prod_' . $hash . '.webp';
            $jpgFilename = 'prod_' . $hash . '.jpg';

            $storageWebpPath = $storageDir . '/' . $webpFilename;
            $storageJpgPath = $storageDir . '/' . $jpgFilename;

            $webpAssetUrl = asset('storage/products/' . $webpFilename);
            $jpgAssetUrl = asset('storage/products/' . $jpgFilename);

            if (file_exists($storageWebpPath) && filesize($storageWebpPath) > 0) {
                return $webpAssetUrl;
            }

            if (file_exists($storageJpgPath) && filesize($storageJpgPath) > 0) {
                return $jpgAssetUrl;
            }

            $rawBinary = null;

            if (str_starts_with($imageUrl, '//')) {
                $imageUrl = 'https:' . $imageUrl;
            }

            $parsedHost = parse_url($imageUrl, PHP_URL_HOST);
            $referer = !empty($parsedHost) ? (str_starts_with($imageUrl, 'https') ? 'https://' : 'http://') . $parsedHost . '/' : 'https://www.cyclegear.com/';

            if (str_starts_with($imageUrl, 'data:image/')) {
                $parts = explode(',', $imageUrl, 2);
                if (count($parts) === 2) {
                    $rawBinary = base64_decode($parts[1]);
                }
            } else if (str_starts_with($imageUrl, 'http://') || str_starts_with($imageUrl, 'https://')) {
                if (function_exists('curl_init')) {
                    $ch = curl_init();
                    curl_setopt_array($ch, [
                        CURLOPT_URL => $imageUrl,
                        CURLOPT_RETURNTRANSFER => true,
                        CURLOPT_FOLLOWLOCATION => true,
                        CURLOPT_MAXREDIRS => 5,
                        CURLOPT_CONNECTTIMEOUT => 3,
                        CURLOPT_TIMEOUT => 8,
                        CURLOPT_SSL_VERIFYPEER => false,
                        CURLOPT_SSL_VERIFYHOST => false,
                        CURLOPT_REFERER => $referer,
                        CURLOPT_USERAGENT => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                        CURLOPT_HTTPHEADER => [
                            'Accept: image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
                            'Accept-Language: en-US,en;q=0.9',
                            'Cache-Control: no-cache',
                        ],
                    ]);
                    $rawBinary = curl_exec($ch);
                    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                    curl_close($ch);

                    if ($httpCode !== 200 || empty($rawBinary)) {
                        $rawBinary = null;
                    }
                }

                if (empty($rawBinary)) {
                    $context = stream_context_create([
                        'http' => [
                            'timeout' => 4,
                            'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                            'header' => "Accept: image/webp,image/*\r\nReferer: {$referer}\r\n"
                        ],
                        'ssl' => ['verify_peer' => false, 'verify_peer_name' => false]
                    ]);
                    $rawBinary = @file_get_contents($imageUrl, false, $context);
                }
            }

            if (!empty($rawBinary)) {
                // 1. Try converting bitmap to WebP via GD
                if (function_exists('imagecreatefromstring') && function_exists('imagewebp')) {
                    $imgRes = @imagecreatefromstring($rawBinary);
                    if ($imgRes !== false) {
                        imagealphablending($imgRes, true);
                        imagesavealpha($imgRes, true);
                        if (@imagewebp($imgRes, $storageWebpPath, 85)) {
                            @chmod($storageWebpPath, 0644);
                            imagedestroy($imgRes);
                            return $webpAssetUrl;
                        }
                        imagedestroy($imgRes);
                    }
                }

                // 2. Fallback JPG save
                @file_put_contents($storageJpgPath, $rawBinary);
                @chmod($storageJpgPath, 0644);
                return $jpgAssetUrl;
            }
        } catch (\Throwable $e) {
            Log::error("Failed to store product image: " . $e->getMessage());
        }

        return $imageUrl;
    }

    private function processGalleryImages($galleryImages)
    {
        if (empty($galleryImages)) {
            return [];
        }

        $rawItems = [];
        if (is_array($galleryImages)) {
            $rawItems = $galleryImages;
        } else if (is_string($galleryImages)) {
            $decoded = json_decode($galleryImages, true);
            if (is_array($decoded)) {
                $rawItems = $decoded;
            } else {
                $rawItems = [$galleryImages];
            }
        }

        $urls = [];
        foreach ($rawItems as $item) {
            if (empty($item)) continue;
            if (is_string($item)) {
                // Split any string containing semicolons, commas, or newlines
                $split = preg_split('/[,;\n]+/', $item);
                foreach ($split as $u) {
                    $u = trim($u, " \t\n\r\0\x0B\"'");
                    if (!empty($u)) {
                        $urls[] = $u;
                    }
                }
            }
        }

        $urls = array_values(array_unique($urls));
        $processed = [];
        foreach ($urls as $img) {
            $stored = $this->downloadAndStoreImage($img);
            if (!empty($stored)) {
                $processed[] = $stored;
            }
        }
        return array_values(array_unique($processed));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'sku' => 'nullable|string',
            'category_id' => 'nullable',
            'brand' => 'nullable|string',
            'stock_quantity' => 'nullable|integer',
            'description' => 'nullable|string',
            'primary_image' => 'nullable|string',
            'gallery_images' => 'nullable|array',
            'fitments' => 'nullable|array',
        ]);

        $sku = !empty($validated['sku']) ? $validated['sku'] : 'SKU-' . strtoupper(Str::random(8));
        $galleryImages = $this->processGalleryImages($request->input('gallery_images', []));
        
        $primaryImage = !empty($validated['primary_image'])
            ? $this->downloadAndStoreImage($validated['primary_image'])
            : ($galleryImages[0] ?? asset('storage/products/default.jpg'));

        if (!empty($primaryImage) && !in_array($primaryImage, $galleryImages)) {
            array_unshift($galleryImages, $primaryImage);
        }

        $slugInput = $request->input('slug');
        $slug = $this->makeUniqueSlug(!empty($slugInput) ? $slugInput : $validated['name']);

        $product = Product::create([
            'name' => $validated['name'],
            'slug' => $slug,
            'sku' => $sku,
            'price' => $validated['price'],
            'was_price' => $request->input('was_price', $validated['price']),
            'compare_at_price' => $request->input('was_price', $validated['price']),
            'category_id' => $validated['category_id'] ?? null,
            'brand' => $validated['brand'] ?? 'BMG',
            'stock_quantity' => $validated['stock_quantity'] ?? 25,
            'description' => $validated['description'] ?? null,
            'primary_image' => $primaryImage,
            'gallery_images' => $galleryImages,
            'vehicle_type' => $request->input('vehicle_type'),
            'product_type' => $request->input('product_type'),
            'item_number' => $request->input('item_number'),
            'compatible_makes' => $request->input('compatible_makes'),
            'compatible_models' => $request->input('compatible_models'),
            'fitment_year_range' => $request->input('fitment_year_range'),
            'specs_and_features' => $request->input('specs_and_features'),
            'front_tire_fitment' => $request->input('front_tire_fitment'),
            'rear_tire_fitment' => $request->input('rear_tire_fitment'),
            'wheel_locations' => $request->input('wheel_locations'),
            'available_sizes' => $request->input('available_sizes'),
            'custom_attributes' => $request->input('custom_attributes', []),
            'meta_title' => $request->input('meta_title'),
            'meta_description' => $request->input('meta_description'),
            'meta_keywords' => $request->input('meta_keywords'),
            'canonical_url' => $request->input('canonical_url'),
            'is_active' => true,
        ]);

        $fitments = $request->input('fitments', []);
        if (is_array($fitments) && count($fitments) > 0) {
            $seenFitments = [];
            foreach ($fitments as $fit) {
                $y = trim($fit['year'] ?? '');
                $m = trim($fit['make'] ?? '');
                $md = trim($fit['model'] ?? '');
                $p = trim($fit['position'] ?? '');
                if (str_contains(strtolower($p), 'position (e.g.')) {
                    $p = '';
                }

                if (!empty($y) || !empty($m) || !empty($md)) {
                    $key = strtolower("{$y}|{$m}|{$md}|{$p}");
                    if (isset($seenFitments[$key])) {
                        continue;
                    }
                    $seenFitments[$key] = true;

                    $subCat = trim($fit['sub_category'] ?? '');
                    if (empty($subCat) && !empty($m) && !empty($md)) {
                        $subCat = ProductController::getModelSubCategory($m, $md);
                    }

                    ProductFitment::create([
                        'product_id' => $product->id,
                        'year' => $y ?: null,
                        'make' => $m ?: null,
                        'model' => $md ?: null,
                        'sub_category' => $subCat ?: null,
                        'position' => $p ?: null,
                        'vendor_part_number' => $fit['vendor_part_number'] ?? null,
                        'notes' => $fit['notes'] ?? null,
                    ]);
                }
            }
        }

        $variants = $request->input('variants', $request->input('product_variants', []));
        if (is_array($variants) && count($variants) > 0) {
            foreach ($variants as $idx => $v) {
                $vStyle = trim($v['name'] ?? $v['style'] ?? '');
                $vPos = trim($v['position'] ?? 'Universal');
                $vSize = trim($v['tire_size'] ?? $v['size'] ?? '');
                $vPrice = (float)($v['price'] ?? $validated['price']);
                $vSku = trim($v['sku'] ?? ($sku . '-VAR-' . ($idx + 1)));

                ProductVariant::create([
                    'product_id' => $product->id,
                    'sku' => $vSku,
                    'name' => $vStyle ?: "{$vPos} {$vSize}",
                    'position' => $vPos,
                    'tire_size' => $vSize,
                    'item_number' => $v['item_number'] ?? null,
                    'store_sku' => $v['store_sku'] ?? null,
                    'mfr_part_number' => $v['mfr_part_number'] ?? null,
                    'price' => $vPrice,
                    'compare_at_price' => isset($v['compare_at_price']) ? (float)$v['compare_at_price'] : null,
                    'stock_quantity' => isset($v['stock_quantity']) ? (int)$v['stock_quantity'] : 25,
                    'is_active' => true,
                ]);
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Product created with gallery images, fitments, and options successfully!',
            'data' => $product->load(['fitments', 'variants']),
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $name = $request->input('name', $product->name);
        $price = $request->input('price', $product->price);
        $brand = $request->input('brand', $product->brand);
        $stock = $request->input('stock_quantity', $product->stock_quantity);
        $description = $request->input('description', $product->description);
        $rawImage = $request->input('primary_image');

        if ($request->has('gallery_images')) {
            $galleryImages = $this->processGalleryImages($request->input('gallery_images', []));
        } else {
            $galleryImages = $product->gallery_images ?? [];
        }

        $primaryImage = $product->primary_image;
        if (!empty($rawImage) && $rawImage !== $product->primary_image) {
            $primaryImage = $this->downloadAndStoreImage($rawImage);
        } else if (!empty($galleryImages[0])) {
            $primaryImage = $galleryImages[0];
        }

        if (!empty($primaryImage) && !in_array($primaryImage, $galleryImages)) {
            array_unshift($galleryImages, $primaryImage);
        }

        $updateData = [
            'name' => $name,
            'price' => $price,
            'brand' => $brand,
            'stock_quantity' => $stock,
            'description' => $description,
            'primary_image' => $primaryImage,
            'gallery_images' => $galleryImages,
            'custom_attributes' => $request->has('custom_attributes') ? $request->input('custom_attributes') : $product->custom_attributes,
        ];

        foreach (['vehicle_type', 'product_type', 'item_number', 'compatible_makes', 'compatible_models', 'fitment_year_range', 'specs_and_features', 'was_price', 'front_tire_fitment', 'rear_tire_fitment', 'wheel_locations', 'available_sizes'] as $f) {
            if ($request->has($f)) {
                $updateData[$f] = $request->input($f);
            }
        }

        if ($request->has('slug') && !empty($request->input('slug'))) {
            $updateData['slug'] = $this->makeUniqueSlug($request->input('slug'), $product->id);
        }
        if ($request->has('meta_title')) {
            $updateData['meta_title'] = $request->input('meta_title');
        }
        if ($request->has('meta_description')) {
            $updateData['meta_description'] = $request->input('meta_description');
        }
        if ($request->has('meta_keywords')) {
            $updateData['meta_keywords'] = $request->input('meta_keywords');
        }
        if ($request->has('canonical_url')) {
            $updateData['canonical_url'] = $request->input('canonical_url');
        }

        $product->update($updateData);

        if ($request->has('fitments')) {
            $fitments = $request->input('fitments');
            if (is_array($fitments)) {
                ProductFitment::where('product_id', $product->id)->delete();
                $seenFitments = [];

                foreach ($fitments as $fit) {
                    $y = trim($fit['year'] ?? '');
                    $m = trim($fit['make'] ?? '');
                    $md = trim($fit['model'] ?? '');
                    $p = trim($fit['position'] ?? '');
                    if (str_contains(strtolower($p), 'position (e.g.')) {
                        $p = '';
                    }

                    if (!empty($y) || !empty($m) || !empty($md)) {
                        $key = strtolower("{$y}|{$m}|{$md}|{$p}");
                        if (isset($seenFitments[$key])) {
                            continue;
                        }
                        $seenFitments[$key] = true;

                        $subCat = trim($fit['sub_category'] ?? '');
                        if (empty($subCat) && !empty($m) && !empty($md)) {
                            $subCat = ProductController::getModelSubCategory($m, $md);
                        }

                        ProductFitment::create([
                            'product_id' => $product->id,
                            'year' => $y ?: null,
                            'make' => $m ?: null,
                            'model' => $md ?: null,
                            'sub_category' => $subCat ?: null,
                            'position' => $p ?: null,
                            'vendor_part_number' => $fit['vendor_part_number'] ?? null,
                            'notes' => $fit['notes'] ?? null,
                        ]);
                    }
                }
            }
        }

        if ($request->has('variants') || $request->has('product_variants')) {
            $variants = $request->input('variants', $request->input('product_variants', []));
            if (is_array($variants)) {
                ProductVariant::where('product_id', $product->id)->delete();
                foreach ($variants as $idx => $v) {
                    $vStyle = trim($v['name'] ?? $v['style'] ?? '');
                    $vPos = trim($v['position'] ?? 'Universal');
                    $vSize = trim($v['tire_size'] ?? $v['size'] ?? '');
                    $vPrice = (float)($v['price'] ?? $product->price);
                    $vSku = trim($v['sku'] ?? ($product->sku . '-VAR-' . ($idx + 1)));

                    ProductVariant::create([
                        'product_id' => $product->id,
                        'sku' => $vSku,
                        'name' => $vStyle ?: "{$vPos} {$vSize}",
                        'position' => $vPos,
                        'tire_size' => $vSize,
                        'item_number' => $v['item_number'] ?? null,
                        'store_sku' => $v['store_sku'] ?? null,
                        'mfr_part_number' => $v['mfr_part_number'] ?? null,
                        'price' => $vPrice,
                        'compare_at_price' => isset($v['compare_at_price']) ? (float)$v['compare_at_price'] : null,
                        'stock_quantity' => isset($v['stock_quantity']) ? (int)$v['stock_quantity'] : 25,
                        'is_active' => true,
                    ]);
                }
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Product, options, and fitment specs updated successfully!',
            'data' => $product->load(['fitments', 'variants']),
        ]);
    }

    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        ProductFitment::where('product_id', $product->id)->delete();
        $product->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Product deleted successfully!',
        ]);
    }

    public function toggleStatus($id)
    {
        $product = Product::findOrFail($id);
        $product->is_active = !$product->is_active;
        $product->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Product status updated to ' . ($product->is_active ? 'Published' : 'Draft'),
            'data' => $product,
        ]);
    }

    public function import(Request $request)
    {
        @set_time_limit(300);
        @ini_set('memory_limit', '512M');

        $rows = [];

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $path = $file->getRealPath();

            if (($handle = fopen($path, 'r')) !== false) {
                $header = fgetcsv($handle, 4000, ',');
                if ($header) {
                    $header = array_map(function($h) {
                        return trim(preg_replace('/[\x00-\x1F\x7F\xEF\xBB\xBF]/', '', $h));
                    }, $header);

                    while (($data = fgetcsv($handle, 4000, ',')) !== false) {
                        if (count($header) == count($data)) {
                            $rows[] = array_combine($header, $data);
                        } else if (count($data) > 0) {
                            $rowObj = [];
                            foreach ($header as $idx => $colName) {
                                $rowObj[$colName] = $data[$idx] ?? '';
                            }
                            $rows[] = $rowObj;
                        }
                    }
                }
                fclose($handle);
            }
        }
        else if ($request->has('rows') && is_array($request->input('rows'))) {
            $rows = $request->input('rows');
        }

        if (empty($rows)) {
            return response()->json([
                'status' => 'error',
                'message' => 'No valid CSV file or data rows were provided.',
            ], 400);
        }

        $createdCount = 0;
        $updatedCount = 0;
        $failedCount = 0;

        foreach ($rows as $row) {
            try {
                $sku = $row['SKU Number'] ?? $row['Part Number'] ?? $row['sku'] ?? $row['SKU'] ?? $row['Item Number'] ?? $row['item_number'] ?? null;
                $name = $row['Product Name'] ?? $row['name'] ?? $row['Title'] ?? 'Motorcycle Component';

                if (empty($sku)) {
                    $sku = 'SKU-' . strtoupper(Str::slug(substr($name, 0, 10))) . '-' . rand(100, 999);
                }

                // Case-Insensitive Category Auto-Create or Match
                $categoryName = $row['Category'] ?? $row['category'] ?? $row['Category Name'] ?? 'Tires';
                $categoryId = null;
                if (!empty($categoryName)) {
                    $catTrim = trim($categoryName);
                    $catObj = Category::whereRaw('LOWER(name) = ?', [strtolower($catTrim)])->first();
                    if (!$catObj) {
                        $catObj = Category::create([
                            'name' => ucfirst($catTrim),
                            'slug' => Str::slug($catTrim),
                            'is_active' => true,
                        ]);
                    }
                    $categoryId = $catObj->id;
                }

                // Case-Insensitive Brand Auto-Create or Match
                $brandName = $row['Brand'] ?? $row['brand'] ?? $row['Brand Name'] ?? 'BMG';
                $brand = 'BMG';
                if (!empty($brandName)) {
                    $brandTrim = trim($brandName);
                    $brandObj = Brand::whereRaw('LOWER(name) = ?', [strtolower($brandTrim)])->first();
                    if (!$brandObj) {
                        $brandObj = Brand::create([
                            'name' => strtoupper($brandTrim),
                            'slug' => Str::slug($brandTrim),
                            'is_active' => true,
                        ]);
                    }
                    $brand = $brandObj ? $brandObj->name : strtoupper($brandTrim);
                }

                $priceStr = $row['Retail Price'] ?? $row['price'] ?? $row['Price'] ?? '99.95';
                preg_match('/\$?([\d,]+\.?\d*)/', (string)$priceStr, $priceMatch);
                $price = isset($priceMatch[1]) ? (float) str_replace(',', '', $priceMatch[1]) : 99.95;

                $wasPriceStr = $row['Was Price / MSRP'] ?? $row['was_price'] ?? $row['Was Price'] ?? null;
                $wasPrice = null;
                if ($wasPriceStr) {
                    preg_match('/\$?([\d,]+\.?\d*)/', (string)$wasPriceStr, $wasMatch);
                    if (isset($wasMatch[1])) {
                        $wasPrice = (float) str_replace(',', '', $wasMatch[1]);
                    }
                }

                $rawImage = $row['Primary Image URL'] ?? $row['Image URL'] ?? $row['primary_image'] ?? $row['Image'] ?? null;
                $primaryImage = $this->downloadAndStoreImage($rawImage);
                $desc = $row['Description'] ?? $row['description'] ?? '';

                $vType = $row['Vehicle Type'] ?? $row['vehicle_type'] ?? null;
                $pType = $row['Specific Product Type'] ?? $row['product_type'] ?? $row['Product Type'] ?? null;
                $cMakes = $row['Compatible Bike Makes'] ?? $row['compatible_makes'] ?? null;
                $cModels = $row['Compatible Bike Models'] ?? $row['compatible_models'] ?? null;
                $fitYearRange = $row['Fitment Year / Range'] ?? $row['fitment_year_range'] ?? null;
                $itemNum = $row['Item Number'] ?? $row['item_number'] ?? null;
                $savings = $row['Savings'] ?? $row['savings'] ?? null;
                $rating = (float) ($row['Rating'] ?? $row['rating'] ?? 0.0);
                $revCount = (int) ($row['Review Count'] ?? $row['review_count'] ?? 0);
                $frontFit = $row['Front Tire Fitment'] ?? $row['front_tire_fitment'] ?? null;
                $rearFit = $row['Rear Tire Fitment'] ?? $row['rear_tire_fitment'] ?? null;
                $wheelLoc = $row['Wheel Locations'] ?? $row['wheel_locations'] ?? null;
                $availSizesCount = (int) ($row['Available Sizes Count'] ?? $row['available_sizes_count'] ?? 0);
                $availSizes = $row['Available Sizes'] ?? $row['available_sizes'] ?? null;
                $totalParts = (int) ($row['Total Part Numbers'] ?? $row['total_part_numbers'] ?? 0);
                $specs = $row['Specs & Features'] ?? $row['specs_and_features'] ?? null;
                $fitVehicle = $row['Fitment Vehicle'] ?? $row['fitment_vehicle'] ?? null;
                $fitDisc = $row['Fitment Disclaimer'] ?? $row['fitment_disclaimer'] ?? null;
                $sourceUrl = $row['URL'] ?? $row['source_url'] ?? null;

                $metaTitle = $row['Meta Title'] ?? $row['meta_title'] ?? null;
                $metaDesc = $row['Meta Description'] ?? $row['meta_description'] ?? null;
                $metaKw = $row['Meta Keywords'] ?? $row['meta_keywords'] ?? null;
                $canonicalUrl = $row['Canonical URL'] ?? $row['canonical_url'] ?? null;
                $customSlug = $row['Slug'] ?? $row['slug'] ?? null;

                // Parse & download Gallery Images into local storage
                $galleryVal = $row['gallery_images'] ?? $row['Gallery Images'] ?? $row['All Image URLs'] ?? null;
                $galleryImages = $this->processGalleryImages($galleryVal);

                // Parse Custom Attributes into array if string
                $customAttrVal = $row['custom_attributes'] ?? $row['Custom Attributes'] ?? null;
                $customAttributes = [];
                if (is_array($customAttrVal)) {
                    $customAttributes = $customAttrVal;
                } else if (is_string($customAttrVal) && !empty($customAttrVal)) {
                    $decoded = json_decode($customAttrVal, true);
                    if (is_array($decoded)) {
                        $customAttributes = $decoded;
                    }
                }

                // Upsert Product strictly by unique SKU (Part Number)
                $existingProduct = !empty($sku) ? Product::where('sku', $sku)->first() : null;

                $prodData = [
                    'name' => $name,
                    'brand' => $brand,
                    'category_id' => $categoryId,
                    'vehicle_type' => $vType,
                    'product_type' => $pType,
                    'compatible_makes' => $cMakes,
                    'compatible_models' => $cModels,
                    'fitment_year_range' => $fitYearRange,
                    'item_number' => $itemNum,
                    'price' => $price > 0 ? $price : 99.95,
                    'was_price' => $wasPrice,
                    'compare_at_price' => $wasPrice,
                    'savings' => $savings,
                    'rating' => $rating,
                    'review_count' => $revCount,
                    'front_tire_fitment' => $frontFit,
                    'rear_tire_fitment' => $rearFit,
                    'wheel_locations' => $wheelLoc,
                    'available_sizes_count' => $availSizesCount,
                    'available_sizes' => $availSizes,
                    'total_part_numbers' => $totalParts,
                    'primary_image' => $primaryImage,
                    'gallery_images' => $galleryImages,
                    'custom_attributes' => $customAttributes,
                    'description' => $desc,
                    'specs_and_features' => $specs,
                    'fitment_vehicle' => $fitVehicle,
                    'fitment_disclaimer' => $fitDisc,
                    'source_url' => $sourceUrl,
                ];

                if ($existingProduct) {
                    if (!empty($metaTitle)) $prodData['meta_title'] = $metaTitle;
                    if (!empty($metaDesc)) $prodData['meta_description'] = $metaDesc;
                    if (!empty($metaKw)) $prodData['meta_keywords'] = $metaKw;
                    if (!empty($canonicalUrl)) $prodData['canonical_url'] = $canonicalUrl;
                    if (!empty($customSlug)) {
                        $prodData['slug'] = $this->makeUniqueSlug($customSlug, $existingProduct->id);
                    }

                    $existingProduct->update($prodData);
                    $product = $existingProduct;
                    $updatedCount++;
                } else {
                    $prodData['sku'] = $sku;
                    $prodData['slug'] = $this->makeUniqueSlug(!empty($customSlug) ? $customSlug : $name);
                    $prodData['stock_quantity'] = 50;
                    $prodData['is_active'] = true;
                    $prodData['meta_title'] = $metaTitle;
                    $prodData['meta_description'] = $metaDesc;
                    $prodData['meta_keywords'] = $metaKw;
                    $prodData['canonical_url'] = $canonicalUrl;

                    $product = Product::create($prodData);
                    $createdCount++;
                }

                // Fitments Upsert
                $year = trim($row['Year'] ?? $row['year'] ?? $row['Fitment Year / Range'] ?? $row['fitment_year_range'] ?? '');
                $make = trim($row['Make'] ?? $row['make'] ?? $row['Compatible Bike Makes'] ?? $row['compatible_makes'] ?? '');
                $model = trim($row['Model'] ?? $row['model'] ?? $row['Compatible Bike Models'] ?? $row['compatible_models'] ?? '');
                $position = trim($row['Position'] ?? $row['position'] ?? $row['Wheel Locations'] ?? $row['wheel_locations'] ?? '');
                $vendorPart = trim($row['Vendor Part Number'] ?? $row['vendor_part_number'] ?? '');
                $tireSize = trim($row['Tire Size'] ?? $row['tire_size'] ?? $row['Available Sizes'] ?? $row['available_sizes'] ?? '');

                if (str_contains(strtolower($position), 'position (e.g.')) {
                    $position = '';
                }

                $subCat = trim($row['Sub Category'] ?? $row['sub_category'] ?? $row['Sub-Category'] ?? $row['Model Family'] ?? $row['model_family'] ?? '');
                if (empty($subCat) && !empty($make) && !empty($model)) {
                    $subCat = ProductController::getModelSubCategory($make, $model);
                }

                if (!empty($year) || !empty($make) || !empty($model)) {
                    ProductFitment::updateOrCreate(
                        [
                            'product_id' => $product->id,
                            'year' => $year ?: null,
                            'make' => $make ?: null,
                            'model' => $model ?: null,
                            'position' => $position ?: null,
                        ],
                        [
                            'sub_category' => $subCat ?: null,
                            'tire_size' => $tireSize ?: null,
                            'sku_number' => $sku,
                            'item_number' => $itemNum,
                            'vendor_part_number' => $vendorPart ?: $sku,
                            'notes' => $row['Notes'] ?? null,
                        ]
                    );
                }
            } catch (\Throwable $e) {
                Log::error("CSV import row error for SKU '" . ($sku ?? 'unknown') . "': " . $e->getMessage());
                $failedCount++;
            }
        }

        return response()->json([
            'status' => 'success',
            'created' => $createdCount,
            'updated' => $updatedCount,
            'failed' => $failedCount,
            'message' => "Import complete! Created: {$createdCount}, Updated: {$updatedCount}, Failed: {$failedCount} products.",
        ]);
    }

    public function export()
    {
        $products = Product::with(['category', 'fitments'])->get();

        $csvHeader = "Part Number,Item Number,Product Name,Slug,Category,Brand,Vehicle Type,Product Type,Retail Price,Was Price / MSRP,Rating,Review Count,Compatible Bike Makes,Compatible Bike Models,Fitment Year / Range,Description,Specs & Features,Image URL,Canonical URL\n";
        $csvRows = [];

        foreach ($products as $p) {
            $categoryName = $p->category ? $p->category->name : '';

            $cleanName = '"' . str_replace('"', '""', $p->name) . '"';
            $cleanDesc = '"' . str_replace('"', '""', $p->description ?? '') . '"';
            $cleanSpecs = '"' . str_replace('"', '""', $p->specs_and_features ?? '') . '"';
            $cleanMakes = '"' . str_replace('"', '""', $p->compatible_makes ?? '') . '"';
            $cleanModels = '"' . str_replace('"', '""', $p->compatible_models ?? '') . '"';
            $vType = '"' . str_replace('"', '""', $p->vehicle_type ?? '') . '"';
            $pType = '"' . str_replace('"', '""', $p->product_type ?? '') . '"';
            $cUrl = '"' . str_replace('"', '""', $p->canonical_url ?? '') . '"';

            $csvRows[] = "{$p->sku},{$p->item_number},{$cleanName},{$p->slug},{$categoryName},{$p->brand},{$vType},{$pType},{$p->price},{$p->was_price},{$p->rating},{$p->review_count},{$cleanMakes},{$cleanModels},{$p->fitment_year_range},{$cleanDesc},{$cleanSpecs},{$p->primary_image},{$cUrl}";
        }

        $csvContent = $csvHeader . implode("\n", $csvRows);

        return response($csvContent, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="americamotorcycletire_products_export_' . date('Y-m-d') . '.csv"',
        ]);
    }

    public function getAttributes()
    {
        $attributes = Attribute::with('values')->orderBy('name')->get();
        return response()->json([
            'status' => 'success',
            'data' => $attributes,
        ]);
    }

    public function convertImagesToWebp()
    {
        @set_time_limit(900);
        @ini_set('memory_limit', '512M');
        $products = Product::all();
        $updatedCount = 0;

        foreach ($products as $product) {
            $changed = false;

            // Process Primary Image
            if (!empty($product->primary_image)) {
                $rawP = $product->primary_image;
                if (str_contains($rawP, ';') || str_contains($rawP, ',')) {
                    $splitP = preg_split('/[,;\n]+/', $rawP);
                    $firstP = trim($splitP[0] ?? '', " \t\n\r\0\x0B\"'");
                    if (!empty($firstP)) {
                        $newP = $this->downloadAndStoreImage($firstP);
                        if ($newP !== $product->primary_image) {
                            $product->primary_image = $newP;
                            $changed = true;
                        }
                    }
                } else if (!str_contains($rawP, '/storage/products/') || str_starts_with($rawP, 'http://') || str_starts_with($rawP, 'https://')) {
                    $newP = $this->downloadAndStoreImage($rawP);
                    if ($newP !== $product->primary_image) {
                        $product->primary_image = $newP;
                        $changed = true;
                    }
                }
            }

            // Process Gallery Images
            if (!empty($product->gallery_images)) {
                $processedG = $this->processGalleryImages($product->gallery_images);
                if ($processedG != $product->gallery_images) {
                    $product->gallery_images = $processedG;
                    $changed = true;
                }
            }

            if ($changed) {
                $product->save();
                $updatedCount++;
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => "Successfully processed catalog! Converted & cleaned gallery images for {$updatedCount} products.",
            'updated_count' => $updatedCount
        ]);
    }
}
