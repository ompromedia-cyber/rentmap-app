<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class TranslationController extends Controller
{
    public function translate(Request $request)
    {
        $validated = $request->validate([
            'target' => ['required', 'string', 'in:ru,en,vi,hi,si,ta,mr,gom'],
            'texts' => ['required', 'array', 'max:100'],
            'texts.*' => ['nullable', 'string', 'max:3000'],
        ]);

        $texts = array_values($validated['texts']);
        $totalLength = array_sum(array_map(static fn ($text) => mb_strlen((string) $text), $texts));
        if ($totalLength > 50000) {
            return response()->json(['message' => 'Too much text in one request.'], 422);
        }

        $apiKey = config('app.google_translate_key');
        if (!$apiKey) {
            return response()->json(['message' => 'Translation is not configured.'], 503);
        }

        $target = $validated['target'];
        $result = $texts;
        $missing = [];
        $indexes = [];

        foreach ($texts as $index => $text) {
            if (trim((string) $text) === '') {
                $result[$index] = $text;
                continue;
            }

            $cacheKey = 'listing-translation:' . $target . ':' . sha1($text);
            $cached = Cache::get($cacheKey);
            if (is_string($cached)) {
                $result[$index] = $cached;
                continue;
            }

            $missing[$cacheKey] = $text;
            $indexes[$cacheKey][] = $index;
        }

        foreach (array_chunk($missing, 100, true) as $chunk) {
            try {
                $response = Http::timeout(15)->post(
                    'https://translation.googleapis.com/language/translate/v2?key=' . urlencode($apiKey),
                    ['q' => array_values($chunk), 'target' => $target, 'format' => 'text']
                );
            } catch (\Throwable $e) {
                report($e);
                return response()->json(['message' => 'Translation provider is temporarily unavailable.'], 502);
            }

            if (!$response->successful()) {
                return response()->json(['message' => 'Translation provider returned an error.'], 502);
            }

            $translations = $response->json('data.translations', []);
            if (count($translations) !== count($chunk)) {
                return response()->json(['message' => 'Unexpected translation response.'], 502);
            }

            $position = 0;
            foreach ($chunk as $cacheKey => $originalText) {
                $translated = html_entity_decode(
                    (string) ($translations[$position]['translatedText'] ?? $originalText),
                    ENT_QUOTES | ENT_HTML5,
                    'UTF-8'
                );
                Cache::put($cacheKey, $translated, now()->addDays(30));
                foreach ($indexes[$cacheKey] ?? [] as $index) {
                    $result[$index] = $translated;
                }
                $position++;
            }
        }

        return response()->json(['translations' => $result]);
    }
}
