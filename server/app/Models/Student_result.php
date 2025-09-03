<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student_result extends Model
{
    use HasFactory;

    protected $table = 'student_results';

    protected $fillable = [
        'student_quiz_id',
        'question_id',
        'solution_id',
        'is_correct',
    ];

    protected $casts = [
        'is_correct' => 'boolean',
    ];

    public function studentQuiz()
    {
        return $this->belongsTo(StudentQuiz::class);
    }

    public function question()
    {
        return $this->belongsTo(Question::class);
    }

    // The selected option for this question
    public function solution()
    {
        return $this->belongsTo(Option::class, 'solution_id');
    }
}
