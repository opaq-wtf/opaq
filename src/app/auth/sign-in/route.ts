import { pool } from "@/lib/db/pool";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { signAccessToken, singRefreshToken } from "@/lib/auth/jwt";
import { setAuthCookies } from "@/lib/auth/cookies";

export async function POST(req: NextRequest) {
  const client = await pool.connect();

  try {
    const body = await req.json();
    const { identifier, password } = body;

    const result = await client.query(
      "SELECT id, username, password FROM users WHERE email = $1 OR username = $1 LIMIT 1;",
      [identifier],
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 },
      );
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { message: "Invalid Credentials" },
        { status: 401 },
      );
    }

    const accessToken = signAccessToken({ userId: user.userId });
    const refreshToken = singRefreshToken({ userId: user.userId });

    const res = NextResponse.json(
      { message: "Login Successful" },
      { status: 200 },
    );
    setAuthCookies(res, accessToken, refreshToken);
    return res;
  } catch (err) {
    console.error("Login error: ", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}
