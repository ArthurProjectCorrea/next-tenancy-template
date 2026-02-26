'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

/**
 * Simple form for requesting a password reset email.
 * This component mirrors the style and structure of the other
 * auth forms in the project (login, signup) so that the UX remains
 * consistent.  It calls `/api/auth/forgot-password` by default but
 * you may override the submit handler using the `onSubmit` prop.
 */
export function ForgotPasswordForm({
  className,
  onSubmit,
  ...props
}: React.ComponentProps<'form'> & {
  onSubmit?: (email: string) => void | Promise<void>;
}) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<{ email: string }>();

  const text = {
    header: 'Recupere sua senha',
    subtext:
      'Informe o e‑mail da sua conta e enviaremos instruções para resetar a senha.',
    emailLabel: 'E‑mail',
    emailPlaceholder: 'm@exemplo.com',
    submit: 'Enviar instruções',
    backToLogin: 'Voltar ao login',
  };

  const defaultHandler = async (data: { email: string }) => {
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email }),
      });
      const payload = await res.json();

      if (!res.ok) {
        toast.error(payload?.error || 'Não foi possível enviar o e‑mail.');
        return;
      }

      toast.success('Verifique seu e‑mail para o código de recuperação.');
      router.push(
        `/verify-otp?type=recovery&email=${encodeURIComponent(data.email)}`
      );
    } catch (err) {
      console.error('forgot-password request failed', err);
      toast.error('Ocorreu um erro ao enviar o e‑mail.');
    }
  };

  const handleForm = async (data: { email: string }) => {
    if (onSubmit) {
      await onSubmit(data.email);
    } else {
      await defaultHandler(data);
    }
  };

  return (
    <form
      className={cn('flex flex-col gap-6', className)}
      onSubmit={handleSubmit(handleForm)}
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
          <Button
            type="submit"
            disabled={isSubmitting}
            className="cursor-pointer"
          >
            {isSubmitting && <Spinner className="mr-2" />}
            {text.submit}
          </Button>
          <FieldDescription className="text-center">
            <Link href="/login" className="underline underline-offset-4">
              {text.backToLogin}
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
