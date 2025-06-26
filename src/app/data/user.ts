import { db } from "@/lib/db";
import { users } from "@/lib/db/schema/user";
import { getSession, verifySession } from "@/lib/session";
import { cache } from "react";
import { eq } from "drizzle-orm";

export const getUserByUsername = cache(async (username: string) => {
  await verifySession();

  const result = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  const user = result[0];
  return user ? userDTO(user) : null;
});

export const getUser = cache(async () => {
  const session = await verifySession();

  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, session.userId as string))
    .limit(1);

  const user = result[0];
  if (!user) throw new Error('User not found.');

  return userDTO(user);
})

export const getUserOptional = cache(async () => {
  const session = await getSession();

  if (!session?.userId) {
    return null;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, session.userId as string))
    .limit(1);

  const user = result[0];
  return user ? userDTO(user) : null;
});

function userDTO(user: any) {
  return {
    id: user.id,
    full_name: user.full_name,
    username: user.username,
  };
}
