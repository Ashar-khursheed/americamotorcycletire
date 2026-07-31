<?php

namespace App\Services;

use App\Models\Attribute;
use App\Models\Product;
use App\Models\ProductFitment;
use Illuminate\Http\Request;

class ProductFilterService
{
    public function getFilteredProducts(Request $request)
    {
        $query = Product::with(['category', 'productAttributeValues.attribute', 'productAttributeValues.attributeValue', 'variants', 'fitments'])
            ->where('is_active', true);

        // 1. Search Query
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%")
                  ->orWhere('brand', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhereHas('fitments', function ($fitQ) use ($search) {
                      $fitQ->where('model', 'like', "%{$search}%")
                           ->orWhere('make', 'like', "%{$search}%")
                           ->orWhere('vendor_part_number', 'like', "%{$search}%");
                  });
            });
        }

        // 2. Category Filter
        if ($request->filled('category')) {
            $categorySlug = $request->input('category');
            $query->whereHas('category', function ($q) use ($categorySlug) {
                $q->where('slug', $categorySlug);
            });
        }

        // 3. Brand Filter
        if ($request->filled('brand')) {
            $brands = explode(',', $request->input('brand'));
            $query->whereIn('brand', $brands);
        }

        // 4. Motorcycle Fitment Filter (Year, Make, Model)
        if ($request->filled('year') || $request->filled('make') || $request->filled('model')) {
            $query->whereHas('fitments', function ($fitQ) use ($request) {
                if ($request->filled('year')) {
                    $fitQ->where('year', $request->input('year'));
                }
                if ($request->filled('make')) {
                    $fitQ->where('make', $request->input('make'));
                }
                if ($request->filled('model')) {
                    $fitQ->where('model', $request->input('model'));
                }
            });
        }

        // 5. Price Range Filter
        if ($request->filled('min_price')) {
            $query->where('price', '>=', (float) $request->input('min_price'));
        }
        if ($request->filled('max_price')) {
            $query->where('price', '<=', (float) $request->input('max_price'));
        }

        // 6. Dynamic Attributes Filter
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

        // 7. Sorting
        $sort = $request->input('sort', 'newest');
        switch ($sort) {
            case 'price_asc':
                $query->orderBy('price', 'asc');
                break;
            case 'price_desc':
                $query->orderBy('price', 'desc');
                break;
            case 'name_asc':
                $query->orderBy('name', 'asc');
                break;
            case 'name_desc':
                $query->orderBy('name', 'desc');
                break;
            case 'newest':
            default:
                $query->orderBy('created_at', 'desc');
                break;
        }

        $perPage = (int) $request->input('per_page', 50);
        return $query->paginate($perPage);
    }

    public function getAvailableFilters(Request $request)
    {
        $attributes = Attribute::with(['values'])->where('is_filterable', true)->get();

        $brands = Product::where('is_active', true)
            ->whereNotNull('brand')
            ->distinct()
            ->pluck('brand');

        $fitmentYears = ProductFitment::distinct()->pluck('year')->sortDesc()->values();
        $fitmentMakes = ProductFitment::distinct()->pluck('make')->sort()->values();
        $fitmentModels = ProductFitment::distinct()->pluck('model')->sort()->values();
        $fitmentPositions = ProductFitment::distinct()->pluck('position')->sort()->values();

        $priceMin = Product::where('is_active', true)->min('price') ?? 0;
        $priceMax = Product::where('is_active', true)->max('price') ?? 2000;

        return [
            'brands' => $brands,
            'price_range' => [
                'min' => (float) $priceMin,
                'max' => (float) $priceMax,
            ],
            'attributes' => $attributes,
            'fitments' => [
                'years' => $fitmentYears,
                'makes' => $fitmentMakes,
                'models' => $fitmentModels,
                'positions' => $fitmentPositions,
            ],
        ];
    }
}
