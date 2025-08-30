<?php

namespace App\Http\Controllers\teacher;

use App\Models\Option;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;

class OptionController extends Controller
{
    /**
     * Display all options
     */
    public function index()
    {
        $options = Option::with('question')->orderBy('created_at', 'DESC')->get();

        return response()->json([
            'status' => true,
            'data' => $options
        ], 200);
    }

    /**
     * Store a new option
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [

            'question_id' => 'required|exists:questions,id',
            'option_text' => 'required|string',
            'is_correct' => 'sometimes|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'errors' => $validator->errors()
            ], 400);
        }

        $option = Option::create($validator->validated());

        return response()->json([
            'status' => true,
            'message' => 'Option created successfully',
            'data' => $option
        ], 201);
    }

    /**
     * Show a specific option
     */
    public function show($id)
    {
        $option = Option::with('question')->find($id);

        if (!$option) {
            return response()->json([
                'status' => false,
                'message' => 'Option not found'
            ], 404);
        }

        return response()->json([
            'status' => true,
            'data' => $option
        ], 200);
    }

    /**
     * Update an option
     */
    public function update(Request $request, $id)
    {
        $option = Option::find($id);

        if (!$option) {
            return response()->json([
                'status' => false,
                'message' => 'Option not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [

            'question_id' => 'sometimes|exists:questions,id',
            'option_text' => 'sometimes|string',
            'is_correct' => 'sometimes|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'errors' => $validator->errors()
            ], 400);
        }

        $option->update($validator->validated());

        return response()->json([
            'status' => true,
            'message' => 'Option updated successfully',
            'data' => $option
        ], 200);
    }

    /**
     * Delete an option
     */
    public function destroy($id)
    {
        $option = Option::find($id);

        if (!$option) {
            return response()->json([
                'status' => false,
                'message' => 'Option not found'
            ], 404);
        }

        $option->delete();

        return response()->json([
            'status' => true,
            'message' => 'Option deleted successfully'
        ], 200);
    }
}
