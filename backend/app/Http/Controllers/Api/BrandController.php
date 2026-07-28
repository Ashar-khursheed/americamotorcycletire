<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BrandController extends Controller
{
    public function index()
    {
        return response()->json([
            'status' => 'success',
            'data' => Brand::orderBy('name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'logo' => 'nullable|string',
        ]);

        $brand = Brand::updateOrCreate(
            ['slug' => Str::slug($validated['name'])],
            [
                'name' => trim($validated['name']),
                'logo' => $validated['logo'] ?? null,
                'is_active' => true,
            ]
        );

        return response()->json([
            'status' => 'success',
            'message' => 'Brand created/saved successfully',
            'data' => $brand,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $brand = Brand::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'logo' => 'nullable|string',
        ]);

        $brand->update([
            'name' => trim($validated['name']),
            'slug' => Str::slug($validated['name']),
            'logo' => $validated['logo'] ?? $brand->logo,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Brand updated successfully',
            'data' => $brand,
        ]);
    }

    public function destroy($id)
    {
        Brand::destroy($id);
        return response()->json([
            'status' => 'success',
            'message' => 'Brand deleted successfully',
        ]);
    }
}
