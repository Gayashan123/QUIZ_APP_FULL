<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;


class Quiz extends Model
{

    use HasFactory;
    protected $fillable = [
        'quiz_title',
        'quiz_password',
        'subject_id',
        'teacher_id',
        'time_limit',
        'passing_score',
        'start_time',
        'end_time',
        'end_date',
    ];

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function teacher()
    {
        return $this->belongsTo(Teacher::class);
    }
}
