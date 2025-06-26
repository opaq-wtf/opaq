"use server";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema/user";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";
import { tokenGen } from "@/actions/token-gen";

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
    const now = new Date();
    const id = uuid();

    const result = await db
      .insert(users)
      .values({
        id,
        fullName: full_name,
        email,
        username,
        password: hashedPassword,
        createdAt: now,
        updatedAt: now,
      })
      .returning({ id: users.id });

    if (!result[0]?.id) {
      return NextResponse.json(
        { message: "Unable to create user" },
        { status: 400 },
      );
    }

    await tokenGen(id, email, full_name);

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
