import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
const COOKIE = 'mt_teacher_session';
function key() {
 const s = process.env.AUTH_SECRET;
 if (!s || s.length < 32) throw new Error('AUTH_SECRET must be at least 32 characters');
 return new TextEncoder().encode(s);
}
export async function createSession() {
 const token = await new SignJWT({ role: 'teacher' }).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('8h').sign(key());
 (await cookies()).set(COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 28800 });
}
export async function clearSession() { (await cookies()).set(COOKIE, '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 0 }); }
export async function isTeacher() {
 try { const token = (await cookies()).get(COOKIE)?.value; if (!token) return false; const { payload } = await jwtVerify(token, key()); return payload.role === 'teacher'; } catch { return false; }
}
