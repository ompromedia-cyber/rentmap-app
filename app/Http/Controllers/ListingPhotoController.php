<?php

namespace App\Http\Controllers;

use App\Models\Listing;
use App\Models\ListingPhoto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ListingPhotoController extends Controller
{
    public function store(Request $request, Listing $listing)
    {
        if ($listing->user_id !== $request->user()->id) {
            abort(403);
        }

        $currentCount = $listing->photos()->count();
        $validated = $request->validate([
            'photos' => ['required', 'array', 'min:1', 'max:5'],
            'photos.*' => ['required', 'image', 'mimes:jpeg,jpg,png,webp', 'max:8192'],
        ]);

        $incomingCount = count($validated['photos']);
        if ($currentCount + $incomingCount > 5) {
            return response()->json([
                'message' => 'Для одного объявления можно добавить максимум 5 фотографий: 1 основную и 4 дополнительные.',
            ], 422);
        }

        $startOrder = (int) $listing->photos()->max('sort_order') + 1;
        $photos = [];

        foreach ($validated['photos'] as $index => $photo) {
            $path = $photo->store('listings/' . $listing->id, 'public');

            $photos[] = $listing->photos()->create([
                'path' => $path,
                'sort_order' => $startOrder + $index,
            ]);
        }

        return response()->json($photos, 201);
    }

    public function destroy(Request $request, ListingPhoto $photo)
    {
        if ($photo->listing->user_id !== $request->user()->id) {
            abort(403);
        }

        Storage::disk('public')->delete($photo->path);
        $photo->delete();

        return response()->json(['message' => 'Фото удалено']);
    }
}
