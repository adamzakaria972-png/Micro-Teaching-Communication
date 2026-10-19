
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const sid = Number(body.studentId);
    const tid = String(body.topicId || '');
    const answers = (body.answers || {}) as Record<string, string>;

    if (!Number.isInteger(sid) || sid < 1 || !tid) {
      return NextResponse.json(
        { error: 'Invalid student or topic.' },
        { status: 400 }
      );
    }

    const qz = await sql`
      SELECT id
      FROM quizzes
      WHERE topic_id = ${tid} AND is_published = TRUE
    `;

    if (!qz.length) {
      return NextResponse.json(
        { error: 'No published quiz.' },
        { status: 404 }
      );
    }

    const qid = String(qz[0].id);

    const prior = await sql`
      SELECT id
      FROM quiz_attempts
      WHERE student_id = ${sid} AND quiz_id = ${qid}
      LIMIT 1
    `;

    if (prior.length) {
      return NextResponse.json(
        { error: 'This quiz has already been attempted.' },
        { status: 409 }
      );
    }

    const qs = await sql`
      SELECT id, question, options, correct_answer
      FROM quiz_questions
      WHERE quiz_id = ${qid}
      ORDER BY display_order, id
    `;

    if (!qs.length) {
      return NextResponse.json(
        { error: 'Quiz has no questions.' },
        { status: 400 }
      );
    }

    const questions = qs as {
      id: number;
      question: string;
      options: { value: string; label: string }[];
      correct_answer: string;
    }[];

    let correct = 0;

    for (const q of questions) {
      if (
        String(answers[String(q.id)] || '') ===
        String(q.correct_answer)
      ) {
        correct++;
      }
    }

    const total = questions.length;
    const score = Number(((correct / total) * 100).toFixed(2));

    const saved = await sql`
      INSERT INTO quiz_attempts (
        student_id,
        quiz_id,
        correct_answers,
        total_questions,
        score_percentage,
        answers
      )
      VALUES (
        ${sid},
        ${qid},
        ${correct},
        ${total},
        ${score},
        ${JSON.stringify(answers)}::jsonb
      )
      ON CONFLICT (student_id, quiz_id) DO NOTHING
      RETURNING id
    `;

    if (!saved.length) {
      return NextResponse.json(
        { error: 'This quiz has already been attempted.' },
        { status: 409 }
      );
    }

    const review = questions.map((q) => ({
      id: q.id,
      question: q.question,
      options: q.options,
      selected_answer: String(answers[String(q.id)] || ''),
      correct_answer: String(q.correct_answer),
    }));

    return NextResponse.json({
      success: true,
      correctAnswers: correct,
      totalQuestions: total,
      scorePercentage: score,
      review,
    });
  } catch {
    return NextResponse.json(
      { error: 'Could not submit quiz.' },
      { status: 500 }
    );
  }
}
