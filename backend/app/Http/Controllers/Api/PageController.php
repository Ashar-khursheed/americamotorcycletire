<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Page;
use Illuminate\Http\Request;

class PageController extends Controller
{
    public function index()
    {
        return response()->json(Page::orderBy('title')->get());
    }

    public function show($slug)
    {
        $page = Page::where('slug', $slug)->first();
        if (!$page) {
            // Return empty default page structure if not created yet
            return response()->json([
                'slug' => $slug,
                'title' => ucfirst(str_replace(['-', '_'], ' ', $slug)),
                'content' => '',
                'meta_data' => [
                    'meta_title' => '',
                    'meta_description' => '',
                    'meta_keywords' => '',
                    'og_title' => '',
                    'og_description' => '',
                    'canonical_url' => '',
                    'allow_indexing' => true,
                ],
                'is_active' => true,
            ]);
        }
        return response()->json($page);
    }

    public function storeOrUpdate(Request $request)
    {
        $request->validate([
            'slug' => 'required|string',
            'title' => 'required|string',
        ]);

        $page = Page::updateOrCreate(
            ['slug' => $request->slug],
            [
                'title' => $request->title,
                'content' => $request->content ?? '',
                'meta_data' => $request->meta_data ?? [],
                'is_active' => $request->boolean('is_active', true)
            ]
        );

        return response()->json(['message' => 'Page saved successfully', 'page' => $page]);
    }
}

