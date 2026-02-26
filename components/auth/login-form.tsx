'use client';
// encoding fix
import React from 'react';
import type { Provider } from '@supabase/supabase-js';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { OAuthButton } from './oauth-button';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { LoginToastHandler } from './login-toast';
import Link from 'next/link';

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<'form'>) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<{ email: string; password: string }>();

  const text = {
    header: 'Faça login na sua conta',
    subtext: 'Insira seu e-mail abaixo para entrar na sua conta',
    emailLabel: 'E-mail',
    emailPlaceholder: 'm@exemplo.com',
    passwordLabel: 'Senha',
    forgotPassword: 'Esqueceu sua senha?',
    login: 'Entrar',
    continueWith: 'Ou continue com',
    loginWithGitHub: 'Entrar com GitHub',
    noAccount: 'Não tem uma conta?',
    signUp: 'Cadastre-se',
    invalidCredentials: 'E-mail ou senha inválidos',
  };

  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectedFrom') || '/private';
  const oauthError = searchParams.get('error');

  // include toast handler for both success and error
  // (error also covered by oauthError effect but duplicate is harmless)
  // we don't render it directly in markup; adding here ensures the useEffect runs
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _toastManager = <LoginToastHandler />;

  // if the callback route returned an error, show it
  React.useEffect(() => {
    if (oauthError) {
      toast.error(oauthError);
    }
  }, [oauthError]);

  const [oauthLoading, setOauthLoading] = React.useState<OAuthProvider | null>(
    null
  );

  const onSubmit = async (data: { email: string; password: string }) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, password: data.password }),
      });
       
      const payload = await res.json();
      if (!res.ok) {
        const msg = String(payload?.error || '').toLowerCase();
        if (
          msg.includes('not confirmed') ||
          msg.includes('verify') ||
          msg.includes('confirm')
        ) {
          toast.error('Por favor, verifique seu e-mail antes de fazer login.');
        } else if (msg.includes('invalid') || msg.includes('credentials')) {
          toast.error('Credenciais inválidas. Verifique e tente novamente.');
        } else {
          toast.error(payload?.error || 'Ocorreu um erro durante o login.');
        }
        console.error('Login error:', payload);
        return;
      }
      // propagate the session to the browser client in case
      // future client-side calls need it (and to keep local storage
      // in sync). the API route already set the cookie, but this
      // ensures the in-memory client is up to date.
      try {
        const supabase = createBrowserSupabaseClient();
        if (payload?.data?.session) {
          await supabase.auth.setSession(payload.data.session);
        }
      } catch (e) {
        console.warn('failed to set client session', e);
      }

      toast.success('Login efetuado com sucesso!');
      router.push(redirectTo);
    } catch (err) {
      console.error('login request failed', err);
      toast.error('Ocorreu um erro durante o login.');
    }
  };

  // helper to start an OAuth flow with a given provider
  // it's easier to just allow the known list of providers; we only
  // use "github" right now but the type can be widened later.
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
    setOauthLoading(provider);
    await new Promise((r) => setTimeout(r, 150));

    const supabase = createBrowserSupabaseClient();

    let callbackUrl = `${window.location.origin}/auth/callback`;
    if (redirectTo) {
      callbackUrl += `?redirectedFrom=${encodeURIComponent(redirectTo)}`;
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider as Provider,
      options: {
        redirectTo: callbackUrl,
      },
    });
    setOauthLoading(null);
    if (error) {
      toast.error('Não foi possível iniciar o login social.');
      console.error('OAuth sign-in error', error);
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
          <FieldLabel htmlFor="email">{text.emailLabel}</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder={text.emailPlaceholder}
            required
            {...register('email', { required: true })}
          />
        </Field>
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">{text.passwordLabel}</FieldLabel>
            <a
              href="#"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              {text.forgotPassword}
            </a>
          </div>
          <Input
            id="password"
            type="password"
            required
            {...register('password', { required: true })}
          />
        </Field>
        <Field>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="cursor-pointer"
          >
            {isSubmitting && <Spinner className="mr-2" />}
            {text.login}
          </Button>
        </Field>
        <FieldSeparator>{text.continueWith}</FieldSeparator>
        <Field>
          <OAuthButton
            provider="github"
            label={text.loginWithGitHub}
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
            {text.noAccount}{' '}
            <Link href="/signup" className="underline underline-offset-4">
              {text.signUp}
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
