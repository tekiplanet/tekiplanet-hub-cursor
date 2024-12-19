<?php

namespace Database\Seeders;

use App\Models\ShippingZone;
use App\Models\ShippingMethod;
use App\Models\ZoneShippingRate;
use Illuminate\Database\Seeder;

class ZoneShippingRateSeeder extends Seeder
{
    public function run(): void
    {
        $zones = ShippingZone::all();
        $methods = ShippingMethod::all();

        foreach ($zones as $zone) {
            // Define base multiplier based on region
            $multiplier = match($zone->name) {
                'Lagos' => 1.0,
                'Federal Capital Territory' => 1.2,
                'Ogun', 'Oyo', 'Osun', 'Ondo', 'Ekiti' => 1.3, // South West
                'Delta', 'Edo', 'Bayelsa', 'Rivers', 'Cross River', 'Akwa Ibom' => 1.4, // South South
                'Abia', 'Anambra', 'Ebonyi', 'Enugu', 'Imo' => 1.4, // South East
                'Kwara', 'Kogi', 'Benue', 'Niger', 'Plateau', 'Nasarawa' => 1.5, // North Central
                default => 1.6, // North East and North West
            };

            foreach ($methods as $method) {
                ZoneShippingRate::create([
                    'zone_id' => $zone->id,
                    'shipping_method_id' => $method->id,
                    'rate' => $method->base_cost * $multiplier,
                    'estimated_days' => rand(
                        $method->estimated_days_min,
                        $method->estimated_days_max
                    )
                ]);
            }
        }
    }
} 