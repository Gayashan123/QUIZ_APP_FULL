<?php

namespace App\Providers;

use App\Models\Faculty;
use App\Models\Option;
use App\Models\Question;
use App\Models\Quiz;
use App\Models\Student;
use App\Models\Student_result;
use App\Models\Subject;
use App\Models\Teacher;
use App\Policies\FacultyPolicy;
use App\Policies\OptionPolicy;
use App\Policies\QuestionPolicy;
use App\Policies\QuizPolicy;
use App\Policies\StudentPolicy;
use App\Policies\StudentResultPolicy;
use App\Policies\SubjectPolicy;
use App\Policies\TeacherPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        Faculty::class  => FacultyPolicy::class,
        Subject::class  => SubjectPolicy::class,
        Teacher::class => TeacherPolicy::class,
        Student::class => StudentPolicy::class,
        Student_result::class => StudentResultPolicy::class,
        Quiz::class => QuizPolicy::class,
        Question::class => QuestionPolicy::class,
        Option::class => OptionPolicy::class,
    ];

    public function boot(): void
    {
        $this->registerPolicies();
    }
}
