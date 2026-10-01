<?php

namespace App\\Http\\Controllers;

use App\\Models\\Category;

class CategoryController extends Controller
{
    public function index()
    {
        return Category::query()
            ->orderBy('id')
            ->get(['id', 'slug', 'name', 'icon']);
    }
}
