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

    public function reviews()
    {
        return $this->hasMany(ProductReview::class);
    }
}
