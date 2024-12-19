<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\Brand;
use App\Models\Promotion;
use App\Models\Setting;
use App\Models\ShippingMethod;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class ProductController extends Controller
{
    public function getFeaturedProducts()
    {
        $featuredProducts = Product::with(['images', 'category'])
            ->where('is_featured', true)
            ->get()
            ->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'description' => $product->short_description,
                    'price' => (float) $product->price,
                    'images' => $product->images->map(fn($image) => $image->image_url),
                    'category' => $product->category->name,
                    'rating' => (float) $product->rating,
                    'reviews_count' => $product->reviews_count,
                    'stock' => $product->stock
                ];
            });

        return response()->json([
            'products' => $featuredProducts,
            'currency' => Setting::getSetting('default_currency', '₦')
        ]);
    }

    public function getCategories()
    {
        // Cache categories for 1 hour
        return response()->json(
            Cache::remember('product-categories', 3600, function () {
                return ProductCategory::select('id', 'name', 'description', 'icon_name', 'count')
                    ->get();
            })
        );
    }

    public function getProducts(Request $request)
    {
        $query = Product::with(['images', 'category', 'brand']);

        // Add at the start of getProducts method
        \Log::info('Category Filter:', [
            'requested_category' => $request->category,
            'all_categories' => ProductCategory::pluck('name')->toArray()
        ]);

        // Search
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('short_description', 'like', "%{$search}%");
            });
        }

        // Category filter
        if ($request->has('category') && !empty($request->category)) {
            $query->whereHas('category', function ($q) use ($request) {
                $q->where('name', 'like', $request->category);
            });
        }

        // Brand filter
        if ($request->has('brands') && !empty($request->brands)) {
            $brands = is_array($request->brands) 
                ? $request->brands 
                : explode(',', $request->brands);
            
            if (!empty($brands)) {
                $query->whereIn('brand_id', function($query) use ($brands) {
                    $query->select('id')
                        ->from('brands')
                        ->whereIn('name', $brands);
                });
            }
        }

        // Price range filter
        if ($request->has('min_price') && is_numeric($request->min_price)) {
            $query->where('price', '>=', (float) $request->min_price);
        }
        if ($request->has('max_price') && is_numeric($request->max_price)) {
            $query->where('price', '<=', (float) $request->max_price);
        }

        // Add some logging to debug
        \Log::info('Product Query Parameters:', [
            'search' => $request->search,
            'category' => $request->category,
            'brands' => $request->brands,
            'min_price' => $request->min_price,
            'max_price' => $request->max_price,
            'sql' => $query->toSql(),
            'bindings' => $query->getBindings()
        ]);

        // Get paginated results
        $products = $query->paginate(12)->through(function ($product) {
            return [
                'id' => $product->id,
                'name' => $product->name,
                'description' => $product->short_description,
                'price' => (float) $product->price,
                'images' => $product->images->map(fn($image) => $image->image_url),
                'category' => $product->category->name,
                'rating' => (float) $product->rating,
                'reviews_count' => $product->reviews_count,
                'stock' => $product->stock
            ];
        });

        \Log::info('Products Found:', [
            'total' => $products->total(),
            'current_page' => $products->currentPage(),
            'per_page' => $products->perPage()
        ]);

        return response()->json([
            'products' => $products,
            'currency' => Setting::getSetting('default_currency', '₦')
        ]);
    }

    public function getPromotions()
    {
        // Cache promotions for 1 hour
        return response()->json(
            Cache::remember('active-promotions', 3600, function () {
                return Promotion::where('is_active', true)
                    ->orderBy('order')
                    ->get();
            })
        );
    }

    public function getBrands()
    {
        // Cache brands for 1 hour
        return response()->json(
            Cache::remember('product-brands', 3600, function () {
                return Brand::all();
            })
        );
    }

    public function getProductDetails($id)
    {
        try {
            $product = Product::with([
                'images',
                'category',
                'brand',
                'features',
                'specifications',
                'reviews.user',
            ])->findOrFail($id);

            // Get shipping methods
            $shippingMethods = ShippingMethod::where('is_active', true)->get();

            return response()->json([
                'product' => [
                    'id' => $product->id,
                    'name' => $product->name,
                    'description' => $product->description,
                    'short_description' => $product->short_description,
                    'price' => (float) $product->price,
                    'images' => $product->images->map(fn($image) => $image->image_url),
                    'category' => $product->category->name,
                    'brand' => $product->brand?->name,
                    'rating' => (float) $product->rating,
                    'reviews_count' => $product->reviews_count,
                    'stock' => $product->stock,
                    'features' => $product->features->pluck('feature'),
                    'specifications' => $product->specifications->pluck('value', 'key')->toArray(),
                    'reviews' => $product->reviews->map(fn($review) => [
                        'id' => $review->id,
                        'rating' => (float) $review->rating,
                        'comment' => $review->comment,
                        'user_name' => $review->user->name,
                        'is_verified' => $review->is_verified_purchase,
                        'created_at' => $review->created_at->diffForHumans()
                    ]),
                ],
                'shipping_methods' => $shippingMethods,
                'currency' => Setting::getSetting('default_currency', '₦')
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Product not found'
            ], 404);
        }
    }
} 