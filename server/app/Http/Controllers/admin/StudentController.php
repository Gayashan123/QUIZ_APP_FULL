<?php

namespace App\Http\Controllers\admin;

use App\Models\Student;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class StudentController extends Controller
{
    // GET: list (any authenticated)
    public function index()
    {
        $students = Student::orderByDesc('created_at')->get();

        return response()->json([
            'status' => true,
            'data'   => $students
        ], 200);
    }

    // POST: create (admin only)
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(),[
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:students,email',
            'phone'    => 'required|string|unique:students,phone',
            'password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $student = Student::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'phone'    => $request->phone,
            'password' => Hash::make($request->password),
        ]);

        return response()->json([
            'status'  => true,
            'message' => 'Student created successfully',
            'data'    => $student
        ], 201);
    }

    // GET: show (admin or self)
    public function show(Student $student)
    {
        return response()->json([
            'status' => true,
            'data'   => $student
        ], 200);
    }

    // GET: count (any authenticated)
    public function count()
    {
        return response()->json([
            'status' => true,
            'count'  => Student::count(),
        ], 200);
    }

    // PUT/PATCH: update (admin or self)
    public function update(Request $request, Student $student)
    {
        $validator = Validator::make($request->all(), [
            'name'     => 'sometimes|string|max:255',
            'email'    => 'sometimes|email|unique:students,email,' . $student->id,
            'phone'    => 'sometimes|string|unique:students,phone,' . $student->id,
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

        $student->update($data);

        return response()->json([
            'status'  => true,
            'message' => 'Student updated successfully',
            'data'    => $student
        ], 200);
    }

    // DELETE: destroy (admin or self)
    public function destroy(Student $student)
    {
        $student->delete();

        return response()->json([
            'status'  => true,
            'message' => 'Student deleted successfully'
        ], 200);
    }
}
