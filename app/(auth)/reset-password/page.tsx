'use client';
export const dynamic = 'force-dynamic';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';

// the page is client-only so we can access browser session and search params
export default function ResetPasswordPage() {
  const router = useRouter();

  // email query param is only used for display/flow debugging

  // ensure a valid session exists before showing the form
  useEffect(() => {
    const checkSession = async () => {
      const supabase = createBrowserSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace('/login');
      }
    };
    checkSession();
  }, [router]);

  return <ResetPasswordForm />;
}
