<?php

namespace App\Policies;

use App\Models\Student_result;
use Illuminate\Contracts\Auth\Authenticatable;

class StudentResultPolicy
{
    // Any authenticated user can list (index), but we'll filter in controller
    public function viewAny(?Authenticatable $user): bool
    {
        return (bool) $user;
    }

    // Admin/Teacher can view anything; Student can view own
    public function view(Authenticatable $user, Student_result $result): bool
    {
        return $this->isAdmin($user) || $this->isTeacher($user) || $this->isOwner($user, $result);
    }

    // Create (store/bulk): admin + teacher only
    public function create(Authenticatable $user): bool
    {
        return $this->isAdmin($user) || $this->isTeacher($user);
    }

    // Update: admin + teacher only
    public function update(Authenticatable $user, Student_result $result): bool
    {
        return $this->isAdmin($user) || $this->isTeacher($user);
    }

    // Delete: admin + teacher only
    public function delete(Authenticatable $user, Student_result $result): bool
    {
        return $this->isAdmin($user) || $this->isTeacher($user);
    }

    private function isAdmin($user): bool
    {
        // Admins authenticate with App\Models\User (students/teachers are different models)
        if ($user instanceof \App\Models\User) {
            if (property_exists($user, 'is_admin') && (bool) $user->is_admin === true) return true;
            if (method_exists($user, 'tokenCan') && $user->tokenCan('admin')) return true;
            return true; // fallback: all App\Models\User treated as admin
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

    private function isOwner($user, Student_result $result): bool
    {
        // Students authenticate as App\Models\Student
        if (!($user instanceof \App\Models\Student)) return false;
        // Requires relation studentQuiz on Student_result
        $studentId = $result->studentQuiz?->student_id;
        return (int) $studentId === (int) $user->id;
    }
}
