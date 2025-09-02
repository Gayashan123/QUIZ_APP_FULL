<?php

namespace App\Http\Controllers\teacher;

use App\Models\Quiz;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;
use App\Models\Teacher;
use App\Models\Student;


class QuizController extends Controller
{
    /**
     * Display all quizzes
     */
    public function index()
    {
        // Eager load subject and teacher names
        $quizzes = Quiz::with(['subject', 'teacher'])->orderBy('created_at', 'DESC')->get();

        return response()->json([
            'status' => true,
            'data' => $quizzes
        ], 200);
    }

    /**
     * Store a new quiz
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'quiz_title'    => 'required|string|max:255',
            'quiz_password' => 'nullable|string|unique:quizzes,quiz_password',
            'subject_id'    => 'required|exists:subjects,id',
            'teacher_id'    => 'required|exists:teachers,id',
            'time_limit'    => 'required|integer|min:1',
            'passing_score' => 'required|integer|min:0',
            'start_time'    => 'required|date',
            'end_time'      => 'required|date|after:start_time',

        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'errors' => $validator->errors()
            ], 400);
        }

        $quiz = Quiz::create($validator->validated());

        return response()->json([
            'status' => true,
            'message' => 'Quiz created successfully',
            'data' => $quiz
        ], 201);
    }

    /**
     * Show a specific quiz
     */
    public function show($id)
    {
        $quiz = Quiz::with(['subject', 'teacher'])->find($id);

        if (!$quiz) {
            return response()->json([
                'status' => false,
                'message' => 'Quiz not found'
            ], 404);
        }

        return response()->json([
            'status' => true,
            'data' => $quiz
        ], 200);
    }

    /**
     * Update a quiz
     */
    public function update(Request $request, $id)
    {
        $quiz = Quiz::find($id);

        if (!$quiz) {
            return response()->json([
                'status' => false,
                'message' => 'Quiz not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'quiz_title'    => 'sometimes|string|max:255',
            'quiz_password' => 'nullable|string|unique:quizzes,quiz_password,' . $quiz->id,
            'subject_id'    => 'sometimes|exists:subjects,id',
            'teacher_id'    => 'sometimes|exists:teachers,id',
            'time_limit'    => 'sometimes|integer|min:1',
            'passing_score' => 'sometimes|integer|min:0',
            'start_time'    => 'sometimes|date',
            'end_time'      => 'sometimes|date|after:start_time',

        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'errors' => $validator->errors()
            ], 400);
        }

        $quiz->update($validator->validated());

        return response()->json([
            'status' => true,
            'message' => 'Quiz updated successfully',
            'data' => $quiz
        ], 200);
    }

    /**
     * Delete a quiz
     */
    public function destroy($id)
    {
        $quiz = Quiz::find($id);

        if (!$quiz) {
            return response()->json([
                'status' => false,
                'message' => 'Quiz not found'
            ], 404);
        }

        $quiz->delete();

        return response()->json([
            'status' => true,
            'message' => 'Quiz deleted successfully'
        ], 200);
    }
}
