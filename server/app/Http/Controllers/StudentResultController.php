<?php

namespace App\Http\Controllers;

use App\Models\Student_result;
use App\Models\StudentQuiz;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StudentResultController extends Controller
{
    // List results with optional filters: student_quiz_id, student_id, quiz_id
    public function index(Request $request)
    {
        $query = Student_result::with([
            'question',
            'solution',
            'studentQuiz.student',
            'studentQuiz.quiz.subject',
        ]);

        if ($sq = $request->query('student_quiz_id')) {
            $query->where('student_quiz_id', $sq);
        }

        if ($studentId = $request->query('student_id')) {
            $query->whereHas('studentQuiz', function ($q) use ($studentId) {
                $q->where('student_id', $studentId);
            });
        }

        if ($quizId = $request->query('quiz_id')) {
            $query->whereHas('studentQuiz', function ($q) use ($quizId) {
                $q->where('quiz_id', $quizId);
            });
        }

        return response()->json($query->orderBy('id', 'asc')->get());
    }

    // Create or update one result for a given attempt + question
    public function store(Request $request)
    {
        $data = $request->validate([
            'student_quiz_id' => 'required|exists:student_quizzes,id',
            'question_id'     => 'required|exists:questions,id',
            'solution_id'     => 'nullable|exists:options,id',
        ]);

        $attempt = StudentQuiz::with('quiz')->findOrFail($data['student_quiz_id']);

        // Ensure question belongs to this quiz
        $question = DB::table('questions')
            ->where('id', $data['question_id'])
            ->where('quiz_id', $attempt->quiz_id)
            ->first();

        if (!$question) {
            return response()->json(['message' => 'Question does not belong to this quiz'], 422);
        }

        // Validate option belongs to question and compute correctness
        $isCorrect = false;
        $solutionId = $data['solution_id'] ?? null;

        if ($solutionId) {
            $opt = DB::table('options')
                ->where('id', $solutionId)
                ->where('question_id', $data['question_id'])
                ->first();

            if (!$opt) {
                return response()->json(['message' => 'Option does not belong to this question'], 422);
            }

            $isCorrect = (bool) ($opt->is_correct ?? 0);
        }

        $result = Student_result::updateOrCreate(
            [
                'student_quiz_id' => $attempt->id,
                'question_id'     => $data['question_id'],
            ],
            [
                'solution_id'     => $solutionId,
                'is_correct'      => $isCorrect,
            ]
        );

        $this->recomputeScore($attempt->id);

        return response()->json([
            'status' => true,
            'data'   => $result->load('question', 'solution'),
        ], 201);
    }

    public function show($id)
    {
        $result = Student_result::with([
            'question',
            'solution',
            'studentQuiz.student',
            'studentQuiz.quiz.subject',
        ])->findOrFail($id);

        return response()->json($result);
    }

    public function update(Request $request, $id)
    {
        $result = Student_result::findOrFail($id);

        $data = $request->validate([
            'solution_id' => 'nullable|exists:options,id',
        ]);

        $solutionId = $data['solution_id'] ?? null;

        // Validate the solution belongs to this result's question and compute correctness
        $isCorrect = false;
        if ($solutionId) {
            $opt = DB::table('options')
                ->where('id', $solutionId)
                ->where('question_id', $result->question_id)
                ->first();

            if (!$opt) {
                return response()->json(['message' => 'Option does not belong to this question'], 422);
            }

            $isCorrect = (bool) ($opt->is_correct ?? 0);
        }

        $result->update([
            'solution_id' => $solutionId,
            'is_correct'  => $isCorrect,
        ]);

        $this->recomputeScore($result->student_quiz_id);

        return response()->json([
            'status' => true,
            'data'   => $result->load('question', 'solution'),
        ]);
    }

    public function destroy($id)
    {
        $result = Student_result::findOrFail($id);
        $sqId   = $result->student_quiz_id;

        $result->delete();

        $this->recomputeScore($sqId);

        return response()->json([
            'status'  => true,
            'message' => 'Deleted successfully',
        ]);
    }

    // Bulk store results for an attempt using student_id + quiz_id + answers[]
    // answers: [{ question_id, option_id }]
    public function bulkStore(Request $request)
    {
        $validated = $request->validate([
            'student_id'           => 'required|exists:students,id',
            'quiz_id'              => 'required|exists:quizzes,id',
            'answers'              => 'required|array|min:1',
            'answers.*.question_id'=> 'required|exists:questions,id',
            'answers.*.option_id'  => 'required|exists:options,id',
        ]);

        return DB::transaction(function () use ($validated) {
            $studentId = (int) $validated['student_id'];
            $quizId    = (int) $validated['quiz_id'];

            // Find or create attempt
            $attempt = StudentQuiz::updateOrCreate(
                ['student_id' => $studentId, 'quiz_id' => $quizId],
                [] // score will be recomputed
            );

            // All questions for this quiz
            $qIds = DB::table('questions')->where('quiz_id', $quizId)->pluck('id')->toArray();
            if (empty($qIds)) {
                return response()->json(['message' => 'Quiz has no questions'], 422);
            }

            // Map of provided answers: question_id => option_id
            $answerMap = [];
            foreach ($validated['answers'] as $a) {
                $answerMap[(int)$a['question_id']] = (int)$a['option_id'];
            }

            // Valid options for these questions, also get correct options
            $options = DB::table('options')
                ->whereIn('question_id', $qIds)
                ->select('id', 'question_id', 'is_correct')
                ->get();

            $validOptionByQuestion = [];
            $correctOptionByQuestion = [];
            $optionById = [];

            foreach ($options as $o) {
                $optionById[$o->id] = $o;
                $validOptionByQuestion[$o->question_id] = $validOptionByQuestion[$o->question_id] ?? [];
                $validOptionByQuestion[$o->question_id][$o->id] = true;

                if ((int) $o->is_correct === 1) {
                    $correctOptionByQuestion[$o->question_id] = $o->id;
                }
            }

            $now = now();
            $rows = [];
            $correctCount = 0;

            foreach ($qIds as $qid) {
                $solId = $answerMap[$qid] ?? null;

                // Ensure the submitted option belongs to the question
                if ($solId && empty($validOptionByQuestion[$qid][$solId])) {
                    $solId = null; // ignore invalid option
                }

                $isCorrect = $solId && isset($correctOptionByQuestion[$qid]) && ((int)$correctOptionByQuestion[$qid] === (int)$solId);

                if ($isCorrect) {
                    $correctCount++;
                }

                $rows[] = [
                    'student_quiz_id' => $attempt->id,
                    'question_id'     => $qid,
                    'solution_id'     => $solId,
                    'is_correct'      => $isCorrect,
                    'created_at'      => $now,
                    'updated_at'      => $now,
                ];
            }

            // Replace previous results for this attempt
            DB::table('student_results')->where('student_quiz_id', $attempt->id)->delete();
            DB::table('student_results')->insert($rows);

            // Update attempt score
            $total      = count($qIds);
            $percentage = (int) round(($correctCount / max(1, $total)) * 100);

            $attempt->update(['score' => $percentage]);

            return response()->json([
                'status' => true,
                'data'   => $attempt->fresh('results'),
                'meta'   => [
                    'correct'       => $correctCount,
                    'total'         => $total,
                    'score_percent' => $percentage,
                ],
            ], 201);
        });
    }

    private function recomputeScore(int $studentQuizId): void
    {
        $attempt = StudentQuiz::find($studentQuizId);
        if (!$attempt) return;

        $total = DB::table('questions')->where('quiz_id', $attempt->quiz_id)->count();
        if ($total === 0) {
            $attempt->update(['score' => 0]);
            return;
        }

        $correct = Student_result::where('student_quiz_id', $studentQuizId)
            ->where('is_correct', true)
            ->count();

        $percentage = (int) round(($correct / $total) * 100);
        $attempt->update(['score' => $percentage]);
    }
}
