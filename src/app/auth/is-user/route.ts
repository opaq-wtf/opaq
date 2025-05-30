import { pool } from "@/lib/db/pool";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const client = await pool.connect();

  try {
    const { identifier } = await req.json();

    const result = await pool.query(
      "SELECT id FROM users WHERE email = $1 OR username = $1 LIMIT 1;",
      [identifier],
    );

    if (result.rows.length !== 0) {
      return NextResponse.json({ exists: true }, { status: 200 });
    }

    return NextResponse.json({ exists: false }, { status: 200 });
  } catch (error) {
    console.error("Database query failed: ", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}
