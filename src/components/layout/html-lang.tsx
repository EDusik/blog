"use client";

import { useEffect } from "react";

import type { Locale } from "@/lib/locales";

export function HtmlLang({ lang }: { lang: Locale }) {
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  return null;
}
