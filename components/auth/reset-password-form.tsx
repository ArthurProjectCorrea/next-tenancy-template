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

/**
 * Form component for choosing a new password after the user has clicked
 * a reset link/token.  The page that renders this form will typically
 * pass the token from the query string as the `token` prop.  The
 * internal submit handler sends the token plus the password to
 * `/api/auth/reset-password` by default, but you can override via
 * `onSubmit`.
 */
export function ResetPasswordForm({
  className,
  onSubmit,
  ...props
}: React.ComponentProps<'form'> & {
  onSubmit?: (password: string) => void | Promise<void>;
}) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
    watch,
  } = useForm<{ password: string; confirm: string }>({
    mode: 'onBlur',
  });

  const text = {
    header: 'Nova senha',
    subtext: 'Defina uma nova senha para a sua conta.',
    passwordLabel: 'Senha',
    confirmLabel: 'Confirme a senha',
    submit: 'Atualizar senha',
    mismatch: 'As senhas não coincidem.',
    backToLogin: 'Voltar ao login',
  };

  const defaultHandler = async (data: {
    password: string;
    confirm: string;
  }) => {
    if (data.password !== data.confirm) {
      toast.error(text.mismatch);
      return;
    }

    try {
      // assume valid recovery session exists; update the user password directly
      const { createBrowserSupabaseClient } =
        await import('@/lib/supabase/client');
      const supabase = createBrowserSupabaseClient();
      const { error } = (await supabase.auth.updateUser({
        password: data.password,
      })) as { error: { message?: string } | null };

      if (error) {
        const errMsg = String(error.message || error);
        toast.error(errMsg || 'Não foi possível atualizar a senha.');
        return;
      }

      toast.success('Senha atualizada com sucesso! Faça login.');
      await supabase.auth.signOut();
      router.push('/login');
    } catch (err) {
      console.error('reset-password handler failed', err);
      toast.error('Ocorreu um erro ao tentar atualizar a senha.');
    }
  };

  const handleForm = async (data: { password: string; confirm: string }) => {
    if (onSubmit) {
      await onSubmit(data.password);
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
          <FieldLabel htmlFor="password">{text.passwordLabel}</FieldLabel>
          <Input
            id="password"
            type="password"
            required
            {...register('password', { required: true, minLength: 8 })}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="confirm">{text.confirmLabel}</FieldLabel>
          <Input
            id="confirm"
            type="password"
            required
            {...register('confirm', { required: true })}
          />
          <FieldDescription>
            {watch('password') &&
              watch('confirm') &&
              watch('password') !== watch('confirm') && (
                <span>{text.mismatch}</span>
              )}
          </FieldDescription>
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
            <a href="/login" className="underline underline-offset-4">
              {text.backToLogin}
            </a>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
