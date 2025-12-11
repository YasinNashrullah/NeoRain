<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\MoodController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\AssessmentController;
use App\Http\Controllers\Api\ChatController;

// Route Chat
Route::post('/chats', [ChatController::class, 'store']); // Simpan Chat
Route::get('/chats', [ChatController::class, 'index']);  // Ambil History

// Route untuk hasil Analyze
Route::post('/assessments', [AssessmentController::class, 'store']);
Route::get('/assessments/latest', [AssessmentController::class, 'getLatest']);
Route::get('/assessments/history', [AssessmentController::class, 'getHistory']);

// Route untuk Mood Tracker
Route::get('/moods/weekly', [MoodController::class, 'getWeekly']);
Route::post('/moods', [MoodController::class, 'store']); // Simpan
Route::get('/moods', [MoodController::class, 'index']);  // Lihat History

// profile
Route::post('/sync-user', [UserController::class, 'syncUser']);
Route::post('/user/update', [UserController::class, 'updateProfile']);
Route::get('/user/detail', [UserController::class, 'getUser']);
Route::post('/user/photo', [UserController::class, 'uploadPhoto']);