import {redirect} from 'next/navigation';import {isTeacher} from '@/lib/auth';import Dashboard from './dashboard';
export const dynamic='force-dynamic';
export default async function TeacherPage(){if(!await isTeacher())redirect('/teacher/login');return <Dashboard/>;}
