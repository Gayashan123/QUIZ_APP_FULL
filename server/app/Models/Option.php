<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Option extends Model
{

        use HasFactory;
    protected $fillable = [
        'quiz_id',
        'question_id',
        'option_text',
        'is_correct'
    ];

    // Relation to Question
    public function question()
    {
        return $this->belongsTo(Question::class);
    }





}
