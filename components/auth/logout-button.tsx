'use client';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useState } from 'react';

export function LogoutButton() {
  const supabase = createBrowserSupabaseClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    toast.success('Logout efetuado com sucesso!');
    router.push('/login');
  };

  return (
    <Button
      className="w-full cursor-pointer"
      onClick={handleLogout}
      disabled={loading}
    >
      {loading && <Spinner className="mr-2" />}
      Log out
    </Button>
  );
}
