
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ topicId: string }> }
) {
  try {
    const { topicId } = await ctx.params;
    const sid = Number(req.nextUrl.searchParams.get('studentId'));

    if (!Number.isInteger(sid) || sid < 1) {
      return NextResponse.json(
        { error: 'Student session missing.' },
        { status: 400 }
      );
    }

    const qr = await sql`
      SELECT id, title
      FROM quizzes
      WHERE topic_id = ${topicId} AND is_published = TRUE
    `;

    if (!qr.length) {
      return NextResponse.json(
        { error: 'No published quiz.' },
        { status: 404 }
      );
    }

    const quiz = qr[0] as { id: string; title: string };

    const attempts = await sql`
      SELECT score_percentage, answers
      FROM quiz_attempts
      WHERE student_id = ${sid} AND quiz_id = ${quiz.id}
      LIMIT 1
    `;

    const alreadyAttempted = attempts.length > 0;

    if (alreadyAttempted) {
      const questions = await sql`
        SELECT id, question, options, correct_answer
        FROM quiz_questions
        WHERE quiz_id = ${quiz.id}
        ORDER BY display_order, id
      `;

      const savedAnswers = (
        attempts[0].answers || {}
      ) as Record<string, string>;

      const review = questions.map((q) => ({
        id: q.id,
        question: q.question,
        options: q.options,
        correct_answer: String(q.correct_answer),
        selected_answer: String(savedAnswers[String(q.id)] || ''),
      }));

      return NextResponse.json({
        quiz,
        alreadyAttempted: true,
        previousScore: Number(attempts[0].score_percentage),
        review,
      });
    }
    console.log("Quiz lookup topicId:", topicId);

    const questions = await sql`
      SELECT id, question, options
      FROM quiz_questions
      WHERE quiz_id = ${quiz.id}
      ORDER BY display_order, id
    `;

    console.log("Received topic ID:", topicId);
    console.log("Quiz query result:", qr);

    return NextResponse.json({
      quiz,
      alreadyAttempted: false,
      questions,
    });
  } catch {
    return NextResponse.json(
      { error: 'Could not load quiz.' },
      { status: 500 }
    );
  }
}
