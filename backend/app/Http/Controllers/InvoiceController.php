<?php

namespace App\Http\Controllers;

use App\Models\ProjectInvoice;
use App\Models\Setting;
use App\Models\Transaction;
use Illuminate\Http\Request;
use TCPDF;

class InvoiceController extends Controller
{
    public function downloadPDF($id)
    {
        try {
            // Get settings
            $settings = Setting::first();
            
            // Find the invoice
            $invoice = ProjectInvoice::with(['project.businessProfile', 'project'])
                ->findOrFail($id);

            // Create new PDF document
            $pdf = new TCPDF(PDF_PAGE_ORIENTATION, PDF_UNIT, PDF_PAGE_FORMAT, true, 'UTF-8', false);

            // Set document information
            $pdf->SetCreator(PDF_CREATOR);
            $pdf->SetAuthor($settings->site_name ?? 'TekiPlanet');
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
            try {
                // Use a PNG image URL
                $logoUrl = 'https://static.vecteezy.com/system/resources/previews/006/298/276/non_2x/gear-smart-eps-icon-digital-tech-business-logo-free-vector.jpg';
                
                // Create a temporary file for the downloaded image
                $tempDownload = tempnam(sys_get_temp_dir(), 'pdf_logo_download');
                
                // Download the image
                $ch = curl_init($logoUrl);
                $fp = fopen($tempDownload, 'wb');
                curl_setopt_array($ch, [
                    CURLOPT_FILE => $fp,
                    CURLOPT_HEADER => 0,
                    CURLOPT_FOLLOWLOCATION => true,
                    CURLOPT_SSL_VERIFYPEER => false,
                    CURLOPT_USERAGENT => 'Mozilla/5.0',
                    CURLOPT_TIMEOUT => 30
                ]);
                
                $success = curl_exec($ch);
                $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                curl_close($ch);
                fclose($fp);
                
                if ($success && $httpCode === 200 && filesize($tempDownload) > 0) {
                    // Get image info
                    $imageInfo = getimagesize($tempDownload);
                    $width = $imageInfo[0];
                    $height = $imageInfo[1];
                    $type = $imageInfo[2];
                    
                    // Create a temporary JPG file
                    $tempJpg = tempnam(sys_get_temp_dir(), 'pdf_logo_jpg') . '.jpg';
                    
                    // Convert to JPG if it's a PNG
                    if ($type === IMAGETYPE_PNG) {
                        // Use fully qualified function names
                        $srcImage = \imagecreatefrompng($tempDownload);
                        $dstImage = \imagecreatetruecolor($width, $height);
                        
                        // Handle transparency
                        \imagealphablending($dstImage, false);
                        \imagesavealpha($dstImage, true);
                        $transparent = \imagecolorallocatealpha($dstImage, 255, 255, 255, 127);
                        \imagefilledrectangle($dstImage, 0, 0, $width, $height, $transparent);
                        
                        // Copy and merge
                        \imagecopy($dstImage, $srcImage, 0, 0, 0, 0, $width, $height);
                        \imagejpeg($dstImage, $tempJpg, 100);
                        
                        // Free memory
                        \imagedestroy($srcImage);
                        \imagedestroy($dstImage);
                        
                        // Use the JPG file for PDF
                        $imageFile = $tempJpg;
                    } else {
                        // Use original file if it's already a JPG
                        $imageFile = $tempDownload;
                    }
                    
                    // Calculate dimensions for PDF
                    $maxWidth = 40;
                    $aspectRatio = $width / $height;
                    $newHeight = $maxWidth / $aspectRatio;
                    
                    // Add image to PDF
                    $pdf->Image($imageFile, 15, 15, $maxWidth, $newHeight);
                    
                    \Log::info('Logo added successfully', [
                        'dimensions' => "$width x $height",
                        'type' => $type,
                        'file_size' => filesize($imageFile)
                    ]);
                    
                    // Clean up temporary files
                    if (file_exists($tempDownload)) unlink($tempDownload);
                    if (isset($tempJpg) && file_exists($tempJpg)) unlink($tempJpg);
                    
                } else {
                    \Log::warning('Failed to download logo', [
                        'http_code' => $httpCode,
                        'file_size' => filesize($tempDownload)
                    ]);
                }
            } catch (\Exception $e) {
                \Log::warning('Error processing logo:', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                // Continue without the logo
            }

            $pdf->SetXY(15, 35);
            $pdf->SetFont('helvetica', 'B', 18);
            $pdf->Cell(0, 10, 'INVOICE', 0, 1, 'R');
            $pdf->SetFont('helvetica', '', 10);
            
            // Company Details using settings
            $pdf->SetXY(120, 45);
            $pdf->MultiCell(75, 5, 
                ($settings->site_name ?? "TekiPlanet Limited") . "\n" .
                ($settings->contact_address ?? "123 Business Avenue") . "\n" .
                ($settings->support_email ?? "info@tekiplanet.com") . "\n" .
                ($settings->support_phone ?? "+234 123 456 7890"),
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

            // Return the PDF
            $pdfContent = $pdf->Output('', 'S');

            return response($pdfContent)
                ->header('Content-Type', 'application/pdf')
                ->header('Content-Disposition', 'attachment; filename="Invoice_' . $invoice->invoice_number . '.pdf"')
                ->header('Access-Control-Allow-Origin', config('app.frontend_url'))
                ->header('Access-Control-Allow-Methods', 'GET, OPTIONS')
                ->header('Access-Control-Allow-Credentials', 'true')
                ->header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept, Authorization, X-Request-With')
                ->header('Access-Control-Expose-Headers', 'Content-Disposition, Content-Length');

        } catch (\Exception $e) {
            \Log::error('Failed to generate invoice PDF:', [
                'id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to generate invoice PDF: ' . $e->getMessage()
            ], 500);
        }
    }

    public function processPayment($id)
    {
        try {
            $invoice = ProjectInvoice::findOrFail($id);
            $user = auth()->user();

            // Check if invoice is already paid
            if ($invoice->status === 'paid') {
                return response()->json([
                    'success' => false,
                    'message' => 'Invoice has already been paid'
                ], 400);
            }

            // Check wallet balance
            if ($user->wallet_balance < $invoice->amount) {
                return response()->json([
                    'success' => false,
                    'message' => 'Insufficient wallet balance',
                    'wallet_balance' => $user->wallet_balance,
                    'required_amount' => $invoice->amount
                ], 400);
            }

            // Begin transaction
            \DB::beginTransaction();

            try {
                // Deduct from wallet
                $user->wallet_balance -= $invoice->amount;
                $user->save();

                // Update invoice
                $invoice->status = 'paid';
                $invoice->paid_at = now();
                $invoice->payment_method = 'wallet';
                $invoice->save();

                // Create transaction record
                Transaction::create([
                    'user_id' => $user->id,
                    'amount' => $invoice->amount,
                    'type' => 'debit',
                    'description' => "Payment for invoice #{$invoice->invoice_number}",
                    'category' => 'invoice_payment',
                    'status' => 'completed',
                    'payment_method' => 'wallet',
                    'reference_number' => 'INV-' . uniqid(),
                ]);

                \DB::commit();

                return response()->json([
                    'success' => true,
                    'message' => 'Payment processed successfully',
                    'invoice' => $invoice,
                    'wallet_balance' => $user->wallet_balance
                ]);

            } catch (\Exception $e) {
                \DB::rollback();
                throw $e;
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to process payment: ' . $e->getMessage()
            ], 500);
        }
    }
} 