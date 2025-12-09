<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ChatHistory;

class ChatController extends Controller
{
    // 1. Simpan Chat Baru
    public function store(Request $request)
    {
        $request->validate([
            'firebase_uid' => 'required',
            'message' => 'required',
            'sender' => 'required|in:user,ai',
        ]);

        $chat = ChatHistory::create([
            'firebase_uid' => $request->firebase_uid,
            'message' => $request->message,
            'sender' => $request->sender,
        ]);

        return response()->json([
            'status' => 'success',
            'data' => $chat
        ], 201);
    }

    // 2. Ambil Riwayat Chat (Pagination)
    public function index(Request $request)
    {
        $uid = $request->query('firebase_uid');
        $page = $request->query('page', 1);
        $limit = 20; // Ambil 20 pesan per load

        if (!$uid) {
            return response()->json(['error' => 'UID required'], 400);
        }

        // Ambil pesan terbaru (descending) lalu di-reverse di frontend
        $chats = ChatHistory::where('firebase_uid', $uid)
                    ->orderBy('created_at', 'desc')
                    ->paginate($limit, ['*'], 'page', $page);

        return response()->json([
            'status' => 'success',
            'data' => $chats->items(), // Array data
            'hasMore' => $chats->hasMorePages()
        ]);
    }
}