<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Model;
use Illuminate\\Database\\Eloquent\\Relations\\HasMany;

class User extends Model
{
    protected $fillable = [
        'telegram_id',
        'username',
        'first_name',
        'last_name',
        'photo_url',
        'role',
    ];

    protected $casts = [
        'telegram_id' => 'integer',
    ];

    public function listings(): HasMany
    {
        return $this->hasMany(Listing::class);
    }
}
