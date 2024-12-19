<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ShippingMethod;
use App\Models\Transaction;
use App\Models\OrderTracking;
use App\Models\ShippingAddress;
use App\Models\ZoneShippingRate;
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
        ], [
            'shipping_address_id.required' => 'Shipping address is required',
            'shipping_address_id.exists' => 'Invalid shipping address',
            'shipping_method_id.required' => 'Shipping method is required',
            'shipping_method_id.exists' => 'Invalid shipping method',
            'payment_method.required' => 'Payment method is required',
            'payment_method.in' => 'Invalid payment method'
        ]);

        DB::beginTransaction();
        try {
            // Get cart total and shipping cost
            $cart = Cart::where('user_id', auth()->id())->first();
            
            // Get shipping address and zone rate
            $shippingAddress = ShippingAddress::with('state')->findOrFail($request->shipping_address_id);
            $zoneRate = ZoneShippingRate::where('zone_id', $shippingAddress->state_id)
                ->where('shipping_method_id', $request->shipping_method_id)
                ->firstOrFail();

            $shippingCost = $zoneRate->rate;
            $total = $cart->current_total + $shippingCost;

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
                'subtotal' => $cart->current_total,
                'shipping_cost' => $shippingCost,
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