// SIGN UP ROUTE LOGIC
/*
v1:


"use server";

import { pool } from "@/lib/db/pool";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";

interface SignUpData {
  full_name: string;
  email: string;
  username: string;
  password: string;
}

export async function POST(req: NextRequest) {
  const { full_name, email, username, password }: SignUpData = await req.json();
  const client = await pool.connect();

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const id = uuid();
    const timeStamp = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
    });

    const result = await client.query(
      "INSERT INTO users (id, full_name, email, username, password, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $6) RETURNING id;",
      [id, full_name, email, username, hashedPassword, timeStamp],
    );

    if (!result.rows[0].id) {
      return NextResponse.json(
        { message: "Unable to create user" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { message: "Sign Up Successful" },
      { status: 201 },
    );
  } catch (error) {
    console.log("Could not insert data: ", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}

*/

"use server";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema/user";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";

interface SignUpData {
  full_name: string;
  email: string;
  username: string;
  password: string;
}

export async function POST(req: NextRequest) {
  const { full_name, email, username, password }: SignUpData = await req.json();

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const now = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
    });
    const id = uuid();

    const result = await db.insert(users).values({
      id,
      fullName: full_name,
      email,
      username,
      password: hashedPassword,
      createdAt: now,
      updatedAt: now
    }).returning({ id: users.id });

    if (!result[0]?.id) {
      return NextResponse.json(
        { message: "Unable to create user" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { message: "Sign Up Successful" },
      { status: 201 },
    );
  } catch (error) {
    console.error("Could not insert data: ", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
