<?php

namespace App\Policies;

use App\Models\Option;
use Illuminate\Contracts\Auth\Authenticatable;

class OptionPolicy
{
    // Any authenticated user can list
    public function viewAny(?Authenticatable $user): bool
    {
        return (bool) $user;
    }

    // Any authenticated user can view a single option
    public function view(?Authenticatable $user, Option $option): bool
    {
        return (bool) $user;
    }

    // Create: teacher (or admin)
    public function create(Authenticatable $user): bool
    {
        return $this->isTeacher($user) || $this->isAdmin($user);
    }

    // Update: teacher (owner of question->quiz) or admin
    public function update(Authenticatable $user, Option $option): bool
    {
        return $this->isAdmin($user) || $this->isOwnerTeacher($user, $option);
    }

    // Delete: teacher (owner) or admin
    public function delete(Authenticatable $user, Option $option): bool
    {
        return $this->isAdmin($user) || $this->isOwnerTeacher($user, $option);
    }

    private function isAdmin($user): bool
    {
        if ($user instanceof \App\Models\User) {
            if (property_exists($user, 'is_admin') && (bool) $user->is_admin) return true;
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

    private function isOwnerTeacher($user, Option $option): bool
    {
        // Requires option->question->quiz->teacher_id relation chain
        return $user instanceof \App\Models\Teacher
            && (int) $option->question?->quiz?->teacher_id === (int) $user->id;
    }
}
