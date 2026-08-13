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

        // 2. Bike Category & Type Filter ('bike_category', 'type', or 'product_type')
        $bikeCategory = strtolower(trim($request->input('bike_category') ?? ''));
        $typeParam = $request->input('type') ?: $request->input('product_type');

        if (!empty($bikeCategory)) {
            $query->where(function ($q) use ($bikeCategory) {
                if (in_array($bikeCategory, ['sportbike', 'sportbikes'])) {
                    $q->where(function ($subQ) {
                        $subQ->where('product_type', 'like', '%sportbike%')
                             ->orWhere('product_type', 'like', '%hypersport%')
                             ->orWhere('product_type', 'like', '%supersport%')
                             ->orWhere('product_type', 'like', '%supermoto%')
                             ->orWhere('vehicle_type', 'like', '%sport%')
                             ->orWhere('name', 'like', '%sport%')
                             ->orWhere('name', 'like', '%hypersport%');
                    });
                } elseif (in_array($bikeCategory, ['race', 'track'])) {
                    $q->where(function ($subQ) {
                        $subQ->where('product_type', 'like', '%race%')
                             ->orWhere('product_type', 'like', '%track%')
                             ->orWhere('product_type', 'like', '%slick%')
                             ->orWhere('name', 'like', '%race%')
                             ->orWhere('name', 'like', '%slick%')
                             ->orWhere('name', 'like', '%supercorsa%')
                             ->orWhere('name', 'like', '%race tec%');
                    });
                } elseif ($bikeCategory === 'cruiser') {
                    $q->where(function ($subQ) {
                        $subQ->where('product_type', 'like', '%cruiser%')
                             ->orWhere('product_type', 'like', '%harley%')
                             ->orWhere('product_type', 'like', '%v-twin%')
                             ->orWhere('product_type', 'like', '%custom%')
                             ->orWhere('product_type', 'like', '%whitewall%')
                             ->orWhere('name', 'like', '%cruiser%')
                             ->orWhere('name', 'like', '%harley%')
                             ->orWhere('name', 'like', '%commander%')
                             ->orWhere('name', 'like', '%cobra chrome%');
                    });
                } elseif (in_array($bikeCategory, ['dualsport', 'dual sport', 'adventure'])) {
                    $q->where(function ($subQ) {
                        $subQ->where('product_type', 'like', '%dual sport%')
                             ->orWhere('product_type', 'like', '%dualsport%')
                             ->orWhere('product_type', 'like', '%adventure%')
                             ->orWhere('product_type', 'like', '%enduro%')
                             ->orWhere('vehicle_type', 'like', '%dual sport%')
                             ->orWhere('name', 'like', '%dual sport%')
                             ->orWhere('name', 'like', '%dualsport%')
                             ->orWhere('name', 'like', '%adventure%')
                             ->orWhere('name', 'like', '%trail%')
                             ->orWhere('name', 'like', '%anakee%')
                             ->orWhere('name', 'like', '%trailmax%')
                             ->orWhere('name', 'like', '%tkc%');
                    });
                } elseif ($bikeCategory === 'touring') {
                    $q->where(function ($subQ) {
                        $subQ->where('product_type', 'like', '%touring%')
                             ->orWhere('vehicle_type', 'like', '%touring%')
                             ->orWhere('name', 'like', '%touring%')
                             ->orWhere('name', 'like', '%road attack%')
                             ->orWhere('name', 'like', '%marathon%');
                    });
                } elseif ($bikeCategory === 'dirt') {
                    $q->where(function ($subQ) {
                        $subQ->where('vehicle_type', 'like', '%dirt%')
                             ->orWhere('product_type', 'like', '%dirt%')
                             ->orWhere('product_type', 'like', '%motocross%')
                             ->orWhere('product_type', 'like', '%off road%')
                             ->orWhere('product_type', 'like', '%enduro%')
                             ->orWhere('product_type', 'like', '%soft terrain%')
                             ->orWhere('product_type', 'like', '%intermediate terrain%')
                             ->orWhere('product_type', 'like', '%hard terrain%')
                             ->orWhere('product_type', 'like', '%sand%')
                             ->orWhere('product_type', 'like', '%mud%')
                             ->orWhere('name', 'like', '%dirt%')
                             ->orWhere('name', 'like', '%motocross%')
                             ->orWhere('name', 'like', '%mx%')
                             ->orWhere('name', 'like', '%starcross%')
                             ->orWhere('name', 'like', '%geomax%');
                    });
                } elseif (in_array($bikeCategory, ['scooter', 'scooters', 'moped'])) {
                    $q->where(function ($subQ) {
                        $subQ->where('vehicle_type', 'like', '%scooter%')
                             ->orWhere('product_type', 'like', '%scooter%')
                             ->orWhere('product_type', 'like', '%moped%')
                             ->orWhere('name', 'like', '%scooter%')
                             ->orWhere('name', 'like', '%moped%')
                             ->orWhere('name', 'like', '%city grip%')
                             ->orWhere('name', 'like', '%bopper%');
                    });
                }
            });
        } elseif (!empty($typeParam)) {
            $types = is_array($typeParam) ? $typeParam : explode(',', $typeParam);
            $query->where(function ($q) use ($types) {
                foreach ($types as $t) {
                    $trimT = trim($t);
                    if (empty($trimT)) continue;

                    $lowerT = strtolower($trimT);
                    if (in_array($lowerT, ['sportbike', 'sportbikes'])) {
                        $q->orWhere('product_type', 'like', '%sportbike%')
                          ->orWhere('product_type', 'like', '%hypersport%')
                          ->orWhere('product_type', 'like', '%race%')
                          ->orWhere('product_type', 'like', '%supermoto%');
                    } elseif (in_array($lowerT, ['race', 'track'])) {
                        $q->orWhere('product_type', 'like', '%race%')
                          ->orWhere('product_type', 'like', '%hypersport%')
                          ->orWhere('product_type', 'like', '%slick%');
                    } elseif (in_array($lowerT, ['cruiser', 'cruisers'])) {
                        $q->orWhere('vehicle_type', 'like', '%cruiser%')
                          ->orWhere('product_type', 'like', '%cruiser%')
                          ->orWhere('product_type', 'like', '%custom%');
                    } elseif (in_array($lowerT, ['dualsport', 'dual sport', 'adventure'])) {
                        $q->orWhere('product_type', 'like', '%dual sport%')
                          ->orWhere('product_type', 'like', '%adventure%')
                          ->orWhere('vehicle_type', 'like', '%dual sport%');
                    } elseif (in_array($lowerT, ['touring'])) {
                        $q->orWhere('product_type', 'like', '%touring%')
                          ->orWhere('vehicle_type', 'like', '%touring%');
                    } elseif (in_array($lowerT, ['dirt', 'motocross', 'offroad', 'off-road'])) {
                        $q->orWhere('vehicle_type', 'like', '%dirt%')
                          ->orWhere('product_type', 'like', '%dirt%')
                          ->orWhere('product_type', 'like', '%motocross%');
                    } elseif (in_array($lowerT, ['scooter', 'scooters'])) {
                        $q->orWhere('vehicle_type', 'like', '%scooter%')
                          ->orWhere('product_type', 'like', '%scooter%');
                    } else {
                        $q->orWhere('vehicle_type', 'like', "%{$trimT}%")
                          ->orWhere('product_type', 'like', "%{$trimT}%");
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
        $year = trim($request->input('year') ?? '');
        $make = trim($request->input('make') ?? '');
        $model = trim($request->input('model') ?? '');

        if (!empty($year) || !empty($make) || !empty($model)) {
            $query->where(function ($q) use ($year, $make, $model) {
                // Primary: check structured fitments table
                $q->whereHas('fitments', function ($fitQ) use ($year, $make, $model) {
                    if (!empty($year)) {
                        $yInt = (int)$year;
                        $fitQ->where(function ($subQ) use ($year, $yInt) {
                            $subQ->where('year', 'like', "%{$year}%");
                            if ($yInt > 0) {
                                $subQ->orWhereRaw("CAST(SUBSTRING_INDEX(year, '-', 1) AS UNSIGNED) <= ? AND CAST(SUBSTRING_INDEX(year, '-', -1) AS UNSIGNED) >= ?", [$yInt, $yInt]);
                            }
                        });
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
                        $yInt = (int)$year;
                        $textQ->where(function($yQ) use ($year, $yInt) {
                            $yQ->where('fitment_year_range', 'like', "%{$year}%");
                            if ($yInt > 0) {
                                $yQ->orWhereRaw("CAST(SUBSTRING_INDEX(fitment_year_range, '-', 1) AS UNSIGNED) <= ? AND CAST(SUBSTRING_INDEX(fitment_year_range, '-', -1) AS UNSIGNED) >= ?", [$yInt, $yInt]);
                            }
                        });
                    }
                });
            });

            // Enforce vehicle model category compatibility (e.g. Cruiser models exclude Scooter / Dirt / Pure Sportbike)
            $modelLower = strtolower($model);
            $makeLower  = strtolower($make);

            $isCruiserVehicle = str_contains($makeLower, 'harley') || str_contains($modelLower, 'street glide') || str_contains($modelLower, 'road glide') || str_contains($modelLower, 'softail') || str_contains($modelLower, 'fat boy') || str_contains($modelLower, 'dyna') || str_contains($modelLower, 'sportster') || str_contains($modelLower, 'vulcan') || str_contains($modelLower, 'boulevard') || str_contains($modelLower, 'shadow');

            if ($isCruiserVehicle) {
                // Cruiser bike selected: exclude Scooter, UTV/ATV, Dirt, and pure Hypersport/Race tires
                $query->where('vehicle_type', '!=', 'UTV/ATV')
                      ->where('product_type', 'not like', '%scooter%')
                      ->where('product_type', 'not like', '%hypersport%')
                      ->where('product_type', 'not like', '%dirt bike%');
            }
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

        $rawMakesList = ProductFitment::distinct()->whereNotNull('make')->where('make', '!=', '')->pluck('make');
        $cleanMakesSet = [];
        foreach ($rawMakesList as $m) {
            $lower = strtolower(trim($m));
            foreach ($validOemMakesMap as $key => $canonicalName) {
                if (str_contains($lower, $key) || $lower === $key) {
                    if (!in_array($canonicalName, $cleanMakesSet)) {
                        $cleanMakesSet[] = $canonicalName;
                    }
                    break;
                }
            }
        }
        sort($cleanMakesSet);
        $makes = collect($cleanMakesSet);

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
