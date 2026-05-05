"use client";

import { useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getDictionary } from "@/lib/dictionary";
import type { Locale } from "@/lib/locales";
import { tagEquals } from "@/lib/tags";
import type { PostSummary } from "@/lib/types";
import { PostCard } from "./post-card";

type Props = {
  lang: Locale;
  posts: PostSummary[];
};

export function Feed({ lang, posts }: Props) {
  const t = getDictionary(lang);
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTag = searchParams.get("tag");

  const displayActiveTag = useMemo(() => {
    if (!activeTag) return null;
    for (const p of posts) {
      const hit = p.tags.find((t) => tagEquals(t, activeTag));
      if (hit) return hit;
    }
    return activeTag;
  }, [activeTag, posts]);

  const filtered = useMemo(() => {
    if (!activeTag) return posts;
    return posts.filter((p) => p.tags.some((t) => tagEquals(t, activeTag)));
  }, [activeTag, posts]);

  const handleTagClick = useCallback(
    (tag: string) => {
      const next = activeTag && tagEquals(activeTag, tag) ? null : tag;
      const url = next
        ? `/${lang}?tag=${encodeURIComponent(next)}`
        : `/${lang}`;
      router.replace(url, { scroll: false });
    },
    [activeTag, lang, router],
  );

  const clearTag = useCallback(() => {
    router.replace(`/${lang}`, { scroll: false });
  }, [lang, router]);

  return (
    <div>
      <h1 className="section-title">
        <span>{t.ui.recent}</span>
        <span className="count">{t.ui.noteCount(filtered.length)}</span>
      </h1>

      {activeTag && displayActiveTag ? (
        <div className="filter-bar" role="status">
          <span>{t.ui.filterBy}</span>
          <span className="current-tag">#{displayActiveTag}</span>
          <button
            type="button"
            className="clear"
            onClick={clearTag}
            aria-label={t.ui.clearFilterAria}
          >
            × {t.ui.clear}
          </button>
        </div>
      ) : null}

      <div className="feed">
        {filtered.length === 0 ? (
          <div
            style={{
              color: "var(--text-mute)",
              fontFamily: "var(--mono)",
              fontSize: 13,
              padding: "20px 0",
            }}
          >
            {t.ui.empty}
          </div>
        ) : (
          filtered.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              lang={lang}
              ui={t.ui}
              activeTag={activeTag}
              onTagClick={handleTagClick}
            />
          ))
        )}
      </div>
    </div>
  );
}
