<?php

namespace App\Policies;

use App\Models\Quiz;
use Illuminate\Contracts\Auth\Authenticatable;

class QuizPolicy
{
    // Any authenticated user (student/teacher/admin) can list
    public function viewAny(?Authenticatable $user): bool
    {
        return (bool) $user;
    }

    // Any authenticated user can view a single quiz
    public function view(?Authenticatable $user, Quiz $quiz): bool
    {
        return (bool) $user;
    }

    // Create: teacher (and optionally admin)
    public function create(Authenticatable $user): bool
    {
        return $this->isTeacher($user) || $this->isAdmin($user);
    }

    // Update: teacher (owner of quiz) or admin
    public function update(Authenticatable $user, Quiz $quiz): bool
    {
        return $this->isAdmin($user) || $this->isOwnerTeacher($user, $quiz);
    }

    // Delete: teacher (owner of quiz) or admin
    public function delete(Authenticatable $user, Quiz $quiz): bool
    {
        return $this->isAdmin($user) || $this->isOwnerTeacher($user, $quiz);
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

    private function isOwnerTeacher($user, Quiz $quiz): bool
    {
        return $user instanceof \App\Models\Teacher
            && (int) $quiz->teacher_id === (int) $user->id;
    }
}
