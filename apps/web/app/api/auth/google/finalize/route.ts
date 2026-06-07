import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE_NAME = "authentication-token";
const ONE_MINUTE = 60 * 1000;
const ONE_HOUR = 60 * ONE_MINUTE;
const ONE_DAY = 24 * ONE_HOUR;
const ONE_MONTH = 30 * ONE_DAY;
const ONE_YEAR = 12 * ONE_MONTH;

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/signin?error=google_oauth_failed", request.url));
  }

  const response = NextResponse.redirect(new URL("/dashboard", request.url));
  response.cookies.set(AUTH_COOKIE_NAME, token, {
    path: "/",
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: ONE_YEAR,
  });

  return response;
}
