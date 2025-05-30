import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db/pool";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";

interface SignUpData {
  full_name: string;
  email: string;
  username: string;
  password: string;
}

export async function POST(req: NextRequest) {
  const client = await pool.connect();

  try {
    const body = await req.json();
    const data: SignUpData = body;

    const uuid = uuidv4();
    const id = uuid.split("-")[1];

    const now = new Date().toISOString();

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const result = await client.query(
      "INSERT INTO users (id, full_name, email, username, password, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $6) RETURNING id;",
      [id, data.full_name, data.email, data.username, hashedPassword, now],
    );

    const inserted_row = result.rows[0].id;
    const success = inserted_row === id;

    if (!success) {
      return NextResponse.json(
        { message: "Could not sign up user." },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { message: "Sign Up Successful!" },
      { status: 201 },
    );
  } catch (error) {
    console.error("Could not reach the database: ", error);
    return NextResponse.json(
      { message: "Unable to sign up user" },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}
