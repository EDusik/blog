import Link from "next/link";

import { ArrowBack } from "@/components/ui/icons";
import type { Locale } from "@/lib/locales";
import type { Post, UiStrings } from "@/types";

import { PostBodyMarkdown } from "./post-body-markdown";
import { PostTitleSetter } from "./post-title-setter";

type Props = {
  post: Post;
  lang: Locale;
  ui: Pick<UiStrings, "recent" | "readingTime" | "date">;
};

export function PostDetail({ post, lang, ui }: Props) {
  return (
    <article className="post-detail">
      <PostTitleSetter title={post.title} />
      <Link className="back-link" href={`/${lang}`}>
        <ArrowBack /> {ui.recent}
      </Link>
      <h1>{post.title}</h1>
      <div className="post-meta">
        <span>{ui.date(post.date)}</span>
        <span className="dot" aria-hidden="true" />
        <span>
          {post.minutes} {ui.readingTime}
        </span>
      </div>
      <PostBodyMarkdown markdown={post.bodyMarkdown} />
      <div className="post-tags" style={{ marginTop: 40 }}>
        {post.tags.map((tag) => (
          <Link
            key={tag}
            href={`/${lang}?tag=${encodeURIComponent(tag)}`}
            className="tag"
            scroll={false}
          >
            {tag}
          </Link>
        ))}
      </div>
    </article>
  );
}
