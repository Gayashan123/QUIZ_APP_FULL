<?php

namespace App\Http\Controllers\admin;

use App\Models\Teacher;
use Hash;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;

class TeacherController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $teachers = Teacher::orderBy('created_at', 'DESC')->get();

        return response()->json([
            'status' => true,
            'data' => $teachers
        ], 200);
    }

    /**
     * Store a newly created teacher.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:teachers,email',
            'phone'    => 'required|string|unique:teachers,phone',

            'password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'errors' => $validator->errors()
            ], 400);
        }

        $teacher = Teacher::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'phone'    => $request->phone,

            'password' => Hash::make($request->password),
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Teacher created successfully',
            'teacher' => $teacher
        ], 201);
    }

    /**
     * Display a specific teacher.
     */
    public function show($id)
    {
        $teacher = Teacher::find($id);

        if (!$teacher) {
            return response()->json([
                'status' => false,
                'message' => 'Teacher not found'
            ], 404);
        }

        return response()->json([
            'status' => true,
            'data' => $teacher
        ], 200);
    }

    /**
     * Update a teacher.
     */
    public function update(Request $request, $id)
    {
        $teacher = Teacher::find($id);

        if (!$teacher) {
            return response()->json([
                'status' => false,
                'message' => 'Teacher not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name'     => 'sometimes|string|max:255',
            'email'    => 'sometimes|email|unique:teachers,email,' . $teacher->id,
            'phone'    => 'sometimes|string|unique:teachers,phone,' . $teacher->id,

            'password' => 'sometimes|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'errors' => $validator->errors()
            ], 400);
        }

        $validatedData = $validator->validated();

        // Hash password if provided
        if (isset($validatedData['password'])) {
            $validatedData['password'] = Hash::make($validatedData['password']);
        }

        $teacher->update($validatedData);

        return response()->json([
            'status' => true,
            'message' => 'Teacher updated successfully',
            'teacher' => $teacher
        ], 200);
    }

    /**
     * Delete a teacher.
     */
    public function destroy($id)
    {
        $teacher = Teacher::find($id);

        if (!$teacher) {
            return response()->json([
                'status' => false,
                'message' => 'Teacher not found'
            ], 404);
        }

        $teacher->delete();

        return response()->json([
            'status' => true,
            'message' => 'Teacher deleted successfully'
        ], 200);
    }
}
