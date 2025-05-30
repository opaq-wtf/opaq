import { NextResponse } from "next/server";

export function setAuthCookies(
  res: NextResponse,
  accessToken: string,
  refreshToken: string,
) {
  if (res.status === 200) {
    res.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60,
    });

    res.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
  }
}
