<?php

namespace App\\Http\\Middleware;

use App\\Models\\User;
use Closure;
use Illuminate\\Http\\Request;
use Symfony\\Component\\HttpFoundation\\Response;

class TelegramWebAppAuth
{
    public function handle(Request $request, Closure $next): Response
    {
        $initData = $request->header('X-Telegram-Init-Data');

        if (!$initData || !env('TELEGRAM_BOT_TOKEN')) {
            return response()->json(['message' => 'Telegram authentication required.'], 401);
        }

        parse_str($initData, $data);
        $receivedHash = $data['hash'] ?? null;
        unset($data['hash']);

        if (!$receivedHash) {
            return response()->json(['message' => 'Invalid Telegram initData.'], 401);
        }

        ksort($data);
        $dataCheckString = collect($data)
            ->map(fn ($value, $key) => $key.'='.$value)
            ->implode("\n");

        $secretKey = hash_hmac('sha256', config('app.telegram_bot_token'), 'WebAppData', true);
        $calculatedHash = hash_hmac('sha256', $dataCheckString, $secretKey);

        if (!hash_equals($calculatedHash, $receivedHash)) {
            return response()->json(['message' => 'Invalid Telegram signature.'], 401);
        }

        $authDate = isset($data['auth_date']) ? (int) $data['auth_date'] : 0;
        if (!$authDate || abs(time() - $authDate) > 86400) {
            return response()->json(['message' => 'Telegram initData expired.'], 401);
        }

        $telegramUser = isset($data['user']) ? json_decode($data['user'], true) : null;
        if (!is_array($telegramUser) || empty($telegramUser['id'])) {
            return response()->json(['message' => 'Telegram user data missing.'], 401);
        }

        $user = User::updateOrCreate(
            ['telegram_id' => (int) $telegramUser['id']],
            [
                'username' => $telegramUser['username'] ?? null,
                'first_name' => $telegramUser['first_name'] ?? null,
                'last_name' => $telegramUser['last_name'] ?? null,
                'photo_url' => $telegramUser['photo_url'] ?? null,
            ]
        );

        $request->setUserResolver(fn () => $user);
        return $next($request);
    }
}
