<?php

namespace App\Http\Controllers\admin;

use App\Models\Subject;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;

class SubjectController extends Controller
{
    public function index()
    {
        $subjects = Subject::orderByDesc('created_at')->get();

        return response()->json([
            'status' => true,
            'data'   => $subjects
        ], 200);
    }

    public function store(Request $request)
    {
        // Policy enforced via route middleware 'can:create,App\Models\Subject'

        $validator = Validator::make($request->all(), [
            'code' => 'required|unique:subjects,code|string|max:32',
            'name' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $subject = Subject::create([
            'code' => $request->code,
            'name' => $request->name
        ]);

        return response()->json([
            'status'  => true,
            'message' => "Subject created successfully",
            'data'    => $subject
        ], 201);
    }

    public function show(Subject $subject)
    {
        // Policy enforced via 'can:view,subject'
        return response()->json([
            'status' => true,
            'data'   => $subject
        ], 200);
    }

    public function update(Request $request, Subject $subject)
    {
        // Policy enforced via 'can:update,subject'

        $validator = Validator::make($request->all(), [
            'code' => 'required|string|max:32|unique:subjects,code,' . $subject->id,
            'name' => 'required|string|max:255'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $subject->update([
            'code' => $request->code,
            'name' => $request->name
        ]);

        return response()->json([
            'status'  => true,
            'message' => 'Subject updated successfully',
            'data'    => $subject
        ], 200);
    }

    public function destroy(Subject $subject)
    {
        // Policy enforced via 'can:delete,subject'
        $subject->delete();

        return response()->json([
            'status'  => true,
            'message' => 'Subject deleted successfully'
        ], 200);
    }
}
