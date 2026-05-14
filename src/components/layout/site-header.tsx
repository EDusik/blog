"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { SearchIcon } from "@/components/ui/icons";
import { SiteSearchModal } from "@/components/ui/site-search-modal";
import type { Locale } from "@/lib/locales";
import { setLangCookieClient } from "@/lib/lang-cookie";
import type { PostSummary } from "@/types";
import { usePostTitle } from "@/components/post/post-title-context";

type Props = {
  lang: Locale;
  siteTitle: string;
  langLabel: string;
  postsForSearch: PostSummary[];
  searchNotes: string;
  searchPlaceholder: string;
  searchNoResults: string;
  searchClose: string;
  searchResultsNav: string;
};

export function SiteHeader({
  lang,
  siteTitle,
  langLabel,
  postsForSearch,
  searchNotes,
  searchPlaceholder,
  searchNoResults,
  searchClose,
  searchResultsNav,
}: Props) {
  const pathname = usePathname() ?? "";
  const suffix = pathname.replace(/^\/(pt-BR|en)/, "") || "";
  const { postTitle } = usePostTitle();
  const [searchOpen, setSearchOpen] = useState(false);
  const searchTriggerRef = useRef<HTMLButtonElement>(null);

  const closeSearch = useCallback((reason: "dismiss" | "select") => {
    setSearchOpen(false);
    if (reason === "dismiss") {
      queueMicrotask(() => searchTriggerRef.current?.focus());
    }
  }, []);
  const prevPathname = useRef(pathname);

  useEffect(() => {
    if (prevPathname.current === pathname) return;
    prevPathname.current = pathname;
    if (searchOpen) queueMicrotask(() => setSearchOpen(false));
  }, [pathname, searchOpen]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.key !== "k") return;
      const t = e.target;
      if (!(t instanceof HTMLElement)) return;
      if (t.isContentEditable) return;
      if (t.tagName === "TEXTAREA" || t.tagName === "SELECT") return;
      if (t.tagName === "INPUT") {
        const el = t as HTMLInputElement;
        if (el.closest(".search-panel")) {
          e.preventDefault();
          queueMicrotask(() => el.focus());
          return;
        }
        if (el.type !== "checkbox" && el.type !== "radio" && el.type !== "file") return;
      }
      e.preventDefault();
      setSearchOpen((wasOpen) => {
        if (wasOpen) {
          queueMicrotask(() => {
            document
              .querySelector<HTMLInputElement>(".search-panel .search-input")
              ?.focus();
          });
        }
        return true;
      });
    };
    window.addEventListener("keydown", down);
    return () => window.removeEventListener("keydown", down);
  }, []);

  return (
    <header className="site-header">
      <div className="brand">
        <span className="brand-mark" aria-hidden="true" />
        <Link href={`/${lang}`} className="brand-name" prefetch>
          {siteTitle}
        </Link>
        {postTitle ? <span className="brand-tagline">/ {postTitle}</span> : null}
      </div>
      <div className="header-tools">
        <div className="lang-toggle" role="group" aria-label={langLabel}>
          <Link
            href={`/pt-BR${suffix}`}
            className={lang === "pt-BR" ? "active" : ""}
            onClick={() => setLangCookieClient("pt-BR")}
            prefetch
            aria-current={lang === "pt-BR" ? "page" : undefined}
          >
            PT
          </Link>
          <span className="sep" aria-hidden="true" />
          <Link
            href={`/en${suffix}`}
            className={lang === "en" ? "active" : ""}
            onClick={() => setLangCookieClient("en")}
            prefetch
            aria-current={lang === "en" ? "page" : undefined}
          >
            EN
          </Link>
        </div>
        <button
          ref={searchTriggerRef}
          type="button"
          className="search-trigger"
          onClick={() => setSearchOpen(true)}
          aria-label={searchNotes}
          aria-expanded={searchOpen}
          aria-haspopup="dialog"
          title={searchNotes}
        >
          <SearchIcon />
        </button>
      </div>
      <SiteSearchModal
        open={searchOpen}
        onClose={closeSearch}
        lang={lang}
        posts={postsForSearch}
        searchNotes={searchNotes}
        searchPlaceholder={searchPlaceholder}
        searchNoResults={searchNoResults}
        searchClose={searchClose}
        searchResultsNav={searchResultsNav}
      />
    </header>
  );
}
