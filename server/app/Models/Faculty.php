<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Faculty extends Model
{
    use HasFactory;

    // Table name (optional if Laravel can infer it)


    // Fields that are mass assignable
    protected $fillable = [
        'code',
        'name',
    ];

    // Optional: hide fields when returning JSON
    // protected $hidden = [];

    // Optional: cast fields to specific types
    // protected $casts = [
    //     'created_at' => 'datetime',
    //     'updated_at' => 'datetime',
    // ];
}
