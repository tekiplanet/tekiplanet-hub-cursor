<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ProfessionalCategory;

class ProfessionalCategorySeeder extends Seeder
{
    public function run()
    {
        $categories = [
            [
                'name' => 'Web Development',
                'description' => 'Experts in creating modern web applications and websites using the latest technologies.',
                'icon' => 'Code',
                'order' => 1
            ],
            [
                'name' => 'Mobile Development',
                'description' => 'Specialists in developing native and cross-platform mobile applications.',
                'icon' => 'Smartphone',
                'order' => 2
            ],
            [
                'name' => 'UI/UX Design',
                'description' => 'Creative professionals focused on user interface and experience design.',
                'icon' => 'Palette',
                'order' => 3
            ],
            [
                'name' => 'Cyber Security',
                'description' => 'Security experts specializing in protecting digital assets and infrastructure.',
                'icon' => 'Shield',
                'order' => 4
            ],
            [
                'name' => 'Data Science',
                'description' => 'Specialists in data analysis, machine learning, and artificial intelligence.',
                'icon' => 'Database',
                'order' => 5
            ],
            [
                'name' => 'DevOps',
                'description' => 'Experts in development operations, deployment, and infrastructure management.',
                'icon' => 'Settings',
                'order' => 6
            ],
            [
                'name' => 'Cloud Computing',
                'description' => 'Specialists in cloud infrastructure and services.',
                'icon' => 'Cloud',
                'order' => 7
            ],
            [
                'name' => 'Project Management',
                'description' => 'Professional project managers and Scrum masters.',
                'icon' => 'GitMerge',
                'order' => 8
            ]
        ];

        foreach ($categories as $category) {
            ProfessionalCategory::create($category);
        }
    }
} 