<?php

namespace Database\Seeders;

use App\Models\Professional;
use App\Models\User;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class ProfessionalsTableSeeder extends Seeder
{
    public function run()
    {
        $professionals = [
            [
                'title' => 'Senior Software Engineer',
                'specialization' => 'Full Stack Development',
                'expertise_areas' => [
                    'React', 'Node.js', 'Laravel', 'AWS',
                    'System Design', 'Database Architecture'
                ],
                'years_of_experience' => 8,
                'hourly_rate' => 150.00,
                'bio' => 'Experienced full-stack developer specializing in scalable web applications and cloud architecture.',
                'certifications' => [
                    'AWS Certified Solutions Architect',
                    'MongoDB Certified Developer'
                ],
                'languages' => ['English', 'French']
            ],
            [
                'title' => 'DevOps Engineer',
                'specialization' => 'Cloud Infrastructure',
                'expertise_areas' => [
                    'Docker', 'Kubernetes', 'CI/CD', 'AWS',
                    'Infrastructure as Code', 'Monitoring'
                ],
                'years_of_experience' => 6,
                'hourly_rate' => 130.00,
                'bio' => 'DevOps specialist focused on automating and optimizing infrastructure deployment and management.',
                'certifications' => [
                    'Kubernetes Administrator (CKA)',
                    'AWS DevOps Professional'
                ],
                'languages' => ['English']
            ],
            [
                'title' => 'Security Consultant',
                'specialization' => 'Cybersecurity',
                'expertise_areas' => [
                    'Penetration Testing', 'Security Auditing',
                    'Incident Response', 'Security Architecture'
                ],
                'years_of_experience' => 7,
                'hourly_rate' => 170.00,
                'bio' => 'Cybersecurity expert specializing in threat detection and security infrastructure design.',
                'certifications' => [
                    'Certified Ethical Hacker (CEH)',
                    'CISSP'
                ],
                'languages' => ['English', 'Spanish']
            ],
            [
                'title' => 'Data Scientist',
                'specialization' => 'Machine Learning',
                'expertise_areas' => [
                    'Python', 'TensorFlow', 'Data Analysis',
                    'Neural Networks', 'Computer Vision'
                ],
                'years_of_experience' => 5,
                'hourly_rate' => 140.00,
                'bio' => 'AI/ML specialist with focus on practical business applications of machine learning.',
                'certifications' => [
                    'TensorFlow Developer Certificate',
                    'IBM Data Science Professional'
                ],
                'languages' => ['English', 'Mandarin']
            ],
            [
                'title' => 'Mobile Development Expert',
                'specialization' => 'Cross-platform Development',
                'expertise_areas' => [
                    'React Native', 'Flutter', 'iOS', 'Android',
                    'Mobile Architecture', 'App Performance'
                ],
                'years_of_experience' => 6,
                'hourly_rate' => 125.00,
                'bio' => 'Mobile development specialist with expertise in cross-platform and native development.',
                'certifications' => [
                    'Google Associate Android Developer',
                    'Apple Certified iOS Developer'
                ],
                'languages' => ['English', 'German']
            ]
        ];

        // Create users first
        foreach ($professionals as $professional) {
            $user = new User();
            $user->forceFill([
                'first_name' => fake()->firstName(),
                'last_name' => fake()->lastName(),
                'email' => fake()->unique()->safeEmail(),
                'password' => bcrypt('password'),
                'username' => fake()->userName(),
                'bio' => fake()->sentence(),
                'timezone' => 'Africa/Lagos',
                'dark_mode' => false,
                'two_factor_enabled' => false,
                'email_notifications' => true,
                'push_notifications' => true,
                'marketing_notifications' => true,
                'profile_visibility' => 'public',
                'account_type' => 'professional',
                'wallet_balance' => 0
            ]);
            $user->save();

            Professional::create(array_merge($professional, [
                'user_id' => $user->id,
                'availability_status' => 'available',
                'preferred_contact_method' => 'email',
                'timezone' => 'Africa/Lagos',
                'rating' => rand(40, 50) / 10, // Random rating between 4.0 and 5.0
                'total_sessions' => rand(10, 50),
                'status' => 'active',
                'verified_at' => Carbon::now(),
                'github_url' => "https://github.com/professional-{$user->id}",
                'linkedin_url' => "https://linkedin.com/in/professional-{$user->id}",
                'portfolio_url' => "https://portfolio-{$user->id}.com"
            ]));
        }
    }
} 