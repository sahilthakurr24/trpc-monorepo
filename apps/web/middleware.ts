import { NextResponse, type NextRequest } from "next/server";

const AUTH_COOKIE_NAME = "authentication-token";
const AUTH_ROUTES = ["/signin", "/signup"];
const PROTECTED_ROUTE_PREFIXES = ["/dashboard"];

function isAuthRoute(pathname: string) {
  return AUTH_ROUTES.includes(pathname);
}

function isProtectedRoute(pathname: string) {
  return PROTECTED_ROUTE_PREFIXES.some(
    (routePrefix) => pathname === routePrefix || pathname.startsWith(`${routePrefix}/`),
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthenticated = Boolean(request.cookies.get(AUTH_COOKIE_NAME)?.value);

  if (isProtectedRoute(pathname) && !isAuthenticated) {
    const signInUrl = new URL("/signin", request.url);
    signInUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(signInUrl);
  }

  if (isAuthRoute(pathname) && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
