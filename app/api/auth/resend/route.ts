import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function POST(req: Request) {
  const res = NextResponse.next();

  try {
    const body = await req.json();
    const { email } = body || {};
    console.info('[api/auth/resend] called', { email });
    if (!email)
      return NextResponse.json({ error: 'email required' }, { status: 400 });

    const supabase = createServerSupabaseClient(res);
    const { error } = (await supabase.auth.resend({
      type: 'signup',
      email,
    })) as any;
    if (error) {
      const status = (error as any)?.status || 400;
      const errMsg = String(
        ((error as any) && (error as any).message) ?? String(error)
      );
      console.error('supabase resend error', { message: errMsg, raw: error });
      return NextResponse.json({ error: errMsg, status }, { status });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('resend otp error', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
