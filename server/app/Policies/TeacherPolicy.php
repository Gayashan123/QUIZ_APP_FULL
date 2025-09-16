<?php

namespace App\Policies;

use App\Models\Teacher;
use Illuminate\Contracts\Auth\Authenticatable;

class TeacherPolicy
{
    // List all teachers: admin only
    public function viewAny(?Authenticatable $user): bool
    {
        return $this->isAdmin($user);
    }

    // View one teacher: admin OR the teacher themself
    public function view(Authenticatable $user, Teacher $teacher): bool
    {
        return $this->isAdmin($user) || $this->isSelf($user, $teacher);
    }

    // Create: admin only
    public function create(Authenticatable $user): bool
    {
        return $this->isAdmin($user);
    }

    // Update: admin OR the teacher themself
    public function update(Authenticatable $user, Teacher $teacher): bool
    {
        return $this->isAdmin($user) || $this->isSelf($user, $teacher);
    }

    // Delete: admin OR the teacher themself
    public function delete(Authenticatable $user, Teacher $teacher): bool
    {
        return $this->isAdmin($user) || $this->isSelf($user, $teacher);
    }

    private function isAdmin($user): bool
    {
        // Works even without roles — adjust to your app.
        // A) Admins authenticate with App\Models\User (students/teachers use other models)
        if ($user instanceof \App\Models\User) {
            // Optional: if you have a boolean
            if (property_exists($user, 'is_admin')) {
                return (bool) $user->is_admin === true;
            }
            // Optional: if you issue Sanctum tokens with abilities
            if (method_exists($user, 'tokenCan') && $user->tokenCan('admin')) {
                return true;
            }
            // Fallback: all App\Models\User are admins
            return true;
        }
        return false;
    }

    private function isSelf($user, Teacher $teacher): bool
    {
        // Teachers authenticate as App\Models\Teacher
        return $user instanceof \App\Models\Teacher && (int) $user->id === (int) $teacher->id;
    }
}
