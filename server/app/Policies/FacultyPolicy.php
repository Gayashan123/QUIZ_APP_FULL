<?php

namespace App\Policies;

use App\Models\Faculty;
use Illuminate\Contracts\Auth\Authenticatable;

class FacultyPolicy
{
    // Any authenticated user can list
    public function viewAny(?Authenticatable $user): bool
    {
        return (bool) $user;
    }

    // Admin only: view a single faculty by id
    public function view(Authenticatable $user, Faculty $faculty): bool
    {
        return $this->isAdmin($user);
    }

    // Admin only: create
    public function create(Authenticatable $user): bool
    {
        return $this->isAdmin($user);
    }

    // Admin only: update
    public function update(Authenticatable $user, Faculty $faculty): bool
    {
        return $this->isAdmin($user);
    }

    // Admin only: delete
    public function delete(Authenticatable $user, Faculty $faculty): bool
    {
        return $this->isAdmin($user);
    }

    private function isAdmin($user): bool
    {
        // Adjust to your setup. These three checks cover most cases:
        // A) Admins sign in via App\Models\User (students/teachers are different models)
        if ($user instanceof \App\Models\User) {
            // B) If you have a boolean flag
            if (property_exists($user, 'is_admin')) {
                return (bool) $user->is_admin === true;
            }
            // C) If you use Sanctum abilities when issuing tokens
            if (method_exists($user, 'tokenCan') && $user->tokenCan('admin')) {
                return true;
            }
            // Fallback: treat all App\Models\User as admin
            return true;
        }
        return false;
    }
}
