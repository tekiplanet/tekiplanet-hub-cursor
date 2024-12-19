<?php

namespace App\Http\Controllers;

use App\Models\ShippingAddress;
use App\Models\ShippingMethod;
use App\Models\ZoneShippingRate;
use Illuminate\Http\Request;

class ShippingMethodController extends Controller
{
    public function getMethodsForAddress(Request $request)
    {
        $request->validate([
            'address_id' => 'required|exists:shipping_addresses,id'
        ]);

        $address = ShippingAddress::with('state')->findOrFail($request->address_id);
        $zoneId = $address->state->id;

        // Get all active shipping methods with their rates for this zone
        $methods = ShippingMethod::where('is_active', true)
            ->orderBy('priority')
            ->get()
            ->map(function ($method) use ($zoneId) {
                $rate = $method->zoneRates()
                    ->where('zone_id', $zoneId)
                    ->first();

                return [
                    'id' => $method->id,
                    'name' => $method->name,
                    'description' => $method->description,
                    'rate' => $rate ? (float)$rate->rate : 0,
                    'estimated_days_min' => $method->estimated_days_min,
                    'estimated_days_max' => $method->estimated_days_max,
                ];
            })
            ->filter(fn ($method) => $method['rate'] !== null)
            ->values();

        return response()->json([
            'methods' => $methods
        ]);
    }
} 