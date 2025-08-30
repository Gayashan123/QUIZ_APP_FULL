<?php

namespace App\Http\Controllers;

use App\Models\Teacher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class TeacherAuthController extends Controller
{
    public function authenticate(Request $request)
    {
        // Validation
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        // Find teacher by email
        $teacher = Teacher::where('email', $request->email)->first();

        if (!$teacher || !Hash::check($request->password, $teacher->password)) {
            return response()->json([
                'status' => false,
                'message' => 'Invalid credentials.'
            ], 401);
        }

        // Create token
        $token = $teacher->createToken('token')->plainTextToken;

        return response()->json([
            'status' => true,
            'id' => $teacher->id,
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $teacher = Auth::guard('teacher')->user(); // Use teacher guard
        if ($teacher) {
            $teacher->tokens()->delete();
        }

        return response()->json([
            'status' => true,
            'message' => 'Logged out successfully.',
        ]);
    }

    // New method: check authenticated teacher
    public function checkAuth(Request $request)
    {
        $teacher = Auth::guard('teacher')->user(); // explicitly use teacher guard

        if (!$teacher) {
            return response()->json([
                'status' => false,
                'message' => 'Unauthenticated'
            ], 401);
        }

        return response()->json([
            'status' => true,
            'teacher' => [
                'id' => $teacher->id,
                'name' => $teacher->name,
                'email' => $teacher->email,
            ],
        ]);
    }
}
