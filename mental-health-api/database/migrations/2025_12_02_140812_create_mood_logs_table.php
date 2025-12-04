<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('mood_logs', function (Blueprint $table) {
            $table->id();
            $table->string('firebase_uid'); // Foreign Key ke User
            $table->string('mood'); // happy, sad, angry, etc
            $table->text('note')->nullable();
            $table->timestamps();

            // Index biar pencarian cepat
            $table->index('firebase_uid');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mood_logs');
    }
};
