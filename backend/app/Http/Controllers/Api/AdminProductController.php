<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attribute;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductFitment;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class AdminProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with(['category', 'fitments']);

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
        $product = Product::with(['category', 'fitments'])->findOrFail($id);

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

        // If it's already hosted on our local server, return as is
        if (str_contains($imageUrl, '127.0.0.1') || str_contains($imageUrl, 'localhost') || str_contains($imageUrl, '/storage/products/')) {
            return $imageUrl;
        }

        try {
            $folderPath = public_path('storage/products');
            if (!file_exists($folderPath)) {
                mkdir($folderPath, 0777, true);
            }

            $hash = md5($imageUrl);

            // Check if WebP file already exists
            $webpFilename = 'prod_' . $hash . '.webp';
            $webpPath = $folderPath . '/' . $webpFilename;
            $webpAssetUrl = asset('storage/products/' . $webpFilename);

            if (file_exists($webpPath) && filesize($webpPath) > 0) {
                return $webpAssetUrl;
            }

            // Check if JPG file already exists
            $jpgFilename = 'prod_' . $hash . '.jpg';
            $jpgPath = $folderPath . '/' . $jpgFilename;
            $jpgAssetUrl = asset('storage/products/' . $jpgFilename);

            if (file_exists($jpgPath) && filesize($jpgPath) > 0) {
                return $jpgAssetUrl;
            }

            $rawBinary = null;
            if (str_starts_with($imageUrl, 'data:image/')) {
                $parts = explode(',', $imageUrl, 2);
                if (count($parts) === 2) {
                    $rawBinary = base64_decode($parts[1]);
                }
            } else if (str_starts_with($imageUrl, 'http://') || str_starts_with($imageUrl, 'https://')) {
                $context = stream_context_create([
                    'http' => ['timeout' => 4, 'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'],
                    'ssl' => ['verify_peer' => false, 'verify_peer_name' => false]
                ]);
                $rawBinary = @file_get_contents($imageUrl, false, $context);
            }

            if (!empty($rawBinary)) {
                // 1. Try converting bitmap to WebP via GD
                if (function_exists('imagecreatefromstring') && function_exists('imagewebp')) {
                    $imgRes = @imagecreatefromstring($rawBinary);
                    if ($imgRes !== false) {
                        imagealphablending($imgRes, true);
                        imagesavealpha($imgRes, true);
                        if (@imagewebp($imgRes, $webpPath, 85)) {
                            imagedestroy($imgRes);
                            return $webpAssetUrl;
                        }
                        imagedestroy($imgRes);
                    }
                }

                // 2. Try converting bitmap to JPG via GD
                if (function_exists('imagecreatefromstring') && function_exists('imagejpeg')) {
                    $imgRes = @imagecreatefromstring($rawBinary);
                    if ($imgRes !== false) {
                        if (@imagejpeg($imgRes, $jpgPath, 90)) {
                            imagedestroy($imgRes);
                            return $jpgAssetUrl;
                        }
                        imagedestroy($imgRes);
                    }
                }

                // 3. Fallback: Save binary directly as JPG
                file_put_contents($jpgPath, $rawBinary);
                return $jpgAssetUrl;
            }
        } catch (\Throwable $e) {
            Log::error("Failed to store product image: " . $e->getMessage());
        }

        return $imageUrl;
    }

    private function processGalleryImages($galleryImages)
    {
        if (!is_array($galleryImages)) {
            return [];
        }
        $processed = [];
        foreach ($galleryImages as $img) {
            if (!empty($img)) {
                $processed[] = $this->downloadAndStoreImage($img);
            }
        }
        return array_values(array_filter($processed));
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

                    ProductFitment::create([
                        'product_id' => $product->id,
                        'year' => $y ?: null,
                        'make' => $m ?: null,
                        'model' => $md ?: null,
                        'position' => $p ?: null,
                        'vendor_part_number' => $fit['vendor_part_number'] ?? null,
                        'notes' => $fit['notes'] ?? null,
                    ]);
                }
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Product created with gallery images and fitments successfully!',
            'data' => $product->load('fitments'),
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

                        ProductFitment::create([
                            'product_id' => $product->id,
                            'year' => $y ?: null,
                            'make' => $m ?: null,
                            'model' => $md ?: null,
                            'position' => $p ?: null,
                            'vendor_part_number' => $fit['vendor_part_number'] ?? null,
                            'notes' => $fit['notes'] ?? null,
                        ]);
                    }
                }
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Product and fitment specs updated successfully!',
            'data' => $product->load('fitments'),
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

        foreach ($rows as $row) {
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
            $localImage = $this->downloadAndStoreImage($rawImage);
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

            // Upsert Product strictly by unique SKU (Part Number) or Name
            $existingProduct = Product::where('sku', $sku)->orWhere('name', $name)->first();

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
                'primary_image' => !empty($localImage) ? $localImage : asset('storage/products/default.jpg'),
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
            $year = trim($row['Year'] ?? $row['year'] ?? '');
            $make = trim($row['Make'] ?? $row['make'] ?? '');
            $model = trim($row['Model'] ?? $row['model'] ?? '');
            $position = trim($row['Position'] ?? $row['position'] ?? '');
            $vendorPart = trim($row['Vendor Part Number'] ?? $row['vendor_part_number'] ?? '');
            $tireSize = trim($row['Tire Size'] ?? $row['tire_size'] ?? '');

            if (str_contains(strtolower($position), 'position (e.g.')) {
                $position = '';
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
                        'tire_size' => $tireSize ?: null,
                        'sku_number' => $sku,
                        'item_number' => $itemNum,
                        'vendor_part_number' => $vendorPart ?: $sku,
                        'notes' => $row['Notes'] ?? null,
                    ]
                );
            }
        }

        return response()->json([
            'status' => 'success',
            'created' => $createdCount,
            'updated' => $updatedCount,
            'message' => "Import complete! Created: {$createdCount}, Updated: {$updatedCount} products, brands, and categories.",
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
        @set_time_limit(600);
        $products = Product::whereNotNull('primary_image')->get();
        $updatedCount = 0;

        foreach ($products as $product) {
            $currentImg = $product->primary_image;
            if (empty($currentImg)) continue;

            // Process any image that isn't already webp or local webp
            if (!str_contains($currentImg, '.webp') || str_starts_with($currentImg, 'http://') || str_starts_with($currentImg, 'https://')) {
                $newImg = $this->downloadAndStoreImage($currentImg);
                if ($newImg && $newImg !== $currentImg) {
                    $product->primary_image = $newImg;
                    $product->save();
                    $updatedCount++;
                }
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => "Successfully processed catalog! Converted {$updatedCount} product images to WebP format.",
            'updated_count' => $updatedCount
        ]);
    }
}
