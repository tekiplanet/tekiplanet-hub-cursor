<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\Brand;
use App\Models\ProductImage;
use App\Models\ProductFeature;
use App\Models\ProductSpecification;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    private array $unsplashImages = [
        'laptops' => [
            'https://images.unsplash.com/photo-1517336714731-489689fd1ca8',
            'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9',
            'https://images.unsplash.com/photo-1541807084-5c52b6b3adef',
            'https://images.unsplash.com/photo-1496181133206-80ce9b88a853',
            'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2',
            'https://images.unsplash.com/photo-1629131726692-1accd0c53ce0'
        ],
        'desktops' => [
            'https://images.unsplash.com/photo-1587202372775-e229f172b9d7',
            'https://images.unsplash.com/photo-1593640408182-31c70c8268f5',
            'https://images.unsplash.com/photo-1547082299-de196ea013d6',
            'https://images.unsplash.com/photo-1589241062272-c0a000072dfa',
            'https://images.unsplash.com/photo-1591405351990-4726e331f141',
            'https://images.unsplash.com/photo-1547447134-cd3f5c716030'
        ],
        'powerstation' => [
            'https://images.unsplash.com/photo-1623126908029-58cb08a2b272',
            'https://images.unsplash.com/photo-1581092162384-8987c1d64926',
            'https://images.unsplash.com/photo-1581092160562-40aa08e78837',
            'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789',
            'https://images.unsplash.com/photo-1581092160607-ee67df11c6d0',
            'https://images.unsplash.com/photo-1581092160562-40aa08e78837'
        ],
        'gaming' => [
            'https://images.unsplash.com/photo-1547394765-185e1e68f34e',
            'https://images.unsplash.com/photo-1600861194942-f883de0dfe96',
            'https://images.unsplash.com/photo-1542751371-adc38448a05e',
            'https://images.unsplash.com/photo-1598550476439-6847785fcea6',
            'https://images.unsplash.com/photo-1526509867162-5b0c0d1b4b33',
            'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf'
        ],
        'accessories' => [
            'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46',
            'https://images.unsplash.com/photo-1601445638532-3c6f6c3aa1d6',
            'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf',
            'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed',
            'https://images.unsplash.com/photo-1625723044792-44de16ccb4e9',
            'https://images.unsplash.com/photo-1625723044792-44de16ccb4e9'
        ]
    ];

    private array $productTemplates = [
        'Laptops' => [
            'names' => ['ProBook', 'UltraBook', 'PowerBook', 'GameBook', 'WorkStation', 'AirBook'],
            'features' => [
                'Full HD Display',
                'Backlit Keyboard',
                'Fingerprint Sensor',
                'Thunderbolt Support',
                'All-Day Battery Life',
                'Premium Build Quality'
            ],
            'specs' => [
                'Screen Size' => ['13.3"', '14"', '15.6"', '16"'],
                'Processor' => ['Intel i5', 'Intel i7', 'Intel i9', 'AMD Ryzen 5', 'AMD Ryzen 7'],
                'RAM' => ['8GB', '16GB', '32GB', '64GB'],
                'Storage' => ['256GB SSD', '512GB SSD', '1TB SSD', '2TB SSD']
            ]
        ],
        'Desktop PCs' => [
            'names' => ['Gaming PC', 'Workstation', 'Creator PC', 'Pro Desktop', 'Ultimate PC', 'Custom Build'],
            'features' => [
                'Custom RGB Lighting',
                'Liquid Cooling',
                'Tool-less Design',
                'Premium Airflow',
                'Expandable Storage',
                'Easy Upgrade Access'
            ],
            'specs' => [
                'CPU' => ['Intel i7-13700K', 'Intel i9-13900K', 'AMD Ryzen 7 7800X', 'AMD Ryzen 9 7950X'],
                'GPU' => ['RTX 4070', 'RTX 4080', 'RTX 4090', 'RX 7900 XT'],
                'RAM' => ['16GB DDR5', '32GB DDR5', '64GB DDR5', '128GB DDR5'],
                'Storage' => ['1TB NVMe', '2TB NVMe', '4TB NVMe', '8TB NVMe']
            ]
        ],
        'Powerstation' => [
            'names' => ['PowerCore', 'EnergyStation', 'PowerMax', 'UltraCharge', 'PowerHub', 'PowerVault'],
            'features' => [
                'Pure Sine Wave Output',
                'Fast Charging Support',
                'LCD Display',
                'Multiple Outputs',
                'Surge Protection',
                'Portable Design'
            ],
            'specs' => [
                'Capacity' => ['500Wh', '1000Wh', '1500Wh', '2000Wh'],
                'Output Ports' => ['2x AC, 4x USB', '4x AC, 6x USB', '6x AC, 8x USB'],
                'Max Output' => ['500W', '1000W', '1500W', '2000W'],
                'Charging Time' => ['2-3 hours', '3-4 hours', '4-5 hours']
            ]
        ],
        'Gaming' => [
            'names' => ['ProGamer', 'Elite Gaming', 'GameMaster', 'Ultimate Gaming', 'Pro Series', 'Gaming Elite'],
            'features' => [
                'RGB Lighting',
                'Programmable Buttons',
                'Ergonomic Design',
                'Premium Switches',
                'Custom Software',
                'Low Latency'
            ],
            'specs' => [
                'Response Time' => ['0.5ms', '1ms', '2ms'],
                'Polling Rate' => ['1000Hz', '2000Hz', '4000Hz', '8000Hz'],
                'Connection' => ['Wired', 'Wireless 2.4GHz', 'Bluetooth 5.0'],
                'Battery Life' => ['30 hours', '50 hours', '70 hours', '100 hours']
            ]
        ],
        'Accessories' => [
            'names' => ['Pro Series', 'Elite', 'Premium', 'Ultimate', 'Advanced', 'Professional'],
            'features' => [
                'Premium Build',
                'Ergonomic Design',
                'Wireless Connectivity',
                'Long Battery Life',
                'Multi-Device Support',
                'Quick Charging'
            ],
            'specs' => [
                'Connection Type' => ['Wireless', 'Bluetooth', 'USB-C', 'USB-A'],
                'Battery Life' => ['20 hours', '30 hours', '40 hours', '50 hours'],
                'Compatibility' => ['Windows/Mac', 'All Platforms', 'Universal'],
                'Material' => ['Aluminum', 'Premium Plastic', 'Carbon Fiber', 'Stainless Steel']
            ]
        ]
    ];

    public function run(): void
    {
        $categories = ProductCategory::all();
        $brands = Brand::all();

        // Keep track of featured products count
        $featuredCount = 0;
        $maxFeatured = 8; // We want 8 featured products
        $maxFeaturedPerCategory = ceil($maxFeatured / $categories->count());

        foreach ($categories as $index => $category) {
            // Create 6 products per category
            for ($i = 0; $i < 6; $i++) {
                $template = $this->productTemplates[$category->name] ?? null;
                
                // Determine if this product should be featured
                $shouldFeature = $featuredCount < $maxFeatured && 
                    // Feature first products of each category up to max per category
                    ($i < $maxFeaturedPerCategory);

                $product = Product::create([
                    'name' => $brands->random()->name . ' ' . 
                            ($template ? $template['names'][array_rand($template['names'])] : fake()->words(2, true)),
                    'description' => fake()->paragraphs(3, true),
                    'short_description' => fake()->sentence(),
                    'price' => fake()->randomFloat(2, 299, 4999),
                    'category_id' => $category->id,
                    'brand_id' => $brands->random()->id,
                    'stock' => fake()->numberBetween(0, 100),
                    'rating' => fake()->randomFloat(1, 3.5, 5.0),
                    'reviews_count' => fake()->numberBetween(0, 500),
                    'is_featured' => $shouldFeature
                ]);

                // Increment featured count if this product was featured
                if ($shouldFeature) {
                    $featuredCount++;
                }

                // Add images
                $categoryKey = strtolower(str_replace(' ', '', $category->name));
                $imageUrls = $this->unsplashImages[$categoryKey] ?? $this->unsplashImages['accessories'];
                
                foreach (array_slice($imageUrls, 0, 3) as $index => $imageUrl) {
                    ProductImage::create([
                        'product_id' => $product->id,
                        'image_url' => $imageUrl,
                        'is_primary' => $index === 0,
                        'order' => $index
                    ]);
                }

                // Add features
                $features = $template['features'] ?? ['Feature 1', 'Feature 2', 'Feature 3'];
                foreach (array_slice($features, 0, 4) as $feature) {
                    ProductFeature::create([
                        'product_id' => $product->id,
                        'feature' => $feature
                    ]);
                }

                // Add specifications
                $specs = $template['specs'] ?? [
                    'Dimension' => ['Small', 'Medium', 'Large'],
                    'Weight' => ['1kg', '2kg', '3kg'],
                    'Color' => ['Black', 'Silver', 'White']
                ];

                foreach ($specs as $key => $values) {
                    ProductSpecification::create([
                        'product_id' => $product->id,
                        'key' => $key,
                        'value' => $values[array_rand($values)]
                    ]);
                }
            }

            // Update category count
            $category->update(['count' => 6]);
        }
    }
} 