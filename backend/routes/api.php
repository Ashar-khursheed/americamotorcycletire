<?php

use App\Http\Controllers\Api\AdminProductController;
use App\Http\Controllers\Api\BrandController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PageController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\SettingsController;
use Illuminate\Support\Facades\Route;

// Storefront Public Endpoints
Route::get('/settings', [SettingsController::class, 'index']);
Route::get('/pages/{slug}', [PageController::class, 'show']);
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{slug}', [ProductController::class, 'show']);
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/brands', [BrandController::class, 'index']);
Route::get('/fitments/options', [ProductController::class, 'getFitmentOptions']);
Route::post('/orders', [OrderController::class, 'store']);
Route::get('/orders/lookup/{id}', [OrderController::class, 'show']);
Route::post('/contact', [ContactController::class, 'store']);

// Reviews Public Endpoints
Route::get('/products/{productId}/reviews', [ReviewController::class, 'getProductReviews']);
Route::post('/reviews', [ReviewController::class, 'storeReview']);

// Admin Management Endpoints
Route::prefix('admin')->group(function () {
    // Settings & CMS Pages
    Route::post('/settings', [SettingsController::class, 'update']);
    Route::get('/pages', [PageController::class, 'index']);
    Route::post('/pages', [PageController::class, 'storeOrUpdate']);

    // Brands
    Route::get('/brands', [BrandController::class, 'index']);
    Route::post('/brands', [BrandController::class, 'store']);
    Route::put('/brands/{id}', [BrandController::class, 'update']);
    Route::delete('/brands/{id}', [BrandController::class, 'destroy']);

    // Categories
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::put('/categories/{id}', [CategoryController::class, 'update']);
    Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);

    // Products
    Route::get('/products', [AdminProductController::class, 'index']);
    Route::post('/products', [AdminProductController::class, 'store']);
    Route::put('/products/{id}', [AdminProductController::class, 'update']);
    Route::patch('/products/{id}/status', [AdminProductController::class, 'toggleStatus']);
    Route::delete('/products/{id}', [AdminProductController::class, 'destroy']);
    Route::post('/products/import', [AdminProductController::class, 'import']);
    Route::get('/products/export', [AdminProductController::class, 'export']);

    // Contact Inquiries
    Route::get('/contact-inquiries', [ContactController::class, 'index']);

    // Attributes
    Route::get('/attributes', [AdminProductController::class, 'getAttributes']);
    Route::post('/attributes', [AdminProductController::class, 'storeAttribute']);

    // Orders Management
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::patch('/orders/{id}/status', [OrderController::class, 'updateStatus']);

    // Reviews Management
    Route::get('/reviews', [ReviewController::class, 'indexAdmin']);
    Route::patch('/reviews/{id}/toggle', [ReviewController::class, 'toggleApproval']);
    Route::delete('/reviews/{id}', [ReviewController::class, 'destroy']);
});
