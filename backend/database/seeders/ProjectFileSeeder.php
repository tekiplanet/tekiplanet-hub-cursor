<?php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\ProjectFile;
use Illuminate\Database\Seeder;

class ProjectFileSeeder extends Seeder
{
    public function run()
    {
        $projects = Project::all();
        $fileTypes = ['pdf', 'doc', 'xls', 'jpg', 'png'];

        foreach ($projects as $project) {
            $numFiles = rand(2, 5);

            for ($i = 0; $i < $numFiles; $i++) {
                $fileType = fake()->randomElement($fileTypes);
                ProjectFile::create([
                    'project_id' => $project->id,
                    'name' => fake()->words(3, true) . '.' . $fileType,
                    'file_path' => 'projects/' . $project->id . '/' . fake()->uuid() . '.' . $fileType,
                    'file_size' => fake()->numberBetween(100, 5000) . 'KB',
                    'file_type' => $fileType,
                    'uploaded_by' => $project->businessProfile->user_id,
                ]);
            }
        }
    }
} 