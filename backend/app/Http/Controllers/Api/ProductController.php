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
                $start = max(1995, (int)$matches[1]);
                $end = min(2025, (int)$matches[2]);
                for ($y = $end; $y >= $start; $y--) {
                    $expandedYearsMap[$y] = true;
                }
            } else if (preg_match_all('/\b(19\d\d|20\d\d)\b/', $ry, $m)) {
                foreach ($m[1] as $yStr) {
                    $yInt = (int)$yStr;
                    if ($yInt >= 1995 && $yInt <= 2025) {
                        $expandedYearsMap[$yInt] = true;
                    }
                }
            }
        }

        if (empty($expandedYearsMap)) {
            for ($y = 2025; $y >= 2000; $y--) {
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
            $yInt = (int)$year;
            $q->where(function ($subQ) use ($year, $yInt) {
                $subQ->where('fitment_year_range', 'like', "%{$year}%")
                     ->orWhereNull('fitment_year_range')
                     ->orWhere('fitment_year_range', '');
                if ($yInt > 0) {
                    $subQ->orWhereRaw("CAST(SUBSTRING_INDEX(fitment_year_range, '-', 1) AS UNSIGNED) <= ? AND CAST(SUBSTRING_INDEX(fitment_year_range, '-', -1) AS UNSIGNED) >= ?", [$yInt, $yInt]);
                }
            });
        };

        // Helper for vehicle type / category matching
        $applyTypeMatchProduct = function ($q) use ($type) {
            if (empty($type)) return;
            $lowerT = strtolower(trim($type));
            if ($lowerT === 'all types' || $lowerT === 'all') return;

            if ($lowerT === 'sportbike') {
                $q->where(function ($sub) {
                    $sub->where('product_type', 'like', '%sportbike%')
                        ->orWhere('product_type', 'like', '%hypersport%')
                        ->orWhere('product_type', 'like', '%supersport%')
                        ->orWhere('product_type', 'like', '%race%')
                        ->orWhere('vehicle_type', 'like', '%street%')
                        ->orWhere('vehicle_type', 'like', '%sport%')
                        ->orWhere('name', 'like', '%sport%');
                });
            } elseif ($lowerT === 'cruiser') {
                $q->where(function ($sub) {
                    $sub->where('product_type', 'like', '%cruiser%')
                        ->orWhere('product_type', 'like', '%v-twin%')
                        ->orWhere('product_type', 'like', '%harley%')
                        ->orWhere('vehicle_type', 'like', '%street%')
                        ->orWhere('vehicle_type', 'like', '%cruiser%')
                        ->orWhere('name', 'like', '%cruiser%');
                });
            } elseif ($lowerT === 'touring') {
                $q->where(function ($sub) {
                    $sub->where('product_type', 'like', '%touring%')
                        ->orWhere('vehicle_type', 'like', '%street%')
                        ->orWhere('vehicle_type', 'like', '%touring%')
                        ->orWhere('name', 'like', '%touring%');
                });
            } elseif ($lowerT === 'dirt') {
                $q->where(function ($sub) {
                    $sub->where('vehicle_type', 'like', '%dirt%')
                        ->orWhere('product_type', 'like', '%dirt%')
                        ->orWhere('product_type', 'like', '%motocross%')
                        ->orWhere('name', 'like', '%dirt%');
                });
            } elseif ($lowerT === 'dualsport' || $lowerT === 'dual sport') {
                $q->where(function ($sub) {
                    $sub->where('product_type', 'like', '%dual sport%')
                        ->orWhere('product_type', 'like', '%adventure%')
                        ->orWhere('vehicle_type', 'like', '%dirt%')
                        ->orWhere('vehicle_type', 'like', '%dual sport%')
                        ->orWhere('name', 'like', '%adventure%')
                        ->orWhere('name', 'like', '%dual sport%');
                });
            } elseif ($lowerT === 'scooter') {
                $q->where(function ($sub) {
                    $sub->where('vehicle_type', 'like', '%scooter%')
                        ->orWhere('product_type', 'like', '%scooter%')
                        ->orWhere('name', 'like', '%scooter%');
                });
            } elseif ($lowerT === 'race') {
                $q->where(function ($sub) {
                    $sub->where('product_type', 'like', '%race%')
                        ->orWhere('product_type', 'like', '%track%')
                        ->orWhere('name', 'like', '%race%');
                });
            } else {
                $q->where('vehicle_type', 'like', "%{$type}%");
            }
        };

        // 2. MAKES LIST
        $fitmentMakesQ = ProductFitment::query()->whereHas('product', function ($q) use ($applyTypeMatchProduct) {
            $q->where('is_active', true);
            $applyTypeMatchProduct($q);
        })->whereNotNull('make')->where('make', '!=', '');
        $applyYearMatchFitment($fitmentMakesQ);
        if (!empty($model)) $fitmentMakesQ->where('model', 'like', "%{$model}%");
        $rawMakes1 = $fitmentMakesQ->distinct()->pluck('make')->filter()->values();

        $prodMakesQ = Product::where('is_active', true)->whereNotNull('compatible_makes')->where('compatible_makes', '!=', '');
        $applyTypeMatchProduct($prodMakesQ);
        $applyYearMatchProduct($prodMakesQ);
        if (!empty($model)) $prodMakesQ->where('compatible_models', 'like', "%{$model}%");
        $rawMakes2 = $prodMakesQ->distinct()->pluck('compatible_makes')->filter()->values();

        $allRawMakes = $rawMakes1->merge($rawMakes2);

        $validOemMakesMap = [
            'harley' => 'Harley-Davidson',
            'harley-davidson' => 'Harley-Davidson',
            'honda' => 'Honda',
            'yamaha' => 'Yamaha',
            'kawasaki' => 'Kawasaki',
            'suzuki' => 'Suzuki',
            'bmw' => 'BMW',
            'ktm' => 'KTM',
            'ducati' => 'Ducati',
            'triumph' => 'Triumph',
            'indian' => 'Indian',
            'husqvarna' => 'Husqvarna',
            'can-am' => 'Can-Am',
            'canam' => 'Can-Am',
            'polaris' => 'Polaris',
            'victory' => 'Victory',
            'aprilia' => 'Aprilia',
            'moto guzzi' => 'Moto Guzzi',
            'royal enfield' => 'Royal Enfield',
            'gasgas' => 'GasGas',
            'gas gas' => 'GasGas',
            'beta' => 'Beta',
            'zero' => 'Zero',
            'husaberg' => 'Husaberg',
            'cobra' => 'Cobra',
            'buell' => 'Buell',
            'mv agusta' => 'MV Agusta',
            'benelli' => 'Benelli',
            'kymco' => 'Kymco',
            'sym' => 'Sym',
            'brp' => 'BRP',
            'arctic cat' => 'Arctic Cat',
            'ski-doo' => 'Ski-Doo',
            'sea-doo' => 'Sea-Doo',
            'vanderhall' => 'Vanderhall'
        ];

        $cleanMakes = [];
        foreach ($allRawMakes as $rm) {
            foreach (explode('/', $rm) as $p1) {
                foreach (explode(',', $p1) as $p2) {
                    $trimmed = trim($p2);
                    $lower = strtolower($trimmed);
                    foreach ($validOemMakesMap as $key => $canonicalName) {
                        if (str_contains($lower, $key) || $lower === $key) {
                            if (!in_array($canonicalName, $cleanMakes)) {
                                $cleanMakes[] = $canonicalName;
                            }
                            break;
                        }
                    }
                }
            }
        }
        sort($cleanMakes);

        // 3. MODELS LIST
        $fitmentModelsQ = ProductFitment::query()->whereHas('product', function ($q) use ($applyTypeMatchProduct) {
            $q->where('is_active', true);
            $applyTypeMatchProduct($q);
        })->whereNotNull('model')->where('model', '!=', '');
        $applyYearMatchFitment($fitmentModelsQ);
        if (!empty($make)) {
            $fitmentModelsQ->where('make', 'like', "%{$make}%");
        }
        $rawModels1 = $fitmentModelsQ->distinct()->pluck('model')->filter()->values();

        $prodModelsQ = Product::where('is_active', true)->whereNotNull('compatible_models')->where('compatible_models', '!=', '');
        $applyTypeMatchProduct($prodModelsQ);
        $applyYearMatchProduct($prodModelsQ);
        if (!empty($make)) {
            $prodModelsQ->where('compatible_makes', 'like', "%{$make}%");
        }
        $rawModels2 = $prodModelsQ->distinct()->pluck('compatible_models')->filter()->values();

        $allRawModels = $rawModels1->merge($rawModels2);

        $exclusiveModelsByMake = [
            'Harley-Davidson' => ['fat boy', 'fat bob', 'softail', 'dyna', 'sportster', 'street glide', 'road king', 'electra glide', 'road glide', 'heritage', 'v-rod', 'v rod', 'iron 883', 'forty-eight', 'low rider', 'breakout', 'fxfxr', 'street rod'],
            'BMW'             => ['bmw', 'r1200gs', 'r1250gs', 'r1250rt', 's1000rr', 'f850gs', 'f750gs', 'f800gs', 'k1600gt', 'g310gs', 'r ninet', 'm1000rr', 's1000r', 'r1250rs', 'gs'],
            'Honda'           => ['cbr600rr', 'cbr1000rr', 'cbr', 'crf250r', 'crf450r', 'crf300l', 'crf', 'africa twin', 'goldwing', 'grom', 'rebel', 'cb650r', 'cb1000r', 'shadow', 'vfr800', 'foreman', 'ruckus', 'vtx'],
            'Kawasaki'        => ['ninja', 'zx-6r', 'zx-10r', 'zx-14r', 'z900', 'z650', 'klr650', 'kx250', 'kx450', 'vulcan'],
            'Suzuki'          => ['gsx-r600', 'gsx-r750', 'gsx-r1000', 'gsx-r', 'hayabusa', 'v-strom', 'sv650', 'dr-z400', 'rm-z250', 'rm-z450', 'boulevard'],
            'KTM'             => ['250 sx-f', '450 sx-f', 'sx-f', '890 adventure', '1290 super adventure', '390 duke', '890 duke', '1290 super duke', '690 enduro', 'super adventure'],
            'Ducati'          => ['monster', 'panigale', 'multistrada', 'scrambler', 'diavel', 'streetfighter', 'supersport', 'hypermotard'],
            'Yamaha'          => ['yzf-r1', 'yzf-r6', 'yzf-r3', 'mt-07', 'mt-09', 'mt-10', 'tracer', 'ténéré', 'tenere', 'bolt', 'v-star', 'zuma', 'xmax', 'fjr1300', 'grizzly', 'yz250f', 'yz450f'],
            'Indian'          => ['scout', 'chief', 'chieftain', 'roadmaster', 'challenger', 'ftr'],
            'Triumph'         => ['bonneville', 'street triple', 'speed triple', 'tiger', 'thruxton', 'rocket 3'],
            'Husqvarna'       => ['fc 250', 'fc 450', 'fe 350', '701 enduro', 'svartpilen', 'vitpilen'],
            'Vespa'           => ['gts 300', 'primavera', 'sprint'],
            'Can-Am'          => ['maverick', 'ryker', 'defender'],
            'Polaris'         => ['ranger', 'rzr', 'sportsman'],
        ];

        $targetMakeCanonical = null;
        if (!empty($make)) {
            $targetLower = strtolower(trim($make));
            foreach ($validOemMakesMap as $k => $can) {
                if ($targetLower === $k || str_contains($targetLower, $k)) {
                    $targetMakeCanonical = $can;
                    break;
                }
            }
        }

        $cleanModels = [];
        $ignoredModels = ['universal', 'all models', 'n/a', 'none', 'all makes', 'all', '1200', 'touring'];

        foreach ($allRawModels as $rm) {
            $currentMake = $targetMakeCanonical;
            $parts = explode('/', $rm);
            foreach ($parts as $part) {
                $subParts = explode(',', $part);
                foreach ($subParts as $sp) {
                    $trimmed = trim($sp);
                    if (!$trimmed) continue;

                    $trimmedLower = strtolower($trimmed);
                    if (in_array($trimmedLower, $ignoredModels)) continue;

                    $detectedMake = null;
                    $modelWithoutMake = $trimmed;
                    foreach ($validOemMakesMap as $key => $canonical) {
                        if (preg_match('/^' . preg_quote($key, '/') . '(\s+|$)/i', $trimmedLower)) {
                            $detectedMake = $canonical;
                            $modelWithoutMake = trim(preg_replace('/^' . preg_quote($key, '/') . '\s*/i', '', $trimmed));
                            break;
                        }
                    }

                    $activeMake = $detectedMake ?: $currentMake;

                    if ($targetMakeCanonical) {
                        if ($activeMake && $activeMake !== $targetMakeCanonical) {
                            continue;
                        }

                        $belongsToOtherMake = false;
                        foreach ($exclusiveModelsByMake as $otherMake => $sigList) {
                            if ($otherMake === $targetMakeCanonical) continue;
                            foreach ($sigList as $sig) {
                                if ($trimmedLower === $sig || str_contains($trimmedLower, $sig)) {
                                    $belongsToOtherMake = true;
                                    break 2;
                                }
                            }
                        }
                        if ($belongsToOtherMake) continue;
                    }

                    $finalModelName = $modelWithoutMake ?: $trimmed;
                    // Clean trailing parens or weird chars
                    $finalModelName = rtrim($finalModelName, ')');
                    $finalModelName = trim($finalModelName);

                    if ($finalModelName && !in_array(strtolower($finalModelName), array_map('strtolower', $cleanModels))) {
                        $cleanModels[] = $finalModelName;
                    }
                }
            }
        }
        sort($cleanModels);

        // 4. Clean Vehicle Types list
        $typesSet = ['Street Bike', 'Dirt Bike', 'UTV/ATV'];

        return response()->json([
            'years' => $years,
            'makes' => $cleanMakes,
            'models' => array_values($cleanModels),
            'types' => $typesSet,
        ]);
    }
}
