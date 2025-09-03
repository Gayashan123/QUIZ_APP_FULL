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
        Schema::create('quizzes', function (Blueprint $table) {
             $table->id();
    $table->string('quiz_title');
    $table->string('quiz_password')->unique()->nullable(); // optional password
    $table->unsignedBigInteger('subject_id'); // FK to subjects
    $table->unsignedBigInteger('teacher_id'); // FK to teachers

    $table->integer('time_limit');   // in minutes
    $table->integer('passing_score'); // e.g. 50 out of 100
    $table->dateTime('start_time');
    $table->dateTime('end_time');

    $table->timestamps();

     // foreign keys
    $table->foreign('subject_id')->references('id')->on('subjects')->onDelete('cascade');
    $table->foreign('teacher_id')->references('id')->on('teachers')->onDelete('cascade');


        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quizzes');
    }
};
