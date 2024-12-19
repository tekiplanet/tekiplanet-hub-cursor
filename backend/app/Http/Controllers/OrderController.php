<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Cart;
use App\Models\ShippingAddress;
use App\Models\ZoneShippingRate;
use App\Models\OrderItem;
use App\Models\Transaction;
use App\Models\OrderTracking;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use PDF;
use NumberFormatter;

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
    
            $orderDetails = $order->load([
                'items.product', 
                'shippingAddress.state', 
                'shippingMethod'
            ]);
    
            DB::commit();
    
            return response()->json([
                'message' => 'Order placed successfully',
                'order' => $orderDetails
            ]);
    
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => $e->getMessage()
            ], 422);
        }
    }



    public function index(Request $request)
    {
        try {
            $query = Order::with(['items.product', 'shippingAddress', 'shippingMethod', 'tracking'])
                ->where('user_id', auth()->id());

            // Search functionality
            if ($request->has('search')) {
                $search = $request->search;
                
                // \Log::info('Search Debug', [
                //     'original_search' => $search,
                //     'original_length' => strlen($search)
                // ]);

                $query->where(function($q) use ($search) {
                    // Clean up search term (remove dashes and convert to uppercase)
                    $cleanSearch = strtoupper(str_replace(['-', ' '], '', $search));
                    
                    // \Log::info('Clean Search Debug', [
                    //     'cleanSearch' => $cleanSearch,
                    //     'cleanLength' => strlen($cleanSearch)
                    // ]);

                    $q->where(function($subQ) use ($cleanSearch) {
                        // If search is 8 characters or more, search by prefix
                        if (strlen($cleanSearch) >= 8) {
                            $searchStart = substr($cleanSearch, 0, 8);
                            
                            if (strlen($cleanSearch) >= 12) {
                                // If full tracking number, also match the last 4
                                $searchEnd = substr($cleanSearch, -4);
                                $subQ->whereRaw("
                                    UPPER(SUBSTRING(REPLACE(id, '-', ''), 1, 8)) = ? 
                                    AND 
                                    UPPER(SUBSTRING(REPLACE(id, '-', ''), -4)) = ?
                                ", [$searchStart, $searchEnd]);
                            } else {
                                // If just the prefix, only match the beginning
                                $subQ->whereRaw("
                                    UPPER(SUBSTRING(REPLACE(id, '-', ''), 1, 8)) = ?
                                ", [$searchStart]);
                            }
                        } else {
                            // If search term is too short, do a general search
                            $subQ->whereRaw("
                                UPPER(REPLACE(id, '-', '')) LIKE ?
                            ", ['%' . $cleanSearch . '%']);
                        }
                    })
                    // Search in related products
                    ->orWhereHas('items.product', function($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    });
                });
            }

            // Status filter
            if ($request->has('status') && $request->status !== 'all') {
                // Map frontend statuses to backend statuses
                $statusMap = [
                    'pending' => ['pending'],
                    'processing' => ['confirmed', 'processing'],
                    'shipped' => ['shipped', 'in_transit', 'out_for_delivery'],
                    'delivered' => ['delivered'],
                    'cancelled' => ['cancelled']
                ];

                if (isset($statusMap[$request->status])) {
                    $query->whereIn('status', $statusMap[$request->status]);
                }
            }

            // Sorting
            switch ($request->sort_by) {
                case 'date':
                    $query->orderBy('created_at', 'desc');
                    break;
                case 'total':
                    $query->orderBy('total', 'desc');
                    break;
                case 'status':
                    $query->orderBy('status', 'asc');
                    break;
                default:
                    $query->orderBy('created_at', 'desc');
            }

            // Pagination
            $orders = $query->paginate(10)->through(function ($order) {
                // Get the first 6 and last 4 characters of the order ID for tracking
                $trackingNumber = substr($order->id, 0, 12) . substr($order->id, -4);
                
                // Calculate estimated delivery date
                $estimatedDelivery = Carbon::parse($order->created_at)
                    ->addDays($order->shippingMethod->estimated_days_max)
                    ->format('Y-m-d');

                // Map backend status to frontend status
                $statusMap = [
                    'pending' => 'pending',
                    'confirmed' => 'processing',
                    'processing' => 'processing',
                    'shipped' => 'shipped',
                    'in_transit' => 'shipped',
                    'out_for_delivery' => 'shipped',
                    'delivered' => 'delivered',
                    'cancelled' => 'cancelled'
                ];

                return [
                    'id' => $order->id,
                    'date' => $order->created_at->format('D, M d, Y'),
                    'total' => (float) $order->total,
                    'status' => $statusMap[$order->status] ?? $order->status,
                    'items' => $order->items->map(function ($item) {
                        return [
                            'id' => $item->product->id,
                            'name' => $item->product->name,
                    'quantity' => $item->quantity,
                            'price' => (float) $item->price,
                            'image' => $item->product->images->first()?->image_url ?? null,
                        ];
                    }),
                    'tracking' => [
                        'number' => $order->id,
                        'carrier' => $order->shippingMethod->name,
                        'status' => ucfirst($order->status),
                        'estimatedDelivery' => $estimatedDelivery,
                    ]
                ];
            });

            return response()->json($orders);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error fetching orders',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $order = Order::with([
                'items.product', 
                'shippingAddress', 
                'shippingMethod', 
                'tracking'
            ])->findOrFail($id);

            // Verify order belongs to authenticated user
            if ($order->user_id !== auth()->id()) {
                return response()->json([
                    'message' => 'Unauthorized access'
                ], 403);
            }

            // Get tracking number (first 6 + last 4 of order ID)
            $trackingNumber = substr($order->id, 0, 12) . substr($order->id, -4);
            
            // Calculate estimated delivery date
            $estimatedDelivery = Carbon::parse($order->created_at)
                ->addDays($order->shippingMethod->estimated_days_max)
                ->format('Y-m-d');

            // Map backend status to frontend status
            $statusMap = [
                'pending' => 'pending',
                'confirmed' => 'processing',
                'processing' => 'processing',
                'shipped' => 'shipped',
                'in_transit' => 'shipped',
                'out_for_delivery' => 'shipped',
                'delivered' => 'delivered',
                'cancelled' => 'cancelled'
            ];

            return response()->json([
                'id' => $order->id,
                'date' => $order->created_at->format('D, M d, Y'),
                'total' => (float) $order->total,
                'status' => $statusMap[$order->status] ?? $order->status,
                'items' => $order->items->map(function ($item) {
                    return [
                        'id' => $item->product->id,
                        'name' => $item->product->name,
                        'quantity' => $item->quantity,
                        'price' => (float) $item->price,
                        'image' => $item->product->images->first()?->image_url ?? null,
                    ];
                }),
                'tracking' => [
                    'number' => $order->id,
                    'carrier' => $order->shippingMethod->name,
                    'status' => ucfirst($order->status),
                    'estimatedDelivery' => $estimatedDelivery,
                ],
                'shipping_address' => [
                    'name' => $order->shippingAddress->first_name . ' ' . $order->shippingAddress->last_name,
                    'address' => $order->shippingAddress->address,
                    'city' => $order->shippingAddress->city,
                    'state' => $order->shippingAddress->state->name,
                    'phone' => $order->shippingAddress->phone,
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error fetching order details',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function tracking($id)
    {
        try {
            // \Log::info('Tracking Request', ['order_id' => $id]);

            $order = Order::with([
                'items.product.images',  // Make sure we're loading images
                'shippingAddress.state', // Make sure we're loading state
                'shippingMethod',
                'tracking'
            ])->findOrFail($id);

            // \Log::info('Order Found', [
            //     'order' => $order->toArray(),
            //     'user_id' => auth()->id()
            // ]);

            // Verify order belongs to authenticated user
            if ($order->user_id !== auth()->id()) {
                return response()->json([
                    'message' => 'Unauthorized access'
                ], 403);
            }

            // Format tracking number
            $trackingNumber = substr(str_replace('-', '', $order->id), 0, 12) . 
                             substr(str_replace('-', '', $order->id), -4);

            // Calculate estimated delivery
            $estimatedDelivery = Carbon::parse($order->created_at)
                ->addDays($order->shippingMethod->estimated_days_max)
                ->format('D, M d, Y');

            // Define status timeline
            $allStatuses = [
                'pending' => 'Order Placed',
                'confirmed' => 'Order Confirmed',
                'processing' => 'Processing',
                'shipped' => 'Shipped',
                'in_transit' => 'In Transit',
                'out_for_delivery' => 'Out for Delivery',
                'delivered' => 'Delivered',
                'cancelled' => 'Cancelled'
            ];

            // Get current status index for progress calculation
            $statusOrder = array_keys($allStatuses);
            $currentStatusIndex = array_search($order->status, $statusOrder);

            // Create timeline with proper scope access
            $timeline = collect($statusOrder)
                ->take($currentStatusIndex + 1)
                ->map(function ($status) use ($order, $allStatuses, $currentStatusIndex) {  // Add $currentStatusIndex here
                    $index = array_search($status, array_keys($allStatuses));
                    return [
                        'status' => $allStatuses[$status],
                        'date' => $index === 0 ? 
                            $order->created_at->format('D, M d, Y H:i:s') : 
                            now()->subHours(($currentStatusIndex - $index) * 24)->format('D, M d, Y H:i:s'),
                        'location' => $status === $order->status ? 
                            ($order->tracking?->location ?? 'Processing Center') : 'Processing Center',
                        'description' => $order->tracking?->description ?? 
                            "Order {$allStatuses[$status]}",
                        'completed' => true
                    ];
                })->values();

            return response()->json([
                'order_number' => $trackingNumber,
                'status' => ucfirst($order->status),
                'estimated_delivery' => $estimatedDelivery,
                'carrier' => $order->shippingMethod->name,
                'current_location' => $order->tracking?->location ?? 'Processing Center',
                'shipping_address' => [
                    'name' => $order->shippingAddress->first_name . ' ' . $order->shippingAddress->last_name,
                    'address' => $order->shippingAddress->address,
                    'city' => $order->shippingAddress->city,
                    'state' => $order->shippingAddress->state->name,
                    'phone' => $order->shippingAddress->phone,
                ],
                'order_summary' => [
                    'items' => $order->items->map(function ($item) {
                        return [
                            'name' => $item->product->name,
                            'quantity' => $item->quantity,
                            'price' => (float) $item->price,
                            'image' => $item->product->images->first()?->image_url ?? null,
                        ];
                    }),
                    'total' => (float) $order->total,
                ],
                'timeline' => $timeline
            ]);

        } catch (\Exception $e) {
            // \Log::error('Tracking Error', [
            //     'order_id' => $id,
            //     'error' => $e->getMessage(),
            //     'trace' => $e->getTraceAsString()
            // ]);

            return response()->json([
                'message' => 'Error fetching tracking details',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function downloadInvoice($id)
    {
        try {
            $order = Order::with([
                'items.product',
                'shippingAddress.state',
                'shippingMethod',
                'user'
            ])->findOrFail($id);

            // Verify order belongs to authenticated user
            if ($order->user_id !== auth()->id()) {
                return response()->json([
                    'message' => 'Unauthorized access'
                ], 403);
            }

            // Format currency without NumberFormatter
            $formatCurrency = function($amount) {
                return number_format($amount, 2);
            };

            $data = [
                'order' => $order,
                'invoice_number' => strtoupper(substr($order->id, 0, 8)),
                'date' => $order->created_at->format('M d, Y'),
                'formatter' => $formatCurrency,
                'currency' => 'NGN' // Add currency symbol
            ];

            $pdf = PDF::loadView('invoices.order', $data);
            
            return $pdf->stream("invoice-{$order->id}.pdf", [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'inline; filename="invoice-' . $order->id . '.pdf"'
            ]);

        } catch (\Exception $e) {
            \Log::error('Invoice Error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'message' => 'Error generating invoice',
                'error' => $e->getMessage()
            ], 500);
        }
    }

   
} 