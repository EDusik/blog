"use client";

import Link from "next/link";
import type { Locale } from "@/lib/locales";
import { tagEquals } from "@/lib/tags";
import type { PostSummary, UiStrings } from "@/types";

type Props = {
  post: PostSummary;
  lang: Locale;
  ui: Pick<UiStrings, "date" | "readingTime" | "tagFilterAria">;
  activeTag: string | null;
  onTagClick: (tag: string) => void;
};

export function PostCard({ post, lang, ui, activeTag, onTagClick }: Props) {
  const href = `/${lang}/post/${post.id}`;

  return (
    <article className="post-card">
      <Link href={href} className="post-card-body">
        <div className="post-meta">
          <span>{ui.date(post.date)}</span>
          <span className="dot" aria-hidden="true" />
          <span>
            {post.minutes} {ui.readingTime}
          </span>
        </div>
        <h2 className="post-title">{post.title}</h2>
        <p className="post-excerpt">{post.excerpt}</p>
      </Link>
      <div className="post-tags">
        {post.tags.map((tag) => {
          const isActive = Boolean(activeTag && tagEquals(activeTag, tag));
          return (
            <span
              key={tag}
              className={"tag" + (isActive ? " active" : "")}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onTagClick(tag);
              }}
              role="button"
              tabIndex={0}
              aria-pressed={isActive}
              aria-label={ui.tagFilterAria(tag)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  onTagClick(tag);
                }
              }}
            >
              {tag}
            </span>
          );
        })}
      </div>
    </article>
  );
}
