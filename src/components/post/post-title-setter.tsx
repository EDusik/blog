"use client";

import { useLayoutEffect } from "react";

import { usePostTitle } from "./post-title-context";

export function PostTitleSetter({ title }: { title: string }) {
  const { setPostTitle } = usePostTitle();
  useLayoutEffect(() => {
    setPostTitle(title);
    return () => setPostTitle(null);
  }, [title, setPostTitle]);
  return null;
}
