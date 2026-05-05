"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Locale } from "@/lib/locales";
import type { PostSummary } from "@/lib/types";

type Props = {
  open: boolean;
  onClose: (reason: "dismiss" | "select") => void;
  lang: Locale;
  posts: PostSummary[];
  searchNotes: string;
  searchPlaceholder: string;
  searchNoResults: string;
  searchClose: string;
  searchResultsNav: string;
};

function normalizeQuery(q: string): string {
  return q.trim().toLowerCase();
}

function scorePost(post: PostSummary, q: string): number {
  if (!q) return 0;
  const title = post.title.toLowerCase();
  const excerpt = post.excerpt.toLowerCase();
  if (title.includes(q)) return 300;
  if (post.tags.some((t) => t.toLowerCase().includes(q))) return 200;
  if (excerpt.includes(q)) return 100;
  return -1;
}

function highlightMatches(text: string, q: string): ReactNode {
  const nq = normalizeQuery(q);
  if (!nq) return text;
  const lower = text.toLowerCase();
  const nodes: ReactNode[] = [];
  let from = 0;
  let key = 0;
  while (from < text.length) {
    const at = lower.indexOf(nq, from);
    if (at === -1) {
      nodes.push(text.slice(from));
      break;
    }
    if (at > from) nodes.push(text.slice(from, at));
    nodes.push(
      <mark className="search-highlight" key={`m-${key++}`}>
        {text.slice(at, at + nq.length)}
      </mark>,
    );
    from = at + nq.length;
  }
  return nodes;
}

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function SiteSearchModal({
  open,
  onClose,
  lang,
  posts,
  searchNotes,
  searchPlaceholder,
  searchNoResults,
  searchClose,
  searchResultsNav,
}: Props) {
  const titleId = useId();
  const resultsId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");

  const q = useMemo(() => normalizeQuery(query), [query]);

  const rows = useMemo(() => {
    if (!q) return posts;
    const scored = posts
      .map((post) => ({ post, score: scorePost(post, q) }))
      .filter((x) => x.score >= 0)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (a.post.date < b.post.date) return 1;
        if (a.post.date > b.post.date) return -1;
        return 0;
      });
    return scored.map((x) => x.post);
  }, [posts, q]);

  const getFocusable = useCallback(() => {
    const root = panelRef.current;
    if (!root) return [];
    return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE));
  }, []);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    inputRef.current?.select();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose("dismiss");
        return;
      }
      if (e.key !== "Tab") return;
      const list = getFocusable();
      if (list.length === 0) return;
      const first = list[0];
      const last = list[list.length - 1];
      const active = document.activeElement;
      if (e.shiftKey) {
        if (active === first || !panelRef.current?.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else if (active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, getFocusable]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="search-backdrop"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose("dismiss");
      }}
    >
      <div
        ref={panelRef}
        className="search-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="search-panel-head">
          <h2 id={titleId} className="search-panel-title">
            {searchNotes}
          </h2>
          <button
            type="button"
            className="search-close"
            onClick={() => onClose("dismiss")}
            aria-label={searchClose}
          >
            ×
          </button>
        </div>
        <input
          ref={inputRef}
          type="search"
          className="search-input"
          placeholder={searchPlaceholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoComplete="off"
          spellCheck={false}
          aria-label={searchPlaceholder}
          aria-controls={resultsId}
        />
        <ul
          id={resultsId}
          className="search-results search-results-list"
          aria-label={searchResultsNav}
        >
          {rows.length === 0 ? (
            <li className="search-results-li search-empty" role="status">
              {searchNoResults}
            </li>
          ) : (
            rows.map((post) => (
              <li key={post.id} className="search-results-li">
                <Link
                  href={`/${lang}/post/${post.id}`}
                  className="search-row"
                  onClick={() => onClose("select")}
                >
                  <div className="search-row-title">
                    {q ? highlightMatches(post.title, query) : post.title}
                  </div>
                  {post.excerpt ? (
                    <div className="search-row-snippet">
                      {q ? highlightMatches(post.excerpt, query) : post.excerpt}
                    </div>
                  ) : null}
                  {post.tags.length > 0 ? (
                    <div className="search-row-tags">
                      {post.tags.map((tag) => (
                        <span key={tag} className="tag search-row-tag">
                          {q ? highlightMatches(tag, query) : tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </Link>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
