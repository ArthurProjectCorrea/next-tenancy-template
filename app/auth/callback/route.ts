import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET(req: NextRequest) {
  // build a response we can mutate with cookies later
  // default destination after handling provider response
  const urlObj = new URL(req.url);
  const fallback = '/private';
  const requested = urlObj.searchParams.get('redirectedFrom');
  const destination = requested ? requested : fallback;
  // build redirect URL with success flag (cookie set happens later)
  const destUrl = new URL(destination, req.url);
  destUrl.searchParams.set('login', 'success');
  const res = NextResponse.redirect(destUrl);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () =>
          req.cookies
            .getAll()
            .map((c) => ({ name: c.name, value: c.value, options: {} })),
        setAll: (cookies) => {
          cookies.forEach(
            (c: {
              name: string;
              value: string;
              options?: Record<string, unknown>;
            }) => {
              res.cookies.set(
                c.name,
                c.value,
                c.options as Record<string, unknown>
              );
            }
          );
        },
      },
    }
  );

  const url = new URL(req.url);
  const errorParam = url.searchParams.get('error');
  // if the callback carried an explicit redirect target, keep it for later
  const redirectTarget = url.searchParams.get('redirectedFrom');

  if (errorParam) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('error', errorParam);
    if (redirectTarget) {
      loginUrl.searchParams.set('redirectedFrom', redirectTarget);
    }
    return NextResponse.redirect(loginUrl);
  }

  const code = url.searchParams.get('code');
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error('OAuth exchange failed', error);
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('error', error.message);
      if (redirectTarget) {
        loginUrl.searchParams.set('redirectedFrom', redirectTarget);
      }
      return NextResponse.redirect(loginUrl);
    }
  }

  return res;
}
