<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\MoodController;
use App\Http\Controllers\Api\UserController;

// Route untuk Sync User Login
Route::post('/sync-user', [UserController::class, 'syncUser']);
Route::get('/moods/weekly', [MoodController::class, 'getWeekly']);

// Route untuk Mood Tracker
Route::post('/moods', [MoodController::class, 'store']); // Simpan
Route::get('/moods', [MoodController::class, 'index']);  // Lihat History