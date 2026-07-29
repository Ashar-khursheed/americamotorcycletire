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
        ])->where('slug', $slug)->firstOrFail();

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
        $position = $request->input('position');

        // 1. Years list: filter by make, model, position (excluding year filter)
        $yearsQuery = ProductFitment::query()->whereNotNull('year')->where('year', '!=', '');
        if (!empty($make)) $yearsQuery->where('make', $make);
        if (!empty($model)) $yearsQuery->where('model', $model);
        if (!empty($position)) $yearsQuery->where('position', $position);
        $years = $yearsQuery->distinct()->pluck('year')->sortDesc()->values();

        // 2. Makes list: filter by year, model, position (excluding make filter)
        $makesQuery = ProductFitment::query()->whereNotNull('make')->where('make', '!=', '');
        if (!empty($year)) $makesQuery->where('year', $year);
        if (!empty($model)) $makesQuery->where('model', $model);
        if (!empty($position)) $makesQuery->where('position', $position);
        $makes = $makesQuery->distinct()->pluck('make')->sort()->values();

        // 3. Models list: filter by year, make, position (excluding model filter)
        $modelsQuery = ProductFitment::query()->whereNotNull('model')->where('model', '!=', '');
        if (!empty($year)) $modelsQuery->where('year', $year);
        if (!empty($make)) $modelsQuery->where('make', $make);
        if (!empty($position)) $modelsQuery->where('position', $position);
        $models = $modelsQuery->distinct()->pluck('model')->sort()->values();

        // 4. Positions list: filter by year, make, model (excluding position filter)
        $positionsQuery = ProductFitment::query()->whereNotNull('position')->where('position', '!=', '');
        if (!empty($year)) $positionsQuery->where('year', $year);
        if (!empty($make)) $positionsQuery->where('make', $make);
        if (!empty($model)) $positionsQuery->where('model', $model);
        $positions = $positionsQuery->distinct()->pluck('position')->sort()->values();

        return response()->json([
            'years' => $years,
            'makes' => $makes,
            'models' => $models,
            'positions' => $positions,
        ]);
    }
}
