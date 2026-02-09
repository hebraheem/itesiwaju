import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const intlMiddleware = createIntlMiddleware(routing);

export default auth((req) => {
  const token = req.auth;
  const isLoggedIn = !!token;
  const { pathname } = req.nextUrl;

  // Dashboard routes
  const isDashboardRoute = pathname.match(/^\/(en|yo|fr|de)\/dashboard/);

  if (!isLoggedIn && isDashboardRoute) {
    const locale = pathname.split("/")[1];
    return NextResponse.redirect(new URL(`/${locale}/login`, req.url));
  }

  if (isLoggedIn && pathname.match(/^\/(en|yo|fr|de)\/(login|register)$/)) {
    const locale = pathname.split("/")[1];
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, req.url));
  }

  // Apply intl middleware
  return intlMiddleware(req);
});

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
