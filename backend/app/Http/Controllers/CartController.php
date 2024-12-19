<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ShoppingCart;
use App\Models\CartItem;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CartController extends Controller
{
    public function getCart()
    {
        $cart = ShoppingCart::with(['items.product.images'])
            ->firstOrCreate(['user_id' => Auth::id()]);

        $cartItems = $cart->items->map(function ($item) {
            return [
                'id' => $item->id,
                'product' => [
                    'id' => $item->product->id,
                    'name' => $item->product->name,
                    'description' => $item->product->short_description,
                    'price' => (float) $item->current_price,
                    'original_price' => (float) $item->original_price,
                    'images' => $item->product->images->map(fn($image) => $image->image_url),
                    'category' => $item->product->category->name,
                    'stock' => $item->product->stock
                ],
                'quantity' => $item->quantity,
                'price_changed' => $item->price_changed
            ];
        });

        return response()->json([
            'items' => $cartItems,
            'totals' => [
                'original' => (float) $cart->original_total,
                'current' => (float) $cart->current_total
            ],
            'currency' => Setting::getSetting('default_currency', '₦')
        ]);
    }

    public function addToCart(Request $request)
    {
        $request->validate([
            'product_id' => 'required|uuid|exists:products,id',
            'quantity' => 'required|integer|min:1'
        ]);

        $product = Product::findOrFail($request->product_id);
        
        // Check stock availability
        if ($product->stock < $request->quantity) {
            return response()->json([
                'message' => 'Not enough stock available',
                'available_stock' => $product->stock
            ], 422);
        }

        $cart = ShoppingCart::firstOrCreate(['user_id' => Auth::id()]);

        // Check if product already exists in cart
        $cartItem = $cart->items()->where('product_id', $product->id)->first();

        if ($cartItem) {
            // Update quantity if total doesn't exceed stock
            $newQuantity = $cartItem->quantity + $request->quantity;
            if ($newQuantity > $product->stock) {
                return response()->json([
                    'message' => 'Cannot add more of this item',
                    'available_stock' => $product->stock,
                    'cart_quantity' => $cartItem->quantity
                ], 422);
            }

            $cartItem->update([
                'quantity' => $newQuantity,
                'current_price' => $product->price,
                'price_changed' => $cartItem->original_price != $product->price
            ]);
        } else {
            // Create new cart item
            $cartItem = $cart->items()->create([
                'product_id' => $product->id,
                'quantity' => $request->quantity,
                'original_price' => $product->price,
                'current_price' => $product->price,
                'price_changed' => false
            ]);
        }

        return response()->json([
            'message' => 'Product added to cart',
            'cart_item' => $cartItem
        ]);
    }

    public function updateQuantity(Request $request, $itemId)
    {
        $request->validate([
            'quantity' => 'required|integer|min:1'
        ]);

        $cartItem = CartItem::findOrFail($itemId);
        
        // Ensure cart belongs to user
        if ($cartItem->cart->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Check stock availability
        if ($cartItem->product->stock < $request->quantity) {
            return response()->json([
                'message' => 'Not enough stock available',
                'available_stock' => $cartItem->product->stock
            ], 422);
        }

        $cartItem->update([
            'quantity' => $request->quantity,
            'current_price' => $cartItem->product->price,
            'price_changed' => $cartItem->original_price != $cartItem->product->price
        ]);

        return response()->json([
            'message' => 'Quantity updated',
            'cart_item' => $cartItem
        ]);
    }

    public function removeItem($itemId)
    {
        $cartItem = CartItem::findOrFail($itemId);
        
        // Ensure cart belongs to user
        if ($cartItem->cart->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $cartItem->delete();

        return response()->json([
            'message' => 'Item removed from cart'
        ]);
    }
} 