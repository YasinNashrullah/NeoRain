<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\MoodLog;
use Carbon\Carbon;

class MoodController extends Controller
{

    public function getWeekly(Request $request)
    {
        $uid = $request->query('firebase_uid');

        if (!$uid)
            return response()->json(['error' => 'UID required'], 400);

        // Tentukan awal dan akhir minggu ini (Senin - Minggu)
        $startOfWeek = Carbon::now()->startOfWeek();
        $endOfWeek = Carbon::now()->endOfWeek();

        $logs = MoodLog::where('firebase_uid', $uid)
            ->whereBetween('created_at', [$startOfWeek, $endOfWeek])
            ->orderBy('created_at', 'desc') // Terbaru di atas
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $logs
        ]);
    }
    // Simpan Mood (POST)
    public function store(Request $request)
    {
        // Validasi input
        $request->validate([
            'firebase_uid' => 'required',
            'mood' => 'required',
        ]);

        // Simpan ke database
        $mood = MoodLog::create([
            'firebase_uid' => $request->firebase_uid,
            'mood' => $request->mood,
            'note' => $request->note,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Mood berhasil disimpan',
            'data' => $mood
        ], 201);
    }

    // Ambil History Mood User (GET)
    public function index(Request $request)
    {
        $uid = $request->query('firebase_uid');

        if (!$uid) {
            return response()->json(['error' => 'UID required'], 400);
        }

        // Ambil data mood berdasarkan UID, urutkan dari terbaru
        $logs = MoodLog::where('firebase_uid', $uid)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $logs
        ]);
    }
}