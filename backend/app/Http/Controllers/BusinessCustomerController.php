<?php

namespace App\Http\Controllers;

use App\Models\BusinessCustomer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class BusinessCustomerController extends Controller
{
    public function index()
    {
        try {
            $customers = BusinessCustomer::where('business_id', Auth::id())
                ->with(['transactions']) // If you have transactions relationship
                ->get()
                ->map(function ($customer) {
                    return [
                        'id' => $customer->id,
                        'name' => $customer->name,
                        'email' => $customer->email,
                        'phone' => $customer->phone,
                        'address' => $customer->address,
                        'city' => $customer->city,
                        'state' => $customer->state,
                        'country' => $customer->country,
                        'tags' => $customer->tags,
                        'notes' => $customer->notes,
                        'status' => $customer->status,
                        'total_spent' => $customer->transactions->sum('amount'),
                        'last_order_date' => $customer->transactions->max('created_at'),
                        'created_at' => $customer->created_at,
                        'updated_at' => $customer->updated_at
                    ];
                });

            return response()->json($customers);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to fetch customers'], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'email' => 'nullable|email|max:255',
                'phone' => 'nullable|string|max:20',
                'address' => 'nullable|string|max:255',
                'city' => 'nullable|string|max:100',
                'state' => 'nullable|string|max:100',
                'country' => 'nullable|string|max:100',
                'tags' => 'nullable|array',
                'notes' => 'nullable|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $customer = BusinessCustomer::create([
                'business_id' => Auth::id(),
                'name' => $request->name,
                'email' => $request->email,
                'phone' => $request->phone,
                'address' => $request->address,
                'city' => $request->city,
                'state' => $request->state,
                'country' => $request->country,
                'tags' => $request->tags,
                'notes' => $request->notes,
                'status' => 'active'
            ]);

            return response()->json([
                'message' => 'Customer created successfully',
                'customer' => $customer
            ], 201);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to create customer'], 500);
        }
    }

    public function show($id)
    {
        try {
            $customer = BusinessCustomer::where('business_id', Auth::id())
                ->where('id', $id)
                ->firstOrFail();

            return response()->json($customer);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Customer not found'], 404);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $customer = BusinessCustomer::where('business_id', Auth::id())
                ->where('id', $id)
                ->firstOrFail();

            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'email' => 'nullable|email|max:255',
                'phone' => 'nullable|string|max:20',
                'address' => 'nullable|string|max:255',
                'city' => 'nullable|string|max:100',
                'state' => 'nullable|string|max:100',
                'country' => 'nullable|string|max:100',
                'tags' => 'nullable|array',
                'notes' => 'nullable|string',
                'status' => 'nullable|in:active,inactive'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $customer->update($request->all());

            return response()->json([
                'message' => 'Customer updated successfully',
                'customer' => $customer
            ]);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to update customer'], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $customer = BusinessCustomer::where('business_id', Auth::id())
                ->where('id', $id)
                ->firstOrFail();

            $customer->delete();

            return response()->json([
                'message' => 'Customer deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to delete customer'], 500);
        }
    }
} 