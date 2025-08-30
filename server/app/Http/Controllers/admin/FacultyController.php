<?php

namespace App\Http\Controllers\admin;


use App\Models\Faculty;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;

class FacultyController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $faculties = Faculty::orderBy('created_at', 'DESC')->get();

        return response()->json([
            'status' => true,
            'data' => $faculties
        ], 200);
    }


    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|unique:faculties,code',
            'name' => 'required'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'errors' => $validator->errors()
            ], 400);
        }

        $faculties = Faculty::create([
            'code' => $request->code,
            'name' => $request->name
        ]);

        return response()->json([
            'status' => true,
            'message' => "Faculty Created Successfully",
            'data' => $faculties
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $faculty = Faculty::find($id);

        if (!$faculty) {
            return response()->json([
                'status' => false,
                'message' => 'Faculty not found'
            ], 404);
        }

        return response()->json([
            'status' => true,
            'data' => $faculty
        ], 200);
    }



    /**
     * Update the specified resource in storage.
     */
 public function update(Request $request, $id)
    {
        $faculty = Faculty::find($id);

        if (!$faculty) {
            return response()->json([
                'status' => false,
                'message' => 'Faculty not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'code' => 'required|unique:faculties,code,' . $id, // ignore current subject
            'name' => 'required'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'errors' => $validator->errors()
            ], 400);
        }

        $faculty->update([
            'code' => $request->code,
            'name' => $request->name
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Faculty updated successfully',
            'data' => $faculty
        ], 200);
    }


    /**
     * Remove the specified resource from storage.
     */ public function destroy($id)
    {
        $faculty = Faculty::find($id);

        if (!$faculty) {
            return response()->json([
                'status' => false,
                'message' => 'Faculty not found'
            ], 404);
        }

        $faculty->delete();

        return response()->json([
            'status' => true,
            'message' => 'Faculty deleted successfully'
        ], 200);
    }
}
