<?php

namespace App\Http\Controllers;

use App\Models\BusinessInvoice;
use App\Models\BusinessInvoiceItem;
use App\Models\BusinessProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class BusinessInvoiceController extends Controller
{
    public function store(Request $request)
    {
        try {
            DB::beginTransaction();

            $validator = Validator::make($request->all(), [
                'customer_id' => 'required|uuid',
                'invoice_number' => 'nullable|string|max:50',
                'amount' => 'required|numeric|min:0',
                'due_date' => 'required|date',
                'notes' => 'nullable|string',
                'theme_color' => 'nullable|string',
                'items' => 'required|array|min:1',
                'items.*.description' => 'required|string',
                'items.*.quantity' => 'required|numeric|min:1',
                'items.*.unit_price' => 'required|numeric|min:0',
                'items.*.amount' => 'required|numeric|min:0'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Get business profile
            $businessProfile = BusinessProfile::where('user_id', Auth::id())->first();
            if (!$businessProfile) {
                return response()->json(['message' => 'Business profile not found'], 404);
            }

            // Create invoice
            $invoice = BusinessInvoice::create([
                'business_id' => $businessProfile->id,
                'customer_id' => $request->customer_id,
                'invoice_number' => $request->invoice_number ?? 'INV-' . time(),
                'amount' => $request->amount,
                'paid_amount' => 0,
                'due_date' => $request->due_date,
                'status' => 'pending',
                'payment_reminder_sent' => false,
                'theme_color' => $request->theme_color,
                'notes' => $request->notes
            ]);

            // Create invoice items
            foreach ($request->items as $item) {
                BusinessInvoiceItem::create([
                    'invoice_id' => $invoice->id,
                    'description' => $item['description'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'amount' => $item['amount']
                ]);
            }

            DB::commit();

            return response()->json([
                'message' => 'Invoice created successfully',
                'invoice' => $invoice->load('items')
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Error creating invoice:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Failed to create invoice',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getCustomerInvoices($customerId)
    {
        try {
            $businessProfile = BusinessProfile::where('user_id', Auth::id())->first();
            if (!$businessProfile) {
                return response()->json(['message' => 'Business profile not found'], 404);
            }

            $invoices = BusinessInvoice::where('business_id', $businessProfile->id)
                ->where('customer_id', $customerId)
                ->with('items')
                ->get();

            return response()->json($invoices);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch invoices',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 