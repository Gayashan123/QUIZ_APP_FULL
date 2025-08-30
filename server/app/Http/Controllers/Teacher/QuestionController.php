<?php

namespace App\Http\Controllers\teacher;

use App\Models\Question;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;

class QuestionController extends Controller
{
    /**
     * Display all questions
     */
    public function index()
    {
        $questions = Question::with('quiz')->orderBy('created_at', 'DESC')->get();

        return response()->json([
            'status' => true,
            'data' => $questions
        ], 200);
    }

    /**
     * Store a new question
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'quiz_id' => 'required|exists:quizzes,id',
            'question_text' => 'required|string',
            'points' => 'required|integer|min:0'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'errors' => $validator->errors()
            ], 400);
        }


        $question=[];


        $question = Question::create($validator->validated());

        return response()->json([
            'status' => true,
            'message' => 'Question created successfully',
            'data' => $question
        ], 201);
    }

    /**
     * Show a specific question
     */
    public function show($id)
    {
        $question = Question::with('quiz')->find($id);

        if (!$question) {
            return response()->json([
                'status' => false,
                'message' => 'Question not found'
            ], 404);
        }

        return response()->json([
            'status' => true,
            'data' => $question
        ], 200);
    }

    /**
     * Update a question
     */
    public function update(Request $request, $id)
    {
        $question = Question::find($id);

        if (!$question) {
            return response()->json([
                'status' => false,
                'message' => 'Question not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'quiz_id' => 'sometimes|exists:quizzes,id',
            'question_text' => 'sometimes|string',
            'points' => 'sometimes|integer|min:0'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'errors' => $validator->errors()
            ], 400);
        }

        $question->update($validator->validated());

        return response()->json([
            'status' => true,
            'message' => 'Question updated successfully',
            'data' => $question
        ], 200);
    }

    /**
     * Delete a question
     */
    public function destroy($id)
    {
        $question = Question::find($id);

        if (!$question) {
            return response()->json([
                'status' => false,
                'message' => 'Question not found'
            ], 404);
        }

        $question->delete();

        return response()->json([
            'status' => true,
            'message' => 'Question deleted successfully'
        ], 200);
    }
}
