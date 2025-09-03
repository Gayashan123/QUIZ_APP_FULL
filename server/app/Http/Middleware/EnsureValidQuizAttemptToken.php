<?php

namespace App\Http\Middleware;

use App\Models\StudentQuiz;
use Closure;
use Illuminate\Http\Request;

class EnsureValidQuizAttemptToken
{
    public function handle(Request $request, Closure $next)
    {
        $token = $request->header('X-Quiz-Token');
        if (!$token) {
            return response()->json(['message' => 'Quiz attempt token missing'], 401);
        }

        $attempt = StudentQuiz::where('attempt_token', $token)->first();
        if (!$attempt) {
            return response()->json(['message' => 'Invalid quiz attempt token'], 401);
        }
        if ($attempt->finished_at) {
            return response()->json(['message' => 'Attempt already finished'], 409);
        }
        if ($attempt->attempt_token_expires_at && now()->gte($attempt->attempt_token_expires_at)) {
            return response()->json(['message' => 'Quiz attempt token expired'], 401);
        }

        // Optional extra guard if client also sends quiz_id in body:
        $payloadQuizId = (int) ($request->input('quiz_id') ?? 0);
        if ($payloadQuizId && $payloadQuizId !== (int) $attempt->quiz_id) {
            return response()->json(['message' => 'Token does not match quiz'], 403);
        }

        $request->attributes->set('attempt', $attempt);

        return $next($request);
    }
}
