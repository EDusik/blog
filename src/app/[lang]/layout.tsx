import { notFound } from "next/navigation";
import { HtmlLang } from "@/components/html-lang";
import { SiteFooter } from "@/components/site-footer";
import { PostTitleProvider } from "@/components/post-title-context";
import { SiteHeader } from "@/components/site-header";
import { TweaksHost } from "@/components/tweaks-host";
import { getPosts } from "@/lib/content/load-posts";
import { getDictionary } from "@/lib/dictionary";
import { isLocale, type Locale } from "@/lib/locales";
import type { PostSummary } from "@/lib/types";

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  if (!isLocale(raw)) notFound();
  const lang = raw as Locale;
  const t = getDictionary(lang);
  const syncedLabel = lang === "pt-BR" ? "sincronizado" : "synced";
  const full = await getPosts(lang);
  const postsForSearch: PostSummary[] = full.map(
    ({ id, date, minutes, tags, title, excerpt }) => ({
      id,
      date,
      minutes,
      tags,
      title,
      excerpt,
    }),
  );

  return (
    <>
      <HtmlLang lang={lang} />
      <TweaksHost />
      <div className="shell">
        <a href="#main-content" className="skip-link">
          {t.ui.skipToContent}
        </a>
        <PostTitleProvider>
          <SiteHeader
            lang={lang}
            siteTitle={t.ui.siteTitle}
            langLabel={t.ui.langLabel}
            postsForSearch={postsForSearch}
            searchNotes={t.ui.searchNotes}
            searchPlaceholder={t.ui.searchPlaceholder}
            searchNoResults={t.ui.searchNoResults}
            searchClose={t.ui.searchClose}
            searchResultsNav={t.ui.searchResultsNav}
          />
          <main id="main-content" tabIndex={-1}>
            {children}
          </main>
        </PostTitleProvider>
        <SiteFooter
          footer={t.ui.footer}
          syncedLabel={syncedLabel}
          networkStatus={t.ui.networkStatus}
        />
      </div>
    </>
  );
}
