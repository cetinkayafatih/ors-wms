'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError('Email veya sifre hatali.');
      setLoading(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-xl">
            W
          </div>
          <CardTitle className="text-2xl">Corap WMS</CardTitle>
          <CardDescription>
            Depo Yonetim Sistemi&apos;ne giris yapin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="ornek@fabrika.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Sifre</Label>
              <Input
                id="password"
                type="password"
                placeholder="Sifrenizi girin"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Giris yapiliyor...
                </>
              ) : (
                'Giris Yap'
              )}
            </Button>
          </form>

          <div className="mt-6 rounded-md bg-muted p-3">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Demo Hesaplari:
            </p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p>
                <strong>Admin:</strong> admin@corapwms.com / admin123
              </p>
              <p>
                <strong>Depo Muduru:</strong> mudur@corapwms.com / mudur123
              </p>
              <p>
                <strong>Operator:</strong> operator@corapwms.com / operator123
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
