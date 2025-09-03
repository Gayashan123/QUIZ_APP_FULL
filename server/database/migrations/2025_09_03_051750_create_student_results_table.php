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
        Schema::create('student_results', function (Blueprint $table) {
            $table->id();

            // Link to student_quizzes (the attempt)
            $table->unsignedBigInteger('student_quiz_id');
            $table->foreign('student_quiz_id')->references('id')->on('student_quizzes')->onDelete('cascade');

            // The question answered
            $table->unsignedBigInteger('question_id');
            $table->foreign('question_id')->references('id')->on('questions')->onDelete('cascade');

            // The option/solution student selected
            $table->unsignedBigInteger('solution_id')->nullable();
            $table->foreign('solution_id')->references('id')->on('options')->onDelete('set null');

            // Whether it was correct
            $table->boolean('is_correct')->default(false);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_results');
    }
};
