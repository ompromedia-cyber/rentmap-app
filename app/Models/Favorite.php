<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Model;

class Favorite extends Model
{
    public $timestamps = false;

    protected $fillable = ['user_id', 'listing_id'];

    protected $casts = [
        'created_at' => 'datetime',
    ];
}
