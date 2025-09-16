<?php

namespace App\Http\Controllers\admin;

use App\Models\Teacher;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class TeacherController extends Controller
{
    // GET /api/teachers (admin only via policy)
    public function index()
    {
        $teachers = Teacher::orderByDesc('created_at')->get();

        return response()->json([
            'status' => true,
            'data'   => $teachers
        ], 200);
    }

    // POST /api/teachers (admin only via policy)
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
            ], 422);
        }

        $teacher = Teacher::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'phone'    => $request->phone,
            'password' => Hash::make($request->password),
        ]);

        return response()->json([
            'status'  => true,
            'message' => 'Teacher created successfully',
            'data'    => $teacher
        ], 201);
    }

    // GET /api/teachers/{teacher} (admin or self via policy)
    public function show(Teacher $teacher)
    {
        return response()->json([
            'status' => true,
            'data'   => $teacher
        ], 200);
    }

    // PUT /api/teachers/{teacher} (admin or self via policy)
    public function update(Request $request, Teacher $teacher)
    {
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
            ], 422);
        }

        $data = $validator->validated();

        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }

        $teacher->update($data);

        return response()->json([
            'status'  => true,
            'message' => 'Teacher updated successfully',
            'data'    => $teacher
        ], 200);
    }

    // DELETE /api/teachers/{teacher} (admin or self via policy)
    public function destroy(Teacher $teacher)
    {
        $teacher->delete();

        return response()->json([
            'status'  => true,
            'message' => 'Teacher deleted successfully'
        ], 200);
    }
}
