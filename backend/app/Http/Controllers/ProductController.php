<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\Brand;
use App\Models\Promotion;
use App\Models\Setting;
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
                    'price' => $product->price,
                    'images' => $product->images->map(fn($image) => $image->image_url),
                    'category' => $product->category->name,
                    'rating' => $product->rating,
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

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('short_description', 'like', "%{$search}%");
            });
        }

        // Category filter
        if ($request->has('category')) {
            $query->whereHas('category', function ($q) use ($request) {
                $q->where('name', $request->category);
            });
        }

        // Brand filter
        if ($request->has('brands') && !empty($request->brands)) {
            $brands = explode(',', $request->brands);
            $query->whereIn('brand_id', $brands);
        }

        // Price range filter
        if ($request->has('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }
        if ($request->has('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        // Get paginated results
        $products = $query->paginate(12)->through(function ($product) {
            return [
                'id' => $product->id,
                'name' => $product->name,
                'description' => $product->short_description,
                'price' => $product->price,
                'images' => $product->images->map(fn($image) => $image->image_url),
                'category' => $product->category->name,
                'rating' => $product->rating,
                'reviews_count' => $product->reviews_count,
                'stock' => $product->stock
            ];
        });

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
} 