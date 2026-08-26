<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductFitment extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'year',
        'make',
        'model',
        'sub_category',
        'position',
        'tire_size',
        'sku_number',
        'item_number',
        'vendor_part_number',
        'notes',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
