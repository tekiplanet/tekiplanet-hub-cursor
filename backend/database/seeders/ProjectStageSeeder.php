<?php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\ProjectStage;
use Illuminate\Database\Seeder;

class ProjectStageSeeder extends Seeder
{
    public function run()
    {
        $projects = Project::all();
        $defaultStages = [
            'Planning',
            'Design',
            'Development',
            'Testing',
            'Deployment'
        ];

        foreach ($projects as $project) {
            foreach ($defaultStages as $index => $stageName) {
                ProjectStage::create([
                    'project_id' => $project->id,
                    'name' => $stageName,
                    'description' => fake()->sentence(),
                    'status' => $index === 0 ? 'completed' : 
                               ($index === 1 ? 'in_progress' : 'pending'),
                    'order' => $index + 1,
                    'start_date' => fake()->dateTimeBetween($project->start_date, $project->end_date),
                    'end_date' => fake()->dateTimeBetween('now', $project->end_date),
                ]);
            }
        }
    }
} 