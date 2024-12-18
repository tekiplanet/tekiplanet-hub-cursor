<?php

namespace Database\Seeders;

use App\Models\Brand;
use Illuminate\Database\Seeder;

class BrandSeeder extends Seeder
{
    public function run(): void
    {
        $brands = [
            ['name' => 'Apple'],
            ['name' => 'Dell'],
            ['name' => 'HP'],
            ['name' => 'Lenovo'],
            ['name' => 'ASUS'],
            ['name' => 'Acer'],
            ['name' => 'MSI'],
            ['name' => 'Samsung']
        ];

        foreach ($brands as $brand) {
            Brand::create($brand);
        }
    }
} 