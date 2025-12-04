<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MoodLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'firebase_uid',
        'mood',
        'note'
    ];
}