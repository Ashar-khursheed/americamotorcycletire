<?php

namespace App\Services;

use App\Models\Attribute;
use App\Models\Product;
use App\Models\ProductFitment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProductFilterService
{
    private function getModelSearchTerms($model, $make = '')
    {
        if (empty($model)) return [];

        $modelLower = strtolower(trim($model));
        $terms = [$modelLower];

        $cleanModel = preg_replace('/^(harley-davidson|harley|honda|yamaha|kawasaki|suzuki|bmw|ktm|ducati|triumph|indian|victory)\s+/i', '', $modelLower);
        if ($cleanModel && $cleanModel !== $modelLower) {
            $terms[] = trim($cleanModel);
        }

        // Harley-Davidson Family Mappings (including database truncated stubs like 'ele', 'roa', 'str', 'her', 'fat', etc.)
        if (str_contains($modelLower, 'electra') || str_contains($modelLower, 'street glide') || str_contains($modelLower, 'road glide') || str_contains($modelLower, 'road king') || str_contains($modelLower, 'ultra') || str_contains($modelLower, 'cvo') || str_contains($modelLower, 'flh')) {
            $terms = array_merge($terms, ['electra', 'ele', 'street glide', 'str', 'road glide', 'road king', 'roa', 'flh', 'ultra', 'cvo', 'flht', 'flhx', 'fltr']);
        } elseif (str_contains($modelLower, 'softail') || str_contains($modelLower, 'fat boy') || str_contains($modelLower, 'heritage') || str_contains($modelLower, 'deluxe') || str_contains($modelLower, 'slim') || str_contains($modelLower, 'breakout')) {
            $terms = array_merge($terms, ['softail', 'fat boy', 'fat', 'heritage', 'her', 'deluxe', 'del', 'deuce', 'deu', 'slim', 'breakout', 'night train', 'nig', 'flst', 'fxst']);
        } elseif (str_contains($modelLower, 'dyna') || str_contains($modelLower, 'low rider') || str_contains($modelLower, 'street bob') || str_contains($modelLower, 'fat bob') || str_contains($modelLower, 'wide glide')) {
            $terms = array_merge($terms, ['dyna', 'low rider', 'street bob', 'fat bob', 'wide glide', 'fxd']);
        } elseif (str_contains($modelLower, 'sportster') || str_contains($modelLower, 'iron') || str_contains($modelLower, 'forty-eight') || str_contains($modelLower, '72') || str_contains($modelLower, '1200') || str_contains($modelLower, '883')) {
            $terms = array_merge($terms, ['sportster', 'iron', 'forty-eight', '883', '1200', 'xl']);
        } elseif (str_contains($modelLower, 'v-rod') || str_contains($modelLower, 'v rod') || str_contains($modelLower, 'vrsc') || str_contains($modelLower, 'night rod')) {
            $terms = array_merge($terms, ['v-rod', 'v rod', 'vrsc', 'night rod']);
        }

        // Honda Mappings
        if (str_contains($modelLower, 'goldwing') || str_contains($modelLower, 'gold wing') || str_contains($modelLower, 'f6b') || str_contains($modelLower, 'valkyrie')) {
            $terms = array_merge($terms, ['goldwing', 'gold wing', 'f6b', 'valkyrie']);
        } elseif (str_contains($modelLower, 'shadow') || str_contains($modelLower, 'phantom') || str_contains($modelLower, 'vt750') || str_contains($modelLower, 'vt1100')) {
            $terms = array_merge($terms, ['shadow', 'phantom', 'vt750', 'vt1100']);
        } elseif (str_contains($modelLower, 'vtx')) {
            $terms = array_merge($terms, ['vtx', 'vtx1300', 'vtx1800']);
        }

        // Yamaha Mappings
        if (str_contains($modelLower, 'v-star') || str_contains($modelLower, 'vstar') || str_contains($modelLower, 'bolt') || str_contains($modelLower, 'dragstar') || str_contains($modelLower, 'stryker') || str_contains($modelLower, 'raider')) {
            $terms = array_merge($terms, ['v-star', 'vstar', 'bolt', 'dragstar', 'stryker', 'raider']);
        }

        // Kawasaki Mappings
        if (str_contains($modelLower, 'vulcan') || str_contains($modelLower, 'vn')) {
            $terms = array_merge($terms, ['vulcan', 'vn', 'vn900', 'vn1500', 'vn1600', 'vn1700', 'vn2000']);
        }

        // Suzuki Mappings
        if (str_contains($modelLower, 'boulevard') || str_contains($modelLower, 'intruder') || str_contains($modelLower, 'c50') || str_contains($modelLower, 'm50') || str_contains($modelLower, 'm109r')) {
            $terms = array_merge($terms, ['boulevard', 'intruder', 'c50', 'm50', 'm109r', 'vl800', 'vz800']);
        }

        // BMW Mappings
        if (str_contains($modelLower, 'gs') || str_contains($modelLower, 'r1200gs') || str_contains($modelLower, 'r1250gs')) {
            $terms = array_merge($terms, ['gs', 'r1200gs', 'r1250gs', 'r1200', 'r1250']);
        } elseif (str_contains($modelLower, 'rt') || str_contains($modelLower, 'k1600')) {
            $terms = array_merge($terms, ['rt', 'k1600', 'r1200rt', 'r1250rt']);
        }

        // Indian Mappings
        if (str_contains($modelLower, 'scout') || str_contains($modelLower, 'chief') || str_contains($modelLower, 'chieftain') || str_contains($modelLower, 'roadmaster') || str_contains($modelLower, 'challenger')) {
            $terms = array_merge($terms, ['scout', 'chief', 'chieftain', 'roadmaster', 'challenger']);
        }

        return array_unique(array_filter($terms));
    }

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
                             ->orWhere('product_type', 'like', '%scooter%')
                             ->orWhere('product_type', 'like', '%moped%')
                             ->orWhere('product_type', 'like', '%street%')
                             ->orWhere('product_type', 'like', '%sport touring%')
                             ->orWhere('product_type', 'like', '%dot tire%')
                             ->orWhere('vehicle_type', 'like', '%sport%')
                             ->orWhere('vehicle_type', 'like', '%street%')
                             ->orWhere('name', 'like', '%sport%')
                             ->orWhere('name', 'like', '%scooter%')
                             ->orWhere('name', 'like', '%hypersport%');
                    });
                } elseif (in_array($bikeCategory, ['race', 'track'])) {
                    $q->where(function ($subQ) {
                        $subQ->where('product_type', 'like', '%race%')
                             ->orWhere('product_type', 'like', '%track%')
                             ->orWhere('product_type', 'like', '%slick%')
                             ->orWhere('product_type', 'like', '%hypersport%')
                             ->orWhere('product_type', 'like', '%supersport%')
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
                             ->orWhere('product_type', 'like', '%touring%')
                             ->orWhere('product_type', 'like', '%vintage%')
                             ->orWhere('vehicle_type', 'like', '%cruiser%')
                             ->orWhere('name', 'like', '%cruiser%')
                             ->orWhere('name', 'like', '%harley%')
                             ->orWhere('name', 'like', '%commander%')
                             ->orWhere('name', 'like', '%touring%')
                             ->orWhere('name', 'like', '%cobra chrome%');
                    });
                } elseif (in_array($bikeCategory, ['dualsport', 'dual sport', 'adventure', 'dirt'])) {
                    $q->where(function ($subQ) {
                        $subQ->where('vehicle_type', 'like', '%dirt%')
                             ->orWhere('product_type', 'like', '%dirt%')
                             ->orWhere('product_type', 'like', '%motocross%')
                             ->orWhere('product_type', 'like', '%off road%')
                             ->orWhere('product_type', 'like', '%enduro%')
                             ->orWhere('product_type', 'like', '%dual sport%')
                             ->orWhere('product_type', 'like', '%dualsport%')
                             ->orWhere('product_type', 'like', '%adventure%')
                             ->orWhere('product_type', 'like', '%soft terrain%')
                             ->orWhere('product_type', 'like', '%intermediate terrain%')
                             ->orWhere('product_type', 'like', '%hard terrain%')
                             ->orWhere('product_type', 'like', '%sand%')
                             ->orWhere('product_type', 'like', '%mud%')
                             ->orWhere('product_type', 'like', '%trials%')
                             ->orWhere('name', 'like', '%dirt%')
                             ->orWhere('name', 'like', '%motocross%')
                             ->orWhere('name', 'like', '%mx%')
                             ->orWhere('name', 'like', '%starcross%')
                             ->orWhere('name', 'like', '%geomax%');
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
                    } elseif (in_array($lowerT, ['street bike', 'street bikes', 'street'])) {
                        $q->orWhere('vehicle_type', 'like', '%street%')
                          ->orWhere('product_type', 'like', '%street%')
                          ->orWhere('product_type', 'like', '%cruiser%')
                          ->orWhere('product_type', 'like', '%touring%')
                          ->orWhere('product_type', 'like', '%sport%')
                          ->orWhere('product_type', 'like', '%dot%');
                    } else {
                        $q->orWhere('vehicle_type', 'like', "%{$trimT}%")
                          ->orWhere('product_type', 'like', "%{$trimT}%");
                    }
                }
            });
        }

        // 3. Vehicle Type Filter
        if ($request->filled('vehicle_type') && empty($request->input('make'))) {
            $vTypes = is_array($request->input('vehicle_type'))
                ? $request->input('vehicle_type')
                : explode(',', $request->input('vehicle_type'));
            
            $query->where(function ($q) use ($vTypes) {
                foreach ($vTypes as $vt) {
                    $trimVt = trim($vt);
                    if (empty($trimVt)) continue;

                    $lowerVt = strtolower($trimVt);
                    if (in_array($lowerVt, ['sportbike', 'sportbikes', 'cruiser', 'cruisers', 'touring', 'dualsport', 'dual sport', 'adventure', 'dirt', 'scooter', 'scooters', 'race'])) {
                        $q->orWhere(function ($sub) use ($lowerVt) {
                            if (in_array($lowerVt, ['sportbike', 'sportbikes'])) {
                                $sub->where('product_type', 'like', '%sportbike%')
                                    ->orWhere('product_type', 'like', '%hypersport%')
                                    ->orWhere('product_type', 'like', '%supersport%')
                                    ->orWhere('vehicle_type', 'like', '%street%')
                                    ->orWhere('name', 'like', '%sport%');
                            } elseif (in_array($lowerVt, ['cruiser', 'cruisers'])) {
                                $sub->where('product_type', 'like', '%cruiser%')
                                    ->orWhere('product_type', 'like', '%harley%')
                                    ->orWhere('vehicle_type', 'like', '%street%')
                                    ->orWhere('name', 'like', '%cruiser%');
                            } elseif ($lowerVt === 'touring') {
                                $sub->where('product_type', 'like', '%touring%')
                                    ->orWhere('vehicle_type', 'like', '%street%')
                                    ->orWhere('name', 'like', '%touring%');
                            } elseif (in_array($lowerVt, ['dirt', 'motocross'])) {
                                $sub->where('vehicle_type', 'like', '%dirt%')
                                    ->orWhere('product_type', 'like', '%dirt%')
                                    ->orWhere('name', 'like', '%dirt%');
                            } elseif (in_array($lowerVt, ['dualsport', 'dual sport', 'adventure'])) {
                                $sub->where('product_type', 'like', '%dual sport%')
                                    ->orWhere('product_type', 'like', '%adventure%')
                                    ->orWhere('vehicle_type', 'like', '%dirt%')
                                    ->orWhere('name', 'like', '%adventure%');
                            } elseif (in_array($lowerVt, ['scooter', 'scooters'])) {
                                $sub->where('vehicle_type', 'like', '%scooter%')
                                    ->orWhere('product_type', 'like', '%scooter%')
                                    ->orWhere('name', 'like', '%scooter%');
                            }
                        });
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
            $terms = $this->getModelSearchTerms($model, $make);

            $query->where(function ($q) use ($year, $make, $model, $terms) {
                // Primary: check structured fitments table
                $q->whereHas('fitments', function ($fitQ) use ($year, $make, $model, $terms) {
                    if (!empty($year)) {
                        $yInt = (int)$year;
                        $fitQ->where(function ($subQ) use ($year, $yInt) {
                            $subQ->where('year', 'like', "%{$year}%")
                                 ->orWhereNull('year')
                                 ->orWhere('year', '');
                            if ($yInt > 0) {
                                $subQ->orWhereRaw("CAST(SUBSTRING_INDEX(year, '-', 1) AS UNSIGNED) <= ? AND CAST(SUBSTRING_INDEX(year, '-', -1) AS UNSIGNED) >= ?", [$yInt, $yInt]);
                            }
                        });
                    }
                    if (!empty($make)) {
                        $fitQ->where('make', 'like', "%{$make}%");
                    }
                    if (!empty($model)) {
                        $fitQ->where(function ($subModelQ) use ($model, $terms) {
                            $subModelQ->where('model', 'like', "%{$model}%");
                            foreach ($terms as $t) {
                                $subModelQ->orWhere('model', 'like', "%{$t}%");
                            }
                        });
                    }
                });

                // Fallback: check columns on products table
                $q->orWhere(function ($textQ) use ($year, $make, $model, $terms) {
                    if (!empty($make)) {
                        $textQ->where(function($mQ) use ($make) {
                            $mQ->where('compatible_makes', 'like', "%{$make}%");
                            $makeLower = strtolower($make);
                            if (str_contains($makeLower, 'harley')) {
                                $mQ->orWhere('product_type', 'like', '%harley%')
                                   ->orWhere('name', 'like', '%harley%');
                            }
                        });
                    }
                    if (!empty($model)) {
                        $textQ->where(function ($subModelQ) use ($model, $terms) {
                            $subModelQ->where('compatible_models', 'like', "%{$model}%");
                            foreach ($terms as $t) {
                                $subModelQ->orWhere('compatible_models', 'like', "%{$t}%")
                                          ->orWhere('product_type', 'like', "%{$t}%")
                                          ->orWhere('name', 'like', "%{$t}%");
                            }
                        });
                    }
                    if (!empty($year)) {
                        $yInt = (int)$year;
                        $textQ->where(function($yQ) use ($year, $yInt) {
                            $yQ->where('fitment_year_range', 'like', "%{$year}%")
                               ->orWhereNull('fitment_year_range')
                               ->orWhere('fitment_year_range', '');
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

            $isCruiserVehicle = str_contains($makeLower, 'harley') || 
                                str_contains($modelLower, 'electra') || 
                                str_contains($modelLower, 'street glide') || 
                                str_contains($modelLower, 'road glide') || 
                                str_contains($modelLower, 'road king') || 
                                str_contains($modelLower, 'softail') || 
                                str_contains($modelLower, 'fat boy') || 
                                str_contains($modelLower, 'dyna') || 
                                str_contains($modelLower, 'sportster') || 
                                str_contains($modelLower, 'vulcan') || 
                                str_contains($modelLower, 'boulevard') || 
                                str_contains($modelLower, 'shadow');

            if ($isCruiserVehicle) {
                // Cruiser bike selected: exclude Scooter, UTV/ATV, Dirt, Drag Slicks, Race, Flat Track, and Dual Sport tires
                $query->where('vehicle_type', '!=', 'UTV/ATV')
                      ->where('product_type', 'not like', '%scooter%')
                      ->where('product_type', 'not like', '%hypersport%')
                      ->where('product_type', 'not like', '%dirt bike%')
                      ->where('product_type', 'not like', '%race%')
                      ->where('product_type', 'not like', '%drag%')
                      ->where('product_type', 'not like', '%slick%')
                      ->where('product_type', 'not like', '%dual sport%')
                      ->where('name', 'not like', '%drag%')
                      ->where('name', 'not like', '%slick%')
                      ->where('name', 'not like', '%track%');
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
        $sort = $request->input('sort', 'name_asc');
        switch ($sort) {
            case 'name_asc':
            default:
                $query->orderBy('name', 'asc');
                break;
            case 'name_desc':
                $query->orderBy('name', 'desc');
                break;
            case 'price_asc':
                $query->orderBy('price', 'asc');
                break;
            case 'price_desc':
                $query->orderBy('price', 'desc');
                break;
            case 'rating_desc':
                $query->orderBy('rating', 'desc');
                break;
            case 'newest':
                $query->orderBy('id', 'desc');
                break;
            case 'featured':
                $query->orderByRaw("CASE 
                    WHEN name LIKE '%Shinko 777%' THEN 1 
                    WHEN name LIKE '%Metzeler CruiseTec%' THEN 2 
                    WHEN name LIKE '%Commander III%' THEN 3 
                    WHEN name LIKE '%ME888%' THEN 4 
                    WHEN name LIKE '%D402%' THEN 5 
                    WHEN name LIKE '%Night Dragon%' THEN 6 
                    WHEN name LIKE '%American Elite%' THEN 7 
                    WHEN name LIKE '%AE2%' THEN 8 
                    WHEN name LIKE '%D401%' THEN 9 
                    WHEN name LIKE '%Cobra Chrome%' THEN 10 
                    ELSE 100 END ASC")
                      ->orderBy('is_featured', 'desc')
                      ->orderBy('review_count', 'desc')
                      ->orderBy('id', 'asc');
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

    public function getCategoryCounts(Request $request)
    {
        $queryParams = $request->query();
        unset($queryParams['bike_category']);

        $counts = [];
        foreach (['sportbike', 'cruiser', 'dirt', 'race'] as $cat) {
            $catParams = array_merge($queryParams, ['bike_category' => $cat]);
            $catReq = Request::create($request->path(), $request->method(), $catParams);
            $res = $this->getFilteredProducts($catReq);
            $counts[$cat] = method_exists($res, 'total') ? $res->total() : (is_countable($res) ? count($res) : 0);
        }
        return $counts;
    }
}
