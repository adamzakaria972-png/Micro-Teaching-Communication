# Complete Microteaching Communication

This project includes a student learning interface, a single-teacher dashboard, editable topics/quizzes/activities, and student reports using Neon PostgreSQL.

## Safe setup
1. Extract this ZIP into a NEW folder. Do not overwrite or delete your old project.
2. Copy `.env.example` to `.env.local`; use the same `DATABASE_URL` as your current app.
3. Set a private `TEACHER_USERNAME`, strong `TEACHER_PASSWORD`, and `AUTH_SECRET` (at least 32 random characters).
4. In Neon SQL Editor, select the correct project, branch and database, then run `database/migrations/001_teacher_dashboard.sql` once. Make a Neon backup branch first.
5. In PowerShell run `npm.cmd install`, then `npm.cmd run dev`. Open http://localhost:3000.
6. Teacher login is at `/teacher/login`. Never commit `.env.local`.

The migration adds content tables and does not drop the five existing tables: students, login_history, reading_progress, quiz_attempts, activity_submissions. If the unique quiz-attempt index fails due to duplicate historical records, inspect duplicates before retrying.

Student entry is name-only and does not verify identity. Activity confirmation records a student's statement that they uploaded work; it does not verify the Google Drive file. Do not treat these records as identity-verified/high-stakes assessment without stronger student authentication.

When tested, merge/push changes to your existing GitHub repository and Vercel will redeploy if connected. Add DATABASE_URL, TEACHER_USERNAME, TEACHER_PASSWORD and AUTH_SECRET to Vercel Environment Variables.
