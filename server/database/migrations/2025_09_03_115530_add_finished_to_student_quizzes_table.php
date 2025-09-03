<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('student_quizzes', function (Blueprint $table) {
            if (!Schema::hasColumn('student_quizzes', 'finished')) {
                $table->boolean('finished')->default(false)->after('finished_at');
            }
        });

        // Backfill: mark finished=true where finished_at is already set
        DB::table('student_quizzes')
            ->whereNotNull('finished_at')
            ->update(['finished' => true]);
    }

    public function down(): void
    {
        Schema::table('student_quizzes', function (Blueprint $table) {
            if (Schema::hasColumn('student_quizzes', 'finished')) {
                $table->dropColumn('finished');
            }
        });
    }
};
