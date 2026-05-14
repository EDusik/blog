import type { Dictionary } from "@/types";
import type { Locale } from "./locales";

function formatDate(iso: string): string {
  const [y, m, day] = iso.split("-").map(Number);
  const d = new Date(y, m - 1, day);
  const months = [
    "jan",
    "feb",
    "mar",
    "apr",
    "may",
    "jun",
    "jul",
    "aug",
    "sep",
    "oct",
    "nov",
    "dec",
  ];
  return `${months[d.getMonth()]} ${String(d.getDate()).padStart(2, "0")}, ${d.getFullYear()}`;
}

const shared: Dictionary = {
  ui: {
    siteTitle: "EDusik",
    recent: "recent notes",
    readingTime: "min read",
    backlinks: "referenced in",
    tags: "tags",
    allTags: "all tags",
    filterBy: "filtering by",
    clear: "clear",
    clearFilterAria: "Clear tag filter",
    skipToContent: "Skip to content",
    searchResultsNav: "Search results",
    tagFilterAria: (tag: string) => `Filter notes by tag ${tag}`,
    networkStatus: {
      pending: "checking connection",
      offline: "offline",
      good: "good connection",
      medium: "unstable connection",
      bad: "slow connection",
    },
    footer: "",
    langLabel: "language",
    empty: "no notes with this tag.",
    searchNotes: "search notes",
    searchPlaceholder: "title, tag, or excerpt…",
    searchNoResults: "no results.",
    searchClose: "close search",
    syncedLabel: "synced",
    date: formatDate,
    noteCount: (n: number) => `${n} ${n === 1 ? "note" : "notes"}`,
  },
};

const byLang: Record<Locale, Dictionary> = {
  "pt-BR": shared,
  en: shared,
};

export function getDictionary(lang: Locale): Dictionary {
  return byLang[lang];
}
