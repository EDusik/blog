export const locales = ["pt-BR", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

const defaultContentSourceLocale: Locale = "pt-BR";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function getContentSourceLocale(): Locale {
  const raw =
    typeof process !== "undefined"
      ? process.env.CONTENT_SOURCE_LOCALE?.trim()
      : undefined;
  if (raw && isLocale(raw)) return raw;
  return defaultContentSourceLocale;
}
