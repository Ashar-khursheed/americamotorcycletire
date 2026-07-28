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
        $query = ProductFitment::query();

        if ($request->filled('year')) {
            $query->where('year', $request->input('year'));
        }
        if ($request->filled('make')) {
            $query->where('make', $request->input('make'));
        }

        $years = ProductFitment::whereNotNull('year')->distinct()->pluck('year')->sortDesc()->values();
        $makes = (clone $query)->whereNotNull('make')->distinct()->pluck('make')->sort()->values();
        $models = (clone $query)->whereNotNull('model')->distinct()->pluck('model')->sort()->values();
        $positions = (clone $query)->whereNotNull('position')->distinct()->pluck('position')->sort()->values();

        return response()->json([
            'years' => $years,
            'makes' => $makes,
            'models' => $models,
            'positions' => $positions,
        ]);
    }
}
