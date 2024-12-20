<?php

namespace App\Services;

use App\Models\WorkstationSubscription;
use Carbon\Carbon;
use Endroid\QrCode\QrCode;
use Endroid\QrCode\Writer\PngWriter;
use Endroid\QrCode\Encoding\Encoding;
use Endroid\QrCode\ErrorCorrectionLevel;
use Endroid\QrCode\RoundBlockSizeMode;

class AccessCardGenerator
{
    private $width = 600;
    private $height = 400;
    private $bgColor;
    private $textColor;

    public function __construct()
    {
        if (!extension_loaded('gd')) {
            throw new \RuntimeException('GD library is not installed');
        }
    }

    public function generate(WorkstationSubscription $subscription)
    {
        try {
            // Create image
            $image = @imagecreatetruecolor($this->width, $this->height);
            if (!$image) {
                throw new \RuntimeException('Failed to create image canvas');
            }

            // Set colors
            $this->bgColor = @imagecolorallocate($image, 255, 255, 255);
            $this->textColor = @imagecolorallocate($image, 26, 26, 26);
            $accentColor = @imagecolorallocate($image, 0, 123, 255);

            // Fill background
            imagefilledrectangle($image, 0, 0, $this->width, $this->height, $this->bgColor);
            imagefilledrectangle($image, 0, 0, $this->width, 10, $accentColor);

            // Add text
            $this->addText($image, 'WORKSPACE ACCESS CARD', 30, 50, 24);
            $this->addText($image, $subscription->user->first_name . ' ' . $subscription->user->last_name, 30, 100, 20);
            $this->addText($image, 'Plan: ' . $subscription->plan->name, 30, 150, 16);
            $this->addText($image, 'Valid Until: ' . Carbon::parse($subscription->end_date)->format('M d, Y'), 30, 180, 16);
            $this->addText($image, 'ID: ' . $subscription->tracking_code, 30, 210, 14);

            // Generate QR Code using Endroid
            $qrCode = QrCode::create($subscription->tracking_code)
                ->setSize(100)
                ->setMargin(0)
                ->setEncoding(new Encoding('UTF-8'))
                ->setErrorCorrectionLevel(ErrorCorrectionLevel::High)
                ->setRoundBlockSizeMode(RoundBlockSizeMode::Margin);

            $writer = new PngWriter();
            $result = $writer->write($qrCode);
            
            // Get QR code as string
            $qrCodeString = $result->getString();

            // Convert QR code string to GD image
            $qrImage = imagecreatefromstring($qrCodeString);
            
            // Add QR code to image
            imagecopy(
                $image, 
                $qrImage, 
                $this->width - 130, 
                $this->height - 130, 
                0, 
                0, 
                100, 
                100
            );

            // Output image
            ob_start();
            imagejpeg($image, null, 90);
            $imageData = ob_get_clean();

            // Clean up
            imagedestroy($image);
            imagedestroy($qrImage);

            return $imageData;

        } catch (\Exception $e) {
            \Log::error('Access card generation failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    private function addText($image, $text, $x, $y, $size)
    {
        $fontSize = min(5, max(1, intval($size / 4)));
        imagestring($image, $fontSize, $x, $y, $text, $this->textColor);
    }
} 