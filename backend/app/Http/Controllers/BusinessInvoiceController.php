<?php

namespace App\Http\Controllers;

use App\Models\BusinessInvoice;
use App\Models\BusinessInvoiceItem;
use App\Models\BusinessProfile;
use App\Models\BusinessInvoicePayment;
use App\Models\BusinessCustomer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;
use TCPDF;

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

            // Get customer to use their currency
            $customer = BusinessCustomer::findOrFail($request->customer_id);

            // Create invoice
            $invoice = BusinessInvoice::create([
                'business_id' => $businessProfile->id,
                'customer_id' => $request->customer_id,
                'invoice_number' => $request->invoice_number ?? 'INV-' . time(),
                'amount' => $request->amount,
                'currency' => $customer->currency,
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
                ->get()
                ->map(function ($invoice) {
                    $invoice->status_details = $invoice->getStatusDetails();
                    return $invoice;
                });

            return response()->json($invoices);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch invoices',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getInvoice(BusinessInvoice $invoice)
    {
        try {
            $businessProfile = auth()->user()->business_profile;
            if (!$businessProfile) {
                return response()->json([
                    'message' => 'Business profile not found'
                ], 404);
            }

            // Check if the user owns the business
            if ($invoice->business_id !== $businessProfile->id) {
                return response()->json([
                    'message' => 'You are not authorized to view this invoice'
                ], 403);
            }

            // Load relationships and add status details
            $invoice->load(['customer', 'items', 'payments']);
            $invoice->status_details = $invoice->getStatusDetails();

            return response()->json($invoice);
        } catch (\Exception $e) {
            \Log::error('Failed to fetch invoice:', [
                'id' => $invoice->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Failed to fetch invoice',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function downloadPDF($id)
    {
        try {
            $invoice = BusinessInvoice::with(['items', 'business', 'customer'])
                ->findOrFail($id);

            // Check if user owns the business
            if ($invoice->business->user_id !== Auth::id()) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            // Create PDF instance
            $pdf = new TCPDF(PDF_PAGE_ORIENTATION, PDF_UNIT, PDF_PAGE_FORMAT, true, 'UTF-8', false);

            // Set document information
            $pdf->SetCreator(PDF_CREATOR);
            $pdf->SetAuthor($invoice->business->business_name);
            $pdf->SetTitle('Invoice #' . $invoice->invoice_number);

            // Remove default header/footer
            $pdf->setPrintHeader(false);
            $pdf->setPrintFooter(false);

            // Set margins
            $pdf->SetMargins(15, 15, 15);

            // Add a page
            $pdf->AddPage();

            // Set font
            $pdf->SetFont('helvetica', '', 10);

            // Add business logo if exists
            if ($invoice->business->logo_url) {
                $pdf->Image($invoice->business->logo_url, 15, 15, 40);
                $pdf->Ln(20);
            }

            // Invoice Title with theme color
            $themeColor = $invoice->theme_color ?? '#0000FF';
            list($r, $g, $b) = sscanf($themeColor, "#%02x%02x%02x");
            $pdf->SetTextColor($r, $g, $b);
            $pdf->SetFont('helvetica', 'B', 20);
            $pdf->Cell(0, 10, 'INVOICE', 0, 1, 'R');
            $pdf->SetTextColor(0, 0, 0);

            // Business Information
            $pdf->SetFont('helvetica', '', 10);
            $pdf->SetXY(120, 45);
            $pdf->MultiCell(75, 5, 
                $invoice->business->business_name . "\n" .
                $invoice->business->address . "\n" .
                $invoice->business->email . "\n" .
                $invoice->business->phone,
                0, 'R');

            // Invoice Details
            $pdf->SetXY(15, 45);
            $pdf->MultiCell(90, 5,
                "Invoice #: " . $invoice->invoice_number . "\n" .
                "Date: " . $invoice->created_at->format('M d, Y') . "\n" .
                "Due Date: " . $invoice->due_date->format('M d, Y') . "\n" .
                "Status: " . ucwords(str_replace('_', ' ', $invoice->status)) . "\n" .
                ($invoice->paid_amount > 0 ? "Amount Paid: " . number_format($invoice->paid_amount, 2) . "\n" : "") .
                ($invoice->paid_amount > 0 ? "Balance Due: " . number_format($invoice->amount - $invoice->paid_amount, 2) : ""),
                0, 'L');

            // Customer Information
            $pdf->Ln(10);
            $pdf->SetFont('helvetica', 'B', 11);
            $pdf->Cell(0, 8, 'Bill To:', 0, 1, 'L');
            $pdf->SetFont('helvetica', '', 10);
            $pdf->MultiCell(0, 5,
                $invoice->customer->name . "\n" .
                ($invoice->customer->address ? $invoice->customer->address . "\n" : '') .
                "Email: " . $invoice->customer->email . "\n" .
                "Phone: " . $invoice->customer->phone,
                0, 'L');

            // Items Table
            $pdf->Ln(10);
            $pdf->SetFillColor($r, $g, $b);
            $pdf->SetTextColor(255, 255, 255);
            $pdf->SetFont('helvetica', 'B', 10);
            
            // Table Header
            $pdf->Cell(90, 8, 'Description', 1, 0, 'L', true);
            $pdf->Cell(30, 8, 'Quantity', 1, 0, 'C', true);
            $pdf->Cell(30, 8, 'Unit Price', 1, 0, 'R', true);
            $pdf->Cell(30, 8, 'Amount', 1, 1, 'R', true);
            
            // Reset text color
            $pdf->SetTextColor(0, 0, 0);
            
            // Table Content
            $pdf->SetFont('helvetica', '', 10);
            foreach ($invoice->items as $item) {
                $pdf->Cell(90, 8, $item->description, 1, 0, 'L');
                $pdf->Cell(30, 8, $item->quantity, 1, 0, 'C');
                $pdf->Cell(30, 8, $invoice->currency . ' ' . number_format($item->unit_price, 2), 1, 0, 'R');
                $pdf->Cell(30, 8, $invoice->currency . ' ' . number_format($item->amount, 2), 1, 1, 'R');
            }

            // Total
            $pdf->SetFont('helvetica', 'B', 10);
            $pdf->Cell(150, 8, 'Total:', 1, 0, 'R', true);
            $pdf->Cell(30, 8, $invoice->currency . ' ' . number_format($invoice->amount, 2), 1, 1, 'R', true);

            if ($invoice->notes) {
                $pdf->Ln(10);
                $pdf->SetFont('helvetica', 'B', 11);
                $pdf->Cell(0, 8, 'Notes:', 0, 1, 'L');
                $pdf->SetFont('helvetica', '', 10);
                $pdf->MultiCell(0, 5, $invoice->notes, 0, 'L');
            }

            // Output PDF without changing status
            return response($pdf->Output('', 'S'))
                ->header('Content-Type', 'application/pdf')
                ->header('Content-Disposition', 'attachment; filename="Invoice_' . $invoice->invoice_number . '.pdf"');

        } catch (\Exception $e) {
            \Log::error('Failed to generate invoice PDF:', [
                'id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Failed to generate invoice PDF',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function sendInvoice($id)
    {
        try {
            $invoice = BusinessInvoice::with(['items', 'business', 'customer'])
                ->findOrFail($id);

            // Check if user owns the business
            if ($invoice->business->user_id !== Auth::id()) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            // Create PDF instance
            $pdf = new TCPDF(PDF_PAGE_ORIENTATION, PDF_UNIT, PDF_PAGE_FORMAT, true, 'UTF-8', false);

            // Set document information
            $pdf->SetCreator(PDF_CREATOR);
            $pdf->SetAuthor($invoice->business->business_name);
            $pdf->SetTitle('Invoice #' . $invoice->invoice_number);

            // Remove default header/footer
            $pdf->setPrintHeader(false);
            $pdf->setPrintFooter(false);

            // Set margins
            $pdf->SetMargins(15, 15, 15);

            // Add a page
            $pdf->AddPage();

            // Set font
            $pdf->SetFont('helvetica', '', 10);

            // Add business logo if exists
            if ($invoice->business->logo_url) {
                $pdf->Image($invoice->business->logo_url, 15, 15, 40);
                $pdf->Ln(20);
            }

            // Invoice Title with theme color
            $themeColor = $invoice->theme_color ?? '#0000FF';
            list($r, $g, $b) = sscanf($themeColor, "#%02x%02x%02x");
            $pdf->SetTextColor($r, $g, $b);
            $pdf->SetFont('helvetica', 'B', 20);
            $pdf->Cell(0, 10, 'INVOICE', 0, 1, 'R');
            $pdf->SetTextColor(0, 0, 0);

            // Business Information
            $pdf->SetFont('helvetica', '', 10);
            $pdf->SetXY(120, 45);
            $pdf->MultiCell(75, 5, 
                $invoice->business->business_name . "\n" .
                $invoice->business->address . "\n" .
                $invoice->business->email . "\n" .
                $invoice->business->phone,
                0, 'R');

            // Invoice Details
            $pdf->SetXY(15, 45);
            $pdf->MultiCell(90, 5,
                "Invoice #: " . $invoice->invoice_number . "\n" .
                "Date: " . $invoice->created_at->format('M d, Y') . "\n" .
                "Due Date: " . $invoice->due_date->format('M d, Y') . "\n" .
                "Status: " . ucwords(str_replace('_', ' ', $invoice->status)) . "\n" .
                ($invoice->paid_amount > 0 ? "Amount Paid: " . number_format($invoice->paid_amount, 2) . "\n" : "") .
                ($invoice->paid_amount > 0 ? "Balance Due: " . number_format($invoice->amount - $invoice->paid_amount, 2) : ""),
                0, 'L');

            // Customer Information
            $pdf->Ln(10);
            $pdf->SetFont('helvetica', 'B', 11);
            $pdf->Cell(0, 8, 'Bill To:', 0, 1, 'L');
            $pdf->SetFont('helvetica', '', 10);
            $pdf->MultiCell(0, 5,
                $invoice->customer->name . "\n" .
                ($invoice->customer->address ? $invoice->customer->address . "\n" : '') .
                "Email: " . $invoice->customer->email . "\n" .
                "Phone: " . $invoice->customer->phone,
                0, 'L');

            // Items Table
            $pdf->Ln(10);
            $pdf->SetFillColor($r, $g, $b);
            $pdf->SetTextColor(255, 255, 255);
            $pdf->SetFont('helvetica', 'B', 10);
            
            // Table Header
            $pdf->Cell(90, 8, 'Description', 1, 0, 'L', true);
            $pdf->Cell(30, 8, 'Quantity', 1, 0, 'C', true);
            $pdf->Cell(30, 8, 'Unit Price', 1, 0, 'R', true);
            $pdf->Cell(30, 8, 'Amount', 1, 1, 'R', true);
            
            // Reset text color
            $pdf->SetTextColor(0, 0, 0);
            
            // Table Content
            $pdf->SetFont('helvetica', '', 10);
            foreach ($invoice->items as $item) {
                $pdf->Cell(90, 8, $item->description, 1, 0, 'L');
                $pdf->Cell(30, 8, $item->quantity, 1, 0, 'C');
                $pdf->Cell(30, 8, $invoice->currency . ' ' . number_format($item->unit_price, 2), 1, 0, 'R');
                $pdf->Cell(30, 8, $invoice->currency . ' ' . number_format($item->amount, 2), 1, 1, 'R');
            }

            // Total
            $pdf->SetFont('helvetica', 'B', 10);
            $pdf->SetFillColor($r, $g, $b);
            $pdf->SetTextColor(255, 255, 255);
            $pdf->Cell(150, 8, 'Total:', 1, 0, 'R', true);
            $pdf->SetTextColor(0, 0, 0);
            $pdf->Cell(30, 8, $invoice->currency . ' ' . number_format($invoice->amount, 2), 1, 1, 'R', true);

            if ($invoice->notes) {
                $pdf->Ln(10);
                $pdf->SetFont('helvetica', 'B', 11);
                $pdf->Cell(0, 8, 'Notes:', 0, 1, 'L');
                $pdf->SetFont('helvetica', '', 10);
                $pdf->MultiCell(0, 5, $invoice->notes, 0, 'L');
            }

            // Send email with PDF attachment
            Mail::send('emails.invoice', ['invoice' => $invoice], function ($message) use ($invoice, $pdf) {
                $message->to($invoice->customer->email, $invoice->customer->name)
                    ->subject('Invoice #' . $invoice->invoice_number . ' from ' . $invoice->business->business_name)
                    ->attachData($pdf->Output('', 'S'), 'Invoice_' . $invoice->invoice_number . '.pdf');
            });

            // Only update status when explicitly sending the invoice
            $invoice->update(['status' => 'sent']);

            return response()->json([
                'message' => 'Invoice sent successfully'
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to send invoice:', [
                'id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Failed to send invoice',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function recordPayment(Request $request, $id)
    {
        \Log::info('Recording payment:', [
            'invoice_id' => $id,
            'data' => $request->all()
        ]);

        try {
            $invoice = BusinessInvoice::with(['business', 'customer'])->findOrFail($id);

            // Check if the user owns the business
            if ($invoice->business_id !== auth()->user()->business_profile->id) {
                return response()->json([
                    'message' => 'You are not authorized to record payments for this invoice'
                ], 403);
            }

            $request->validate([
                'amount' => 'required|numeric|min:0.01',
                'payment_date' => 'required|date',
                'notes' => 'nullable|string'
            ]);

            // Validate that amount doesn't exceed remaining balance
            $remainingBalance = $invoice->amount - $invoice->payments()->sum('amount');
            if ($request->amount > $remainingBalance) {
                return response()->json([
                    'message' => 'Payment amount cannot exceed the remaining balance',
                    'errors' => [
                        'amount' => ['Payment amount cannot exceed the remaining balance']
                    ]
                ], 422);
            }

            // Create the payment record
            $payment = $invoice->payments()->create([
                'amount' => $request->amount,
                'currency' => $invoice->currency,
                'payment_date' => $request->payment_date,
                'notes' => $request->notes
            ]);

            // Calculate total paid amount and update invoice status
            $totalPaid = $invoice->payments()->sum('amount');
            $invoice->update([
                'paid_amount' => $totalPaid,
                'status' => $totalPaid >= $invoice->amount ? 'paid' : 
                           ($totalPaid > 0 ? 'partially_paid' : $invoice->status)
            ]);

            // Send payment receipt email
            try {
                Mail::send('emails.payment-received', [
                    'invoice' => $invoice,
                    'payment' => $payment,
                    'business' => $invoice->business,
                    'customer' => $invoice->customer
                ], function ($message) use ($invoice, $payment) {
                    $message->to($invoice->customer->email, $invoice->customer->name)
                        ->subject('Payment Receipt for Invoice #' . $invoice->invoice_number);
                });

                \Log::info('Payment receipt email sent successfully', [
                    'invoice_id' => $invoice->id,
                    'customer_email' => $invoice->customer->email
                ]);
            } catch (\Exception $emailError) {
                \Log::error('Failed to send payment receipt email:', [
                    'error' => $emailError->getMessage(),
                    'invoice_id' => $invoice->id
                ]);
                // Don't throw the error - just log it and continue
            }

            \Log::info('Payment recorded successfully:', [
                'payment_id' => $payment->id,
                'invoice_id' => $id,
                'new_status' => $invoice->status,
                'total_paid' => $totalPaid,
                'invoice_amount' => $invoice->amount
            ]);

            return response()->json([
                'message' => 'Payment recorded successfully',
                'payment' => $payment,
                'invoice' => $invoice->fresh()
            ]);

        } catch (\Exception $e) {
            \Log::error('Failed to record payment:', [
                'invoice_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'message' => 'Failed to record payment',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function updateStatus(Request $request, $id)
    {
        try {
            $validator = Validator::make($request->all(), [
                'status' => 'required|string|in:' . implode(',', BusinessInvoice::$statuses)
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $invoice = BusinessInvoice::findOrFail($id);

            // Check if user owns the business
            if ($invoice->business->user_id !== Auth::id()) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            // Prevent status update if invoice is paid
            if ($invoice->status === BusinessInvoice::STATUS_PAID) {
                return response()->json([
                    'message' => 'Cannot update status of paid invoice'
                ], 422);
            }

            $invoice->update(['status' => $request->status]);

            return response()->json([
                'message' => 'Invoice status updated successfully',
                'invoice' => $invoice->fresh()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update invoice status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    private function generateInvoicePDF($invoice)
    {
        // Create PDF instance
        $pdf = new TCPDF(PDF_PAGE_ORIENTATION, PDF_UNIT, PDF_PAGE_FORMAT, true, 'UTF-8', false);

        // Set document information
        $pdf->SetCreator(PDF_CREATOR);
        $pdf->SetAuthor($invoice->business->business_name);
        $pdf->SetTitle('Invoice #' . $invoice->invoice_number);

        // Remove default header/footer
        $pdf->setPrintHeader(false);
        $pdf->setPrintFooter(false);

        // Set margins
        $pdf->SetMargins(15, 15, 15);

        // Add a page
        $pdf->AddPage();

        // Set font
        $pdf->SetFont('helvetica', '', 10);

        // Add business logo if exists
        if ($invoice->business->logo_url) {
            $pdf->Image($invoice->business->logo_url, 15, 15, 40);
            $pdf->Ln(20);
        }

        // Add invoice content (same as downloadPDF method)
        // ... (copy the PDF generation code from downloadPDF)

        return $pdf->Output('', 'S');
    }

    public function getCustomerTransactions($customerId)
    {
        try {
            $businessProfile = BusinessProfile::where('user_id', Auth::id())->first();
            if (!$businessProfile) {
                return response()->json(['message' => 'Business profile not found'], 404);
            }

            // Get all invoice payments for the customer
            $transactions = BusinessInvoicePayment::whereHas('invoice', function ($query) use ($businessProfile, $customerId) {
                $query->where('business_id', $businessProfile->id)
                    ->where('customer_id', $customerId);
            })
            ->with(['invoice:id,invoice_number'])
            ->orderBy('payment_date', 'desc')
            ->get()
            ->map(function ($payment) {
                return [
                    'id' => $payment->id,
                    'date' => $payment->payment_date,
                    'type' => 'payment',
                    'amount' => $payment->amount,
                    'status' => 'completed',
                    'notes' => $payment->notes,
                    'invoice_number' => $payment->invoice->invoice_number
                ];
            });

            return response()->json($transactions);
        } catch (\Exception $e) {
            \Log::error('Error fetching customer transactions:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Failed to fetch customer transactions',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function createInvoice(Request $request)
    {
        $request->validate([
            'customer_id' => 'required|exists:business_customers,id',
            'invoice_number' => 'nullable|string',
            'amount' => 'required|numeric|min:0.01',
            'due_date' => 'required|date',
            'notes' => 'nullable|string',
            'theme_color' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.description' => 'required|string',
            'items.*.quantity' => 'required|numeric|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.amount' => 'required|numeric|min:0'
        ]);

        // Get the customer to use their currency
        $customer = BusinessCustomer::findOrFail($request->customer_id);

        // Check if the user owns the business
        if ($customer->business_id !== auth()->user()->business_profile->id) {
            return response()->json([
                'message' => 'You are not authorized to create invoices for this customer'
            ], 403);
        }

        // Create the invoice
        $invoice = BusinessInvoice::create([
            'business_id' => auth()->user()->business_profile->id,
            'customer_id' => $request->customer_id,
            'invoice_number' => $request->invoice_number,
            'amount' => $request->amount,
            'currency' => $customer->currency,
            'due_date' => $request->due_date,
            'status' => 'draft',
            'notes' => $request->notes,
            'theme_color' => $request->theme_color
        ]);

        // Create invoice items
        foreach ($request->items as $item) {
            $invoice->items()->create([
                'description' => $item['description'],
                'quantity' => $item['quantity'],
                'unit_price' => $item['unit_price'],
                'amount' => $item['amount']
            ]);
        }

        return response()->json([
            'message' => 'Invoice created successfully',
            'invoice' => $invoice->fresh(['items'])
        ]);
    }

    public function show($id)
    {
        \Log::info('Fetching invoice:', ['id' => $id]);
        try {
            $invoice = BusinessInvoice::with(['items', 'business', 'customer', 'payments'])
                ->findOrFail($id);
            
            // Get the business profile
            $businessProfile = auth()->user()->business_profile;
            if (!$businessProfile) {
                \Log::error('Business profile not found for user:', ['user_id' => auth()->id()]);
                return response()->json([
                    'message' => 'Business profile not found'
                ], 404);
            }
            
            // Add authorization check
            if ($invoice->business_id !== $businessProfile->id) {
                \Log::error('Unauthorized access to invoice:', [
                    'invoice_id' => $id,
                    'user_id' => auth()->id(),
                    'business_id' => $businessProfile->id
                ]);
                abort(403);
            }

            \Log::info('Invoice found:', ['invoice' => $invoice->toArray()]);
            return response()->json($invoice);
        } catch (\Exception $e) {
            \Log::error('Error fetching invoice:', [
                'id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Invoice not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }
} 