import type { Metadata } from "next";

import { ServiceWorkerRegister } from "@/components/layout/service-worker-register";
import { getMetadataBase } from "@/lib/site-url";
import "@/styles/globals.scss";

const defaultTitle = "EDusik — notes and blog · Eduardo Dusik";
const defaultDescription =
  "Notes and blog by Eduardo Dusik, front-end developer and engineer: code, tools, and habits.";

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
    "blog",
    "Eduardo Dusik",
    "EDusik",
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
    locale: "en_US",
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
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
