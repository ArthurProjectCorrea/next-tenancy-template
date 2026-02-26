import {
  Card,
  CardHeader,
  CardTitle,
  CardFooter,
  CardContent,
} from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { LogoutButton } from '@/components/auth/logout-button';
import { LoginToastHandler } from '@/components/auth/login-toast';

const text = {
  title: 'Perfil do Usuário',
  welcome: 'Bem-vindo de volta!',
  logout: 'Sair',
};

export default async function PrivatePage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  // session.user can be tampered with; fetch authenticated user from server
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error('Failed to verify user:', userError);
    redirect('/login');
  }

  // metadata coming from Supabase (email provider or OAuth)
  // keep unknown to avoid linting against any; cast individual fields later
  const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;
  const displayName =
    (metadata.full_name as string | undefined) ||
    (metadata.name as string | undefined) ||
    (metadata.preferred_username as string | undefined) ||
    (metadata.user_name as string | undefined) ||
    user?.email ||
    '';
  const avatarUrl = (metadata.avatar_url as string) || undefined;

  return (
    <>
      <LoginToastHandler />
      <div className="flex min-h-screen items-center justify-center p-6">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>{text.title}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <Avatar>
              {avatarUrl ? (
                <AvatarImage src={avatarUrl} alt={displayName} />
              ) : (
                <AvatarFallback>{displayName.charAt(0) ?? 'U'}</AvatarFallback>
              )}
            </Avatar>
            <div className="text-center">
              <div className="font-semibold">{displayName}</div>
              <div className="text-sm text-muted-foreground">{user?.email}</div>
            </div>
            <div className="text-center text-sm text-muted-foreground">
              {text.welcome}
            </div>
          </CardContent>
          <CardFooter>
            <LogoutButton />
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
