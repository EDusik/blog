import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { Feed } from "@/components/post/feed";
import { getPosts } from "@/lib/content/load-posts";
import { getDictionary } from "@/lib/dictionary";
import { isLocale, locales, type Locale } from "@/lib/locales";
import { alternateLanguagesForHome, homePath, keywordsForHome } from "@/lib/seo";
import type { PostSummary } from "@/types";

const HOME_TAGLINE = "Notes on code, tools, and habits";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: raw } = await params;
  if (!isLocale(raw)) return {};
  const lang = raw as Locale;
  const posts = await getPosts(lang);
  const t = getDictionary(lang);
  const path = homePath(lang);
  const desc = `${t.ui.noteCount(posts.length)} · ${HOME_TAGLINE}`;
  const ogLocale = lang === "pt-BR" ? "pt_BR" : "en_US";
  return {
    title: "notes",
    description: desc,
    keywords: keywordsForHome(posts),
    alternates: {
      canonical: path,
      languages: alternateLanguagesForHome(),
    },
    openGraph: {
      type: "website",
      locale: ogLocale,
      url: path,
      title: t.ui.siteTitle,
      description: desc,
    },
    twitter: {
      card: "summary",
      title: t.ui.siteTitle,
      description: desc,
    },
  };
}

function FeedFallback() {
  return (
    <p
      style={{
        fontFamily: "var(--mono)",
        color: "var(--text-mute)",
        fontSize: 13,
      }}
    >
      …
    </p>
  );
}

export default async function LangHomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  if (!isLocale(raw)) notFound();
  const lang = raw as Locale;
  const full = await getPosts(lang);
  const posts: PostSummary[] = full.map(
    ({ id, date, minutes, tags, title, excerpt }) => ({
      id,
      date,
      minutes,
      tags,
      title,
      excerpt,
    })
  );

  return (
    <Suspense fallback={<FeedFallback />}>
      <Feed lang={lang} posts={posts} />
    </Suspense>
  );
}
