import type { Locale } from "@/lib/locales";
import type { Post } from "@/types";
import { absoluteUrl, postPath } from "@/lib/seo";

type Props = {
  post: Post;
  lang: Locale;
};

export function PostArticleJsonLd({ post, lang }: Props) {
  const url = absoluteUrl(postPath(lang, post.id));
  const payload = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt || undefined,
    datePublished: `${post.date}T12:00:00.000Z`,
    inLanguage: lang,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    keywords: post.tags.join(", "),
    author: {
      "@type": "Person",
      name: "Eduardo Dusik",
    },
    publisher: {
      "@type": "Organization",
      name: "EDusik",
    },
    articleSection: post.tags[0],
    wordCount: post.bodyMarkdown.split(/\s+/).filter(Boolean).length,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}
