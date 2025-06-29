// DO NOT TOUCH THIS FILE AT ANY COST!!!!!
// NO MODIFICATIONS ARE TO BE DONE UNLESS THEY ARE DONE BY TEJA(SHOYO)

import { decrypt } from "@/lib/session";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import axios from 'axios';

export async function middleware(req: NextRequest) {
  // Log IP details

  const header = req.headers.get("x-forwarded-for");
  const ip = header?.split(",")[0] || "Unknown IP";

  const timeStamp = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour12: true,
  });

  const method = req.method;
  const path = req.nextUrl.pathname;

  const log = `[Access Log] - (${timeStamp}) ${path} [${method}] --> ${ip}`;

  if (path !== "/api/log") {
    axios.post(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/log`,
      { message: log },
      { headers: { "Content-Type": "application/json" } }
    ).catch((e) => console.error("Log send failed: ", e));
  }

  const currentPath = req.nextUrl.pathname;

  const protectedRoutes = [
    "/home",
    "/wallet",
    "/home",
    "/bloom",
    "/dashboard",
    "/artwall/upload",
    "/artwall",
    "/manifest"
  ];

  const publicRoutes = ["/", "/about", "/guidelines", "/reach",];

  const authRoutes = ["/sign-in", "sign-up", "/forgot-password"];

  const normalizePath = currentPath.toLowerCase();
  const isDynamicRoute = /^\/[a-zA-Z0-9._]+$/.test(normalizePath); //Path for profiles like /user /user123 /user_123 /user.123

  const isProtectedRoute =
    protectedRoutes.includes(currentPath) || isDynamicRoute;
  const isPublicRoute = publicRoutes.includes(currentPath);
  const isAuthRoute = authRoutes.includes(currentPath);

  const cookie = (await cookies()).get("session")?.value;
  const session = await decrypt(cookie);

  if (isAuthRoute && session?.userId) {
    return NextResponse.redirect(new URL("/home", req.nextUrl));
  }

  if (isProtectedRoute) {
    if (!isPublicRoute && !session?.userId) {
      return NextResponse.redirect(new URL("/", req.nextUrl));
    }

    if (
      isPublicRoute &&
      session?.userId &&
      !req.nextUrl.pathname.startsWith("/home")
    ) {
      return NextResponse.redirect(new URL("/home", req.nextUrl));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|logo.svg|retro.gif|api/log).*)",
  ],
};
