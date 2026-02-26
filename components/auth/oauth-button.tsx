'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

interface OAuthButtonProps {
  provider: string; // e.g. "github", "google" etc.
  label: string;
  icon: React.ReactNode;
  loading?: boolean;
  onClick: () => void;
}

export function OAuthButton({
  provider,
  label,
  icon,
  loading = false,
  onClick,
}: OAuthButtonProps) {
  return (
    <Button
      variant="outline"
      type="button"
      onClick={onClick}
      disabled={loading}
      data-provider={provider}
      className="flex items-center justify-center cursor-pointer"
    >
      {loading && <Spinner className="mr-2" />}
      {icon}
      <span className="ml-2">{label}</span>
    </Button>
  );
}
