import { createServerClient } from '@supabase/ssr';
import { cookies, headers } from 'next/headers';

// Server-side client you can call inside server components or actions
export const createServerSupabaseClient = () =>
  createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: async () => {
          const cs: unknown = await cookies();
          // some runtimes return a CookieStore-like object with get()/set()/delete()
          if (cs && typeof (cs as { getAll?: unknown }).getAll === 'function') {
            const g = (
              cs as { getAll: () => Array<{ name: string; value: string }> }
            ).getAll();
            return g.map((c) => ({
              name: c.name,
              value: c.value,
              options: {},
            }));
          }
          // otherwise fall back to raw header parsing; many stores only support get()/set()
          try {
            let hdr = '';
            const h = await headers();
            if (h && typeof h.get === 'function') {
              hdr = h.get('cookie') || '';
            } else if (h && 'cookie' in h) {
              hdr = (h as { cookie?: string }).cookie || '';
            }
            return hdr
              .split(';')
              .map((part) => {
                const [name, ...vals] = part.split('=');
                return {
                  name: name.trim(),
                  value: vals.join('=').trim(),
                  options: {},
                };
              })
              .filter((c) => c.name);
          } catch (e) {
            console.warn('unable to parse cookie header', e);
            return [];
          }
        },
        setAll: (_cookies: unknown) => {
          // no-op: server components rarely set cookies, middleware handles writes
        },
      },
    }
  );
