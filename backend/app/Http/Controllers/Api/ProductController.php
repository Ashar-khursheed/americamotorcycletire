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

        // 1. YEARS LIST
        $fitmentYearsQ = ProductFitment::query()->whereHas('product', function ($q) use ($type) {
            $q->where('is_active', true);
            if (!empty($type)) $q->where('vehicle_type', 'like', "%{$type}%");
        });
        if (!empty($make)) $fitmentYearsQ->where('make', 'like', "%{$make}%");
        if (!empty($model)) $fitmentYearsQ->where('model', 'like', "%{$model}%");
        $rawYears1 = $fitmentYearsQ->distinct()->pluck('year')->filter()->values();

        $prodYearsQ = Product::where('is_active', true)->whereNotNull('fitment_year_range');
        if (!empty($type)) $prodYearsQ->where('vehicle_type', 'like', "%{$type}%");
        if (!empty($make)) $prodYearsQ->where('compatible_makes', 'like', "%{$make}%");
        if (!empty($model)) $prodYearsQ->where('compatible_models', 'like', "%{$model}%");
        $rawYears2 = $prodYearsQ->distinct()->pluck('fitment_year_range')->filter()->values();

        $rawYears = $rawYears1->merge($rawYears2);

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

        if (empty($expandedYearsMap)) {
            for ($y = 2026; $y >= 1980; $y--) {
                $expandedYearsMap[$y] = true;
            }
        }
        krsort($expandedYearsMap);
        $years = array_map('strval', array_keys($expandedYearsMap));

        // Helper for year matching on ProductFitment
        $applyYearMatchFitment = function ($q) use ($year) {
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

        // Helper for year matching on Product
        $applyYearMatchProduct = function ($q) use ($year) {
            if (empty($year)) return;
            $q->where(function ($subQ) use ($year) {
                $subQ->where('fitment_year_range', 'like', "%{$year}%")
                     ->orWhereNull('fitment_year_range')
                     ->orWhere('fitment_year_range', '');
            });
        };

        // 2. MAKES LIST
        $fitmentMakesQ = ProductFitment::query()->whereHas('product', function ($q) use ($type) {
            $q->where('is_active', true);
            if (!empty($type)) $q->where('vehicle_type', 'like', "%{$type}%");
        })->whereNotNull('make')->where('make', '!=', '');
        $applyYearMatchFitment($fitmentMakesQ);
        if (!empty($model)) $fitmentMakesQ->where('model', 'like', "%{$model}%");
        $rawMakes1 = $fitmentMakesQ->distinct()->pluck('make')->filter()->values();

        $prodMakesQ = Product::where('is_active', true)->whereNotNull('compatible_makes')->where('compatible_makes', '!=', '');
        if (!empty($type)) $prodMakesQ->where('vehicle_type', 'like', "%{$type}%");
        $applyYearMatchProduct($prodMakesQ);
        if (!empty($model)) $prodMakesQ->where('compatible_models', 'like', "%{$model}%");
        $rawMakes2 = $prodMakesQ->distinct()->pluck('compatible_makes')->filter()->values();

        $allRawMakes = $rawMakes1->merge($rawMakes2);

        $cleanMakes = [];
        $ignoredMakes = ['universal', 'all models', 'n/a', 'none', 'all makes', 'all'];
        foreach ($allRawMakes as $rm) {
            foreach (explode('/', $rm) as $p1) {
                foreach (explode(',', $p1) as $p2) {
                    $trimmed = trim($p2);
                    if ($trimmed && !in_array(strtolower($trimmed), $ignoredMakes) && !in_array($trimmed, $cleanMakes)) {
                        $cleanMakes[] = $trimmed;
                    }
                }
            }
        }
        sort($cleanMakes);

        // 3. MODELS LIST
        $fitmentModelsQ = ProductFitment::query()->whereHas('product', function ($q) use ($type) {
            $q->where('is_active', true);
            if (!empty($type)) $q->where('vehicle_type', 'like', "%{$type}%");
        })->whereNotNull('model')->where('model', '!=', '');
        $applyYearMatchFitment($fitmentModelsQ);
        if (!empty($make)) $fitmentModelsQ->where('make', 'like', "%{$make}%");
        $rawModels1 = $fitmentModelsQ->distinct()->pluck('model')->filter()->values();

        $prodModelsQ = Product::where('is_active', true)->whereNotNull('compatible_models')->where('compatible_models', '!=', '');
        if (!empty($type)) $prodModelsQ->where('vehicle_type', 'like', "%{$type}%");
        $applyYearMatchProduct($prodModelsQ);
        if (!empty($make)) $prodModelsQ->where('compatible_makes', 'like', "%{$make}%");
        $rawModels2 = $prodModelsQ->distinct()->pluck('compatible_models')->filter()->values();

        $allRawModels = $rawModels1->merge($rawModels2);

        $cleanModels = [];
        $ignoredModels = ['universal', 'all models', 'n/a', 'none', 'all makes', 'all'];
        foreach ($allRawModels as $rm) {
            foreach (explode('/', $rm) as $p1) {
                foreach (explode(',', $p1) as $p2) {
                    $trimmed = trim($p2);
                    if ($trimmed && !in_array(strtolower($trimmed), $ignoredModels) && !in_array($trimmed, $cleanModels)) {
                        $cleanModels[] = $trimmed;
                    }
                }
            }
        }

        // Filter models to match selected Make
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

        // 4. Clean Vehicle Types list
        $typesSet = ['Dirt Bike', 'Street Bike', 'UTV/ATV'];

        return response()->json([
            'years' => $years,
            'makes' => $cleanMakes,
            'models' => $cleanModels,
            'types' => $typesSet,
        ]);
    }
}
