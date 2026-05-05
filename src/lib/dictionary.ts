import type { Dictionary } from "./types";
import type { Locale } from "./locales";

function datePtBR(iso: string): string {
  const [y, m, day] = iso.split("-").map(Number);
  const d = new Date(y, m - 1, day);
  const meses = [
    "jan",
    "fev",
    "mar",
    "abr",
    "mai",
    "jun",
    "jul",
    "ago",
    "set",
    "out",
    "nov",
    "dez",
  ];
  return `${String(d.getDate()).padStart(2, "0")} ${meses[d.getMonth()]} ${d.getFullYear()}`;
}

function dateEn(iso: string): string {
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

const ptBR: Dictionary = {
  ui: {
    siteTitle: "EDusik",
    recent: "notas recentes",
    readingTime: "min de leitura",
    backlinks: "referenciado em",
    tags: "tags",
    allTags: "todas as tags",
    filterBy: "filtrando por",
    clear: "limpar",
    clearFilterAria: "Limpar filtro de tag",
    listenSpeedLabel: "velocidade",
    listenEtaAria: "Tempo estimado restante da leitura em voz alta: {{time}} (aproximado).",
    listenEtaApprox: "aprox.",
    listenToggleAria: (title: string) => `Reproduzir nota em voz alta: ${title}`,
    listenPauseAria: "Pausar leitura em voz alta",
    listenResumeAria: "Retomar leitura em voz alta",
    skipToContent: "Pular para o conteúdo",
    searchResultsNav: "Resultados da busca",
    tagFilterAria: (tag: string) => `Filtrar notas pela tag ${tag}`,
    networkStatus: {
      pending: "verificando conexão",
      offline: "sem conexão",
      good: "conexão boa",
      medium: "conexão instável",
      bad: "conexão lenta",
    },
    footer: "",
    langLabel: "idioma",
    empty: "nenhuma nota com essa tag.",
    searchNotes: "buscar notas",
    searchPlaceholder: "título, tag ou trecho…",
    searchNoResults: "nenhum resultado.",
    searchClose: "fechar busca",
    date: datePtBR,
    noteCount: (n: number) => `${n} ${n === 1 ? "nota" : "notas"}`,
  },
};

const en: Dictionary = {
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
    listenSpeedLabel: "speed",
    listenEtaAria: "Estimated time remaining for audio playback: {{time}} (approximate).",
    listenEtaApprox: "approx.",
    listenToggleAria: (title: string) => `Play audio for note: ${title}`,
    listenPauseAria: "Pause audio playback",
    listenResumeAria: "Resume audio playback",
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
    date: dateEn,
    noteCount: (n: number) => `${n} ${n === 1 ? "note" : "notes"}`,
  },
};

const byLang: Record<Locale, Dictionary> = {
  "pt-BR": ptBR,
  en,
};

export function getDictionary(lang: Locale): Dictionary {
  return byLang[lang];
}
