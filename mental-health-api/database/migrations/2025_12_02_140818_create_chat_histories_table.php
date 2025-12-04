<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
    Schema::create('chat_histories', function (Blueprint $table) {
        $table->id();
        $table->string('firebase_uid');
        $table->text('message');
        $table->enum('sender', ['user', 'ai']);
        $table->timestamps();
        
        $table->index('firebase_uid');
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chat_histories');
    }
};
