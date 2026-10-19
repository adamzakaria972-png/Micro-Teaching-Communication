import { NextResponse } from 'next/server';
import { isTeacher } from '@/lib/auth';
export async function teacherGuard() { return await isTeacher() ? null : NextResponse.json({ error: 'Teacher login required.' }, { status: 401 }); }
