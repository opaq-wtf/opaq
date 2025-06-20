// DO NOT TOUCH THIS FILE AT ANY COST!!!!!
// NO MODIFICATIONS ARE TO BE DONE UNLESS THEY ARE DONE BY TEJA(SHOYO)

import { decrypt } from "@/lib/session";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const header = req.headers.get("x-forwarded-for");
  const ip = header?.split(",")[0] || "Unknown IP";

  const timeStamp = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour12: true,
  });

  const method = req.method;
  const path = req.nextUrl.pathname;

  const log = `[Access Log] - (${timeStamp}) ${path} [${method}] --> ${ip}`;

  fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/log`,
    {
      method: "POST",
      body: JSON.stringify({ message: log }),
      headers: { "Content-Type": "application/json" },
    },
  ).catch((e) => console.error("Log send failed: ", e));

  const currentPath = req.nextUrl.pathname;

  const protectedRoutes = ["/dashboard", '/home']; // Need to create the dashboard route
  const publicRoutes = ["/", "/sign-in", "/sign-up", '/start', '/about'];

  const normalizePath = currentPath.toLowerCase();
  const isDynamicRoute = /^\/[a-zA-Z0-9._]+$/.test(normalizePath); //Path for profiles like /user /user123 /user_123 /user.123

  const isProtectedRoute =
    protectedRoutes.includes(currentPath) || isDynamicRoute;
  const isPublicRoute = publicRoutes.includes(currentPath);

  if (isProtectedRoute) {
    const cookie = (await cookies()).get("session")?.value;
    const session = await decrypt(cookie);

    if (!isPublicRoute && !session?.userId) {
      return NextResponse.redirect(new URL("/start", req.nextUrl));
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
  matcher: ["/((?!_next/static|_next/image|favicon.ico|logo.svg|retro.gif|api/log).*)"],
};
