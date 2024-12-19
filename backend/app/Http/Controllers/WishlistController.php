<?php

namespace App\Http\Controllers;

use App\Models\Wishlist;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class WishlistController extends Controller
{
    public function getWishlist()
    {
        $wishlist = Wishlist::with(['items.product.images'])
            ->firstOrCreate(['user_id' => Auth::id()]);

        $items = $wishlist->items->map(function ($item) {
            return [
                'id' => $item->id,
                'product' => [
                    'id' => $item->product->id,
                    'name' => $item->product->name,
                    'price' => (float) $item->product->price,
                    'images' => $item->product->images->map(fn($image) => $image->image_url),
                    'stock' => $item->product->stock
                ]
            ];
        });

        return response()->json([
            'items' => $items
        ]);
    }

    public function getWishlistCount()
    {
        $wishlist = Wishlist::where('user_id', Auth::id())
            ->with('items')
            ->first();

        return response()->json([
            'count' => $wishlist ? $wishlist->items->count() : 0
        ]);
    }

    public function toggleWishlistItem($productId)
    {
        $wishlist = Wishlist::firstOrCreate(['user_id' => Auth::id()]);
        $exists = $wishlist->items()->where('product_id', $productId)->exists();

        if ($exists) {
            $wishlist->items()->where('product_id', $productId)->delete();
            $message = 'Product removed from wishlist';
        } else {
            $wishlist->items()->create(['product_id' => $productId]);
            $message = 'Product added to wishlist';
        }

        return response()->json([
            'message' => $message,
            'is_wishlisted' => !$exists
        ]);
    }

    public function checkWishlistStatus($productId)
    {
        $wishlist = Wishlist::where('user_id', Auth::id())->first();
        $isWishlisted = false;

        if ($wishlist) {
            $isWishlisted = $wishlist->items()->where('product_id', $productId)->exists();
        }

        return response()->json([
            'is_wishlisted' => $isWishlisted
        ]);
    }
} 