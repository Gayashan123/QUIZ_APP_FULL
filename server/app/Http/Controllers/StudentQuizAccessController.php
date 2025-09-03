<?php

namespace App\Http\Controllers;

use App\Models\Quiz;
use App\Models\StudentQuiz;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class StudentQuizAccessController extends Controller
{
    public function enter(Request $request, Quiz $quiz)
    {
        $user = $request->user();
        if (!$user) return response()->json(['message' => 'Unauthenticated'], 401);

        $now = now();

        if ($quiz->start_time && $now->lt($quiz->start_time)) {
            return response()->json([
                'message'    => 'Quiz has not started yet',
                'start_time' => optional($quiz->start_time)->toIso8601String(),
            ], 403);
        }
        if ($quiz->end_time && $now->gt($quiz->end_time)) {
            return response()->json([
                'message' => 'Quiz has ended',
                'end_at'  => optional($quiz->end_time)->toIso8601String(),
            ], 403);
        }

        $data = $request->validate(['access_code' => 'nullable|string']);
        if ($quiz->quiz_password) {
            if (($data['access_code'] ?? '') !== $quiz->quiz_password) {
                return response()->json(['message' => 'Invalid access code'], 422);
            }
        }

        $attempt = StudentQuiz::firstOrCreate(
            ['student_id' => $user->id, 'quiz_id' => $quiz->id]
        );

        if ($attempt->finished_at) {
            return response()->json(['message' => 'You have already completed this quiz'], 409);
        }

        $startedAt = $attempt->started_at ?: $now;

        $expiresAt = null;
        $candidates = [];
        if (!empty($quiz->time_limit)) $candidates[] = $startedAt->copy()->addMinutes((int) $quiz->time_limit);
        if ($quiz->end_time)          $candidates[] = $quiz->end_time->copy();
        foreach ($candidates as $c) {
            if (!$expiresAt || $c->lt($expiresAt)) $expiresAt = $c;
        }

        $token = Str::random(64);

        $attempt->update([
            'attempt_token'            => $token,
            'attempt_token_expires_at' => $expiresAt,
            'started_at'               => $startedAt,
        ]);

        return response()->json([
            'status' => true,
            'data'   => [
                'attempt_id'    => $attempt->id,
                'attempt_token' => $token,
                'end_at'        => optional($expiresAt)->toIso8601String(),
                'time_limit'    => (int) ($quiz->time_limit ?? 0),
            ],
        ], 201);
    }
}
