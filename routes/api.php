<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\FavoriteController;
use App\Http\Controllers\ListingController;
use App\Http\Controllers\ListingPhotoController;
use App\Http\Controllers\TelegramAuthController;
use App\Http\Controllers\TranslationController;
use Illuminate\Support\Facades\Route;

Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/listings', [ListingController::class, 'index']);
Route::post('/translate', [TranslationController::class, 'translate'])->middleware('throttle:10,1');
Route::get('/listings/{listing}', [ListingController::class, 'show'])->whereNumber('listing');

Route::post('/telegram/auth', [TelegramAuthController::class, 'auth'])->middleware('telegram.auth');

Route::middleware('telegram.auth')->group(function () {
    Route::get('/favorites', [FavoriteController::class, 'index']);
    Route::get('/my-listings', [ListingController::class, 'mine']);
    Route::post('/listings', [ListingController::class, 'store']);
    Route::post('/listings/{listing}/photos', [ListingPhotoController::class, 'store'])->whereNumber('listing');
    Route::delete('/listing-photos/{photo}', [ListingPhotoController::class, 'destroy'])->whereNumber('photo');
    Route::post('/favorites/{listing}', [FavoriteController::class, 'store'])->whereNumber('listing');
    Route::delete('/favorites/{listing}', [FavoriteController::class, 'destroy'])->whereNumber('listing');
});
