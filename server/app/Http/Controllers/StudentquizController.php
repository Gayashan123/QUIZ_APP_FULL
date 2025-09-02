<?php

namespace App\Http\Controllers;

use App\Models\StudentQuiz;
use Illuminate\Http\Request;

class StudentQuizController extends Controller
{
    // List all student quizzes
    public function index()
    {
        $studentQuizzes = StudentQuiz::with(['student', 'quiz.subject'])->get();
        return response()->json($studentQuizzes);
    }

    // Store a new student quiz score
    public function store(Request $request)
    {
        $request->validate([
            'student_id' => 'required|exists:students,id',
            'quiz_id' => 'required|exists:quizzes,id',
            'score' => 'nullable|integer|min:0',
        ]);

        $studentQuiz = StudentQuiz::create($request->only('student_id', 'quiz_id', 'score'));

        return response()->json([
            'status' => true,
            'data' => $studentQuiz,
        ]);
    }

    // Show a single student quiz
    public function show($id)
    {
        $studentQuiz = StudentQuiz::with(['student', 'quiz.subject'])->findOrFail($id);
        return response()->json($studentQuiz);
    }

    // Update a student quiz score
    public function update(Request $request, $id)
    {
        $studentQuiz = StudentQuiz::findOrFail($id);

        $request->validate([
            'score' => 'required|integer|min:0',
        ]);

        $studentQuiz->update($request->only('score'));

        return response()->json([
            'status' => true,
            'data' => $studentQuiz,
        ]);
    }

    // Delete a student quiz
    public function destroy($id)
    {
        $studentQuiz = StudentQuiz::findOrFail($id);
        $studentQuiz->delete();

        return response()->json([
            'status' => true,
            'message' => 'Deleted successfully',
        ]);
    }
}
