<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProductReview;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    // Public: List reviews for a specific product
    public function getProductReviews($productId)
    {
        $reviews = ProductReview::where('product_id', $productId)
            ->where('is_approved', true)
            ->orderBy('id', 'desc')
            ->get();

        $avgRating = $reviews->avg('rating') ?? 5.0;

        return response()->json([
            'status' => 'success',
            'reviews' => $reviews,
            'average_rating' => round($avgRating, 1),
            'total_reviews' => $reviews->count(),
        ]);
    }

    // Public: Store review from customer
    public function storeReview(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'user_name' => 'required|string|max:255',
            'user_email' => 'nullable|email|max:255',
            'rating' => 'required|integer|min:1|max:5',
            'title' => 'nullable|string|max:255',
            'comment' => 'required|string',
        ]);

        $review = ProductReview::create([
            'product_id' => $validated['product_id'],
            'user_name' => $validated['user_name'],
            'user_email' => $validated['user_email'] ?? null,
            'rating' => $validated['rating'],
            'title' => $validated['title'] ?? null,
            'comment' => $validated['comment'],
            'is_approved' => true,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Review submitted successfully!',
            'review' => $review,
        ], 201);
    }

    // Admin: List all product reviews across site
    public function indexAdmin()
    {
        $reviews = ProductReview::with('product')->orderBy('id', 'desc')->paginate(30);
        return response()->json($reviews);
    }

    // Admin: Toggle Approval / Delete
    public function toggleApproval($id)
    {
        $review = ProductReview::findOrFail($id);
        $review->is_approved = !$review->is_approved;
        $review->save();

        return response()->json(['message' => 'Review status toggled', 'review' => $review]);
    }

    public function destroy($id)
    {
        $review = ProductReview::findOrFail($id);
        $review->delete();

        return response()->json(['message' => 'Review deleted successfully']);
    }
}
