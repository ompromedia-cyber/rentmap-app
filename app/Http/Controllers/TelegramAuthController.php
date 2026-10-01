<?php

namespace App\\Http\\Controllers;

use Illuminate\\Http\\Request;

class TelegramAuthController extends Controller
{
    public function auth(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'authenticated' => true,
            'user' => [
                'id' => $user->id,
                'telegram_id' => $user->telegram_id,
                'username' => $user->username,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'role' => $user->role,
            ],
        ]);
    }
}
