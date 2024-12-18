<?php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\BusinessProfile;
use Illuminate\Database\Seeder;

class ProjectSeeder extends Seeder
{
    public function run()
    {
        $businesses = BusinessProfile::all();

        foreach ($businesses as $business) {
            $numProjects = rand(2, 5); // Random number of projects per business

            for ($i = 0; $i < $numProjects; $i++) {
                Project::create([
                    'business_id' => $business->id,
                    'name' => fake()->catchPhrase(),
                    'client_name' => fake()->company(),
                    'description' => fake()->paragraph(),
                    'status' => fake()->randomElement(['pending', 'in_progress', 'completed']),
                    'start_date' => fake()->dateTimeBetween('-6 months', 'now'),
                    'end_date' => fake()->dateTimeBetween('now', '+6 months'),
                    'budget' => fake()->numberBetween(5000, 50000),
                    'progress' => fake()->numberBetween(0, 100),
                ]);
            }
        }
    }
} 