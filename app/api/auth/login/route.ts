import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function POST(req: Request) {
  // build a response early so the cookie helper in `server.ts` can write to it
  const res = NextResponse.next();

  try {
    const body = await req.json();
    const { email, password } = body || {};
    console.info('[api/auth/login] called', { email });
    if (!email || !password)
      return NextResponse.json(
        { error: 'email and password required' },
        { status: 400 }
      );

    const supabase = createServerSupabaseClient(res);
    const { data, error } = (await supabase.auth.signInWithPassword({
      email,
      password,
    })) as any;

    if (error) {
      const status = (error as any)?.status || 400;
      const errMsg = String(
        ((error as any) && (error as any).message) ?? String(error)
      );
      console.error('supabase signInWithPassword error', {
        message: errMsg,
        raw: error,
      });
      return NextResponse.json({ error: errMsg, status }, { status });
    }

    // the `res` object now contains any cookies set by Supabase, return it
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    console.error('login api error', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
