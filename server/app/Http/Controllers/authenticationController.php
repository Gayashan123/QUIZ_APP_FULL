<?php

namespace App\Http\Controllers;

use App\Models\User;;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class authenticationController extends Controller
{
    public function authenticate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $credentials = [
            'email' => $request->email,
            'password' => $request->password,
        ];

        if (Auth::attempt($credentials)) {
           $user = User::find(Auth::user()->id);
          $token = $user->createToken('token')->plainTextToken;

     return response()->json([
        'status' =>true ,

        'id' => Auth::user()->id,
        'token' =>$token,
     ]);


        } else {
            return response()->json([
                'status' => false,
                'message' => 'Invalid credentials.'
            ],401);
        }
    }


    public function logout() {
$user = User::find(Auth::user()->id);
$user->tokens()->delete();


return response()->json([

'status' =>true,
'message'=>'**Bro You Logged out Successfully**',

]);


    }


  public function checkAuth(Request $request)
    {
        $admin = Auth::guard('user')->user(); // explicitly use admin guard

        if (!$admin) {
            return response()->json([
                'status' => false,
                'message' => 'Unauthenticated'
            ], 401);
        }

        return response()->json([
            'status' => true,
            'admin' => [
                'id' => $admin->id,
                'name' => $admin->name,
                'email' => $admin->email,
            ],
        ]);
    }




}
