<?php

namespace Database\Seeders;

use App\Models\BusinessProfile;
use App\Models\User;
use Illuminate\Database\Seeder;

class BusinessProfileSeeder extends Seeder
{
    public function run()
    {
        // Get users with business account type
        $businessUsers = User::where('account_type', 'business')->get();

        foreach ($businessUsers as $user) {
            BusinessProfile::create([
                'user_id' => $user->id,
                'business_name' => fake()->company(),
                'business_email' => fake()->companyEmail(),
                'phone_number' => fake()->phoneNumber(),
                'address' => fake()->streetAddress(),
                'city' => fake()->city(),
                'state' => fake()->state(),
                'country' => fake()->country(),
                'business_type' => fake()->randomElement(['Technology', 'Consulting', 'Marketing', 'E-commerce']),
                'registration_number' => fake()->numerify('REG-####-####'),
                'tax_number' => fake()->numerify('TAX-####-####'),
                'website' => fake()->url(),
                'description' => fake()->paragraph(),
                'status' => 'active',
                'is_verified' => fake()->boolean(70), // 70% chance of being verified
                'verified_at' => fake()->boolean(70) ? fake()->dateTimeThisYear() : null,
            ]);
        }
    }
} 