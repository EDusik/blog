export type PostSummary = {
  id: string;
  date: string;
  minutes: number;
  tags: string[];
  title: string;
  excerpt: string;
};

export type Post = PostSummary & {
  bodyMarkdown: string;
};

/** Plain strings only — safe to pass Server → Client Component. */
export type PostArticleClientUi = {
  recent: string;
  formattedDate: string;
  readingTime: string;
  listenSpeedLabel: string;
  listenToggleAria: string;
  listenPauseAria: string;
  listenResumeAria: string;
  /** `{{time}}` is replaced with formatted mm:ss */
  listenEtaAria: string;
  listenEtaApprox: string;
};

export type NetworkQuality = "pending" | "offline" | "good" | "medium" | "bad";

export type UiStrings = {
  siteTitle: string;
  recent: string;
  readingTime: string;
  backlinks: string;
  tags: string;
  allTags: string;
  filterBy: string;
  clear: string;
  clearFilterAria: string;
  listenSpeedLabel: string;
  listenToggleAria: (title: string) => string;
  listenPauseAria: string;
  listenResumeAria: string;
  listenEtaAria: string;
  listenEtaApprox: string;
  skipToContent: string;
  searchResultsNav: string;
  tagFilterAria: (tag: string) => string;
  networkStatus: Record<NetworkQuality, string>;
  footer: string;
  langLabel: string;
  empty: string;
  searchNotes: string;
  searchPlaceholder: string;
  searchNoResults: string;
  searchClose: string;
  date: (iso: string) => string;
  noteCount: (n: number) => string;
};

export type Dictionary = {
  ui: UiStrings;
};
