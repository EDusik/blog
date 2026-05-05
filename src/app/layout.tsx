import type { Metadata } from "next";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import { getMetadataBase } from "@/lib/site-url";
import "./globals.css";

const defaultTitle = "EDusik — notas e blog · Eduardo Dusik";
const defaultDescription =
  "Blog e notas de Eduardo Dusik, desenvolvedor front-end e engineer: código, ferramentas e hábitos. Developer notes.";

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  applicationName: "EDusik",
  title: {
    default: defaultTitle,
    template: "EDusik / %s",
  },
  description: defaultDescription,
  robots: { index: true, follow: true },
  keywords: [
    "notas",
    "blog",
    "Eduardo Dusik",
    "EDusik",
    "desenvolvedor",
    "developer",
    "front-end",
    "frontend",
    "engineer",
    "programer",
    "programmer",
    "notes",
  ],
  authors: [{ name: "Eduardo Dusik" }],
  creator: "Eduardo Dusik",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "EDusik",
    title: defaultTitle,
    description: defaultDescription,
  },
  twitter: {
    card: "summary",
    title: defaultTitle,
    description: defaultDescription,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- mono stack + tweak options match legacy Google bundle */}
        <link
          href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500&family=Geist+Mono:wght@400;500&family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
