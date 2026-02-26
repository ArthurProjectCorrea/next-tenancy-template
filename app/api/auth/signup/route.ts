import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function POST(req: Request) {
  const res = NextResponse.next();

  try {
    const body = await req.json();
    const { name, password } = body || {};
    let { email } = body || {};
    email = typeof email === 'string' ? email.trim().toLowerCase() : email;
    console.info('[api/auth/signup] called', { name, email });
    if (!email || !password)
      return NextResponse.json(
        { error: 'email and password required' },
        { status: 400 }
      );

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      console.warn('[api/auth/signup] rejected invalid email format', email);
      return NextResponse.json(
        { error: 'invalid email format' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient(res);
    const { data, error } = (await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    } as any)) as any;

    if (error) {
      const status = (error as any)?.status || 400;
      const errMsg = String(
        ((error as any) && (error as any).message) ?? String(error)
      );
      console.error('supabase signUp error', { message: errMsg, raw: error });
      return NextResponse.json({ error: errMsg, status }, { status });
    }

    if (data?.session) {
      await supabase.auth.signOut();
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('signup api error', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
