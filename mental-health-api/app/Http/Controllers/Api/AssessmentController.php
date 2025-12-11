<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AssessmentController extends Controller
{
    // Simpan Hasil Tes
    public function store(Request $request)
    {
        $request->validate([
            'firebase_uid' => 'required',
            'depression_score' => 'required|integer',
            'anxiety_score' => 'required|integer',
            'stress_score' => 'required|integer',
            // ai_analysis boleh nullable, tapi jika ada harus valid
            'ai_analysis' => 'nullable',
        ]);

        // LOGIKA PENTING: Pastikan format JSON aman
        // Jika React mengirim object, Laravel membacanya sebagai Array -> kita encode ke JSON String
        // Jika React mengirim string, kita simpan apa adanya
        $aiAnalysisData = $request->ai_analysis;
        if (is_array($aiAnalysisData) || is_object($aiAnalysisData)) {
            $aiAnalysisData = json_encode($aiAnalysisData);
        }

        $id = DB::table('assessments')->insertGetId([
            'firebase_uid' => $request->firebase_uid,
            'depression_score' => $request->depression_score,
            'anxiety_score' => $request->anxiety_score,
            'stress_score' => $request->stress_score,
            'ai_analysis' => $aiAnalysisData, // Gunakan variabel yang sudah diamankan
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['status' => 'success', 'id' => $id], 201);
    }

    // Ambil Hasil Terakhir
    public function getLatest(Request $request)
    {
        $uid = $request->query('firebase_uid');

        $latest = DB::table('assessments')
            ->where('firebase_uid', $uid)
            ->orderBy('created_at', 'desc')
            ->first();

        if (!$latest) {
            return response()->json(['status' => 'empty', 'data' => null]);
        }

        return response()->json(['status' => 'success', 'data' => $latest]);
    }

    // Ambil Semua History User
    public function getHistory(Request $request)
    {
        $uid = $request->query('firebase_uid');

        $history = DB::table('assessments')
            ->where('firebase_uid', $uid)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['status' => 'success', 'data' => $history]);
    }
}