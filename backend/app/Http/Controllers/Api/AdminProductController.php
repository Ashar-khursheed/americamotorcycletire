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
            $query->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%")
                  ->orWhere('brand', 'like', "%{$search}%");
        }

        $products = $query->orderBy('id', 'desc')->paginate(50);

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

            // 1. Handle Base64 Data URI
            if (str_starts_with($imageUrl, 'data:image/')) {
                $hash = md5($imageUrl);
                $filename = 'prod_' . $hash . '.png';
                $localFilePath = $folderPath . '/' . $filename;
                $assetUrl = asset('storage/products/' . $filename);

                if (file_exists($localFilePath) && filesize($localFilePath) > 0) {
                    return $assetUrl;
                }

                $parts = explode(',', $imageUrl, 2);
                if (count($parts) === 2) {
                    $decoded = base64_decode($parts[1]);
                    file_put_contents($localFilePath, $decoded);
                    return $assetUrl;
                }
            }

            // 2. Handle External HTTP/HTTPS Remote Image URL
            if (str_starts_with($imageUrl, 'http://') || str_starts_with($imageUrl, 'https://')) {
                $ext = pathinfo(parse_url($imageUrl, PHP_URL_PATH), PATHINFO_EXTENSION) ?: 'jpg';
                if (strlen($ext) > 4 || empty($ext)) $ext = 'jpg';

                // Deterministic filename based on MD5 of URL -> prevents duplicate image files!
                $filename = 'prod_' . md5($imageUrl) . '.' . $ext;
                $localFilePath = $folderPath . '/' . $filename;
                $assetUrl = asset('storage/products/' . $filename);

                // If image file ALREADY exists locally, reuse existing file without downloading!
                if (file_exists($localFilePath) && filesize($localFilePath) > 0) {
                    return $assetUrl;
                }

                $context = stream_context_create([
                    'http' => ['timeout' => 2, 'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'],
                    'ssl' => ['verify_peer' => false, 'verify_peer_name' => false]
                ]);
                $contents = @file_get_contents($imageUrl, false, $context);
                if ($contents) {
                    file_put_contents($localFilePath, $contents);
                    return $assetUrl;
                }
            }
        } catch (\Throwable $e) {
            Log::error("Failed to convert image to local server: " . $e->getMessage());
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
            'category_id' => $validated['category_id'] ?? null,
            'brand' => $validated['brand'] ?? 'BMG',
            'stock_quantity' => $validated['stock_quantity'] ?? 25,
            'description' => $validated['description'] ?? null,
            'primary_image' => $primaryImage,
            'gallery_images' => $galleryImages,
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
            $sku = $row['Part Number'] ?? $row['sku'] ?? $row['SKU'] ?? $row['Part #'] ?? null;
            $name = $row['Product Name'] ?? $row['name'] ?? $row['Title'] ?? 'Motorcycle Component';

            if (empty($sku)) {
                $sku = 'SKU-' . strtoupper(Str::slug(substr($name, 0, 10))) . '-' . rand(100, 999);
            }

            // Case-Insensitive Category Auto-Create or Match
            $categoryName = $row['Category'] ?? $row['category'] ?? $row['Category Name'] ?? null;
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
            $price = (float) str_replace(['$', ','], '', $priceStr);
            $rawImage = $row['Image URL'] ?? $row['primary_image'] ?? $row['Image'] ?? null;

            $localImage = $this->downloadAndStoreImage($rawImage);
            $desc = $row['Description'] ?? $row['description'] ?? '';

            $metaTitle = $row['Meta Title'] ?? $row['meta_title'] ?? null;
            $metaDesc = $row['Meta Description'] ?? $row['meta_description'] ?? null;
            $metaKw = $row['Meta Keywords'] ?? $row['meta_keywords'] ?? null;
            $canonicalUrl = $row['Canonical URL'] ?? $row['canonical_url'] ?? null;
            $customSlug = $row['Slug'] ?? $row['slug'] ?? null;

            // Upsert Product strictly by unique SKU (Part Number)
            $existingProduct = Product::where('sku', $sku)->first();

            if ($existingProduct) {
                $upData = [
                    'name' => $name,
                    'brand' => $brand,
                    'category_id' => $categoryId ?? $existingProduct->category_id,
                    'price' => $price > 0 ? $price : $existingProduct->price,
                    'primary_image' => !empty($localImage) ? $localImage : $existingProduct->primary_image,
                    'description' => !empty($desc) ? $desc : $existingProduct->description,
                ];
                if (!empty($metaTitle)) $upData['meta_title'] = $metaTitle;
                if (!empty($metaDesc)) $upData['meta_description'] = $metaDesc;
                if (!empty($metaKw)) $upData['meta_keywords'] = $metaKw;
                if (!empty($canonicalUrl)) $upData['canonical_url'] = $canonicalUrl;
                if (!empty($customSlug)) {
                    $upData['slug'] = $this->makeUniqueSlug($customSlug, $existingProduct->id);
                }

                $existingProduct->update($upData);
                $product = $existingProduct;
                $updatedCount++;
            } else {
                $product = Product::create([
                    'name' => $name,
                    'slug' => $this->makeUniqueSlug(!empty($customSlug) ? $customSlug : $name),
                    'sku' => $sku,
                    'brand' => $brand,
                    'category_id' => $categoryId,
                    'price' => $price > 0 ? $price : 99.95,
                    'stock_quantity' => 25,
                    'primary_image' => $localImage ?: asset('storage/products/default.jpg'),
                    'description' => $desc,
                    'meta_title' => $metaTitle,
                    'meta_description' => $metaDesc,
                    'meta_keywords' => $metaKw,
                    'canonical_url' => $canonicalUrl,
                    'is_active' => true,
                ]);
                $createdCount++;
            }

            // Fitments Upsert
            $year = trim($row['Year'] ?? $row['year'] ?? '');
            $make = trim($row['Make'] ?? $row['make'] ?? '');
            $model = trim($row['Model'] ?? $row['model'] ?? '');
            $position = trim($row['Position'] ?? $row['position'] ?? '');
            $vendorPart = trim($row['Vendor Part Number'] ?? $row['vendor_part_number'] ?? '');

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
                        'vendor_part_number' => $vendorPart ?: null,
                        'notes' => $row['Notes'] ?? null,
                    ]
                );
            }
        }

        return response()->json([
            'status' => 'success',
            'created' => $createdCount,
            'updated' => $updatedCount,
            'message' => "CSV Import complete! Created: {$createdCount}, Updated: {$updatedCount} products, brands, and categories.",
        ]);
    }

    public function export()
    {
        $products = Product::with(['category', 'fitments'])->get();

        $csvHeader = "Part Number,Vendor Part Number,Product Name,Slug,Category,Brand,Retail Price,Year,Make,Model,Position,Description,Image URL,Meta Title,Meta Description,Meta Keywords,Canonical URL\n";
        $csvRows = [];

        foreach ($products as $p) {
            $firstFitment = $p->fitments->first();
            $vendorPart = $firstFitment ? $firstFitment->vendor_part_number : '';
            $year = $firstFitment ? $firstFitment->year : '';
            $make = $firstFitment ? $firstFitment->make : '';
            $model = $firstFitment ? $firstFitment->model : '';
            $position = $firstFitment ? $firstFitment->position : '';
            $categoryName = $p->category ? $p->category->name : '';

            $cleanName = '"' . str_replace('"', '""', $p->name) . '"';
            $cleanDesc = '"' . str_replace('"', '""', $p->description ?? '') . '"';
            $cleanMake = '"' . str_replace('"', '""', $make) . '"';
            $cleanModel = '"' . str_replace('"', '""', $model) . '"';

            $mTitle = '"' . str_replace('"', '""', $p->meta_title ?? '') . '"';
            $mDesc = '"' . str_replace('"', '""', $p->meta_description ?? '') . '"';
            $mKw = '"' . str_replace('"', '""', $p->meta_keywords ?? '') . '"';
            $cUrl = '"' . str_replace('"', '""', $p->canonical_url ?? '') . '"';

            $csvRows[] = "{$p->sku},{$vendorPart},{$cleanName},{$p->slug},{$categoryName},{$p->brand},{$p->price},{$year},{$cleanMake},{$cleanModel},{$position},{$cleanDesc},{$p->primary_image},{$mTitle},{$mDesc},{$mKw},{$cUrl}";
        }

        $csvContent = $csvHeader . implode("\n", $csvRows);

        return response($csvContent, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="bmg_cycles_products_export_' . date('Y-m-d') . '.csv"',
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
}
