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
        Schema::table('assessments', function (Blueprint $table) {
            // simpan sebagai (Ringkasan, Saran, Edukasi)
            $table->json('ai_analysis')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
    Schema::table('assessments', function (Blueprint $table) {
        $table->dropColumn('ai_analysis');
    });
    }
};
