// CREATING AND SESSION WITH JWT

import "server-only";

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const secret = new TextEncoder().encode(process.env.NEXT_SESSION_SECRET);

const cookie = {
  name: "session",
  options: { httpOnly: true, secure: true, sameSite: "lax", path: "/" },
  duration: 24 * 60 * 60 * 1000,
};

export async function encrypt(payload: any) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1day")
    .sign(secret);
}

export async function decrypt(session: any) {
  try {
    const { payload } = await jwtVerify(session, secret, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch (error) {
    return null;
  }
}

export async function createSession(userId: any) {
  const expires = new Date(Date.now() + cookie.duration);
  const session = await encrypt({ userId, expires });

  (await cookies()).set(cookie.name, session, {
    ...cookie.options,
    expires,
    sameSite: "lax",
  });
}

export async function verifySession() {
  const seshcookie = (await cookies()).get(cookie.name)?.value;
  const session = await decrypt(seshcookie);
  if (!session?.userId) {
    redirect("/start");
  }

  return { userId: session.userId };
}

export async function deleteSession() {
  (await cookies()).delete(cookie.name);
  redirect("/sign-in");
}
