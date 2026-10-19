
import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { createSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const username =
      typeof body.username === "string" ? body.username.trim() : "";
    const password =
      typeof body.password === "string" ? body.password : "";

    if (!username || !password) {
      return NextResponse.json(
        { error: "Enter your username and password." },
        { status: 400 }
      );
    }

    const rows = await sql`
      SELECT id, full_name, username, password_hash
      FROM teachers
      WHERE username = ${username}
      LIMIT 1
    `;

    const teacher = rows[0];

    if (
      !teacher ||
      teacher.password_hash !== password
    ) {
      return NextResponse.json(
        { error: "Incorrect username or password." },
        { status: 401 }
      );
    }

    await createSession();

    return NextResponse.json({
      success: true,
      teacher: {
        fullName: teacher.full_name,
        username: teacher.username,
      },
    });
  } catch (error) {
    console.error("Teacher login failed:", error);
    return NextResponse.json(
      { error: "Could not sign in. Check the server configuration." },
      { status: 500 }
    );
  }
}
