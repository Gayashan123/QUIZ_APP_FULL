<?php

namespace App\Http\Controllers\teacher;
use App\Models\Quiz;
use App\Models\Question;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;

class QuestionController extends Controller
{
    /**
     * Display all questions
     */
    public function index(Request $request)
    {
        // OPTIONAL FILTER SUPPORT: /api/questions?quiz_id=123
        $quizId = $request->query('quiz_id');
        $query  = Question::with('quiz')->orderBy('created_at', 'DESC');

        if ($quizId) {
            $query->where('quiz_id', $quizId);
        }

        $questions = $query->get();

        return response()->json([
            'status' => true,
            'data'   => $questions,
        ], 200);
    }

    // ADD THIS: /api/quizzes/{quiz}/questions?include_options=true
    public function indexByQuiz(Request $request, Quiz $quiz)
    {
        $includeOptions = filter_var($request->query('include_options'), FILTER_VALIDATE_BOOLEAN);

        $query = $quiz->questions()->select('id', 'quiz_id', 'question_text', 'points');

        if ($includeOptions) {
            // NOTE: For student-facing calls, consider hiding is_correct here
            $query->with(['options' => function ($q) {
                $q->select('id', 'question_id', 'option_text', 'is_correct');
            }]);
        }

        $questions = $query->orderBy('id')->get();

        return response()->json([
            'status' => true,
            'data'   => $questions,
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
