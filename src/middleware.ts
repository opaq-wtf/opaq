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

  const protectedRoutes = ["/profile"];
  const publicPath = ["/", "/sign-up", "sign-in"];
  const currentPath = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.includes(currentPath);
  const isPublicPath = publicPath.includes(currentPath);

  const session = (await cookies()).get("accessToken")?.value;

  if (isProtectedRoute) {
    if (!session) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }
    return NextResponse.next();
  }
  if (isPublicPath) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/log).*)"],
};
