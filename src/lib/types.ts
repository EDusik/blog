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
