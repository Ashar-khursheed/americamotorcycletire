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
        $categoryCounts = $this->filterService->getCategoryCounts($request);

        return response()->json([
            'status' => 'success',
            'data' => $products,
            'category_counts' => $categoryCounts,
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

        // Group models into Sub-Categories (e.g., Harley CVO/SE, Harley Dyna, Harley Softail, Harley Sportster)
        $groupedModelsMap = [];
        $activeMakeName = $make ?: ($targetMakeCanonical ?? '');

        foreach ($cleanModels as $mod) {
            $explicitSubCat = ProductFitment::where('model', $mod)->whereNotNull('sub_category')->where('sub_category', '!=', '')->value('sub_category');
            $subCat = static::getModelSubCategory($activeMakeName, $mod, $explicitSubCat);
            if (!isset($groupedModelsMap[$subCat])) {
                $groupedModelsMap[$subCat] = [];
            }
            $groupedModelsMap[$subCat][] = $mod;
        }

        // Sort grouped categories logically
        ksort($groupedModelsMap);

        // 4. Clean Vehicle Types list
        $typesSet = ['Street Bike', 'Dirt Bike', 'UTV/ATV'];

        return response()->json([
            'years' => $years,
            'makes' => $cleanMakes,
            'models' => array_values($cleanModels),
            'grouped_models' => $groupedModelsMap,
            'types' => $typesSet,
        ]);
    }

    public static function getModelSubCategory(string $make, string $model, ?string $explicitSubCat = null): string
    {
        if (!empty($explicitSubCat)) {
            return trim($explicitSubCat);
        }

        $makeLower = strtolower(trim($make));
        $modelUpper = strtoupper(trim($model));
        $modelLower = strtolower(trim($model));

        // Harley-Davidson Sub-Families
        if (str_contains($makeLower, 'harley') || str_contains($makeLower, 'davidson') || str_contains($modelLower, 'harley') || str_contains($modelLower, 'flh') || str_contains($modelLower, 'fls') || str_contains($modelLower, 'fxd')) {
            if (
                str_contains($modelUpper, 'CVO') ||
                str_contains($modelUpper, 'FLHTKSE') ||
                str_contains($modelUpper, 'FLTRUSE') ||
                str_contains($modelUpper, 'FLSTNSE') ||
                str_contains($modelUpper, 'FLHXSE') ||
                str_contains($modelLower, 'screamin') ||
                str_contains($modelLower, 'custom vehicle')
            ) {
                return 'Harley CVO/SE';
            }

            if (
                str_contains($modelLower, 'dyna') ||
                preg_match('/\b(fxdf|fxdl|fxdb|fld|fxdwg|fxd|fxdc|fxd35)\b/i', $modelUpper) ||
                str_contains($modelLower, 'street bob') ||
                str_contains($modelLower, 'fat bob') ||
                str_contains($modelLower, 'low rider') ||
                str_contains($modelLower, 'wide glide') ||
                str_contains($modelLower, 'switchback') ||
                str_contains($modelLower, 'super glide')
            ) {
                return 'Harley Dyna';
            }

            if (
                str_contains($modelLower, 'softail') ||
                preg_match('/\b(fxsb|flstn|flstf|flstfb|flstc|fls|fxst|flst|fxstd|fxcw|fxstw)\b/i', $modelUpper) ||
                str_contains($modelLower, 'fat boy') ||
                str_contains($modelLower, 'heritage') ||
                str_contains($modelLower, 'breakout') ||
                str_contains($modelLower, 'deluxe') ||
                str_contains($modelLower, 'slim') ||
                str_contains($modelLower, 'deuce') ||
                str_contains($modelLower, 'cross bones') ||
                str_contains($modelLower, 'springer') ||
                str_contains($modelLower, 'night train') ||
                str_contains($modelLower, 'bad boy')
            ) {
                return 'Harley Softail';
            }

            if (
                str_contains($modelLower, 'sportster') ||
                preg_match('/\b(xl|xlh|xl883|xl1200|xr1200)\b/i', $modelUpper) ||
                str_contains($modelLower, 'iron 883') ||
                str_contains($modelLower, 'forty-eight') ||
                str_contains($modelLower, 'forty eight') ||
                str_contains($modelLower, 'nightster') ||
                str_contains($modelLower, 'superlow') ||
                str_contains($modelLower, 'seventy-two') ||
                str_contains($modelLower, 'seventy two') ||
                str_contains($modelLower, 'roadster')
            ) {
                return 'Harley Sportster';
            }

            if (
                str_contains($modelLower, 'touring') ||
                preg_match('/\b(flht|fltr|flhx|flhr|flhtc|flhtcu|fltrk|flhrc|flhxst|fltrxst)\b/i', $modelUpper) ||
                str_contains($modelLower, 'electra glide') ||
                str_contains($modelLower, 'road glide') ||
                str_contains($modelLower, 'street glide') ||
                str_contains($modelLower, 'road king') ||
                str_contains($modelLower, 'ultra limited') ||
                str_contains($modelLower, 'tri glide') ||
                str_contains($modelLower, 'freewheeler')
            ) {
                return 'Harley Touring';
            }

            if (
                str_contains($modelLower, 'v-rod') ||
                str_contains($modelLower, 'v rod') ||
                preg_match('/\b(vrsc|vrsca|vrscb|vrscd|vrscdx|vrscr|vrscf)\b/i', $modelUpper) ||
                str_contains($modelLower, 'night rod') ||
                str_contains($modelLower, 'street rod') ||
                str_contains($modelLower, 'vrod')
            ) {
                return 'Harley V-Rod';
            }

            if (
                str_contains($modelLower, 'street 500') ||
                str_contains($modelLower, 'street 750') ||
                preg_match('/\b(xg500|xg750)\b/i', $modelUpper)
            ) {
                return 'Harley Street';
            }

            return 'Harley-Davidson Models';
        }

        // Honda Sub-Families
        if (str_contains($makeLower, 'honda')) {
            if (preg_match('/cbr|fireblade|rc51/i', $modelLower)) return 'Honda Sportbike';
            if (preg_match('/crf|xr|cr\d/i', $modelLower)) return 'Honda Off-Road / Dirt';
            if (preg_match('/goldwing|gl1800|gl1500|ctx1300|st1300/i', $modelLower)) return 'Honda Touring';
            if (preg_match('/shadow|rebel|vtx|fury|sabre|stateline|interstate|magna/i', $modelLower)) return 'Honda Cruiser';
            if (preg_match('/africa twin|cb500x|nc750x|transalp/i', $modelLower)) return 'Honda Adventure';
            return 'Honda Motorcycles';
        }

        // Yamaha Sub-Families
        if (str_contains($makeLower, 'yamaha')) {
            if (preg_match('/yzf|r1|r6|r3|r7/i', $modelLower)) return 'Yamaha Sportbike';
            if (preg_match('/yz|wr/i', $modelLower)) return 'Yamaha Off-Road / Dirt';
            if (preg_match('/v-star|bolt|raider|stryker|road star|royal star|virago/i', $modelLower)) return 'Yamaha Cruiser';
            if (preg_match('/mt-|fz-|xs/i', $modelLower)) return 'Yamaha Hyper Naked';
            if (preg_match('/ténéré|tenere|tracer|super ténéré/i', $modelLower)) return 'Yamaha Adventure';
            return 'Yamaha Motorcycles';
        }

        // Kawasaki Sub-Families
        if (str_contains($makeLower, 'kawasaki')) {
            if (preg_match('/ninja|zx-/i', $modelLower)) return 'Kawasaki Sportbike';
            if (preg_match('/kx|klx/i', $modelLower)) return 'Kawasaki Off-Road / Dirt';
            if (preg_match('/vulcan|eliminator/i', $modelLower)) return 'Kawasaki Cruiser';
            if (preg_match('/klr|versys/i', $modelLower)) return 'Kawasaki Adventure';
            if (preg_match('/z\d00|z650|z400|z900/i', $modelLower)) return 'Kawasaki Naked';
            return 'Kawasaki Motorcycles';
        }

        // Suzuki Sub-Families
        if (str_contains($makeLower, 'suzuki')) {
            if (preg_match('/gsx-r|hayabusa|katana/i', $modelLower)) return 'Suzuki Sportbike';
            if (preg_match('/rm-z|dr-z|rm\d|dr\d/i', $modelLower)) return 'Suzuki Off-Road / Dirt';
            if (preg_match('/boulevard|intruder|s40|m109r|c50|c90/i', $modelLower)) return 'Suzuki Cruiser';
            if (preg_match('/v-strom/i', $modelLower)) return 'Suzuki Adventure';
            return 'Suzuki Motorcycles';
        }

        // BMW Sub-Families
        if (str_contains($makeLower, 'bmw')) {
            if (preg_match('/s1000rr|m1000rr/i', $modelLower)) return 'BMW Superbike';
            if (preg_match('/gs|r1250gs|f850gs|g310gs/i', $modelLower)) return 'BMW Adventure';
            if (preg_match('/rt|gt|k1600/i', $modelLower)) return 'BMW Touring';
            if (preg_match('/r ninet|r18/i', $modelLower)) return 'BMW Heritage';
            return 'BMW Motorcycles';
        }

        // KTM
        if (str_contains($makeLower, 'ktm')) {
            if (preg_match('/sx|xc|exc/i', $modelLower)) return 'KTM Motocross / Off-Road';
            if (preg_match('/duke/i', $modelLower)) return 'KTM Naked';
            if (preg_match('/adventure/i', $modelLower)) return 'KTM Adventure';
            return 'KTM Motorcycles';
        }

        // Ducati
        if (str_contains($makeLower, 'ducati')) {
            if (preg_match('/panigale/i', $modelLower)) return 'Ducati Superbike';
            if (preg_match('/monster|streetfighter/i', $modelLower)) return 'Ducati Naked';
            if (preg_match('/multistrada/i', $modelLower)) return 'Ducati Touring';
            if (preg_match('/scrambler/i', $modelLower)) return 'Ducati Scrambler';
            if (preg_match('/diavel/i', $modelLower)) return 'Ducati Cruiser';
            return 'Ducati Motorcycles';
        }

        return trim($make) ? ucfirst(trim($make)) . ' Models' : 'Motorcycle Models';
    }
}
