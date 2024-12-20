<?php

namespace Database\Seeders;

use App\Models\Hustle;
use App\Models\ProfessionalCategory;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class HustleSeeder extends Seeder
{
    public function run()
    {
        // Get all professional categories
        $categories = ProfessionalCategory::all();

        // Sample hustle data per category
        foreach ($categories as $category) {
            $this->createHustlesForCategory($category);
        }
    }

    private function createHustlesForCategory(ProfessionalCategory $category)
    {
        $hustles = $this->getHustleDataForCategory($category->name);

        foreach ($hustles as $hustleData) {
            Hustle::create([
                'title' => $hustleData['title'],
                'description' => $hustleData['description'],
                'category_id' => $category->id,
                'budget' => $hustleData['budget'],
                'deadline' => Carbon::now()->addDays(rand(7, 30)),
                'requirements' => $hustleData['requirements'],
                'status' => 'open'
            ]);
        }
    }

    private function getHustleDataForCategory($categoryName)
    {
        $hustlesByCategory = [
            'Software Development' => [
                [
                    'title' => 'E-commerce Website Development',
                    'description' => 'Need a professional developer to build a modern e-commerce website using React and Laravel. The website should include product management, shopping cart, and payment integration.',
                    'budget' => 500000,
                    'requirements' => "- Experience with React and Laravel\n- Previous e-commerce projects\n- Payment gateway integration experience\n- Responsive design implementation"
                ],
                [
                    'title' => 'Mobile App Bug Fixes',
                    'description' => 'Looking for a developer to fix critical bugs in our React Native mobile app. The app is experiencing crashes and performance issues.',
                    'budget' => 150000,
                    'requirements' => "- React Native expertise\n- Debugging experience\n- Performance optimization skills\n- Code review capabilities"
                ]
            ],
            'Cybersecurity' => [
                [
                    'title' => 'Security Audit & Assessment',
                    'description' => 'Conduct a comprehensive security audit of our web application and infrastructure. Identify vulnerabilities and provide remediation recommendations.',
                    'budget' => 300000,
                    'requirements' => "- Security certification required\n- Experience with penetration testing\n- Knowledge of OWASP standards\n- Report writing skills"
                ],
                [
                    'title' => 'Implement SSO Authentication',
                    'description' => 'Need a security expert to implement Single Sign-On (SSO) authentication for our enterprise applications.',
                    'budget' => 250000,
                    'requirements' => "- Experience with OAuth 2.0 and SAML\n- Enterprise SSO implementation\n- Security best practices\n- Documentation skills"
                ]
            ],
            'Data Science' => [
                [
                    'title' => 'Customer Data Analysis',
                    'description' => 'Analyze our customer data to identify patterns and provide actionable insights for improving customer retention and satisfaction.',
                    'budget' => 400000,
                    'requirements' => "- Python/R proficiency\n- Data visualization skills\n- Statistical analysis experience\n- Business analytics background"
                ],
                [
                    'title' => 'Predictive Model Development',
                    'description' => 'Develop a predictive model for forecasting sales based on historical data and market indicators.',
                    'budget' => 350000,
                    'requirements' => "- Machine learning expertise\n- Time series analysis\n- Model deployment experience\n- Data preprocessing skills"
                ]
            ],
            'UI/UX Design' => [
                [
                    'title' => 'Mobile App Redesign',
                    'description' => 'Redesign our existing mobile app interface to improve user experience and modernize the look and feel.',
                    'budget' => 200000,
                    'requirements' => "- Mobile UI/UX expertise\n- Figma proficiency\n- User research experience\n- Prototyping skills"
                ],
                [
                    'title' => 'Design System Creation',
                    'description' => 'Create a comprehensive design system for our product suite, including components, guidelines, and documentation.',
                    'budget' => 450000,
                    'requirements' => "- Design system experience\n- Component library creation\n- Documentation writing\n- Team collaboration"
                ]
            ]
        ];

        return $hustlesByCategory[$categoryName] ?? [
            [
                'title' => "Generic {$categoryName} Project",
                'description' => "Need a professional in {$categoryName} for a project.",
                'budget' => rand(100000, 500000),
                'requirements' => "- Expertise in {$categoryName}\n- Professional experience\n- Good communication skills"
            ]
        ];
    }
} 