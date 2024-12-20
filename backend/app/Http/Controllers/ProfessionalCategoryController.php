<?php

namespace App\Http\Controllers;

use App\Models\ProfessionalCategory;
use Illuminate\Http\Request;

class ProfessionalCategoryController extends Controller
{
    public function index()
    {
        try {
            $categories = ProfessionalCategory::where('is_active', true)
                ->orderBy('order')
                ->get();

            return response()->json([
                'categories' => $categories
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch professional categories',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $category = ProfessionalCategory::with(['professionals'])
                ->findOrFail($id);

            return response()->json([
                'category' => $category
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Category not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }
} 