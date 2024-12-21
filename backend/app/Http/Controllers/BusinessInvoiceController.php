<?php

namespace App\Http\Controllers;

use App\Models\BusinessInvoice;
use App\Models\BusinessInvoiceItem;
use App\Models\BusinessProfile;
use App\Models\BusinessInvoicePayment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use TCPDF;
use Mail;

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

    public function getInvoice($id)
    {
        try {
            $businessProfile = BusinessProfile::where('user_id', Auth::id())->first();
            if (!$businessProfile) {
                return response()->json(['message' => 'Business profile not found'], 404);
            }

            $invoice = BusinessInvoice::with(['items', 'business', 'customer', 'payments'])
                ->where('business_id', $businessProfile->id)
                ->findOrFail($id);

            // Add status details to the response
            $invoice->status_details = $invoice->getStatusDetails();

            return response()->json($invoice);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Invoice not found',
                'error' => 'The requested invoice does not exist'
            ], 404);
        } catch (\Exception $e) {
            \Log::error('Error fetching invoice:', [
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
                $pdf->Cell(30, 8, number_format($item->unit_price, 2), 1, 0, 'R');
                $pdf->Cell(30, 8, number_format($item->amount, 2), 1, 1, 'R');
            }

            // Total
            $pdf->SetFont('helvetica', 'B', 10);
            $pdf->Cell(150, 8, 'Total:', 1, 0, 'R', true);
            $pdf->SetTextColor(0, 0, 0);
            $pdf->Cell(30, 8, number_format($invoice->amount, 2), 1, 1, 'R');

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
                $pdf->Cell(30, 8, number_format($item->unit_price, 2), 1, 0, 'R');
                $pdf->Cell(30, 8, number_format($item->amount, 2), 1, 1, 'R');
            }

            // Total
            $pdf->SetFont('helvetica', 'B', 10);
            $pdf->SetFillColor($r, $g, $b);
            $pdf->SetTextColor(255, 255, 255);
            $pdf->Cell(150, 8, 'Total:', 1, 0, 'R', true);
            $pdf->SetTextColor(0, 0, 0);
            $pdf->Cell(30, 8, number_format($invoice->amount, 2), 1, 1, 'R');

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
        try {
            DB::beginTransaction();

            $validator = Validator::make($request->all(), [
                'amount' => 'required|numeric|min:0',
                'date' => 'required|date',
                'notes' => 'nullable|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $invoice = BusinessInvoice::with(['business', 'customer'])
                ->findOrFail($id);

            // Check if user owns the business
            if ($invoice->business->user_id !== Auth::id()) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            // Check if payment amount is valid
            $remainingAmount = $invoice->amount - $invoice->paid_amount;
            if ($request->amount > $remainingAmount) {
                return response()->json([
                    'message' => 'Payment amount cannot exceed the remaining balance'
                ], 422);
            }

            // Create payment record
            $payment = BusinessInvoicePayment::create([
                'invoice_id' => $invoice->id,
                'amount' => $request->amount,
                'date' => $request->date,
                'notes' => $request->notes
            ]);

            // Update invoice paid amount and status
            $newPaidAmount = $invoice->paid_amount + $request->amount;
            $invoice->paid_amount = $newPaidAmount;
            
            // Update status based on payment
            if ($newPaidAmount >= $invoice->amount) {
                $invoice->status = 'paid';
            } elseif ($newPaidAmount > 0) {
                $invoice->status = 'partially_paid';
            }
            
            $invoice->save();

            // Send email notification to customer
            try {
                Mail::send('emails.payment-received', [
                    'invoice' => $invoice,
                    'payment' => $payment,
                    'business' => $invoice->business,
                    'customer' => $invoice->customer
                ], function($message) use ($invoice) {
                    $message->to($invoice->customer->email)
                            ->subject("Payment Recorded - Invoice #{$invoice->invoice_number}");
                });
            } catch (\Exception $e) {
                \Log::error('Failed to send payment notification email:', [
                    'error' => $e->getMessage(),
                    'invoice_id' => $invoice->id
                ]);
            }

            DB::commit();

            return response()->json([
                'message' => 'Payment recorded successfully',
                'payment' => $payment->load('invoice'),
                'invoice' => $invoice->fresh()
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Error recording payment:', [
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
} 