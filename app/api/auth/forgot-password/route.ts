import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function POST(req: Request) {
  const res = NextResponse.next();

  try {
    const body = await req.json();
    let { email } = body || {};
    email = typeof email === 'string' ? email.trim().toLowerCase() : email;
    console.info('[api/auth/forgot-password] called', { email });
    if (!email)
      return NextResponse.json({ error: 'email required' }, { status: 400 });

    const supabase = createServerSupabaseClient(res);
    // the supabase-js types don't expose resetPasswordForEmail on the
    // main client, so cast to any. the method will send a recovery email
    // use the dedicated recovery endpoint so Supabase treats this as a
    // password reset request. by default the email will contain a link; to
    // switch to a numeric OTP change the *Reset password* template in the
    // dashboard so it includes `{{ .Token }}` instead of
    // `{{ .ConfirmationURL }}`.
    const { data, error } = (await supabase.auth.resetPasswordForEmail(
      email
    )) as any; // types are narrow so cast to any

    if (error) {
      const status = (error as any)?.status || 400;
      const errMsg = String(
        ((error as any) && (error as any).message) ?? String(error)
      );
      console.error('supabase resetPasswordForEmail error', {
        message: errMsg,
        raw: error,
      });
      return NextResponse.json({ error: errMsg, status }, { status });
    }

    return NextResponse.json({ ok: true, data });
  } catch (err) {
    console.error('forgot-password api error', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
