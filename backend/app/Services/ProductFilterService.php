<?php

namespace App\Services;

use App\Models\Attribute;
use App\Models\Product;
use App\Models\ProductFitment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProductFilterService
{
    public function getFilteredProducts(Request $request)
    {
        $query = Product::with(['category', 'productAttributeValues.attribute', 'productAttributeValues.attributeValue', 'variants', 'fitments'])
            ->where('is_active', true);

        // 1. Keyword Search (supports keyword searching across name, brand, sku, description, vehicle_type, product_type, fitment specs)
        if ($request->filled('search')) {
            $search = trim($request->input('search'));
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%")
                  ->orWhere('item_number', 'like', "%{$search}%")
                  ->orWhere('brand', 'like', "%{$search}%")
                  ->orWhere('vehicle_type', 'like', "%{$search}%")
                  ->orWhere('product_type', 'like', "%{$search}%")
                  ->orWhere('compatible_makes', 'like', "%{$search}%")
                  ->orWhere('compatible_models', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('specs_and_features', 'like', "%{$search}%")
                  ->orWhereHas('fitments', function ($fitQ) use ($search) {
                      $fitQ->where('model', 'like', "%{$search}%")
                           ->orWhere('make', 'like', "%{$search}%")
                           ->orWhere('tire_size', 'like', "%{$search}%")
                           ->orWhere('sku_number', 'like', "%{$search}%")
                           ->orWhere('vendor_part_number', 'like', "%{$search}%");
                  });
            });
        }

        // 2. Product Type Filter ('type' or 'product_type')
        $typeParam = $request->input('type') ?: $request->input('product_type');
        if (!empty($typeParam)) {
            $types = is_array($typeParam) ? $typeParam : explode(',', $typeParam);
            $query->where(function ($q) use ($types) {
                foreach ($types as $idx => $t) {
                    $trimT = trim($t);
                    if (empty($trimT)) continue;
                    if ($idx === 0) {
                        $q->where('product_type', 'like', "%{$trimT}%");
                    } else {
                        $q->orWhere('product_type', 'like', "%{$trimT}%");
                    }
                }
            });
        }

        // 3. Vehicle Type Filter
        if ($request->filled('vehicle_type')) {
            $vTypes = is_array($request->input('vehicle_type'))
                ? $request->input('vehicle_type')
                : explode(',', $request->input('vehicle_type'));
            
            $query->where(function ($q) use ($vTypes) {
                foreach ($vTypes as $idx => $vt) {
                    $trimVt = trim($vt);
                    if (empty($trimVt)) continue;
                    if ($idx === 0) {
                        $q->where('vehicle_type', 'like', "%{$trimVt}%");
                    } else {
                        $q->orWhere('vehicle_type', 'like', "%{$trimVt}%");
                    }
                }
            });
        }

        // 4. Category Filter
        if ($request->filled('category')) {
            $categorySlug = $request->input('category');
            $query->whereHas('category', function ($q) use ($categorySlug) {
                $q->where('slug', $categorySlug);
            });
        }

        // 5. Brand Filter
        if ($request->filled('brand')) {
            $brands = is_array($request->input('brand'))
                ? $request->input('brand')
                : explode(',', $request->input('brand'));
            $brands = array_map('trim', array_filter($brands));
            if (!empty($brands)) {
                $query->whereIn('brand', $brands);
            }
        }

        // 6. Motorcycle Fitment Filter (Year, Make, Model)
        $year = $request->input('year');
        $make = $request->input('make');
        $model = $request->input('model');

        if (!empty($year) || !empty($make) || !empty($model)) {
            $query->where(function ($q) use ($year, $make, $model) {
                // Primary: check structured fitments table
                $q->whereHas('fitments', function ($fitQ) use ($year, $make, $model) {
                    if (!empty($year)) {
                        $fitQ->where('year', $year);
                    }
                    if (!empty($make)) {
                        $fitQ->where('make', 'like', "%{$make}%");
                    }
                    if (!empty($model)) {
                        $fitQ->where('model', 'like', "%{$model}%");
                    }
                });

                // Fallback: check columns on products table
                $q->orWhere(function ($textQ) use ($year, $make, $model) {
                    if (!empty($make)) {
                        $textQ->where('compatible_makes', 'like', "%{$make}%");
                    }
                    if (!empty($model)) {
                        $textQ->where('compatible_models', 'like', "%{$model}%");
                    }
                    if (!empty($year)) {
                        $textQ->where('fitment_year_range', 'like', "%{$year}%");
                    }
                });
            });
        }

        // 7. Price Range Filter
        if ($request->filled('min_price')) {
            $query->where('price', '>=', (float) $request->input('min_price'));
        }
        if ($request->filled('max_price')) {
            $query->where('price', '<=', (float) $request->input('max_price'));
        }

        // 8. Rating Filter
        if ($request->filled('min_rating')) {
            $query->where('rating', '>=', (float) $request->input('min_rating'));
        }

        // 9. Featured Only Filter
        if ($request->boolean('is_featured')) {
            $query->where('is_featured', true);
        }

        // 10. Dynamic Attributes Filter
        if ($request->has('attr') && is_array($request->input('attr'))) {
            foreach ($request->input('attr') as $attrSlug => $valuesStr) {
                if (empty($valuesStr)) continue;

                $values = is_array($valuesStr) ? $valuesStr : explode(',', $valuesStr);

                $query->whereHas('productAttributeValues', function ($q) use ($attrSlug, $values) {
                    $q->whereHas('attribute', function ($attrQ) use ($attrSlug) {
                        $attrQ->where('slug', $attrSlug);
                    })->where(function ($valQ) use ($values) {
                        $valQ->whereHas('attributeValue', function ($avQ) use ($values) {
                            $avQ->whereIn('value', $values);
                        })->orWhereIn('custom_value', $values);
                    });
                });
            }
        }

        // 11. Sorting
        $sort = $request->input('sort', 'newest');
        switch ($sort) {
            case 'price_asc':
                $query->orderBy('price', 'asc');
                break;
            case 'price_desc':
                $query->orderBy('price', 'desc');
                break;
            case 'rating_desc':
                $query->orderBy('rating', 'desc');
                break;
            case 'name_asc':
                $query->orderBy('name', 'asc');
                break;
            case 'name_desc':
                $query->orderBy('name', 'desc');
                break;
            case 'newest':
            default:
                $query->orderBy('id', 'desc');
                break;
        }

        $perPage = (int) $request->input('per_page', 24);
        return $query->paginate($perPage);
    }

    public function getAvailableFilters(Request $request)
    {
        $attributes = Attribute::with(['values'])->where('is_filterable', true)->get();

        $brands = Product::where('is_active', true)
            ->whereNotNull('brand')
            ->where('brand', '!=', '')
            ->distinct()
            ->orderBy('brand', 'asc')
            ->pluck('brand');

        $rawVehicleTypes = Product::where('is_active', true)
            ->whereNotNull('vehicle_type')
            ->where('vehicle_type', '!=', '')
            ->pluck('vehicle_type');

        $vehicleTypesSet = [];
        foreach ($rawVehicleTypes as $vt) {
            foreach (explode('/', $vt) as $part) {
                $p = trim($part);
                if ($p && !in_array($p, $vehicleTypesSet)) {
                    $vehicleTypesSet[] = $p;
                }
            }
        }
        sort($vehicleTypesSet);

        $rawProductTypes = Product::where('is_active', true)
            ->whereNotNull('product_type')
            ->where('product_type', '!=', '')
            ->pluck('product_type');

        $productTypesSet = [];
        foreach ($rawProductTypes as $pt) {
            foreach (explode('/', $pt) as $part) {
                $p = trim($part);
                if ($p && !in_array($p, $productTypesSet)) {
                    $productTypesSet[] = $p;
                }
            }
        }
        sort($productTypesSet);

        $makes = ProductFitment::distinct()->whereNotNull('make')->where('make', '!=', '')->pluck('make')->sort()->values();
        $models = ProductFitment::distinct()->whereNotNull('model')->where('model', '!=', '')->pluck('model')->sort()->values();
        $years = ProductFitment::distinct()->whereNotNull('year')->where('year', '!=', '')->pluck('year')->sortDesc()->values();

        $priceMin = Product::where('is_active', true)->min('price') ?? 0;
        $priceMax = Product::where('is_active', true)->max('price') ?? 1000;

        return [
            'brands' => $brands,
            'vehicle_types' => $vehicleTypesSet,
            'product_types' => $productTypesSet,
            'price_range' => [
                'min' => (float) $priceMin,
                'max' => (float) $priceMax,
            ],
            'attributes' => $attributes,
            'fitments' => [
                'years' => $years,
                'makes' => $makes,
                'models' => $models,
            ],
        ];
    }
}
