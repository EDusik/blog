export const locales = ["pt-BR", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "pt-BR";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/**
 * Markdown vive só em `content/<locale>/`. Outros idiomas do site são preenchidos via `translateBetween`.
 * Opcional: `CONTENT_SOURCE_LOCALE=pt-BR` ou `en` no ambiente.
 */
export function getContentSourceLocale(): Locale {
  const raw =
    typeof process !== "undefined" ? process.env.CONTENT_SOURCE_LOCALE?.trim() : undefined;
  if (raw && isLocale(raw)) return raw;
  return defaultLocale;
}
