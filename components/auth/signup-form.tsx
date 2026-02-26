'use client';

import React, { useState } from 'react';
import type { Provider } from '@supabase/supabase-js';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { OAuthButton } from './oauth-button';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
// signup now uses server API route
import Link from 'next/link';

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<'form'>) {
  const router = useRouter();
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<{
    name: string;
    email: string;
    password: string;
    confirm: string;
  }>({
    mode: 'onBlur',
  });

  const text = {
    header: 'Crie sua conta',
    subtext: 'Preencha o formulário abaixo para criar sua conta',
    nameLabel: 'Nome completo',
    namePlaceholder: 'João da Silva',
    emailLabel: 'E-mail',
    emailPlaceholder: 'm@exemplo.com',
    passwordLabel: 'Senha',
    confirmPasswordLabel: 'Confirme a senha',
    createAccount: 'Criar conta',
    continueWith: 'Ou continue com',
    signupWithGitHub: 'Cadastrar com GitHub',
    alreadyHaveAccount: 'Já tem uma conta?',
    signIn: 'Entrar',
    emailDescription:
      'Usaremos este e‑mail para contato. Não compartilharemos com ninguém.',
    passwordDescription: 'Deve conter pelo menos 8 caracteres.',
    confirmPasswordDescription: 'Por favor confirme sua senha.',
    passwordMismatch: 'As senhas não coincidem.',
    signupSuccess: 'Conta criada! Verifique seu e-mail para o código.',
    signupFailed: 'Falha ao criar conta. Tente novamente.',
  };

  type OAuthProvider =
    | 'github'
    | 'google'
    | 'azure'
    | 'facebook'
    | 'gitlab'
    | 'bitbucket'
    | 'discord'
    | 'slack'
    | 'twitch'
    | string;

  const signInWithProvider = async (provider: OAuthProvider) => {
    // still use browser flow for OAuth (redirect)
    setOauthLoading(provider);
    await new Promise((r) => setTimeout(r, 150));
    try {
      // dynamic import to avoid adding supabase client bundle if unused
      const { createBrowserSupabaseClient } =
        await import('@/lib/supabase/client');
      const supabase = createBrowserSupabaseClient();
      const callbackUrl = `${window.location.origin}/auth/callback`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider as Provider,
        options: { redirectTo: callbackUrl },
      });
      if (error) {
        console.error('OAuth sign-in error', error);
        toast.error('Não foi possível iniciar o login social.');
      }
    } finally {
      setOauthLoading(null);
    }
  };

  const onSubmit = async (data: {
    name: string;
    email: string;
    password: string;
    confirm: string;
  }) => {
    if (data.password !== data.confirm) {
      toast.error(text.passwordMismatch);
      return;
    }

    try {
      const cleanEmail = data.email.trim();
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: cleanEmail,
          password: data.password,
        }),
      });
      const payload = await res.json();

      if (!res.ok) {
        // respond with an appropriate message based on status
        if (res.status === 429) {
          toast.error(
            'Muitas tentativas. Tente novamente daqui a alguns minutos.'
          );
          return;
        }

        const msg = String(payload?.error || '').toLowerCase();
        if (msg.includes('already') || msg.includes('exist')) {
          toast.error('E-mail já cadastrado. Faça login ou recupere a senha.');
        } else if (res.status === 400) {
          // validation error from our route or supabase
          toast.error(payload?.error || text.signupFailed);
        } else {
          toast.error(payload?.error || text.signupFailed);
        }
        return;
      }

      // occasionally supabase returns a session even though we immediately
      // sign it out server-side; propagate it locally just in case, then
      // navigate to verification.
      try {
        if (payload?.data?.session) {
          const { createBrowserSupabaseClient } =
            await import('@/lib/supabase/client');
          const supabase = createBrowserSupabaseClient();
          await supabase.auth.setSession(payload.data.session);
        }
      } catch {} // non‑critical

      toast.success(text.signupSuccess);
      router.push(
        `/verify-otp?type=signup&email=${encodeURIComponent(data.email)}`
      );
    } catch (err) {
      console.error('signup error', err);
      toast.error(text.signupFailed);
    }
  };

  return (
    <form
      className={cn('flex flex-col gap-6', className)}
      onSubmit={handleSubmit(onSubmit)}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">{text.header}</h1>
          <p className="text-muted-foreground text-sm text-balance">
            {text.subtext}
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="name">{text.nameLabel}</FieldLabel>
          <Input
            id="name"
            type="text"
            placeholder={text.namePlaceholder}
            required
            {...register('name', { required: true })}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="email">{text.emailLabel}</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder={text.emailPlaceholder}
            required
            {...register('email', {
              required: true,
              pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            })}
          />
          <FieldDescription>{text.emailDescription}</FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="password">{text.passwordLabel}</FieldLabel>
          <Input
            id="password"
            type="password"
            required
            {...register('password', {
              required: true,
              minLength: 8,
            })}
          />
          <FieldDescription>{text.passwordDescription}</FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="confirm-password">
            {text.confirmPasswordLabel}
          </FieldLabel>
          <Input
            id="confirm-password"
            type="password"
            required
            {...register('confirm', { required: true })}
          />
          <FieldDescription>{text.confirmPasswordDescription}</FieldDescription>
        </Field>
        <Field>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Spinner className="mr-2" />}
            {text.createAccount}
          </Button>
        </Field>
        <FieldSeparator>{text.continueWith}</FieldSeparator>
        <Field>
          <OAuthButton
            provider="github"
            label={text.signupWithGitHub}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path
                  d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
                  fill="currentColor"
                />
              </svg>
            }
            loading={oauthLoading === 'github'}
            onClick={() => signInWithProvider('github')}
          />
          <FieldDescription className="text-center">
            {text.alreadyHaveAccount}{' '}
            <Link href="/login" className="underline underline-offset-4">
              {text.signIn}
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
