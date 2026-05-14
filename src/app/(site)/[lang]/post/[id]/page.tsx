import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PostArticleJsonLd } from "@/components/post/post-article-json-ld";
import { PostDetail } from "@/components/post/post-detail";
import { getAllPostIds, getPost } from "@/lib/content/load-posts";
import { getDictionary } from "@/lib/dictionary";
import { isLocale, locales, type Locale } from "@/lib/locales";
import { alternateLanguagesForPost, keywordsForPost, postPath } from "@/lib/seo";

type PageProps = {
  params: Promise<{ lang: string; id: string }>;
};

export async function generateStaticParams() {
  const ids = await getAllPostIds();
  return locales.flatMap((lang) => ids.map((id) => ({ lang, id })));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang: raw, id } = await params;
  if (!isLocale(raw)) return {};
  const lang = raw as Locale;
  const post = await getPost(lang, id);
  if (!post) return {};
  const path = postPath(lang, id);
  const ogLocale = lang === "pt-BR" ? "pt_BR" : "en_US";
  const publishedTime = `${post.date}T12:00:00.000Z`;
  return {
    title: post.title,
    description: post.excerpt || undefined,
    keywords: keywordsForPost(post),
    alternates: {
      canonical: path,
      languages: alternateLanguagesForPost(id),
    },
    openGraph: {
      type: "article",
      locale: ogLocale,
      url: path,
      title: post.title,
      description: post.excerpt || undefined,
      publishedTime,
      authors: ["Eduardo Dusik"],
      tags: post.tags,
      section: post.tags[0],
    },
    twitter: {
      card: "summary",
      title: post.title,
      description: post.excerpt || undefined,
    },
  };
}

export default async function PostPage({ params }: PageProps) {
  const { lang: raw, id } = await params;
  if (!isLocale(raw)) notFound();
  const lang = raw as Locale;
  const post = await getPost(lang, id);
  if (!post) notFound();
  const t = getDictionary(lang);

  return (
    <>
      <PostArticleJsonLd post={post} lang={lang} />
      <PostDetail post={post} lang={lang} ui={t.ui} />
    </>
  );
}
