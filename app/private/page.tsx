import {
  Card,
  CardHeader,
  CardTitle,
  CardFooter,
  CardContent,
} from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { LogoutButton } from '@/components/auth/logout-button';

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

  const user = session?.user;

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{text.title}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <Avatar>
            <AvatarFallback>{user?.email?.charAt(0) ?? 'U'}</AvatarFallback>
          </Avatar>
          <div className="text-center">
            <div className="font-semibold">{user?.email}</div>
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
  );
}
