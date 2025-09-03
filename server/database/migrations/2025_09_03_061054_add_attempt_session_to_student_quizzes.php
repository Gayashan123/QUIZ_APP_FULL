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
        Schema::table('student_quizzes', function (Blueprint $table) {
            if (!Schema::hasColumn('student_quizzes', 'attempt_token')) {
                $table->string('attempt_token', 100)->nullable()->unique();
            }
            if (!Schema::hasColumn('student_quizzes', 'attempt_token_expires_at')) {
                $table->timestamp('attempt_token_expires_at')->nullable();
            }
            if (!Schema::hasColumn('student_quizzes', 'started_at')) {
                $table->timestamp('started_at')->nullable();
            }
            if (!Schema::hasColumn('student_quizzes', 'finished_at')) {
                $table->timestamp('finished_at')->nullable();
            }

            // One attempt per student per quiz
            $table->unique(['student_id', 'quiz_id']);
        });
    }
    /**
     * Reverse the migrations.
     */
   public function down(): void
    {
        Schema::table('student_quizzes', function (Blueprint $table) {
            if (Schema::hasColumn('student_quizzes', 'attempt_token')) {
                $table->dropUnique(['attempt_token']);
                $table->dropColumn('attempt_token');
            }
            if (Schema::hasColumn('student_quizzes', 'attempt_token_expires_at')) {
                $table->dropColumn('attempt_token_expires_at');
            }
            if (Schema::hasColumn('student_quizzes', 'started_at')) {
                $table->dropColumn('started_at');
            }
            if (Schema::hasColumn('student_quizzes', 'finished_at')) {
                $table->dropColumn('finished_at');
            }
            // $table->dropUnique(['student_id', 'quiz_id']); // only if you want to allow multiple attempts later
        });
    }
};
