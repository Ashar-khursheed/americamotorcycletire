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
        $type = $request->input('type') ?: $request->input('vehicle_type');
        $year = trim($request->input('year') ?? '');
        $make = trim($request->input('make') ?? '');
        $model = trim($request->input('model') ?? '');

        // Base query filtering fitments by vehicle_type / product_type if provided
        $baseQuery = ProductFitment::query()
            ->whereHas('product', function ($q) use ($type) {
                $q->where('is_active', true);
                if (!empty($type)) {
                    $q->where(function ($tQ) use ($type) {
                        $tQ->where('vehicle_type', 'like', "%{$type}%")
                           ->orWhere('product_type', 'like', "%{$type}%");
                    });
                }
            });

        // 1. Extract and expand Years list
        $yearsQuery = (clone $baseQuery)->whereNotNull('year')->where('year', '!=', '');
        if (!empty($make)) $yearsQuery->where('make', 'like', "%{$make}%");
        if (!empty($model)) $yearsQuery->where('model', 'like', "%{$model}%");
        $rawYears = $yearsQuery->distinct()->pluck('year')->filter()->values();

        // Also fallback to product fitment_year_range if fitments table rawYears is thin
        if ($rawYears->isEmpty()) {
            $prodYearQuery = Product::where('is_active', true)->whereNotNull('fitment_year_range');
            if (!empty($type)) {
                $prodYearQuery->where(function ($tQ) use ($type) {
                    $tQ->where('vehicle_type', 'like', "%{$type}%")
                       ->orWhere('product_type', 'like', "%{$type}%");
                });
            }
            $rawYears = $prodYearQuery->distinct()->pluck('fitment_year_range')->filter()->values();
        }

        $expandedYearsMap = [];
        foreach ($rawYears as $ry) {
            if (preg_match('/(\d{4})\s*-\s*(\d{4})/', $ry, $matches)) {
                $start = (int)$matches[1];
                $end = (int)$matches[2];
                for ($y = $end; $y >= $start; $y--) {
                    $expandedYearsMap[$y] = true;
                }
            } else if (preg_match_all('/\b(19\d\d|20\d\d)\b/', $ry, $m)) {
                foreach ($m[1] as $yStr) {
                    $expandedYearsMap[(int)$yStr] = true;
                }
            }
        }

        // If no specific fitment years found, generate default standard motorcycle years (2026 down to 1980)
        if (empty($expandedYearsMap)) {
            for ($y = 2026; $y >= 1980; $y--) {
                $expandedYearsMap[$y] = true;
            }
        }

        krsort($expandedYearsMap);
        $years = array_map('strval', array_keys($expandedYearsMap));

        // Helper closure to match selected year against single year or range "1998 - 2025"
        $applyYearMatch = function ($q) use ($year) {
            if (empty($year)) return;
            $yInt = (int)$year;
            $q->where(function ($subQ) use ($year, $yInt) {
                $subQ->where('year', 'like', "%{$year}%")
                     ->orWhereNull('year')
                     ->orWhere('year', '');
                if ($yInt > 0) {
                    $subQ->orWhereRaw("CAST(SUBSTRING_INDEX(year, '-', 1) AS UNSIGNED) <= ? AND CAST(SUBSTRING_INDEX(year, '-', -1) AS UNSIGNED) >= ?", [$yInt, $yInt]);
                }
            });
        };

        // 2. Makes list
        $makesQuery = (clone $baseQuery)->whereNotNull('make')->where('make', '!=', '');
        $applyYearMatch($makesQuery);
        if (!empty($model)) $makesQuery->where('model', 'like', "%{$model}%");
        
        $rawMakes = $makesQuery->distinct()->pluck('make')->filter()->values();

        // Fallback: If rawMakes is empty, extract from Product.compatible_makes
        if ($rawMakes->isEmpty()) {
            $pMakeQ = Product::where('is_active', true)->whereNotNull('compatible_makes');
            if (!empty($type)) {
                $pMakeQ->where(function ($tQ) use ($type) {
                    $tQ->where('vehicle_type', 'like', "%{$type}%")
                       ->orWhere('product_type', 'like', "%{$type}%");
                });
            }
            if (!empty($year)) {
                $pMakeQ->where('fitment_year_range', 'like', "%{$year}%");
            }
            $rawMakes = $pMakeQ->distinct()->pluck('compatible_makes')->filter()->values();
        }

        $cleanMakes = [];
        foreach ($rawMakes as $rm) {
            foreach (explode('/', $rm) as $p1) {
                foreach (explode(',', $p1) as $p2) {
                    $trimmed = trim($p2);
                    if ($trimmed && !in_array($trimmed, $cleanMakes)) {
                        $cleanMakes[] = $trimmed;
                    }
                }
            }
        }
        sort($cleanMakes);

        // 3. Models list
        $modelsQuery = (clone $baseQuery)->whereNotNull('model')->where('model', '!=', '');
        $applyYearMatch($modelsQuery);
        if (!empty($make)) $modelsQuery->where('make', 'like', "%{$make}%");

        $rawModels = $modelsQuery->distinct()->pluck('model')->filter()->values();

        // Fallback: If rawModels is empty, extract from Product.compatible_models
        if ($rawModels->isEmpty()) {
            $pModQ = Product::where('is_active', true)->whereNotNull('compatible_models');
            if (!empty($type)) {
                $pModQ->where(function ($tQ) use ($type) {
                    $tQ->where('vehicle_type', 'like', "%{$type}%")
                       ->orWhere('product_type', 'like', "%{$type}%");
                });
            }
            if (!empty($make)) {
                $pModQ->where('compatible_makes', 'like', "%{$make}%");
            }
            if (!empty($year)) {
                $pModQ->where('fitment_year_range', 'like', "%{$year}%");
            }
            $rawModels = $pModQ->distinct()->pluck('compatible_models')->filter()->values();
        }

        $cleanModels = [];
        foreach ($rawModels as $rm) {
            foreach (explode('/', $rm) as $p1) {
                foreach (explode(',', $p1) as $p2) {
                    $trimmed = trim($p2);
                    if ($trimmed && !in_array($trimmed, $cleanModels)) {
                        $cleanModels[] = $trimmed;
                    }
                }
            }
        }

        // Filter models to make sure they match the selected Make if specified
        if (!empty($make)) {
            $knownMakes = ["BMW","Ducati","GasGas","Harley-Davidson","Harley","Honda","Husqvarna","Indian","KTM","Kawasaki","Suzuki","Triumph","Victory","Yamaha","Can-Am","Aprilia","Buell","Polaris","Vespa","Piaggio","Kymco"];
            $otherMakes = array_values(array_filter($knownMakes, function($m) use ($make) {
                $lcM = strtolower($make);
                $lcOther = strtolower($m);
                if ($lcM === 'harley-davidson' || $lcM === 'harley') {
                    return $lcOther !== 'harley-davidson' && $lcOther !== 'harley';
                }
                return $lcOther !== $lcM;
            }));

            $filteredByMakeModels = [];
            foreach ($cleanModels as $cm) {
                $belongsToOther = false;
                foreach ($otherMakes as $om) {
                    if (stripos($cm, $om) !== false) {
                        $belongsToOther = true;
                        break;
                    }
                }
                if (!$belongsToOther) {
                    $filteredByMakeModels[] = $cm;
                }
            }
            if (!empty($filteredByMakeModels)) {
                $cleanModels = $filteredByMakeModels;
            }
        }

        sort($cleanModels);

        // 4. Clean Vehicle Types list (Only Dirt Bike, Street Bike, UTV/ATV)
        $rawVehicleTypes = Product::where('is_active', true)
            ->whereNotNull('vehicle_type')
            ->where('vehicle_type', '!=', '')
            ->distinct()
            ->pluck('vehicle_type')
            ->filter()
            ->values();

        $typesSet = [];
        foreach ($rawVehicleTypes as $vt) {
            $trimmed = trim($vt);
            if ($trimmed && !in_array($trimmed, $typesSet)) {
                $typesSet[] = $trimmed;
            }
        }
        sort($typesSet);

        if (empty($typesSet)) {
            $typesSet = ['Dirt Bike', 'Street Bike', 'UTV/ATV'];
        }

        return response()->json([
            'years' => $years,
            'makes' => $cleanMakes,
            'models' => $cleanModels,
            'types' => array_values($typesSet),
        ]);
    }
}
