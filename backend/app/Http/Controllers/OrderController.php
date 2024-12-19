<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ShippingMethod;
use App\Models\Transaction;
use App\Models\OrderTracking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'shipping_address_id' => 'required|exists:shipping_addresses,id',
            'shipping_method_id' => 'required|exists:shipping_methods,id',
            'payment_method' => 'required|in:wallet'
        ]);

        DB::beginTransaction();
        try {
            // Get cart total and shipping cost
            $cart = Cart::where('user_id', auth()->id())->first();
            $shippingMethod = ShippingMethod::findOrFail($request->shipping_method_id);
            $total = $cart->totals['current'] + $shippingMethod->rate;

            // Check wallet balance
            $user = auth()->user();
            if ($user->wallet_balance < $total) {
                throw new \Exception('Insufficient wallet balance');
            }

            // Create order
            $order = Order::create([
                'user_id' => auth()->id(),
                'shipping_address_id' => $request->shipping_address_id,
                'shipping_method_id' => $request->shipping_method_id,
                'subtotal' => $cart->totals['current'],
                'shipping_cost' => $shippingMethod->rate,
                'total' => $total,
                'status' => 'pending',
                'payment_method' => $request->payment_method,
                'payment_status' => 'pending'
            ]);

            // Create initial order tracking
            OrderTracking::create([
                'order_id' => $order->id,
                'status' => 'pending',
                'description' => 'Order has been placed and is pending processing',
                'location' => 'System'
            ]);

            // Create order items from cart
            foreach ($cart->items as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item->product_id,
                    'quantity' => $item->quantity,
                    'price' => $item->product->price,
                    'total' => $item->product->price * $item->quantity
                ]);
            }

            // Deduct from wallet
            $user->decrement('wallet_balance', $total);

            // Create wallet transaction
            Transaction::create([
                'user_id' => auth()->id(),
                'amount' => $total,
                'type' => 'debit',
                'description' => "Payment for order #{$order->id}",
                'status' => 'completed'
            ]);

            // Update order status
            $order->update([
                'payment_status' => 'paid',
                'status' => 'processing'
            ]);

            // After payment is confirmed, add another tracking entry
            OrderTracking::create([
                'order_id' => $order->id,
                'status' => 'processing',
                'description' => 'Payment confirmed. Order is being processed',
                'location' => 'System'
            ]);

            // Clear cart
            $cart->items()->delete();
            $cart->delete();

            DB::commit();

            return response()->json([
                'message' => 'Order placed successfully',
                'order' => $order
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => $e->getMessage()
            ], 422);
        }
    }
} 