// SIGN IN ROUTE LOGIC

import { pool } from "@/lib/db/pool";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { createSession } from "@/lib/session";

interface SingInData {
  identifier: string;
  password: string;
}

export async function POST(req: NextRequest) {
  const { identifier, password }: SingInData = await req.json();

  const client = await pool.connect();

  try {
    const result = await client.query(
      "SELECT * FROM users WHERE email = $1 OR username = $1 LIMIT 1;",
      [identifier],
    );

    if (result.rows.length === 0 || null) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      result.rows[0].password,
    );

    if (!passwordMatch) {
      return NextResponse.json(
        { message: "Incorrect Password" },
        { status: 401 },
      );
    }

    const userId = result.rows[0].id;
    const username = result.rows[0].username;
    await createSession(userId);

    return NextResponse.json(
      { message: "Sign In successful", username },
      { status: 200 },
    );
  } catch (error) {
    console.log("Some issue occured: ", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
