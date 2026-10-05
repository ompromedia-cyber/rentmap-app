<?php

namespace App\\Http\\Controllers;

use App\\Models\\Category;
use App\\Models\\Listing;
use Illuminate\\Http\\Request;
use Illuminate\\Validation\\Rule;

class ListingController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'lat' => ['nullable', 'numeric', 'between:-90,90'],
            'lng' => ['nullable', 'numeric', 'between:-180,180'],
            'radius' => ['nullable', 'numeric', 'min:0.1', 'max:100'],
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'category' => ['nullable', 'string', 'exists:categories,slug'],
            'limit' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $query = Listing::query()
            ->with(['category:id,slug,name,icon', 'photos:id,listing_id,path'])
            ->where('status', 'active');

        if (!empty($validated['category_id'])) {
            $query->where('category_id', $validated['category_id']);
        }

        if (!empty($validated['category'])) {
            $query->whereHas('category', fn ($q) => $q->where('slug', $validated['category']));
        }

        $limit = (int) ($validated['limit'] ?? 100);

        if (isset($validated['lat'], $validated['lng'])) {
            $radiusKm = (float) ($validated['radius'] ?? 5);
            $lat = (float) $validated['lat'];
            $lng = (float) $validated['lng'];

            $query->select('listings.*')
                ->selectRaw(
                    'ST_Distance_Sphere(location, ST_SRID(POINT(?, ?), 4326)) / 1000 AS distance_km',
                    [$lng, $lat]
                )
                ->whereRaw(
                    'ST_Distance_Sphere(location, ST_SRID(POINT(?, ?), 4326)) <= ?',
                    [$lng, $lat, $radiusKm * 1000]
                )
                ->orderBy('distance_km');
        } else {
            $query->latest('id');
        }

        return response()->json($query->limit($limit)->get());
    }

    public function show(Listing $listing)
    {
        if ($listing->status !== 'active') {
            abort(404);
        }

        return $listing->load(['category:id,slug,name,icon', 'photos:id,listing_id,path', 'user:id,telegram_id,username,first_name,last_name,photo_url']);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'currency' => ['required', 'string', 'size:3'],
            'price_period' => ['required', Rule::in(['hour', 'day', 'week', 'month'])],
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'status' => ['nullable', Rule::in(['draft', 'active'])],
        ]);

        $listing = Listing::create([
            ...$validated,
            'user_id' => $request->user()->id,
            'status' => $validated['status'] ?? 'active',
        ]);

        return response()->json(
            $listing->load('category:id,slug,name,icon'),
            201
        );
    }
}
