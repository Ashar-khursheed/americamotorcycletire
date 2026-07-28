<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Page extends Model
{
    protected $fillable = ['slug', 'title', 'content', 'meta_data', 'is_active'];

    protected $casts = [
        'meta_data' => 'array',
        'is_active' => 'boolean',
    ];
}
