import type { Locale } from "./locales";

export const LANG_COOKIE = "blog-lang";

export function setLangCookieClient(lang: Locale) {
  if (typeof document === "undefined") return;
  document.cookie = `${LANG_COOKIE}=${lang};path=/;max-age=31536000;SameSite=Lax`;
}
