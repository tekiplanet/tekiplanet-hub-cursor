<?php

namespace App\Http\Controllers;

use App\Models\ShippingAddress;
use App\Models\ShippingZone;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ShippingAddressController extends Controller
{
    public function index()
    {
        $addresses = ShippingAddress::where('user_id', Auth::id())
            ->with('state')
            ->get();

        return response()->json([
            'addresses' => $addresses
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'required|email|max:255',
            'address' => 'required|string',
            'city' => 'required|string|max:255',
            'state_id' => 'required|exists:shipping_zones,id',
            'is_default' => 'boolean'
        ]);

        if ($request->is_default) {
            // Remove default status from other addresses
            ShippingAddress::where('user_id', Auth::id())
                ->where('is_default', true)
                ->update(['is_default' => false]);
        }

        $address = ShippingAddress::create([
            'user_id' => Auth::id(),
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'phone' => $request->phone,
            'email' => $request->email,
            'address' => $request->address,
            'city' => $request->city,
            'state_id' => $request->state_id,
            'is_default' => $request->is_default ?? false
        ]);

        return response()->json([
            'message' => 'Address added successfully',
            'address' => $address->load('state')
        ]);
    }

    public function update(Request $request, ShippingAddress $address)
    {
        // Ensure address belongs to user
        if ($address->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'required|email|max:255',
            'address' => 'required|string',
            'city' => 'required|string|max:255',
            'state_id' => 'required|exists:shipping_zones,id',
            'is_default' => 'boolean'
        ]);

        if ($request->is_default) {
            ShippingAddress::where('user_id', Auth::id())
                ->where('id', '!=', $address->id)
                ->where('is_default', true)
                ->update(['is_default' => false]);
        }

        $address->update($request->all());

        return response()->json([
            'message' => 'Address updated successfully',
            'address' => $address->load('state')
        ]);
    }

    public function destroy(ShippingAddress $address)
    {
        if ($address->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $address->delete();

        return response()->json([
            'message' => 'Address deleted successfully'
        ]);
    }

    public function getStates()
    {
        $states = ShippingZone::select('id', 'name')->get();

        return response()->json([
            'states' => $states
        ]);
    }
} 