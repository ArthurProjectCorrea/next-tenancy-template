'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

export function LoginToastHandler() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const success = searchParams.get('login');
    const error = searchParams.get('error');

    if (success === 'success') {
      toast.success('Login efetuado com sucesso!');
    }
    if (error) {
      toast.error(error);
    }
  }, [searchParams]);

  return null;
}
