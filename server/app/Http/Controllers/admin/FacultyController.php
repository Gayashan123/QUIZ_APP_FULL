<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use App\Models\Faculty;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class FacultyController extends Controller
{
    // GET /api/faculties (any authenticated) — policy enforced in routes via can:viewAny
    public function index()
    {
        $faculties = Faculty::orderByDesc('created_at')->get();

        return response()->json([
            'status' => true,
            'data'   => $faculties,
        ], 200);
    }

    // POST /api/faculties (admin only) — policy enforced in routes via can:create
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string|max:32|unique:faculties,code',
            'name' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $faculty = Faculty::create([
            'code' => $request->code,
            'name' => $request->name,
        ]);

        return response()->json([
            'status'  => true,
            'message' => 'Faculty created successfully',
            'data'    => $faculty,
        ], 201);
    }

    // GET /api/faculties/{faculty} (admin only) — policy enforced in routes via can:view
    public function show(Faculty $faculty)
    {
        return response()->json([
            'status' => true,
            'data'   => $faculty,
        ], 200);
    }

    // PUT /api/faculties/{faculty} (admin only) — policy enforced in routes via can:update
    public function update(Request $request, Faculty $faculty)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string|max:32|unique:faculties,code,' . $faculty->id,
            'name' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $faculty->update([
            'code' => $request->code,
            'name' => $request->name,
        ]);

        return response()->json([
            'status'  => true,
            'message' => 'Faculty updated successfully',
            'data'    => $faculty,
        ], 200);
    }

    // DELETE /api/faculties/{faculty} (admin only) — policy enforced in routes via can:delete
    public function destroy(Faculty $faculty)
    {
        $faculty->delete();

        return response()->json([
            'status'  => true,
            'message' => 'Faculty deleted successfully',
        ], 200);
    }
}
