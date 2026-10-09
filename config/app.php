<?php

return [
    'name' => env('APP_NAME', 'RentMap'),
    'env' => env('APP_ENV', 'production'),
    'debug' => (bool) env('APP_DEBUG', false),
    'url' => env('APP_URL', 'http://localhost'),
    'timezone' => 'UTC',
    'locale' => 'ru',
    'fallback_locale' => 'ru',
    'key' => env('APP_KEY'),
    'telegram_bot_token' => env('TELEGRAM_BOT_TOKEN'),
    'cipher' => 'AES-256-CBC',
];
