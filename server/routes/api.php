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

//Admin
Route::post('authenticate', [AuthenticationController::class, 'authenticate']);

//Student
Route::post('stauthenticate', [studentauthController::class, 'authenticate']);


//Teacher
Route::post('teauthenticate', [TeacherAuthController::class, 'authenticate']);






Route::group(['middleware' => ['auth:sanctum']], function () {
    Route::get('dashboard', [dashboared::class, 'index']);
    Route::get('logout', [AuthenticationController::class, 'logout']);

    //Subject Routes
    Route::post('subjects', [SubjectController::class, 'store']);
     Route::get('subjects', [SubjectController::class, 'index']);
     Route::put('subjects/{id}', [SubjectController::class, 'update']);
Route::delete('subjects/{id}', [SubjectController::class, 'destroy']);
Route::get('subjects/{id}', [SubjectController::class, 'show']);


//Faculty Routes

 Route::post('faculties', [FacultyController::class, 'store']);
     Route::get('faculties', [FacultyController::class, 'index']);
     Route::put('faculties/{id}', [FacultyController::class, 'update']);
Route::delete('faculties/{id}', [FacultyController::class, 'destroy']);
Route::get('faculties/{id}', [FacultyController::class, 'show']);


//Student routes

 Route::post('students', [StudentController::class, 'store']);
     Route::get('students', [StudentController::class, 'index']);
     Route::put('students/{id}', [StudentController::class, 'update']);
Route::delete('students/{id}', [StudentController::class, 'destroy']);
Route::get('students/{id}', [StudentController::class, 'show']);


//Teacher Routes
 Route::post('teachers', [TeacherController::class, 'store']);
     Route::get('teachers', [TeacherController::class, 'index']);
     Route::put('teachers/{id}', [TeacherController::class, 'update']);
Route::delete('teachers/{id}', [TeacherController::class, 'destroy']);
Route::get('teachers/{id}', [TeacherController::class, 'show']);



//Student Group

Route::get('stlogout', [studentauthController::class, 'logout']);



//Teacher Group
Route::get('telogout', [studentauthController::class, 'logout']);

//teacher quiz routes
Route::post('quizzes', [QuizController::class, 'store']);
     Route::get('quizzes', [QuizController::class, 'index']);
     Route::put('quizzes/{id}', [QuizController::class, 'update']);
Route::delete('quizzes/{id}', [QuizController::class, 'destroy']);
Route::get('quizzes/{id}', [QuizController::class, 'show']);


//teacher question routes
Route::post('questions', [QuestionController::class, 'store']);
     Route::get('questions', [QuestionController::class, 'index']);
     Route::put('questions/{id}', [QuestionController::class, 'update']);
Route::delete('questions/{id}', [QuestionController::class, 'destroy']);
Route::get('questions/{id}', [QuestionController::class, 'show']);

//teacher option routes
Route::post('options', [OptionController::class, 'store']);
     Route::get('options', [OptionController::class, 'index']);
     Route::put('options/{id}', [OptionController::class, 'update']);
Route::delete('options/{id}', [OptionController::class, 'destroy']);
Route::get('options/{id}', [OptionController::class, 'show']);

// Add this inside your sanctum-protected group
Route::get('checkauth', [TeacherAuthController::class, 'checkAuth']);//teacher check auth
Route::get('adcheckauth', [AuthenticationController::class, 'checkAuth']);//admin check auth
Route::get('stcheckauth', [studentauthController::class, 'checkAuth']);//student check auth


});




