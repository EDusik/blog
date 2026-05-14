export function getSiteUrlString(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    const withProto = vercel.startsWith("http") ? vercel : `https://${vercel}`;
    return withProto.replace(/\/$/, "");
  }
  return "http://localhost:3000";
}

export function getMetadataBase(): URL {
  const base = getSiteUrlString();
  return new URL(base.endsWith("/") ? base : `${base}/`);
}
