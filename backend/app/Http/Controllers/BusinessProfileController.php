<?php

namespace App\Http\Controllers;

use App\Models\BusinessProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class BusinessProfileController extends Controller
{
    public function checkProfile()
    {
        try {
            $profile = BusinessProfile::where('user_id', Auth::id())->first();

            return response()->json([
                'has_profile' => !is_null($profile),
                'profile' => $profile
            ]);

        } catch (\Exception $e) {
            Log::error('Error checking business profile:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Failed to check business profile'
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'business_name' => 'required|string|min:2',
                'business_email' => 'required|email',
                'phone_number' => 'required|string|min:10',
                'address' => 'required|string|min:5',
                'city' => 'required|string|min:2',
                'state' => 'required|string|min:2',
                'country' => 'required|string|min:2',
                'business_type' => 'required|string|min:2',
                'registration_number' => 'nullable|string',
                'tax_number' => 'nullable|string',
                'website' => 'nullable|url',
                'description' => 'required|string|min:20',
                'logo' => 'required|image|max:2048' // Max 2MB
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Handle logo upload
            $logoPath = null;
            if ($request->hasFile('logo')) {
                $logoPath = $request->file('logo')->store('business-logos', 'public');
            }

            // Create business profile
            $profile = BusinessProfile::create([
                'user_id' => Auth::id(),
                'business_name' => $request->business_name,
                'business_email' => $request->business_email,
                'phone_number' => $request->phone_number,
                'address' => $request->address,
                'city' => $request->city,
                'state' => $request->state,
                'country' => $request->country,
                'business_type' => $request->business_type,
                'registration_number' => $request->registration_number,
                'tax_number' => $request->tax_number,
                'website' => $request->website,
                'description' => $request->description,
                'logo' => $logoPath,
                'status' => 'inactive', // Set status to inactive by default
                'is_verified' => false
            ]);

            return response()->json([
                'message' => 'Business profile created successfully',
                'profile' => $profile
            ], 201);

        } catch (\Exception $e) {
            Log::error('Error creating business profile:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Failed to create business profile'
            ], 500);
        }
    }

    public function update(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'business_name' => 'required|string|min:2',
                'business_email' => 'required|email',
                'phone_number' => 'required|string|min:10',
                'address' => 'required|string|min:5',
                'city' => 'required|string|min:2',
                'state' => 'required|string|min:2',
                'country' => 'required|string|min:2',
                'business_type' => 'required|string|min:2',
                'registration_number' => 'nullable|string',
                'tax_number' => 'nullable|string',
                'website' => 'nullable|url',
                'description' => 'required|string|min:20'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $profile = BusinessProfile::where('user_id', Auth::id())->firstOrFail();
            
            $profile->update($request->all());

            return response()->json([
                'message' => 'Business profile updated successfully',
                'profile' => $profile
            ]);

        } catch (\Exception $e) {
            Log::error('Error updating business profile:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Failed to update business profile'
            ], 500);
        }
    }
} 