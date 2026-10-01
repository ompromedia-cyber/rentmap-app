<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Model;
use Illuminate\\Database\\Eloquent\\Relations\\BelongsTo;
use Illuminate\\Database\\Eloquent\\Relations\\HasMany;

class Listing extends Model
{
    protected $fillable = [
        'user_id',
        'category_id',
        'title',
        'description',
        'price',
        'currency',
        'price_period',
        'latitude',
        'longitude',
        'status',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'latitude' => 'float',
        'longitude' => 'float',
    ];

    protected $appends = ['category_slug'];

    public function getCategorySlugAttribute(): ?string
    {
        return $this->category?->slug;
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function photos(): HasMany
    {
        return $this->hasMany(ListingPhoto::class);
    }
}
