<?php

namespace App\Http\Controllers;

use App\Models\BusinessCustomer;
use App\Models\BusinessProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class BusinessCustomerController extends Controller
{
    public function index()
    {
        try {
            // Get the business profile first
            $businessProfile = BusinessProfile::where('user_id', Auth::id())->first();

            if (!$businessProfile) {
                return response()->json([
                    'message' => 'Business profile not found'
                ], 404);
            }

            $customers = BusinessCustomer::where('business_id', $businessProfile->id)
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
                        'currency' => $customer->currency,
                        'tags' => $customer->tags,
                        'notes' => $customer->notes,
                        'status' => $customer->status,
                        'total_spent' => $customer->getTotalSpent(), // Using the model method
                        'last_order_date' => null, // Update this when you have orders
                        'created_at' => $customer->created_at,
                        'updated_at' => $customer->updated_at
                    ];
                });

            \Log::info('Fetched customers:', [
                'count' => $customers->count(),
                'business_id' => $businessProfile->id,
                'customers' => $customers->toArray()
            ]);

            return response()->json($customers);
        } catch (\Exception $e) {
            \Log::error('Failed to fetch customers:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'message' => 'Failed to fetch customers',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            \Log::info('Creating customer with data:', $request->all());

            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'email' => 'nullable|email|max:255',
                'phone' => 'nullable|string|max:20',
                'address' => 'nullable|string|max:255',
                'city' => 'required|string|max:100',
                'state' => 'required|string|max:100',
                'country' => 'required|string|max:100',
                'currency' => 'required|string|size:3',
                'tags' => 'nullable|array',
                'notes' => 'nullable|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Get the business profile ID
            $businessProfile = BusinessProfile::where('user_id', Auth::id())->first();

            if (!$businessProfile) {
                return response()->json([
                    'message' => 'Business profile not found'
                ], 404);
            }

            $customer = BusinessCustomer::create([
                'business_id' => $businessProfile->id,
                'name' => $request->name,
                'email' => $request->email,
                'phone' => $request->phone,
                'address' => $request->address,
                'city' => $request->city,
                'state' => $request->state,
                'country' => $request->country,
                'currency' => $request->currency,
                'tags' => $request->tags,
                'notes' => $request->notes,
                'status' => 'active'
            ]);

            \Log::info('Customer created successfully:', $customer->toArray());

            return response()->json([
                'message' => 'Customer created successfully',
                'customer' => $customer
            ], 201);

        } catch (\Exception $e) {
            \Log::error('Error creating customer:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Failed to create customer',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            // Get the business profile first
            $businessProfile = BusinessProfile::where('user_id', Auth::id())->first();

            if (!$businessProfile) {
                return response()->json([
                    'message' => 'Business profile not found'
                ], 404);
            }

            $customer = BusinessCustomer::where('business_id', $businessProfile->id)
                ->where('id', $id)
                ->first();

            if (!$customer) {
                return response()->json([
                    'message' => 'Customer not found'
                ], 404);
            }

            return response()->json([
                'id' => $customer->id,
                'name' => $customer->name,
                'email' => $customer->email,
                'phone' => $customer->phone,
                'address' => $customer->address,
                'city' => $customer->city,
                'state' => $customer->state,
                'country' => $customer->country,
                'currency' => $customer->currency,
                'tags' => $customer->tags,
                'notes' => $customer->notes,
                'status' => $customer->status,
                'total_spent' => $customer->getTotalSpent(),
                'last_order_date' => null,
                'created_at' => $customer->created_at,
                'updated_at' => $customer->updated_at
            ]);

        } catch (\Exception $e) {
            \Log::error('Error fetching customer:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Failed to fetch customer',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            // Get the business profile first
            $businessProfile = BusinessProfile::where('user_id', Auth::id())->first();

            if (!$businessProfile) {
                return response()->json([
                    'message' => 'Business profile not found'
                ], 404);
            }

            $customer = BusinessCustomer::where('business_id', $businessProfile->id)
                ->where('id', $id)
                ->firstOrFail();

            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'email' => 'nullable|email|max:255',
                'phone' => 'nullable|string|max:20',
                'address' => 'nullable|string|max:255',
                'city' => 'required|string|max:100',
                'state' => 'required|string|max:100',
                'country' => 'required|string|max:100',
                'currency' => 'required|string|size:3',
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

            \Log::info('Customer updated successfully:', $customer->toArray());

            return response()->json([
                'message' => 'Customer updated successfully',
                'customer' => $customer
            ]);

        } catch (\Exception $e) {
            \Log::error('Error updating customer:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Failed to update customer',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            // Get the business profile first
            $businessProfile = BusinessProfile::where('user_id', Auth::id())->first();

            if (!$businessProfile) {
                return response()->json([
                    'message' => 'Business profile not found'
                ], 404);
            }

            // Find the customer that belongs to this business
            $customer = BusinessCustomer::where('business_id', $businessProfile->id)
                ->where('id', $id)
                ->first();

            if (!$customer) {
                return response()->json([
                    'message' => 'Customer not found'
                ], 404);
            }

            \Log::info('Deleting customer:', [
                'customer_id' => $id,
                'business_id' => $businessProfile->id,
                'customer_data' => $customer->toArray()
            ]);

            // Delete the customer
            $customer->delete();

            return response()->json([
                'message' => 'Customer deleted successfully'
            ]);

        } catch (\Exception $e) {
            \Log::error('Error deleting customer:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Failed to delete customer',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 