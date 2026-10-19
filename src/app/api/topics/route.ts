
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    const topics = await sql`
      SELECT
        t.*,

        q.id AS quiz_id,
        q.title AS quiz_title,
        q.is_published AS quiz_published,

        a.id AS activity_id,
        a.title AS activity_title,
        a.instructions AS activity_instructions,
        a.drive_url,
        a.is_published AS activity_published

      FROM topics t

      LEFT JOIN quizzes q
        ON q.topic_id = t.id
        AND q.is_published = TRUE

      LEFT JOIN activities a
        ON a.topic_id = t.id
        AND a.is_published = TRUE

      WHERE t.is_published = TRUE

      ORDER BY t.display_order, t.created_at
    `;

    return NextResponse.json({ topics });
  } catch (error) {
    console.error("Failed to load topics:", error);

    return NextResponse.json(
      { error: "Could not load topics. Please check the database configuration." },
      { status: 500 }
    );
  }
}
