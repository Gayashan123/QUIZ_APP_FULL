<?php

namespace App\Http\Controllers;

use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class StudentAuthController extends Controller
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

        // Find student by email
        $student = Student::where('email', $request->email)->first();

        if (!$student || !Hash::check($request->password, $student->password)) {
            return response()->json([
                'status' => false,
                'message' => 'Invalid credentials.'
            ], 401);
        }

        // Create token
        $token = $student->createToken('token')->plainTextToken;

        return response()->json([
            'status' => true,
            'id' => $student->id,
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $student = $request->user(); // Authenticated student via Sanctum
        $student->tokens()->delete();

        return response()->json([
            'status' => true,
            'message' => 'Logged out successfully.',
        ]);
    }


  public function checkAuth(Request $request)
    {
        $student = Auth::guard('student')->user(); // explicitly use admin guard

        if (!$student) {
            return response()->json([
                'status' => false,
                'message' => 'Unauthenticated'
            ], 401);
        }

        return response()->json([
            'status' => true,
            'student' => [
                'id' => $student->id,
                'name' => $student->name,
                'email' => $student->email,
            ],
        ]);
    }







}
