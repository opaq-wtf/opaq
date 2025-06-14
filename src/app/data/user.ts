import { pool } from "@/lib/db/pool";
import { verifySession } from "@/lib/session";
import { cache } from "react";

export const getUserByUsername = cache(async (username: string) => {
  await verifySession();
  const client = await pool.connect();
  try {
    const result = await client.query(
      "SELECT * FROM users WHERE username = $1 LIMIT 1;",
      [username],
    );
    const user = result.rows[0];
    return user ? userDTO(user) : null;
  } finally {
    client.release();
  }
});

function userDTO(user: any) {
  return {
    id: user.id,
    full_name: user.full_name,
    username: user.username,
  };
}
