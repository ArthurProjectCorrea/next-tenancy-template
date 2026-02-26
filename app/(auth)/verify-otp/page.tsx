'use client';
export const dynamic = 'force-dynamic';
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect } from 'react';
import { OTPForm } from '@/components/auth/otp-form';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';

export default function VerifyOTPPage() {
  const router = useRouter();
  // client will call server API routes; keep page client-only for hooks

  const [typeParam, setTypeParam] = React.useState<string | null>(null);
  const [email, setEmail] = React.useState<string | null>(null);

  // parse query string on mount
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setTypeParam(params.get('type'));
    setEmail(params.get('email'));
  }, []);

  // redirect back if required params are missing
  useEffect(() => {
    if (typeParam === null || email === null) return; // wait until parsed
    if (!typeParam || !email) {
      router.replace('/signup');
    }
  }, [typeParam, email, router]);

  type SupaFlowType = 'email' | 'recovery' | 'magiclink' | 'invite' | string;

  const mapType = (param: string): SupaFlowType => {
    switch (param) {
      case 'signup':
        return 'email';
      case 'recovery':
        return 'recovery';
      default:
        return param as SupaFlowType;
    }
  };

  const handleSubmit = async (code: string) => {
    if (!email || !typeParam) return;
    const token = String(code || '').trim();
    if (!token) {
      toast.error('Digite o código recebido por e‑mail.');
      return;
    }

    if (!/^[0-9]+$/.test(token)) {
      toast.error('Código inválido. Use apenas números.');
      return;
    }

    const supaType = mapType(typeParam);
    const supabase = createBrowserSupabaseClient();

    try {
      const { data, error } = (await supabase.auth.verifyOtp({
        email,
        token,
        // supabase types are narrow; cast to any so our union is acceptable
        type: supaType as any,
      })) as any;

      if (error) {
        const status = (error as any)?.status;
        if (status === 403) {
          toast.error('A requisição foi recusada (403).');
        } else {
          toast.error(
            String((error as any)?.message ?? 'Código inválido ou expirado')
          );
        }
        return;
      }

      if (data?.session && typeParam === 'signup') {
        // prevent automatic login after sign‑up confirmation
        await supabase.auth.signOut();
      }

      // route based on the flow type
      if (typeParam === 'signup' || typeParam === 'email') {
        toast.success('E-mail confirmado! Faça login.');
        router.push('/login');
      } else if (typeParam === 'recovery') {
        toast.success('Código verificado. Defina uma nova senha.');
        router.push(`/reset-password?email=${encodeURIComponent(email)}`);
      } else {
        // fallback
        router.push('/login');
      }
    } catch (err) {
      toast.error('Erro ao verificar código.');
      console.error('verifyOtp', err);
    }
  };

  const handleResend = async () => {
    if (!email || !typeParam) return false;

    if (typeParam === 'recovery') {
      // simply trigger forgot-password endpoint again; this will send a
      // fresh OTP (assuming the project template is configured for OTP).
      try {
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        if (!res.ok) {
          const payload = await res.json().catch(() => ({}));
          toast.error(payload?.error || 'Não foi possível reenviar o código.');
          return false;
        }
        toast.success('Código reenviado para o e‑mail.');
        return true;
      } catch (err) {
        toast.error('Erro ao reenviar o código.');
        console.error('forgot-password resend', err);
        return false;
      }
    }

    // other flows (signup/email) still use Supabase resend helper
    const supaType = mapType(typeParam);
    const supabase = createBrowserSupabaseClient();

    try {
      const { error } = (await supabase.auth.resend({
        type: supaType as any,
        email,
      })) as any;

      if (error) {
        toast.error(
          String(
            (error as any)?.message ?? 'Não foi possível reenviar o código.'
          )
        );
        return false;
      }

      toast.success('Código reenviado para o e‑mail.');
      return true;
    } catch (err) {
      toast.error('Erro ao reenviar o código.');
      console.error('resend', err);
      return false;
    }
  };

  let headerText = undefined;
  let descriptionText = undefined;
  if (typeParam === 'recovery') {
    headerText = 'Recuperação de senha';
    descriptionText = 'Digite o código de recuperação que enviamos para:';
  } else if (typeParam === 'signup' || typeParam === 'email') {
    headerText = 'Confirme seu e‑mail';
    descriptionText = 'Digite o código de verificação que enviamos para:';
  }

  return (
    <OTPForm
      email={email}
      onSubmit={handleSubmit}
      onResend={handleResend}
      header={headerText}
      description={descriptionText}
    />
  );
}
