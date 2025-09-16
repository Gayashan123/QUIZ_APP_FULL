<?php

namespace App\Policies;

use App\Models\Subject;
use Illuminate\Contracts\Auth\Authenticatable;

class SubjectPolicy
{
    // Any authenticated user can list
    public function viewAny(?Authenticatable $user): bool
    {
        return (bool) $user;
    }

    // Admin only: view a single subject by id
    public function view(Authenticatable $user, Subject $subject): bool
    {
        return $this->isAdmin($user);
    }

    // Admin only: create
    public function create(Authenticatable $user): bool
    {
        return $this->isAdmin($user);
    }

    // Admin only: update
    public function update(Authenticatable $user, Subject $subject): bool
    {
        return $this->isAdmin($user);
    }

    // Admin only: delete
    public function delete(Authenticatable $user, Subject $subject): bool
    {
        return $this->isAdmin($user);
    }

    private function isAdmin($user): bool
    {
        // Adjust to your setup. Any of these patterns work:
        // A) Admins authenticate with App\Models\User (students/teachers use other models)
        if ($user instanceof \App\Models\User) {
            // B) Boolean flag on users table
            if (property_exists($user, 'is_admin')) {
                return (bool) $user->is_admin === true;
            }
            // C) Sanctum ability when you issue tokens
            if (method_exists($user, 'tokenCan') && $user->tokenCan('admin')) {
                return true;
            }
            // Fallback: treat App\Models\User as admin
            return true;
        }
        // Students/Teachers are not admins
        return false;
    }
}
