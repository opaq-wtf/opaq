import { cookies } from "next/headers";
import { signAccessToken, verifyRefreshToken } from "@/lib/auth/jwt";
import { NextResponse } from "next/server";

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;

  if (!refreshToken) {
    return NextResponse.json({ message: "No refresh token" }, { status: 401 });
  }

  try {
    const decoded = verifyRefreshToken(refreshToken) as any;
    const newAccessToken = signAccessToken({ userId: decoded.userId });

    cookieStore.set("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60,
    });

    return NextResponse.json({ message: "Token refreshed." }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { message: "Invalid Refresh Token." },
      { status: 403 },
    );
  }
}
