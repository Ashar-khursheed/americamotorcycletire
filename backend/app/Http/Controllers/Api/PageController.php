<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Page;
use Illuminate\Http\Request;

class PageController extends Controller
{
    public function index()
    {
        return response()->json(Page::where('is_active', true)->get());
    }

    public function show($slug)
    {
        $page = Page::where('slug', $slug)->first();
        if (!$page) {
            return response()->json(['message' => 'Page not found'], 404);
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
                'content' => $request->content,
                'is_active' => $request->boolean('is_active', true)
            ]
        );

        return response()->json(['message' => 'Page saved successfully', 'page' => $page]);
    }
}
