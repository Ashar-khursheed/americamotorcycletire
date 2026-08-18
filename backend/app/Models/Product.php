<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Product extends Model
{
    use HasFactory;

    protected static function booted()
    {
        static::creating(function ($product) {
            if (empty($product->slug)) {
                $product->slug = Str::slug($product->name);
            }
            $product->slug = static::generateUniqueSlug($product->slug, $product->id);
        });

        static::updating(function ($product) {
            if ($product->isDirty('slug') || empty($product->slug)) {
                $slugToUse = $product->slug ?: $product->name;
                $product->slug = static::generateUniqueSlug($slugToUse, $product->id);
            }
        });
    }

    public static function generateUniqueSlug($slugInput, $ignoreId = null)
    {
        $slug = Str::slug($slugInput);
        if (empty($slug)) {
            $slug = 'product-' . strtolower(Str::random(6));
        }

        $originalSlug = $slug;
        $count = 1;

        while (static::where('slug', $slug)
            ->when($ignoreId, function ($query) use ($ignoreId) {
                return $query->where('id', '!=', $ignoreId);
            })
            ->exists()) {
            $slug = "{$originalSlug}-{$count}";
            $count++;
        }

        return $slug;
    }

    protected $fillable = [
        'sku',
        'name',
        'slug',
        'brand',
        'category_id',
        'vehicle_type',
        'product_type',
        'compatible_makes',
        'compatible_models',
        'fitment_year_range',
        'item_number',
        'price',
        'was_price',
        'compare_at_price',
        'cost_price',
        'savings',
        'rating',
        'review_count',
        'front_tire_fitment',
        'rear_tire_fitment',
        'wheel_locations',
        'available_sizes_count',
        'available_sizes',
        'total_part_numbers',
        'short_description',
        'description',
        'specs_and_features',
        'fitment_vehicle',
        'fitment_disclaimer',
        'primary_image',
        'gallery_images',
        'custom_attributes',
        'meta_title',
        'meta_description',
        'meta_keywords',
        'canonical_url',
        'source_url',
        'stock_quantity',
        'is_active',
        'is_featured',
    ];

    protected $casts = [
        'gallery_images' => 'array',
        'custom_attributes' => 'array',
        'price' => 'decimal:2',
        'was_price' => 'decimal:2',
        'compare_at_price' => 'decimal:2',
        'rating' => 'decimal:2',
        'review_count' => 'integer',
        'available_sizes_count' => 'integer',
        'total_part_numbers' => 'integer',
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function variants()
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function productAttributeValues()
    {
        return $this->hasMany(ProductAttributeValue::class);
    }

    public function fitments()
    {
        return $this->hasMany(ProductFitment::class);
    }

    public static function sanitizeText(?string $text): ?string
    {
        if ($text === null) return null;
        // Strip replacement characters (\uFFFD / \xEF\xBF\xBD) and non-breaking spaces
        $clean = preg_replace('/[\x{FFFD}\x{00A0}]/u', '', $text);
        $clean = str_replace(["\xEF\xBF\xBD", "\u{FFFD}", ''], '', $clean);
        return trim(preg_replace('/\s+/', ' ', $clean));
    }

    public function getNameAttribute($value)
    {
        return static::sanitizeText($value);
    }

    public function getShortDescriptionAttribute($value)
    {
        return static::sanitizeText($value);
    }

    public function getDescriptionAttribute($value)
    {
        return static::sanitizeText($value);
    }

    public function getCompatibleModelsAttribute($value)
    {
        return static::sanitizeText($value);
    }

    public function getCompatibleMakesAttribute($value)
    {
        return static::sanitizeText($value);
    }

    public static function formatImageUrl(?string $value): ?string
    {
        if (empty($value)) return null;

        $value = stripslashes(trim($value, " \t\n\r\0\x0B\"'[]"));
        if (empty($value)) return null;

        if (str_contains($value, 'americaapi.kaafifoods.com')) {
            $value = str_replace('https://americaapi.kaafifoods.com/', '', $value);
            $value = str_replace('http://americaapi.kaafifoods.com/', '', $value);
        }

        $baseUrl = rtrim(config('app.url', 'http://localhost:8000'), '/');

        if (str_contains($value, '127.0.0.1:8000') || str_contains($value, 'localhost:8000')) {
            $value = preg_replace('#http://(127\.0\.0\.1|localhost):8000#i', $baseUrl, $value);
        }

        if (!str_starts_with($value, 'http://') && !str_starts_with($value, 'https://')) {
            $path = ltrim($value, '/');
            if (!str_starts_with($path, 'storage/')) {
                $path = 'storage/' . $path;
            }
            return $baseUrl . '/' . $path;
        }

        return $value;
    }

    public function getPrimaryImageAttribute($value)
    {
        return static::formatImageUrl($value);
    }

    public function getGalleryImagesAttribute($value)
    {
        $images = [];
        if (is_string($value) && !empty($value)) {
            $clean = stripslashes(trim($value, " \t\n\r\0\x0B"));
            $decoded = json_decode($clean, true);
            if (is_array($decoded)) {
                $images = $decoded;
            } else {
                $normalized = str_replace("'", '"', $clean);
                $decoded = json_decode($normalized, true);
                if (is_array($decoded)) {
                    $images = $decoded;
                } else {
                    preg_match_all('#(https?://[^\s,\'\"\[\]]+|storage/[^\s,\'\"\[\]]+)#i', $clean, $matches);
                    if (!empty($matches[0])) {
                        $images = $matches[0];
                    } elseif (str_contains($clean, ';')) {
                        $images = array_map(fn($item) => trim($item, " \t\n\r\0\x0B\"'[]"), explode(';', $clean));
                    } else {
                        $images = [trim($clean, " \t\n\r\0\x0B\"'[]")];
                    }
                }
            }
        } elseif (is_array($value)) {
            $images = $value;
        }

        if (empty($images)) {
            $primary = static::formatImageUrl($this->attributes['primary_image'] ?? null);
            return $primary ? [$primary] : [];
        }

        return array_values(array_filter(array_map(fn($img) => static::formatImageUrl($img), $images)));
    }

    public function reviews()
    {
        return $this->hasMany(ProductReview::class);
    }
}
