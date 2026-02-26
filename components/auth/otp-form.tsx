'use client';
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { RefreshCwIcon } from 'lucide-react';

export function OTPForm({
  className,
  onSubmit,
  email,
  onResend,
  ...props
}: // inherit standard form props except onSubmit, which would conflict with our
// custom handler that receives the OTP string instead of an event
Omit<React.ComponentProps<'form'>, 'onSubmit'> & {
  onSubmit?: (code: string) => void | Promise<void>;
  // returning `false` is respected by caller to prevent cooldown
  onResend?: () => void | boolean | Promise<void | boolean>;
  email?: string | null;
}) {
  const [code, setCode] = React.useState('');
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const text = {
    header: 'Verifique seu login',
    description: 'Digite o código que enviamos para seu e‑mail: ',
    email: 'm@example.com',
    verificationCode: 'Código de verificação',
    resend: 'Reenviar código',
    noAccess: 'Já não tenho acesso a este e‑mail.',
    verify: 'Verificar',
    helpText: 'Está com problemas para entrar? ',
    contactSupport: 'Contatar suporte',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSubmit) return;
    try {
      setSubmitting(true);
      await onSubmit(code);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  return (
    <form
      className={cn('flex flex-col gap-6', className)}
      onSubmit={handleSubmit}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">{text.header}</h1>
          <p className="text-muted-foreground text-sm text-balance">
            {text.description}
            <span className="font-medium">{email ?? text.email}</span>.
          </p>
        </div>
        <Field>
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="otp-verification">
              {text.verificationCode}
            </FieldLabel>
            <Button
              variant="outline"
              size="xs"
              type="button"
              disabled={resending || cooldown > 0}
              onClick={async () => {
                if (!onResend || cooldown > 0) return;
                try {
                  setResending(true);
                  const ok = await onResend();
                  setResending(false);
                  // start cooldown only when resend succeeded
                  if (ok !== false) {
                    setCooldown(60); // 60s cooldown
                  }
                } catch {
                  setResending(false);
                }
              }}
            >
              <RefreshCwIcon />
              {resending
                ? 'Enviando...'
                : cooldown > 0
                  ? `Reenviar (${cooldown}s)`
                  : text.resend}
            </Button>
          </div>
          <div className="w-full flex justify-center">
            <InputOTP
              className="w-full max-w-md"
              maxLength={8}
              id="otp-verification"
              required
              onChange={(val: string) => setCode(val)}
            >
              <InputOTPGroup className="flex justify-center gap-0 *:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-11 *:data-[slot=input-otp-slot]:text-xl">
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
              </InputOTPGroup>
              <InputOTPSeparator className="mx-2" />
              <InputOTPGroup className="flex justify-center gap-0 *:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-11 *:data-[slot=input-otp-slot]:text-xl">
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
                <InputOTPSlot index={6} />
                <InputOTPSlot index={7} />
              </InputOTPGroup>
            </InputOTP>
          </div>
          <FieldDescription>
            <a href="#">{text.noAccess}</a>
          </FieldDescription>
        </Field>
        <Field>
          <Button
            type="submit"
            className="w-full flex items-center justify-center cursor-pointer"
            disabled={submitting}
          >
            {submitting && <Spinner className="mr-2" />}
            {text.verify}
          </Button>
          <div className="text-muted-foreground text-sm">
            {text.helpText}
            <a
              href="#"
              className="hover:text-primary underline underline-offset-4 transition-colors"
            >
              {text.contactSupport}
            </a>
          </div>
        </Field>
      </FieldGroup>
    </form>
  );
}
