import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { LANG_COOKIE } from "./lib/lang-cookie";
import { defaultLocale, isLocale } from "./lib/locales";

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === "/") {
    const cookie = request.cookies.get(LANG_COOKIE)?.value;
    const lang = cookie && isLocale(cookie) ? cookie : defaultLocale;
    const res = NextResponse.redirect(new URL(`/${lang}`, request.url));
    res.headers.set("Cache-Control", "no-store");
    return res;
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/"],
};
