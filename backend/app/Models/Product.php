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
        'short_description',
        'description',
        'price',
        'compare_at_price',
        'cost_price',
        'stock_quantity',
        'category_id',
        'primary_image',
        'gallery_images',
        'custom_attributes',
        'meta_title',
        'meta_description',
        'meta_keywords',
        'canonical_url',
        'is_active',
        'is_featured',
    ];

    protected $casts = [
        'gallery_images' => 'array',
        'custom_attributes' => 'array',
        'price' => 'decimal:2',
        'compare_at_price' => 'decimal:2',
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

    public static function formatImageUrl(?string $value): ?string
    {
        if (empty($value)) return null;

        $baseUrl = rtrim(config('app.url', 'https://americaapi.kaafifoods.com'), '/');

        // Replace local dev host URL if present
        if (str_contains($value, '127.0.0.1:8000') || str_contains($value, 'localhost:8000')) {
            $value = preg_replace('#http://(127\.0\.0\.1|localhost):8000#i', $baseUrl, $value);
        }

        // Handle relative storage paths e.g. storage/products/xxx.webp or /storage/products/xxx.webp
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
        $images = is_string($value) ? json_decode($value, true) : $value;
        if (!is_array($images)) return [];
        return array_map(fn($img) => static::formatImageUrl($img), $images);
    }

    public function reviews()
    {
        return $this->hasMany(ProductReview::class);
    }
}
