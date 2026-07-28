<?php

namespace App\Exports;

use App\Models\Product;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class ProductsExport implements FromCollection, WithHeadings, WithMapping
{
    public function collection()
    {
        return Product::with(['category', 'productAttributeValues.attribute', 'productAttributeValues.attributeValue'])->get();
    }

    public function headings(): array
    {
        return [
            'ID',
            'SKU',
            'Name',
            'Brand',
            'Category',
            'Price',
            'Compare At Price',
            'Stock Quantity',
            'Primary Image',
            'Status',
            'Dynamic Attributes',
            'Created At',
        ];
    }

    public function map($product): array
    {
        $attributesStr = $product->productAttributeValues->map(function ($pav) {
            $name = $pav->attribute->name ?? 'Attribute';
            $val = $pav->attributeValue->value ?? $pav->custom_value ?? '';
            return "{$name}: {$val}";
        })->implode(' | ');

        return [
            $product->id,
            $product->sku,
            $product->name,
            $product->brand,
            $product->category?->name,
            $product->price,
            $product->compare_at_price,
            $product->stock_quantity,
            $product->primary_image,
            $product->is_active ? 'Active' : 'Inactive',
            $attributesStr,
            $product->created_at->format('Y-m-d H:i:s'),
        ];
    }
}
