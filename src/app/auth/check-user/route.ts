/*
v1

import { pool } from "@/lib/db/pool";
import { NextRequest, NextResponse } from "next/server";

interface UsernameData {
  username: string;
}

export async function POST(req: NextRequest) {
  const { username }: UsernameData = await req.json();

  const client = await pool.connect();

  try {
    const result = await client.query(
      "SELECT username FROM users WHERE username = $1 LIMIT 1;",
      [username],
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ exists: false }, { status: 200 });
    }

    return NextResponse.json({ exists: true }, { status: 200 });
  } catch (error) {
    console.log("Could not fetch data from database: ", error);
    return NextResponse.json(
      { message: "Internal Server Error." },
      { status: 500 },
    );
  }
}
*/

// CHECKING IF A CERTAIN username EXISTS OR NOT

import { db } from "@/lib/db"; // Import your Drizzle db instance
import { users } from "@/lib/db/schema/user"; // Import your users schema
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

interface UsernameData {
  username: string;
}

export async function POST(req: NextRequest) {
  const { username }: UsernameData = await req.json();

  try {
    const result = await db
      .select({ username: users.username })
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json({ exists: false }, { status: 200 });
    }

    return NextResponse.json({ exists: true }, { status: 200 });
  } catch (error) {
    console.log("Could not fetch data from database: ", error);
    return NextResponse.json(
      { message: "Internal Server Error." },
      { status: 500 },
    );
  }
}
