'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '~/ui/primitives/button';
import { Input } from '~/ui/primitives/input';
import { Label } from '~/ui/primitives/label';
import { useAuth } from '~/lib/auth-context';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Email e password são obrigatórios');
      setLoading(false);
      return;
    }

    try {
      await login(email, password);
      router.push('/dashboard/home');
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          {/* Form Card */}
          <div className="bg-white rounded-lg border shadow-sm p-8">
            <h1 className="text-3xl font-bold mb-2">Bem-vindo</h1>
            <p className="text-gray-600 mb-8">
              Entre com suas credenciais para continuar
            </p>

            {error && (
              <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Sua password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>

            <p className="text-center text-gray-600 mt-6 text-sm">
              Não tem conta?{' '}
              <Link href="/auth/register" className="text-blue-600 hover:underline font-medium">
                Registar-se
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
}
