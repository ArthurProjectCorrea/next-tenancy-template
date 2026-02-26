import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function POST(req: Request) {
  const res = NextResponse.next();

  try {
    const body = await req.json();
    const { email, token, type } = body || {};
    const mask = (s: unknown) => {
      if (!s) return undefined;
      const str = String(s);
      if (str.length <= 4) return '****';
      return `${str.slice(0, 2)}...${str.slice(-2)}`;
    };
    console.info('[api/auth/verify] called', {
      email,
      token: mask(token),
      type,
    });
    if (!email || !token || !type)
      return NextResponse.json(
        { error: 'email, token and type required' },
        { status: 400 }
      );

    const supabase = createServerSupabaseClient(res);
    const { data, error } = (await supabase.auth.verifyOtp({
      email,
      token,
      type,
    })) as any;
    if (error) {
      const status = (error as any)?.status || 400;
      const errMsg = String(
        ((error as any) && (error as any).message) ?? String(error)
      );
      console.error('supabase verifyOtp error', {
        message: errMsg,
        raw: error,
      });
      return NextResponse.json({ error: errMsg, status }, { status });
    }

    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }

    return NextResponse.json({ ok: true, data });
  } catch (err) {
    console.error('verify otp error', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
