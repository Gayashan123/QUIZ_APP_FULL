<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Question extends Model
{
    use HasFactory;
    protected $fillable = [
        'quiz_id',
        'question_text',
        'points'
    ];

    // Relation to quiz
    public function quiz()
    {
        return $this->belongsTo(Quiz::class);
    }
}
