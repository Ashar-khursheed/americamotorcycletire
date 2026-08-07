<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductFitment;
use App\Services\ProductFilterService;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    protected $filterService;

    public function __construct(ProductFilterService $filterService)
    {
        $this->filterService = $filterService;
    }

    public function index(Request $request)
    {
        $products = $this->filterService->getFilteredProducts($request);
        $filters = $this->filterService->getAvailableFilters($request);

        return response()->json([
            'status' => 'success',
            'data' => $products,
            'available_filters' => $filters,
        ]);
    }

    public function show($slug)
    {
        $product = Product::with([
            'category',
            'variants',
            'fitments',
            'productAttributeValues.attribute',
            'productAttributeValues.attributeValue',
        ])->where('slug', $slug)->orWhere('id', $slug)->firstOrFail();

        return response()->json([
            'status' => 'success',
            'data' => $product,
        ]);
    }

    public function getFitmentOptions(Request $request)
    {
        $year = $request->input('year');
        $make = $request->input('make');
        $model = $request->input('model');

        $baseQuery = ProductFitment::query()
            ->whereHas('product', function ($q) {
                $q->where('is_active', true);
            });

        // 1. Years list
        $yearsQuery = (clone $baseQuery)->whereNotNull('year')->where('year', '!=', '');
        if (!empty($make)) $yearsQuery->where('make', 'like', "%{$make}%");
        if (!empty($model)) $yearsQuery->where('model', 'like', "%{$model}%");
        $years = $yearsQuery->distinct()->pluck('year')->sortDesc()->values();

        // 2. Makes list
        $makesQuery = (clone $baseQuery)->whereNotNull('make')->where('make', '!=', '');
        if (!empty($year)) $makesQuery->where('year', $year);
        if (!empty($model)) $makesQuery->where('model', 'like', "%{$model}%");
        $makes = $makesQuery->distinct()->pluck('make')->sort()->values();

        // 3. Models list
        $modelsQuery = (clone $baseQuery)->whereNotNull('model')->where('model', '!=', '');
        if (!empty($year)) $modelsQuery->where('year', $year);
        if (!empty($make)) $modelsQuery->where('make', 'like', "%{$make}%");
        $models = $modelsQuery->distinct()->pluck('model')->sort()->values();

        // 4. Product Types list
        $rawTypes = Product::where('is_active', true)->whereNotNull('product_type')->pluck('product_type');
        $typesSet = [];
        foreach ($rawTypes as $rt) {
            foreach (explode('/', $rt) as $p) {
                $trimmed = trim($p);
                if ($trimmed && !in_array($trimmed, $typesSet)) {
                    $typesSet[] = $trimmed;
                }
            }
        }
        sort($typesSet);

        return response()->json([
            'years' => $years,
            'makes' => $makes,
            'models' => $models,
            'types' => $typesSet,
        ]);
    }
}
