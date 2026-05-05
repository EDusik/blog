import type { Locale } from "@/lib/locales";
import type { Post, PostArticleClientUi } from "@/lib/types";
import { PostTitleSetter } from "./post-title-setter";
import { PostArticleClient } from "./post-article-client";

type Props = {
  post: Post;
  lang: Locale;
  ui: PostArticleClientUi;
};

export function PostDetail({ post, lang, ui }: Props) {
  return (
    <>
      <PostTitleSetter title={post.title} />
      <PostArticleClient post={post} lang={lang} ui={ui} />
    </>
  );
}
