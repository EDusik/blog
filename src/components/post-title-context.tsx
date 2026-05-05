"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type PostTitleContextValue = {
  postTitle: string | null;
  setPostTitle: (title: string | null) => void;
};

const PostTitleContext = createContext<PostTitleContextValue | null>(null);

export function PostTitleProvider({ children }: { children: ReactNode }) {
  const [postTitle, setPostTitleState] = useState<string | null>(null);
  const setPostTitle = useCallback((title: string | null) => {
    setPostTitleState(title);
  }, []);
  const value = useMemo(
    () => ({ postTitle, setPostTitle }),
    [postTitle, setPostTitle],
  );
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
