<?php

use App\Http\Controllers\admin\dashboared;
use App\Http\Controllers\admin\FacultyController;
use App\Http\Controllers\admin\StudentController;
use App\Http\Controllers\admin\SubjectController;
use App\Http\Controllers\admin\TeacherController;
use App\Http\Controllers\studentauthController;
use App\Http\Controllers\teacher\OptionController;
use App\Http\Controllers\teacher\QuestionController;
use App\Http\Controllers\teacher\QuizController;
use App\Http\Controllers\TeacherAuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthenticationController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Public authentication routes
Route::post('authenticate', [AuthenticationController::class, 'authenticate']);
Route::post('stauthenticate', [studentauthController::class, 'authenticate']);
Route::post('teauthenticate', [TeacherAuthController::class, 'authenticate']);

// Public routes accessible to all
Route::get('subjects', [SubjectController::class, 'index']);
Route::get('subjects/{id}', [SubjectController::class, 'show']);
Route::get('faculties', [FacultyController::class, 'index']);
Route::get('faculties/{id}', [FacultyController::class, 'show']);

// Public quiz routes (GET only)
Route::get('quizzes', [QuizController::class, 'index']);
Route::get('quizzes1/{id}', [QuizController::class, 'show']);

// Public question routes (GET only)
Route::get('questions', [QuestionController::class, 'index']);
Route::get('questions/{id}', [QuestionController::class, 'show']);

// Public option routes (GET only)
Route::get('options', [OptionController::class, 'index']);
Route::get('options/{id}', [OptionController::class, 'show']);

Route::group(['middleware' => ['auth:sanctum']], function () {







    // Common routes for all authenticated users
    Route::get('logout', [AuthenticationController::class, 'logout']);
    Route::get('checkauth', [TeacherAuthController::class, 'checkAuth']);
    Route::get('adcheckauth', [AuthenticationController::class, 'checkAuth']);
    Route::get('stcheckauth', [studentauthController::class, 'checkAuth']);

    // Admin-only routes (using User model)
    Route::middleware(['admin'])->group(function () {
        Route::get('dashboard', [dashboared::class, 'index']);

        // Subject management (full CRUD)
        Route::post('subjects', [SubjectController::class, 'store']);
        Route::put('subjects/{id}', [SubjectController::class, 'update']);
        Route::delete('subjects/{id}', [SubjectController::class, 'destroy']);

        // Faculty management (full CRUD)
        Route::post('faculties', [FacultyController::class, 'store']);
        Route::put('faculties/{id}', [FacultyController::class, 'update']);
        Route::delete('faculties/{id}', [FacultyController::class, 'destroy']);

        // Student management (full CRUD)
        Route::post('students', [StudentController::class, 'store']);
        Route::get('students', [StudentController::class, 'index']);
        Route::put('students/{id}', [StudentController::class, 'update']);
        Route::delete('students/{id}', [StudentController::class, 'destroy']);
        Route::get('students/{id}', [StudentController::class, 'show']);

        // Teacher management (full CRUD)
        Route::post('teachers', [TeacherController::class, 'store']);
        Route::get('teachers', [TeacherController::class, 'index']);
        Route::put('teachers/{id}', [TeacherController::class, 'update']);
        Route::delete('teachers/{id}', [TeacherController::class, 'destroy']);
        Route::get('teachers/{id}', [TeacherController::class, 'show']);
    });

    // Teacher-only routes (using Teacher model)
    Route::middleware(['teacher'])->group(function () {
        Route::get('telogout', [TeacherAuthController::class, 'logout']);

        // Quiz management (full CRUD - except GET which is public)
        Route::post('quizzes', [QuizController::class, 'store']);
        Route::put('quizzes/{id}', [QuizController::class, 'update']);
        Route::delete('quizzes/{id}', [QuizController::class, 'destroy']);

        // Question management (full CRUD - except GET which is public)
        Route::post('questions', [QuestionController::class, 'store']);
        Route::put('questions/{id}', [QuestionController::class, 'update']);
        Route::delete('questions/{id}', [QuestionController::class, 'destroy']);

        // Option management (full CRUD - except GET which is public)
        Route::post('options', [OptionController::class, 'store']);
        Route::put('options/{id}', [OptionController::class, 'update']);
        Route::delete('options/{id}', [OptionController::class, 'destroy']);
    });

    // Student-only routes (using Student model)
    Route::middleware(['student'])->group(function () {
        Route::get('stlogout', [studentauthController::class, 'logout']);

        // Student can view quizzes, questions, and solutions
        Route::get('student/quizzes', [QuizController::class, 'studentIndex']);
        Route::get('student/quizzes/{id}', [QuizController::class, 'studentShow']);
        Route::get('student/questions/{quiz_id}', [QuestionController::class, 'studentIndex']);
        Route::get('student/solutions/{quiz_id}', [QuestionController::class, 'showSolutions']);
    });
});
