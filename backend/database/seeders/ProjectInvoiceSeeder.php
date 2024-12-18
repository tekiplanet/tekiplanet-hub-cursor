<?php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\ProjectInvoice;
use Illuminate\Database\Seeder;

class ProjectInvoiceSeeder extends Seeder
{
    public function run()
    {
        $projects = Project::all();

        foreach ($projects as $project) {
            $numInvoices = rand(1, 3);
            $totalAmount = $project->budget;
            $amountPerInvoice = $totalAmount / $numInvoices;

            for ($i = 0; $i < $numInvoices; $i++) {
                ProjectInvoice::create([
                    'project_id' => $project->id,
                    'invoice_number' => 'INV-' . fake()->unique()->numerify('######'),
                    'amount' => $amountPerInvoice,
                    'status' => fake()->randomElement(['pending', 'paid', 'cancelled']),
                    'due_date' => fake()->dateTimeBetween('now', '+30 days'),
                    'paid_at' => fake()->boolean(60) ? fake()->dateTimeBetween('-30 days', 'now') : null,
                    'description' => fake()->sentence(),
                    'payment_method' => fake()->randomElement(['credit_card', 'bank_transfer', 'paypal']),
                    'transaction_reference' => fake()->uuid(),
                    'file_path' => 'invoices/' . fake()->uuid() . '.pdf',
                ]);
            }
        }
    }
} 