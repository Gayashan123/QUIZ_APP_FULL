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
        'attempt_token',
        'attempt_token_expires_at',
        'started_at',
        'finished_at',
        'finished',
    ];


    protected $casts = [
        'attempt_token_expires_at' => 'datetime',
        'started_at' => 'datetime',
        'finished_at' => 'datetime',
        'finished' => 'boolean',
    ];

    // Relationships

    // Each StudentQuiz belongs to a Student
   public function student() { return $this->belongsTo(Student::class); }
    public function quiz()    { return $this->belongsTo(Quiz::class); }
    public function results() { return $this->hasMany(Student_result::class); }
}
