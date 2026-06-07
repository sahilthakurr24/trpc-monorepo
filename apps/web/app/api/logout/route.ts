import { NextResponse } from "next/server";

const AUTH_COOKIE_NAME = "authentication-token";

export async function POST() {
  const response = NextResponse.json({ success: true });

  response.cookies.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "lax",
    secure: false,
  });

  return response;
}
