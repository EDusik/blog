"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type PostTitleContextValue = {
  postTitle: string | null;
  setPostTitle: (title: string | null) => void;
};

const PostTitleContext = createContext<PostTitleContextValue | null>(null);

export function PostTitleProvider({ children }: { children: ReactNode }) {
  const [postTitle, setPostTitle] = useState<string | null>(null);
  const value = useMemo(() => ({ postTitle, setPostTitle }), [postTitle, setPostTitle]);
  return (
    <PostTitleContext.Provider value={value}>{children}</PostTitleContext.Provider>
  );
}

export function usePostTitle(): PostTitleContextValue {
  const ctx = useContext(PostTitleContext);
  if (!ctx) {
    return { postTitle: null, setPostTitle: () => {} };
  }
  return ctx;
}
