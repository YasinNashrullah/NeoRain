<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\MoodController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\AssessmentController;

// Route untuk hasil Analyze

Route::post('/assessments', [AssessmentController::class, 'store']);
Route::get('/assessments/latest', [AssessmentController::class, 'getLatest']);
Route::get('/assessments/history', [AssessmentController::class, 'getHistory']);

// Route untuk Sync User Login
Route::post('/sync-user', [UserController::class, 'syncUser']);
Route::get('/moods/weekly', [MoodController::class, 'getWeekly']);

// Route untuk Mood Tracker
Route::post('/moods', [MoodController::class, 'store']); // Simpan
Route::get('/moods', [MoodController::class, 'index']);  // Lihat History