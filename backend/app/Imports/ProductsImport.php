<?php

namespace App\Imports;

use App\Models\Attribute;
use App\Models\AttributeValue;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductAttributeValue;
use Illuminate\Support\Str;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class ProductsImport implements ToModel, WithHeadingRow
{
    public function model(array $row)
    {
        if (empty($row['name']) || empty($row['price'])) {
            return null;
        }

        // Category lookup or creation
        $category = null;
        if (!empty($row['category'])) {
            $category = Category::firstOrCreate(
                ['slug' => Str::slug($row['category'])],
                ['name' => $row['category']]
            );
        }

        $sku = !empty($row['sku']) ? $row['sku'] : 'SKU-' . strtoupper(Str::random(8));

        $product = Product::updateOrCreate(
            ['sku' => $sku],
            [
                'name' => $row['name'],
                'slug' => Str::slug($row['name']) . '-' . strtolower(Str::random(4)),
                'brand' => $row['brand'] ?? null,
                'short_description' => $row['short_description'] ?? null,
                'description' => $row['description'] ?? null,
                'price' => (float) $row['price'],
                'compare_at_price' => !empty($row['compare_at_price']) ? (float) $row['compare_at_price'] : null,
                'stock_quantity' => isset($row['stock_quantity']) ? (int) $row['stock_quantity'] : 10,
                'category_id' => $category?->id,
                'primary_image' => $row['primary_image'] ?? 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&auto=format&fit=crop',
                'is_active' => true,
            ]
        );

        // Process dynamic attribute columns prefixed with "attr_" e.g. attr_tyre_size, attr_speed_rating
        foreach ($row as $key => $value) {
            if (str_starts_with($key, 'attr_') && !empty($value)) {
                $attrName = Str::headline(str_replace('attr_', '', $key));
                $attrSlug = Str::slug($attrName);

                $attribute = Attribute::firstOrCreate(
                    ['slug' => $attrSlug],
                    ['name' => $attrName, 'type' => 'select', 'is_filterable' => true]
                );

                $attrValue = AttributeValue::firstOrCreate(
                    ['attribute_id' => $attribute->id, 'value' => trim($value)],
                    ['label' => trim($value)]
                );

                ProductAttributeValue::updateOrCreate([
                    'product_id' => $product->id,
                    'attribute_id' => $attribute->id,
                ], [
                    'attribute_value_id' => $attrValue->id,
                ]);
            }
        }

        return $product;
    }
}
