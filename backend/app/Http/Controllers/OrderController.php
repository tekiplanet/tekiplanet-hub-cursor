<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Order::with(['items.product', 'shippingAddress', 'shippingMethod', 'tracking'])
                ->where('user_id', auth()->id());

            // Search functionality
            if ($request->has('search')) {
                $search = $request->search;
                
                \Log::info('Search Debug', [
                    'original_search' => $search,
                    'original_length' => strlen($search)
                ]);

                $query->where(function($q) use ($search) {
                    // Clean up search term (remove dashes and convert to uppercase)
                    $cleanSearch = strtoupper(str_replace(['-', ' '], '', $search));
                    
                    \Log::info('Clean Search Debug', [
                        'cleanSearch' => $cleanSearch,
                        'cleanLength' => strlen($cleanSearch)
                    ]);

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
} 