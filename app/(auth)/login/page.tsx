export const dynamic = 'force-dynamic';

import { LoginForm } from '@/components/auth/login-form';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function LoginPage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect('/private');
  }

  return <LoginForm />;
}
