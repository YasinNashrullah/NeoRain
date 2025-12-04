<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;

class UserController extends Controller
{
    public function syncUser(Request $request)
    {
        $request->validate([
            'firebase_uid' => 'required',
            'email' => 'required|email',
            'name' => 'required',
        ]);

        // Cek apakah user sudah ada, jika belum buat baru (updateOrCreate)
        $user = User::updateOrCreate(
            ['firebase_uid' => $request->firebase_uid],
            [
                'name' => $request->name,
                'email' => $request->email,
            ]
        );

        return response()->json([
            'status' => 'success',
            'message' => 'User synced',
            'data' => $user
        ]);
    }
}