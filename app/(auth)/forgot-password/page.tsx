export const dynamic = 'force-dynamic';

import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function ForgotPasswordPage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect('/private');
  }

  return <ForgotPasswordForm />;
}
