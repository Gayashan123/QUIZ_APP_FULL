<?php

namespace App\Http\Controllers;

use App\Models\Student_result;
use App\Models\StudentQuiz;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StudentQuizController extends Controller
{
    public function index()
    {
        $studentQuizzes = StudentQuiz::with(['student', 'quiz.subject'])->get();
        return response()->json($studentQuizzes);
    }

    public function store(Request $request)
    {
        $request->validate([
            'student_id' => 'required|exists:students,id',
            'quiz_id'    => 'required|exists:quizzes,id',
            'score'      => 'nullable|integer|min:0|max:100',
        ]);

        $studentQuiz = StudentQuiz::updateOrCreate(
            ['student_id' => $request->student_id, 'quiz_id' => $request->quiz_id],
            ['score'      => $request->score ?? 0]
        );

        return response()->json(['status' => true, 'data' => $studentQuiz], 201);
    }

    public function show($id)
    {
        $studentQuiz = StudentQuiz::with(['student', 'quiz.subject'])->findOrFail($id);
        return response()->json($studentQuiz);
    }

    public function update(Request $request, $id)
    {
        $studentQuiz = StudentQuiz::findOrFail($id);
        $request->validate(['score' => 'required|integer|min:0|max:100']);
        $studentQuiz->update($request->only('score'));
        return response()->json(['status' => true, 'data' => $studentQuiz]);
    }

    public function destroy($id)
    {
        $studentQuiz = StudentQuiz::findOrFail($id);
        $studentQuiz->delete();
        return response()->json(['status' => true, 'message' => 'Deleted successfully']);
    }

    // POST /api/student-quizzes/submit (no middleware variant)
    public function submit(Request $request)
    {
        $validated = $request->validate([
            'quiz_id'               => 'required|exists:quizzes,id',
            'answers'               => 'required|array|min:1',
            'answers.*.question_id' => 'required|exists:questions,id',
            'answers.*.option_id'   => 'required|exists:options,id',
            'student_id'            => 'nullable|exists:students,id',
        ]);

        $studentId = optional($request->user())->id ?: $validated['student_id'];
        if (!$studentId) return response()->json(['message' => 'Unauthenticated or student_id missing'], 401);

        $quizId = (int) $validated['quiz_id'];

        return DB::transaction(function () use ($studentId, $quizId, $validated) {
            $attempt = StudentQuiz::updateOrCreate(
                ['student_id' => $studentId, 'quiz_id' => $quizId],
                []
            );

            // If already finished, block resubmission
            if ($attempt->finished) {
                return response()->json(['message' => 'Attempt already finished'], 409);
            }

            $qIds = DB::table('questions')->where('quiz_id', $quizId)->pluck('id')->toArray();
            if (empty($qIds)) return response()->json(['message' => 'Quiz has no questions'], 422);

            $answerMap = [];
            foreach ($validated['answers'] as $a) {
                $answerMap[(int)$a['question_id']] = (int)$a['option_id'];
            }

            $options = DB::table('options')
                ->whereIn('question_id', $qIds)
                ->select('id', 'question_id', 'is_correct')
                ->get();

            $validOptionByQuestion = [];
            $correctOptionByQuestion = [];

            foreach ($options as $o) {
                $validOptionByQuestion[$o->question_id][$o->id] = true;
                if ((int)$o->is_correct === 1) $correctOptionByQuestion[$o->question_id] = $o->id;
            }

            $rows = [];
            $now = now();
            $correctCount = 0;

            foreach ($qIds as $qid) {
                $solId = $answerMap[$qid] ?? null;

                if ($solId && empty($validOptionByQuestion[$qid][$solId])) $solId = null;

                $isCorrect = $solId && isset($correctOptionByQuestion[$qid]) && ((int)$correctOptionByQuestion[$qid] === (int)$solId);
                if ($isCorrect) $correctCount++;

                $rows[] = [
                    'student_quiz_id' => $attempt->id,
                    'question_id'     => $qid,
                    'solution_id'     => $solId,
                    'is_correct'      => $isCorrect,
                    'created_at'      => $now,
                    'updated_at'      => $now,
                ];
            }

            DB::table('student_results')->where('student_quiz_id', $attempt->id)->delete();
            DB::table('student_results')->insert($rows);

            $total      = count($qIds);
            $percentage = (int) round(($correctCount / max(1, $total)) * 100);

            // Finish attempt, mark finished, and EXPIRE token
            $attempt->update([
                'score'                    => $percentage,
                'finished_at'              => $now,
                'finished'                 => true,
                'attempt_token'            => null,
                'attempt_token_expires_at' => null,
            ]);

            return response()->json([
                'status' => true,
                'data'   => $attempt->load('results'),
                'meta'   => [
                    'correct'       => $correctCount,
                    'total'         => $total,
                    'score_percent' => $percentage,
                    'finished_at'   => $attempt->finished_at,
                ],
            ], 201);
        });
    }

    // Optional helper: get attempts for a student (to disable button on frontend)
    public function getStudentQuizzes($studentId)
    {
        $attempts = StudentQuiz::where('student_id', $studentId)
            ->select('id', 'quiz_id', 'score', 'finished', 'finished_at')
            ->get();

        return response()->json([
            'status' => true,
            'data'   => $attempts,
        ]);
    }



// app/Http/Controllers/StudentQuizController.php

public function reviewByQuiz(Request $request, int $studentId, int $quizId)
{
    // Load attempt with quiz, subject, and teacher
    $attempt = StudentQuiz::with(['quiz.subject', 'quiz.teacher'])
        ->where('student_id', $studentId)
        ->where('quiz_id', $quizId)
        ->first();

    if (!$attempt) {
        return response()->json(['message' => 'Attempt not found'], 404);
    }

    // Fetch per-question results
    $results = Student_result::where('student_quiz_id', $attempt->id)
        ->get(['question_id', 'solution_id', 'is_correct'])
        ->keyBy('question_id');

    // Fetch questions + options (expose is_correct in review only)
    $questions = \App\Models\Question::where('quiz_id', $quizId)
        ->with(['options' => function ($q) {
            $q->select('id', 'question_id', 'option_text', 'is_correct')->orderBy('id');
        }])
        ->get(['id', 'quiz_id', 'question_text', 'points']);

    $total = $questions->count();
    $correct = 0;

    $qPayload = $questions->map(function ($q) use ($results, &$correct) {
        $res = $results->get($q->id);
        $sel = $res ? $res->solution_id : null;
        $ok  = (bool) ($res ? $res->is_correct : false);
        if ($ok) $correct++;
        return [
            'id' => $q->id,
            'question_text' => $q->question_text,
            'points' => (int) ($q->points ?? 0),
            'selected_option_id' => $sel,
            'is_correct' => $ok,
            'options' => $q->options->map(fn($o) => [
                'id' => $o->id,
                'option_text' => $o->option_text,
                'is_correct' => (bool) $o->is_correct,
            ])->toArray(),
        ];
    })->values();

    $percent = $total > 0 ? (int) round(($correct / $total) * 100) : 0;

    return response()->json([
        'status' => true,
        'attempt' => [
            'id' => $attempt->id,
            'score' => (int) ($attempt->score ?? $percent),
            'finished' => (bool) $attempt->finished,
            'finished_at' => optional($attempt->finished_at)->toIso8601String(),
            'quiz' => [
                'id' => $attempt->quiz->id,
                'title' => $attempt->quiz->quiz_title ?? $attempt->quiz->title ?? 'Quiz',
                'subject' => optional($attempt->quiz->subject)->name,
                'teacher' => optional($attempt->quiz->teacher)->name ?? 'Unknown Teacher', // <-- teacher added
                'time_limit' => (int) ($attempt->quiz->time_limit ?? 0),
            ],
        ],
        'summary' => [
            'correct' => $correct,
            'total' => $total,
            'percent' => $percent,
        ],
        'questions' => $qPayload,
    ]);
}

// Add this method to your StudentQuizController
public function getQuizStudents($quizId)
{
    // Load students who have attempted this quiz
    $attempts = StudentQuiz::with(['student'])
        ->where('quiz_id', $quizId)
        ->get();

    // Transform the data to match what your frontend expects
    $students = $attempts->map(function ($attempt) {
        return [
            'id' => $attempt->id, // attempt ID
            'attemptId' => $attempt->id,
            'studentId' => $attempt->student_id,
            'student_id' => $attempt->student_id,
            'name' => $attempt->student->name ?? 'Unknown Student',
            'student_name' => $attempt->student->name ?? 'Unknown Student',
            'email' => $attempt->student->email ?? '',
            'score' => $attempt->score,
            'finished_at' => $attempt->finished_at,
            'finished' => $attempt->finished,
            'student' => [
                'id' => $attempt->student_id,
                'name' => $attempt->student->name ?? 'Unknown Student',
                'email' => $attempt->student->email ?? '',
            ]
        ];
    });

    return response()->json($students);
}


}
