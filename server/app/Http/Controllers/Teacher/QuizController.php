<?php

namespace App\Http\Controllers\teacher;

use App\Models\Quiz;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class QuizController extends Controller
{
  public function index(Request $request)
    {
        $teacherId = optional($request->user())->id;

        // Return only quizzes created by this teacher
        $quizzes = Quiz::with(['subject'])
            ->when($teacherId, fn ($q) => $q->where('teacher_id', $teacherId))
            ->orderByDesc('created_at')
            ->get();

        return response()->json($quizzes);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'quiz_title'    => 'required|string|max:255',
            'quiz_password' => 'nullable|string|unique:quizzes,quiz_password',
            'subject_id'    => 'required|exists:subjects,id',
            'teacher_id'    => 'required|exists:teachers,id',
            'time_limit'    => 'required|integer|min:1',
            'passing_score' => 'required|integer|min:0',
            'start_time'    => 'required',
            'end_time'      => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => false, 'errors' => $validator->errors()], 400);
        }

        $data = $validator->validated();

        // Normalize incoming datetimes to UTC for storage
        $start = $this->parseDateTime($data['start_time']);
        $end   = $this->parseDateTime($data['end_time']);

        if ($end->lte($start)) {
            return response()->json(['status' => false, 'message' => 'end_time must be after start_time'], 422);
        }

        $data['start_time'] = $start->utc();
        $data['end_time']   = $end->utc();

        $quiz = Quiz::create($data);

        return response()->json([
            'status'  => true,
            'message' => 'Quiz created successfully',
            'data'    => $quiz,
        ], 201);
    }

    public function show($id)
    {
        $quiz = Quiz::with(['subject', 'teacher'])->find($id);

        if (!$quiz) {
            return response()->json(['status' => false, 'message' => 'Quiz not found'], 404);
        }

        return response()->json(['status' => true, 'data' => $quiz], 200);
    }

    public function update(Request $request, $id)
    {
        $quiz = Quiz::find($id);
        if (!$quiz) {
            return response()->json(['status' => false, 'message' => 'Quiz not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'quiz_title'    => 'sometimes|string|max:255',
            'quiz_password' => 'nullable|string|unique:quizzes,quiz_password,' . $quiz->id,
            'subject_id'    => 'sometimes|exists:subjects,id',
            'teacher_id'    => 'sometimes|exists:teachers,id',
            'time_limit'    => 'sometimes|integer|min:1',
            'passing_score' => 'sometimes|integer|min:0',
            'start_time'    => 'sometimes',
            'end_time'      => 'sometimes',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => false, 'errors' => $validator->errors()], 400);
        }

        $data = $validator->validated();

        // Normalize time if provided
        if (isset($data['start_time']) || isset($data['end_time'])) {
            $start = isset($data['start_time']) ? $this->parseDateTime($data['start_time']) : $quiz->start_time;
            $end   = isset($data['end_time'])   ? $this->parseDateTime($data['end_time'])   : $quiz->end_time;

            if ($end->lte($start)) {
                return response()->json(['status' => false, 'message' => 'end_time must be after start_time'], 422);
            }

            $data['start_time'] = $start->utc();
            $data['end_time']   = $end->utc();
        }

        $quiz->update($data);

        return response()->json([
            'status'  => true,
            'message' => 'Quiz updated successfully',
            'data'    => $quiz,
        ], 200);
    }

    public function destroy($id)
    {
        $quiz = Quiz::find($id);
        if (!$quiz) {
            return response()->json(['status' => false, 'message' => 'Quiz not found'], 404);
        }

        $quiz->delete();

        return response()->json(['status' => true, 'message' => 'Quiz deleted successfully'], 200);
    }

    /**
     * Parse a datetime string in flexible formats.
     * Returns Carbon instance in app timezone.
     */
    private function parseDateTime($value): Carbon
    {
        $appTz = config('app.timezone', 'UTC');

        // Already Carbon
        if ($value instanceof Carbon) return $value->copy()->timezone($appTz);

        $raw = trim($value);

        // Handle HTML datetime-local: YYYY-MM-DDTHH:MM(:SS)?
        if (preg_match('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/', $raw)) {
            $fmt = strlen($raw) === 16 ? 'Y-m-d\TH:i' : 'Y-m-d\TH:i:s';
            return Carbon::createFromFormat($fmt, $raw, $appTz);
        }

        // ISO8601 or with Z/+hh:mm
        if (preg_match('/Z$|[+\-]\d{2}:\d{2}$/', $raw)) {
            return Carbon::parse($raw)->timezone($appTz);
        }

        // YYYY-MM-DD HH:MM(:SS)?
        if (preg_match('/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}(:\d{2})?$/', $raw)) {
            $fmt = substr_count($raw, ':') === 1 ? 'Y-m-d H:i' : 'Y-m-d H:i:s';
            return Carbon::createFromFormat($fmt, $raw, $appTz);
        }

        // Time-only HH:mm (24h) or hh:mm AM/PM
        try {
            return Carbon::parse($raw, $appTz);
        } catch (\Exception $e) {
            // fallback
            return Carbon::now($appTz);
        }
    }
}
