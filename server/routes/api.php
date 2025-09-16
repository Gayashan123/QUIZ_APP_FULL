<?php


use App\Http\Controllers\admin\FacultyController;
use App\Http\Controllers\admin\StudentController;
use App\Http\Controllers\admin\SubjectController;
use App\Http\Controllers\admin\TeacherController;
use App\Http\Controllers\studentauthController;
use App\Http\Controllers\StudentQuizAccessController;
use App\Http\Controllers\StudentQuizController;
use App\Http\Controllers\StudentResultController;
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


//Admin , Student and Teacher Authetications..
Route::post('authenticate', [AuthenticationController::class, 'authenticate']);//Admin
Route::post('stauthenticate', [studentauthController::class, 'authenticate']);//Student
Route::post('teauthenticate', [TeacherAuthController::class, 'authenticate']);//Teacher


Route::group(['middleware' => ['auth:sanctum']], function () {

//3 roles logout routes
    Route::get('logout', [AuthenticationController::class, 'logout']);
    Route::get('stlogout', [studentauthController::class, 'logout']);
    Route::get('telogout', [TeacherAuthController::class, 'logout']);

// 3 roles check the authentications.
    Route::get('checkauth', [TeacherAuthController::class, 'checkAuth']);//teacher check auth
    Route::get('adcheckauth', [AuthenticationController::class, 'checkAuth']);//admin check auth
    Route::get('stcheckauth', [studentauthController::class, 'checkAuth']);//student check auth

//End of the 3 roles logout and the check auth basic routes

//**************************************************************** */

 //Subject Routes  List: any authenticated user

    Route::get('subjects', [SubjectController::class, 'index'])
        ->middleware('can:viewAny,App\Models\Subject');

    // Admin-only
    Route::get('subjects/{subject}', [SubjectController::class, 'show'])
        ->whereNumber('subject')
        ->middleware('can:view,subject');

    Route::post('subjects', [SubjectController::class, 'store'])
        ->middleware('can:create,App\Models\Subject');

    Route::put('subjects/{subject}', [SubjectController::class, 'update'])
        ->whereNumber('subject')
        ->middleware('can:update,subject');

    Route::delete('subjects/{subject}', [SubjectController::class, 'destroy'])
        ->whereNumber('subject')
       ->middleware('can:delete,subject');

//***************************************************************** */


//Faculty Routes

    // Any authenticated user (student/teacher/admin)
    Route::get('faculties', [FacultyController::class, 'index'])
        ->middleware('can:viewAny,App\Models\Faculty');

    // Admin-only (policy will allow only admins)
    Route::get('faculties/{faculty}', [FacultyController::class, 'show'])
        ->whereNumber('faculty')
        ->middleware('can:view,faculty');

    Route::post('faculties', [FacultyController::class, 'store'])
        ->middleware('can:create,App\Models\Faculty');

    Route::put('faculties/{faculty}', [FacultyController::class, 'update'])
        ->whereNumber('faculty')
        ->middleware('can:update,faculty');

    Route::delete('faculties/{faculty}', [FacultyController::class, 'destroy'])
        ->whereNumber('faculty')
        ->middleware('can:delete,faculty');
//******************************************************************** */
    //Student routes

    // Any authenticated user
    Route::get('students', [StudentController::class, 'index'])
        ->middleware('can:viewAny,App\Models\Student');

    Route::get('students/count', [StudentController::class, 'count'])
        ->middleware('can:viewAny,App\Models\Student');

    // Admin-only create
    Route::post('students', [StudentController::class, 'store'])
        ->middleware('can:create,App\Models\Student');

    // Admin OR the student themself
    Route::get('students/{student}', [StudentController::class, 'show'])
        ->whereNumber('student')
        ->middleware('can:view,student');

    Route::put('students/{student}', [StudentController::class, 'update'])
        ->whereNumber('student')
        ->middleware('can:update,student');

    Route::delete('students/{student}', [StudentController::class, 'destroy'])
        ->whereNumber('student')
        ->middleware('can:delete,student');

//***************************************************************************** */
//Teacher Routes
    // Admin only list
    Route::get('teachers', [TeacherController::class, 'index'])
        ->middleware('can:viewAny,App\Models\Teacher');

    // Admin only create
    Route::post('teachers', [TeacherController::class, 'store'])
        ->middleware('can:create,App\Models\Teacher');

    // Admin OR self can view/update/delete
    Route::get('teachers/{teacher}', [TeacherController::class, 'show'])
        ->whereNumber('teacher')
        ->middleware('can:view,teacher');

    Route::put('teachers/{teacher}', [TeacherController::class, 'update'])
        ->whereNumber('teacher')
        ->middleware('can:update,teacher');

    Route::delete('teachers/{teacher}', [TeacherController::class, 'destroy'])
        ->whereNumber('teacher')
        ->middleware('can:delete,teacher');
//************************************************************************ */

 //End of the admin faculty , subject , student , teacher all crud routes



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


    // Nested read routes to fetch ONLY a quiz's questions, and ONLY a question's options
    Route::get('quizzes/{quiz}/questions', [QuestionController::class, 'indexByQuiz']);
    Route::get('questions/{question}/options', [OptionController::class, 'indexByQuestion']);

    // Student Quiz Routes
    Route::get('student-quizzes', [StudentQuizController::class, 'index']);
    Route::post('student-quizzes', [StudentQuizController::class, 'store']);
    Route::get('student-quizzes/{id}', [StudentQuizController::class, 'show']);
    Route::put('student-quizzes/{id}', [StudentQuizController::class, 'update']);
    Route::delete('student-quizzes/{id}', [StudentQuizController::class, 'destroy']);
    Route::post('student-quizzes/submit', [StudentQuizController::class, 'submit']);
    // Additional useful routes
    Route::get('students/{studentId}/quizzes', [StudentQuizController::class, 'getStudentQuizzes']);
    Route::get('quizzes/{quizId}/students', [StudentQuizController::class, 'getQuizStudents']);



    Route::post('quizzes/{quiz}/enter', [StudentQuizAccessController::class, 'enter']);
    // Student results management (optional for admin/teacher views)
    Route::get('student-results', [StudentResultController::class, 'index']);
    Route::post('student-results', [StudentResultController::class, 'store']);
    Route::get('student-results/{id}', [StudentResultController::class, 'show']);
    Route::put('student-results/{id}', [StudentResultController::class, 'update']);
    Route::delete('student-results/{id}', [StudentResultController::class, 'destroy']);

    // Optional: bulk store if you want a standalone endpoint
    Route::post('student-results/bulk', [StudentResultController::class, 'bulkStore']);

    Route::get('students/{studentId}/quizzes', [StudentQuizController::class, 'getStudentQuizzes']);


    // Submit answers (requires valid attempt token)
    Route::post('student-quizzes/submit', [StudentQuizController::class, 'submit'])
        ->middleware('quiz.attempt');


    Route::get('students/{studentId}/quizzes/{quizId}/review', [StudentQuizController::class, 'reviewByQuiz']);
    Route::get('students/{studentId}/available-quizzes', [StudentQuizController::class, 'availableQuizzes']);

});


