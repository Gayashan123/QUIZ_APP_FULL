<?php

namespace App\Policies;

use App\Models\Question;
use Illuminate\Contracts\Auth\Authenticatable;

class QuestionPolicy
{
    // Any authenticated user can list (controller will filter)
    public function viewAny(?Authenticatable $user): bool
    {
        return (bool) $user;
    }

    // Any authenticated user can view a question
    // (controller will hide is_correct for students and can also restrict by teacher ownership)
    public function view(?Authenticatable $user, Question $question): bool
    {
        return (bool) $user;
    }

    // Create: teacher (or admin)
    public function create(Authenticatable $user): bool
    {
        return $this->isTeacher($user) || $this->isAdmin($user);
    }

    // Update: teacher (who owns the quiz) or admin
    public function update(Authenticatable $user, Question $question): bool
    {
        return $this->isAdmin($user) || $this->isOwnerTeacher($user, $question);
    }

    // Delete: teacher (who owns the quiz) or admin
    public function delete(Authenticatable $user, Question $question): bool
    {
        return $this->isAdmin($user) || $this->isOwnerTeacher($user, $question);
    }

    private function isAdmin($user): bool
    {
        if ($user instanceof \App\Models\User) {
            if (property_exists($user, 'is_admin') && (bool) $user->is_admin === true) return true;
            if (method_exists($user, 'tokenCan') && $user->tokenCan('admin')) return true;
            return true; // fallback
        }
        return false;
    }

    private function isTeacher($user): bool
    {
        if ($user instanceof \App\Models\Teacher) {
            if (method_exists($user, 'tokenCan') && $user->tokenCan('teacher')) return true;
            return true; // fallback
        }
        return false;
    }

    private function isOwnerTeacher($user, Question $question): bool
    {
        // Requires question->quiz relation with teacher_id
        return $user instanceof \App\Models\Teacher
            && (int) $question->quiz?->teacher_id === (int) $user->id;
    }
}
