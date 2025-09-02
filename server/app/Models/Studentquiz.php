<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentQuiz extends Model
{
    use HasFactory;

    // Table name (optional if follows Laravel naming convention)
    protected $table = 'student_quizzes';

    // Mass assignable fields
    protected $fillable = [
        'student_id',
        'quiz_id',
        'score',
    ];

    // Relationships

    // Each StudentQuiz belongs to a Student
    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    // Each StudentQuiz belongs to a Quiz
    public function quiz()
    {
        return $this->belongsTo(Quiz::class);
    }
}
