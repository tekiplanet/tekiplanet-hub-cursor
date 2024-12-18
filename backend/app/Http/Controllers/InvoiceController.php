<?php

namespace App\Http\Controllers;

use App\Models\ProjectInvoice;
use Illuminate\Http\Request;
use TCPDF;

class InvoiceController extends Controller
{
    public function downloadPDF($id)
    {
        try {
            \Log::info('Attempting to download invoice:', [
                'id' => $id,
                'id_type' => gettype($id)
            ]);
            
            // Try to find the invoice first
            $invoice = ProjectInvoice::where('id', $id)->first();
            
            if (!$invoice) {
                \Log::error('Invoice not found:', ['id' => $id]);
                return response()->json([
                    'success' => false,
                    'message' => 'Invoice not found',
                ], 404);
            }

            // Load relationships after confirming invoice exists
            $invoice->load(['project.businessProfile', 'project']);

            \Log::info('Invoice found:', ['invoice_number' => $invoice->invoice_number]);

            // Check if project and business profile exist
            if (!$invoice->project || !$invoice->project->businessProfile) {
                throw new \Exception('Project or business profile not found');
            }

            // Create new PDF document
            $pdf = new TCPDF(PDF_PAGE_ORIENTATION, PDF_UNIT, PDF_PAGE_FORMAT, true, 'UTF-8', false);

            // Set document information
            $pdf->SetCreator(PDF_CREATOR);
            $pdf->SetAuthor('TekiPlanet');
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

            // Company Logo and Info
            $logoPath = public_path('images/logo.png');
            if (file_exists($logoPath)) {
                $pdf->Image($logoPath, 15, 15, 40);
            } else {
                \Log::warning('Logo file not found at: ' . $logoPath);
                // Skip logo or use alternative
            }
            $pdf->SetXY(15, 35);
            $pdf->SetFont('helvetica', 'B', 18);
            $pdf->Cell(0, 10, 'INVOICE', 0, 1, 'R');
            $pdf->SetFont('helvetica', '', 10);
            
            // Company Details
            $pdf->SetXY(120, 45);
            $pdf->MultiCell(75, 5, 
                "TekiPlanet Limited\n" .
                "123 Business Avenue\n" .
                "Lagos, Nigeria\n" .
                "Email: info@tekiplanet.com\n" .
                "Phone: +234 123 456 7890",
                0, 'R');

            // Invoice Details
            $pdf->SetXY(15, 45);
            $pdf->MultiCell(90, 5,
                "Invoice #: " . $invoice->invoice_number . "\n" .
                "Date: " . $invoice->created_at->format('M d, Y') . "\n" .
                "Due Date: " . $invoice->due_date->format('M d, Y') . "\n" .
                "Status: " . ucfirst($invoice->status),
                0, 'L');

            // Client Details
            $pdf->Ln(10);
            $pdf->SetFont('helvetica', 'B', 11);
            $pdf->Cell(0, 8, 'Bill To:', 0, 1, 'L');
            $pdf->SetFont('helvetica', '', 10);
            $pdf->MultiCell(0, 5,
                $invoice->project->businessProfile->business_name . "\n" .
                $invoice->project->businessProfile->address . "\n" .
                "Email: " . $invoice->project->businessProfile->email . "\n" .
                "Phone: " . $invoice->project->businessProfile->phone,
                0, 'L');

            // Project Details
            $pdf->Ln(10);
            $pdf->SetFont('helvetica', 'B', 11);
            $pdf->Cell(0, 8, 'Project Details:', 0, 1, 'L');
            $pdf->SetFont('helvetica', '', 10);
            $pdf->MultiCell(0, 5,
                "Project Name: " . $invoice->project->name . "\n" .
                "Project Status: " . ucfirst($invoice->project->status) . "\n" .
                "Progress: " . $invoice->project->progress . "%",
                0, 'L');

            // Invoice Items Header
            $pdf->Ln(10);
            $pdf->SetFillColor(240, 240, 240);
            $pdf->SetFont('helvetica', 'B', 10);
            $pdf->Cell(90, 8, 'Description', 1, 0, 'L', true);
            $pdf->Cell(30, 8, 'Quantity', 1, 0, 'C', true);
            $pdf->Cell(30, 8, 'Rate', 1, 0, 'R', true);
            $pdf->Cell(30, 8, 'Amount', 1, 1, 'R', true);

            // Invoice Items
            $pdf->SetFont('helvetica', '', 10);
            $pdf->Cell(90, 8, 'Project Development Services', 1, 0, 'L');
            $pdf->Cell(30, 8, '1', 1, 0, 'C');
            $pdf->Cell(30, 8, number_format($invoice->amount, 2), 1, 0, 'R');
            $pdf->Cell(30, 8, number_format($invoice->amount, 2), 1, 1, 'R');

            // Total
            $pdf->SetFont('helvetica', 'B', 10);
            $pdf->Cell(150, 8, 'Total:', 1, 0, 'R', true);
            $pdf->Cell(30, 8, number_format($invoice->amount, 2), 1, 1, 'R', true);

            // Payment Instructions
            $pdf->Ln(10);
            $pdf->SetFont('helvetica', 'B', 11);
            $pdf->Cell(0, 8, 'Payment Instructions:', 0, 1, 'L');
            $pdf->SetFont('helvetica', '', 10);
            $pdf->MultiCell(0, 5,
                "Bank: TekiPlanet Bank\n" .
                "Account Number: 1234567890\n" .
                "Sort Code: 123456\n" .
                "Please include invoice number as reference",
                0, 'L');

            // Terms and Conditions
            $pdf->Ln(10);
            $pdf->SetFont('helvetica', 'B', 11);
            $pdf->Cell(0, 8, 'Terms and Conditions:', 0, 1, 'L');
            $pdf->SetFont('helvetica', '', 9);
            $pdf->MultiCell(0, 5,
                "1. Payment is due within 30 days\n" .
                "2. Please make payment via bank transfer\n" .
                "3. Late payments may incur additional charges",
                0, 'L');

            // Instead of directly outputting, return as response
            $pdfContent = $pdf->Output('', 'S');  // 'S' means return as string

            return response($pdfContent)
                ->header('Content-Type', 'application/pdf')
                ->header('Content-Disposition', 'attachment; filename="Invoice_' . $invoice->invoice_number . '.pdf"')
                ->header('Access-Control-Allow-Origin', '*')
                ->header('Access-Control-Allow-Methods', 'GET, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept, Authorization, X-Request-With')
                ->header('Access-Control-Expose-Headers', 'Content-Disposition');

        } catch (\Exception $e) {
            \Log::error('Failed to generate invoice PDF:', [
                'id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to generate invoice PDF: ' . $e->getMessage(),
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 