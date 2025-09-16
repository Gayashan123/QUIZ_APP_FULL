<?php

namespace App\Policies;

use App\Models\Student;
use Illuminate\Contracts\Auth\Authenticatable;

class StudentPolicy
{
    // Any authenticated user can list
    public function viewAny(?Authenticatable $user): bool
    {
        return (bool) $user;
    }

    // Admin or the student themself
    public function view(Authenticatable $user, Student $student): bool
    {
        return $this->isAdmin($user) || $this->isSelf($user, $student);
    }

    // Admin only
    public function create(Authenticatable $user): bool
    {
        return $this->isAdmin($user);
    }

    // Admin or the student themself
    public function update(Authenticatable $user, Student $student): bool
    {
        return $this->isAdmin($user) || $this->isSelf($user, $student);
    }

    // Admin or the student themself
    public function delete(Authenticatable $user, Student $student): bool
    {
        return $this->isAdmin($user) || $this->isSelf($user, $student);
    }

    private function isAdmin($user): bool
    {
        // Works even without "roles":
        // A) Admins authenticate with App\Models\User (students/teachers use other models)
        if ($user instanceof \App\Models\User) {
            // B) If you keep a boolean flag
            if (property_exists($user, 'is_admin')) {
                return (bool) $user->is_admin === true;
            }
            // C) If you issue Sanctum tokens with abilities
            if (method_exists($user, 'tokenCan') && $user->tokenCan('admin')) {
                return true;
            }
            // Fallback: treat App\Models\User as admin
            return true;
        }
        return false;
    }

    private function isSelf($user, Student $student): bool
    {
        // Students authenticate with App\Models\Student in your multi-guard setup
        return $user instanceof \App\Models\Student && (int) $user->id === (int) $student->id;
    }
}
