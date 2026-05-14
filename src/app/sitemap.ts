import type { MetadataRoute } from "next";

import { getAllPostIds, getPost } from "@/lib/content/load-posts";
import { defaultLocale } from "@/lib/locales";
import {
  absoluteUrl,
  alternateLanguagesForHome,
  alternateLanguagesForPost,
  homePath,
  postPath,
} from "@/lib/seo";

function lastModFromDate(isoDate: string): Date {
  const t = Date.parse(`${isoDate}T12:00:00.000Z`);
  return Number.isFinite(t) ? new Date(t) : new Date();
}

function toAbsoluteLanguageMap(relativeByLang: Record<string, string>) {
  const languages: Record<string, string> = {};
  for (const [code, path] of Object.entries(relativeByLang)) {
    languages[code] = absoluteUrl(path);
  }
  return languages;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const ids = await getAllPostIds();
  const entries: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl(homePath(defaultLocale)),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
      alternates: {
        languages: toAbsoluteLanguageMap(alternateLanguagesForHome()),
      },
    },
  ];

  for (const id of ids) {
    const post = await getPost(defaultLocale, id);
    if (!post) continue;
    entries.push({
      url: absoluteUrl(postPath(defaultLocale, id)),
      lastModified: lastModFromDate(post.date),
      changeFrequency: "monthly",
      priority: 0.85,
      alternates: {
        languages: toAbsoluteLanguageMap(alternateLanguagesForPost(id)),
      },
    });
  }

  return entries;
}
