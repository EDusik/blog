import type { Locale } from "./locales";

/** Effective speech rate at `utterance.rate === 1` (chars/s), tuned for TTS—adjust by ear. */
const BASE_CHARS_PER_SECOND: Record<Locale, number> = {
  "pt-BR": 14,
  en: 15,
};

/**
 * Rough duration of speaking `text` at the given utterance rate.
 * Shorter when `rate` > 1.
 */
export function estimateSpeechDurationSeconds(text: string, rate: number, locale: Locale): number {
  const len = text.length;
  if (len === 0) return 0;
  const cps = BASE_CHARS_PER_SECOND[locale] ?? 14;
  const safeRate = Math.max(0.1, Math.min(rate, 10));
  return len / cps / safeRate;
}

/**
 * Scale total estimated duration by boundary progress (`charIndex` / `utteranceLength`).
 */
export function remainingFromCharIndex(
  estimatedTotalSeconds: number,
  charIndex: number,
  utteranceLength: number,
): number {
  if (utteranceLength <= 0) return 0;
  const progress = Math.min(1, Math.max(0, charIndex / utteranceLength));
  return Math.max(0, estimatedTotalSeconds * (1 - progress));
}
