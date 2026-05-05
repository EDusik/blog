# EDusik — notes & blog

A small, fast personal site built with **Next.js** (App Router). Posts live as Markdown on disk with front matter; **pt-BR** and **English** URLs share one content tree, with on-demand translation when the viewer’s locale differs from how a note was written.

---

## Features

|                 |                                                                                                   |
| --------------: | ------------------------------------------------------------------------------------------------- |
|     **Content** | Markdown + [gray-matter](https://github.com/jonschlinkert/gray-matter) front matter, Git-friendly |
|     **Locales** | `pt-BR` (default) and `en`; `/` redirects to `/{lang}` (cookie-backed preference where set)       |
| **Translation** | Optional OpenAI, or MyMemory fallback; results cached under `.translate-cache/`                   |
|   **Discovery** | In-site search across titles and excerpts                                                         |
|   **Reader UX** | GFM Markdown, wiki-style links between notes, tags from `#hashtags` and `[[links]]`               |
|         **PWA** | Service worker registered in production                                                           |

---

## Technologies

| Layer | Stack |
| ----- | ----- |
| **Framework** | [Next.js](https://nextjs.org/) 16 (App Router), [React](https://react.dev/) 19 |
| **Language** | [TypeScript](https://www.typescriptlang.org/) 5 |
| **Content** | Markdown on disk · [gray-matter](https://github.com/jonschlinkert/gray-matter) (front matter) · [react-markdown](https://github.com/remarkjs/react-markdown) + [remark-gfm](https://github.com/remarkjs/remark-gfm) (GFM) |
| **i18n & translation** | Locale routing + dictionary strings · [OpenAI](https://platform.openai.com/) Chat Completions (optional) · [MyMemory](https://mymemory.translated.net/) (fallback) · on-disk cache (`.translate-cache/`) |
| **Tooling** | [ESLint](https://eslint.org/) 9 · [eslint-config-next](https://www.npmjs.com/package/eslint-config-next) |

Typography (loaded in the root layout): **Inter**, **Geist Mono**, **JetBrains Mono**, **IBM Plex Mono**, **Fira Code** (Google Fonts).

---

## Prerequisites

- **Node.js** 20+ (recommended for current Next.js releases)
- **npm**, **pnpm**, **yarn**, or **bun** — examples below use `npm`

---

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you’ll be redirected to `http://localhost:3000/pt-BR` unless a saved language applies.

Production build:

```bash
npm run build
npm start
```

---

## Writing posts

1. Put a `.md` file in `content/<source-locale>/` (see **Environment** for `CONTENT_SOURCE_LOCALE`).
2. The URL slug is the **filename without** `.md` (e.g. `keyboard.md` → `/pt-BR/post/keyboard`).
3. **Front matter** (YAML between `---` lines):

```yaml
---
title: Title shown in listings and OG
date: 2026-03-12 # ISO date
tags:
  - one-tag
  - another
excerpt: Optional short blurb for cards and search
minutes: # Optional; otherwise estimated from word count
contentLang: pt-BR # Optional override if prose language ≠ folder locale
---
```

Body is standard Markdown (**GFM**). Code fences are stripped when inferring hashtags so examples don’t pollute tags.

**Links between notes:** use wikilinks, e.g. `[[keyboard]]` or `[[Displayed title|actual-slug]]`, matching another post’s file slug.

---

## Environment variables

| Variable                 | Required   | Purpose                                                                                            |
| ------------------------ | ---------- | -------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`   | Production | Canonical base URL (sitemap, Open Graph, JSON-LD). Falls back to `VERCEL_URL` or localhost.        |
| `CONTENT_SOURCE_LOCALE`  | No         | `pt-BR` or `en` — which folder under `content/` is the **source** for all posts. Default: `pt-BR`. |
| `OPENAI_API_KEY`         | No         | If set, translation uses OpenAI; on failure it falls back to MyMemory.                             |
| `OPENAI_TRANSLATE_MODEL` | No         | Model id (default `gpt-4o-mini`).                                                                  |

Translation cache is written to **`.translate-cache/`** (gitignored). Copying the cache across deploys avoids repeat API calls.

---

## Project layout

```
content/                 # Markdown sources (by locale folder)
src/
  app/                   # Routes, layouts, metadata, sitemap, robots
  components/            # UI (header, feed, post, search, …)
  lib/
    content/load-posts.ts   # Read & normalize posts
    translate.ts            # Cross-locale body translation
    locales.ts, dictionary.ts
middleware.ts           # Redirect `/` → `/{locale}`
legacy/                  # Older site/materials (see legacy/README.md)
```

---

## Scripts

| Command         | Description             |
| --------------- | ----------------------- |
| `npm run dev`   | Development server      |
| `npm run build` | Production build        |
| `npm run start` | Serve production output |
| `npm run lint`  | ESLint (Next.js config) |

---

## Deploy notes

- Set **`NEXT_PUBLIC_SITE_URL`** to your public HTTPS origin.
- **`OPENAI_API_KEY`** improves translation quality; without it the app uses MyMemory (free tier limits apply).
- The service worker is only active when **`NODE_ENV=production`**.

---

## Agent / contributor note

This repo targets a **recent Next.js** generation with API and conventions that may differ from older docs. If you use automation or AI-assisted edits, skim **`AGENTS.md`** and Next’s shipped docs under `node_modules/next/dist/docs/` before large changes.
