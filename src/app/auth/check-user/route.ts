import { pool } from "@/lib/db/pool";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const client = await pool.connect();

  try {
    const { username } = await req.json();

    const result = await client.query(
      "SELECT username FROM users WHERE username = $1 LIMIT 1;",
      [username],
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ exists: false }, { status: 200 });
    }

    return NextResponse.json({ exists: true }, { status: 200 });
  } catch {}
}
