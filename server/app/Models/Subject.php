<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subject extends Model
{
    use HasFactory;

    // Table name (optional if following Laravel conventions)


    // Mass assignable fields
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
