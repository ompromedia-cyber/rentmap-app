<?php

namespace App\\Http\\Controllers;

use Illuminate\\Http\\Request;
use Illuminate\\Support\\Facades\\Cache;
use Illuminate\\Support\\Facades\\Http;

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

        $target = $validated['target'];
        $result = $texts;

        foreach ($texts as $index => $text) {
            $text = (string) $text;
            if (trim($text) === '') {
                continue;
            }

            $source = $this->detectSourceLanguage($text);
            if ($source === $target || ($target === 'gom' && $source === 'gom')) {
                $result[$index] = $text;
                continue;
            }

            $cacheKey = 'listing-translation:mymemory:' . $source . ':' . $target . ':' . sha1($text);
            $cached = Cache::get($cacheKey);
            if (is_string($cached)) {
                $result[$index] = $cached;
                continue;
            }

            try {
                $translated = $this->translateLongText($text, $source, $target);
            } catch (\\Throwable $e) {
                report($e);
                // Preserve the original listing text if the translation provider is unavailable.
                continue;
            }

            if (is_string($translated) && $translated !== '') {
                $result[$index] = $translated;
                Cache::put($cacheKey, $translated, now()->addDays(30));
            }
        }

        return response()->json(['translations' => $result]);
    }

    private function detectSourceLanguage(string $text): string
    {
        // Detect scripts commonly used by listings in RentMap.
        if (preg_match('/[\\x{0D80}-\\x{0DFF}]/u', $text)) {
            return 'si';
        }
        if (preg_match('/[\\x{0B80}-\\x{0BFF}]/u', $text)) {
            return 'ta';
        }
        if (preg_match('/[\\x{0900}-\\x{097F}]/u', $text)) {
            return 'hi';
        }
        if (preg_match('/[\\x{0400}-\\x{04FF}]/u', $text)) {
            return 'ru';
        }
        if (preg_match('/[\\x{0102}\\x{0103}\\x{0110}\\x{0111}\\x{0128}\\x{0129}\\x{0168}\\x{0169}\\x{01A0}\\x{01A1}\\x{01AF}\\x{01B0}\\x{0300}-\\x{036F}]/u', $text)) {
            return 'vi';
        }

        // MyMemory requires an explicit source language. Latin-script text without
        // Vietnamese-specific marks is treated as English.
        return 'en';
    }

    private function translateLongText(string $text, string $source, string $target): string
    {
        // MyMemory's q parameter is limited to about 500 bytes. Split on word
        // boundaries to stay safely below the limit for UTF-8 text.
        $words = preg_split('/\\s+/u', trim($text), -1, PREG_SPLIT_NO_EMPTY) ?: [];
        $chunks = [];
        $chunk = '';

        foreach ($words as $word) {
            $candidate = $chunk === '' ? $word : $chunk . ' ' . $word;
            if (strlen($candidate) > 450 && $chunk !== '') {
                $chunks[] = $chunk;
                $chunk = $word;
            } else {
                $chunk = $candidate;
            }
        }
        if ($chunk !== '') {
            $chunks[] = $chunk;
        }

        $translatedChunks = [];
        foreach ($chunks as $part) {
            $response = Http::timeout(8)->get('https://api.mymemory.translated.net/get', [
                'q' => $part,
                'langpair' => $source . '|' . $target,
                'mt' => 1,
            ]);

            if (!$response->successful()) {
                throw new \\RuntimeException('MyMemory translation request failed.');
            }

            $translated = $response->json('responseData.translatedText');
            $status = (int) $response->json('responseStatus', 0);
            if (!is_string($translated) || $translated === '' || $status !== 200) {
                throw new \\RuntimeException('MyMemory returned no translation.');
            }

            $translatedChunks[] = html_entity_decode($translated, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        }

        return implode(' ', $translatedChunks);
    }
}
