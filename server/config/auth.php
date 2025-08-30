<?php

return [

    'defaults' => [
        'guard' => 'web', // default for admin/users
        'passwords' => 'users',
    ],

    'guards' => [
        'web' => [
            'driver' => 'session',
            'provider' => 'users',
        ],

        'student' => [
            'driver' => 'sanctum', // token-based
            'provider' => 'students',
        ],



        'teacher' => [
            'driver' => 'sanctum', // token-based
            'provider' => 'teachers',
        ],

    ],

    'providers' => [
        'users' => [
            'driver' => 'eloquent',
            'model' => App\Models\User::class,
        ],

        'students' => [
            'driver' => 'eloquent',
            'model' => App\Models\Student::class,
        ],


         'teachers' => [
            'driver' => 'eloquent',
            'model' => App\Models\Teacher::class,
        ],




    ],

    'passwords' => [
        'users' => [
            'provider' => 'users',
            'table' => 'password_reset_tokens',
            'expire' => 60,
            'throttle' => 60,
        ],

        'students' => [
            'provider' => 'students',
            'table' => 'student_password_resets',
            'expire' => 60,
            'throttle' => 60,
        ],

         'teachers' => [
            'provider' => 'teachers',
            'table' => 'teacher_password_resets',
            'expire' => 60,
            'throttle' => 60,
        ],


    ],

    'password_timeout' => 10800,
];
