<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\MoodLog;

class UserController extends Controller
{
    // Update Data Text
    public function updateProfile(Request $request)
    {
        $request->validate([
            'firebase_uid' => 'required',
            'name' => 'required', 
        ]);

        // Cari user
        $user = User::where('firebase_uid', $request->firebase_uid)->first();

        if ($user) {
            // Update data
            $user->name = $request->name;
            $user->gender = $request->gender;
            $user->date_of_birth = $request->date_of_birth;
            $user->location = $request->location;

            // Simpan
            $user->save();

            return response()->json([
                'status' => 'success',
                'message' => 'Profile updated',
                'data' => $user
            ]);
        }

        return response()->json(['status' => 'error', 'message' => 'User not found'], 404);
    }

    // Upload Foto Profile
    public function uploadPhoto(Request $request)
    {
        $request->validate([
            'firebase_uid' => 'required',
            'photo' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048', // Max 2MB
        ]);

        $user = User::where('firebase_uid', $request->firebase_uid)->first();

        if ($user && $request->hasFile('photo')) {
            $path = $request->file('photo')->store('avatars', 'public');
            $url = asset('storage/' . $path);
            $user->update(['photo_url' => $url]);
            return response()->json([
                'status' => 'success',
                'message' => 'Photo uploaded',
                'url' => $url
            ]);
        }

        return response()->json(['status' => 'error', 'message' => 'Upload failed'], 400);
    }

    // Get User Data
    public function getUser(Request $request)
    {
        $uid = $request->query('firebase_uid');
        $user = User::where('firebase_uid', $uid)->first();

        if ($user) {
            $user->mood_count = MoodLog::where('firebase_uid', $uid)->count();
        }

        return response()->json(['status' => 'success', 'data' => $user]);
    }

    // Sync User
    public function syncUser(Request $request)
    {
        $request->validate([
            'firebase_uid' => 'required',
            'email' => 'required|email',
            'name' => 'required',
        ]);

        $user = User::updateOrCreate(
            ['firebase_uid' => $request->firebase_uid],
            [
                'name' => $request->name,
                'email' => $request->email,
            ]
        );

        return response()->json(['status' => 'success', 'data' => $user]);
    }
}