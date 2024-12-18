<?php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\ProjectTeamMember;
use App\Models\User;
use Illuminate\Database\Seeder;

class ProjectTeamMemberSeeder extends Seeder
{
    public function run()
    {
        $projects = Project::all();
        $users = User::all();
        $roles = ['Project Manager', 'Developer', 'Designer', 'QA Engineer', 'Business Analyst'];

        foreach ($projects as $project) {
            $teamSize = rand(3, 5); // Random team size
            $selectedUsers = $users->random($teamSize);

            foreach ($selectedUsers as $index => $user) {
                ProjectTeamMember::create([
                    'project_id' => $project->id,
                    'user_id' => $user->id,
                    'role' => $roles[$index % count($roles)],
                    'status' => 'active',
                    'joined_at' => fake()->dateTimeBetween($project->start_date, 'now'),
                    'left_at' => fake()->boolean(20) ? fake()->dateTimeBetween('now', $project->end_date) : null,
                ]);
            }
        }
    }
} 