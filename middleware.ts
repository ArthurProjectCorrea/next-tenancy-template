import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  // build middleware client with cookie helpers
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
              // NextResponse cookies API automatically serializes options
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

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // optionally verify user authenticity; we only care if a session exists for now
  // could call supabase.auth.getUser() here if you need the user object

  const isPrivatePath = req.nextUrl.pathname.startsWith('/private');
  const isAuthPath = req.nextUrl.pathname.startsWith('/login');

  if (!session && isPrivatePath) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirectedFrom', req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  if (session && isAuthPath) {
    return NextResponse.redirect(new URL('/private', req.url));
  }

  return res;
}

export const config = {
  matcher: ['/private/:path*', '/login'],
};
