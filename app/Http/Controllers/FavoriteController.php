<?php

namespace App\\Http\\Controllers;

use App\\Models\\Favorite;
use App\\Models\\Listing;
use Illuminate\\Http\\Request;

class FavoriteController extends Controller
{
    public function index(Request $request)
    {
        return Favorite::with(['listing.category', 'listing.photos'])
            ->where('user_id', $request->user()->id)
            ->latest('created_at')
            ->get()
            ->pluck('listing')
            ->values();
    }

    public function store(Request $request, Listing $listing)
    {
        Favorite::firstOrCreate([
            'user_id' => $request->user()->id,
            'listing_id' => $listing->id,
        ]);

        return response()->json(['favorite' => true]);
    }

    public function destroy(Request $request, Listing $listing)
    {
        Favorite::where('user_id', $request->user()->id)
            ->where('listing_id', $listing->id)
            ->delete();

        return response()->json(['favorite' => false]);
    }
}
