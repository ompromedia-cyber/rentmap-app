<?php

namespace App\\Http\\Controllers;

use App\\Models\\User;
use Illuminate\\Http\\Request;

class TelegramAuthController extends Controller
{
    public function auth(Request $request)
    {
        $initData = $request->header('X-Telegram-Init-Data');

        if (!$initData) {
            return response()->json(['message' => 'X-Telegram-Init-Data header is required.'], 400);
        }

        // Authentication is performed by the same middleware used by protected API routes.
        // The endpoint remains intentionally simple so the frontend can verify connectivity.
        return response()->json([
            'authenticated' => false,
            'message' => 'Use the X-Telegram-Init-Data header on protected requests.',
        ], 200);
    }
}
