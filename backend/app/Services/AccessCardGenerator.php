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
    private $width = 1000;
    private $height = 600;
    private $colors;
    private $logoUrl = 'https://static.vecteezy.com/system/resources/previews/012/986/755/non_2x/abstract-circle-logo-icon-free-png.png';
    private $companyInfo = [
        'name' => 'TEKIPLANET',
        'address' => '123 Tech Street, Lagos, Nigeria',
        'email' => 'info@tekiplanet.com',
        'phone' => '+234 123 456 7890',
        'website' => 'www.tekiplanet.com'
    ];

    public function __construct()
    {
        if (!extension_loaded('gd')) {
            throw new \RuntimeException('GD library is not installed');
        }
    }

    public function generate(WorkstationSubscription $subscription)
    {
        try {
            $image = imagecreatetruecolor($this->width, $this->height);
            
            // Define colors
            $this->colors = [
                'white' => imagecolorallocate($image, 255, 255, 255),
                'black' => imagecolorallocate($image, 26, 26, 26),
                'blue' => imagecolorallocate($image, 0, 123, 255),
                'lightBlue' => imagecolorallocate($image, 235, 245, 255),
                'gray' => imagecolorallocate($image, 128, 128, 128),
                'darkBlue' => imagecolorallocate($image, 0, 84, 174)
            ];

            // Create modern design
            $this->createBackground($image);
            $this->addLogo($image);
            $this->addUserInfo($image, $subscription);
            $this->addSubscriptionDetails($image, $subscription);
            $this->addCompanyInfo($image);
            $this->addQRCode($image, $subscription);
            $this->addDesignElements($image);

            // Output image
            ob_start();
            imagejpeg($image, null, 95);
            $imageData = ob_get_clean();

            // Clean up
            imagedestroy($image);

            return $imageData;

        } catch (\Exception $e) {
            \Log::error('Access card generation failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    private function createBackground($image)
    {
        // Fill main background
        imagefilledrectangle($image, 0, 0, $this->width, $this->height, $this->colors['white']);
        
        // Add gradient-like header
        for ($i = 0; $i < 150; $i++) {
            $opacity = 1 - ($i / 150);
            $color = imagecolorallocatealpha(
                $image, 
                0, 
                123, 
                255, 
                127 * (1 - $opacity)
            );
            imagefilledrectangle($image, 0, $i, $this->width, $i + 1, $color);
        }

        // Add side accent
        imagefilledrectangle($image, 0, 0, 8, $this->height, $this->colors['blue']);
    }

    private function addLogo($image)
    {
        try {
            $logo = imagecreatefromstring(file_get_contents($this->logoUrl));
            $logoWidth = 120;
            $logoHeight = 120;
            imagecopyresampled(
                $image, $logo, 
                30, 20, 
                0, 0, 
                $logoWidth, $logoHeight,
                imagesx($logo), imagesy($logo)
            );
            imagedestroy($logo);
        } catch (\Exception $e) {
            \Log::warning('Failed to add logo to access card', ['error' => $e->getMessage()]);
        }
    }

    private function addUserInfo($image, $subscription)
    {
        $user = $subscription->user;
        
        // Add user photo or placeholder
        $photoUrl = $user->photo ?? 
            "https://ui-avatars.com/api/?name=" . urlencode($user->first_name . '+' . $user->last_name) . 
            "&size=200&background=0D8ABC&color=fff";
        
        try {
            $photo = imagecreatefromstring(file_get_contents($photoUrl));
            imagecopyresampled(
                $image, $photo,
                $this->width - 230, 20,
                0, 0,
                200, 200,
                imagesx($photo), imagesy($photo)
            );
            imagedestroy($photo);
        } catch (\Exception $e) {
            \Log::warning('Failed to add user photo to access card', ['error' => $e->getMessage()]);
        }

        // User details
        $this->addText($image, 'WORKSPACE ACCESS CARD', 170, 40, 28, 'bold');
        $this->addText($image, $user->first_name . ' ' . $user->last_name, 170, 90, 24);
        $this->addText($image, $user->email, 170, 120, 16, 'normal', $this->colors['gray']);
        $this->addText($image, 'Member since: ' . Carbon::parse($user->created_at)->format('F Y'), 170, 150, 16, 'normal', $this->colors['gray']);
    }

    private function addSubscriptionDetails($image, $subscription)
    {
        $y = 250;
        $this->addText($image, 'SUBSCRIPTION DETAILS', 30, $y, 18, 'bold', $this->colors['blue']);
        $y += 40;

        $details = [
            'Plan' => $subscription->plan->name,
            'Status' => ucfirst($subscription->status),
            'Valid Until' => Carbon::parse($subscription->end_date)->format('M d, Y'),
            'Access Hours' => '24/7',
            'Tracking ID' => $subscription->tracking_code
        ];

        foreach ($details as $label => $value) {
            $this->addText($image, $label . ':', 30, $y, 16, 'normal', $this->colors['gray']);
            $this->addText($image, $value, 200, $y, 16);
            $y += 30;
        }
    }

    private function addCompanyInfo($image)
    {
        $y = $this->height - 120;
        foreach ($this->companyInfo as $key => $value) {
            if ($key === 'name') continue;
            $this->addText($image, $value, 30, $y, 14, 'normal', $this->colors['gray']);
            $y += 25;
        }
    }

    private function addQRCode($image, $subscription)
    {
        $qrCode = QrCode::create($subscription->tracking_code)
            ->setSize(150)
            ->setMargin(0)
            ->setEncoding(new Encoding('UTF-8'))
            ->setErrorCorrectionLevel(ErrorCorrectionLevel::High)
            ->setRoundBlockSizeMode(RoundBlockSizeMode::Margin);

        $writer = new PngWriter();
        $result = $writer->write($qrCode);
        
        $qrImage = imagecreatefromstring($result->getString());
        imagecopy(
            $image, 
            $qrImage, 
            $this->width - 180, 
            $this->height - 180, 
            0, 
            0, 
            150, 
            150
        );
        imagedestroy($qrImage);
    }

    private function addDesignElements($image)
    {
        // Add decorative elements
        imagefilledrectangle($image, 0, $this->height - 5, $this->width, $this->height, $this->colors['blue']);
        
        // Add subtle pattern
        for ($i = 0; $i < $this->width; $i += 20) {
            imageline($image, $i, 0, $i + 10, 10, $this->colors['lightBlue']);
        }
    }

    private function addText($image, $text, $x, $y, $size, $weight = 'normal', $color = null)
    {
        $color = $color ?? $this->colors['black'];
        $fontSize = min(5, max(1, intval($size / 4)));
        
        if ($weight === 'bold') {
            // Simulate bold by drawing the text multiple times with slight offsets
            imagestring($image, $fontSize, $x - 1, $y, $text, $color);
            imagestring($image, $fontSize, $x + 1, $y, $text, $color);
            imagestring($image, $fontSize, $x, $y - 1, $text, $color);
            imagestring($image, $fontSize, $x, $y + 1, $text, $color);
        }
        
        imagestring($image, $fontSize, $x, $y, $text, $color);
    }
} 