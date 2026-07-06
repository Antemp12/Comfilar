'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { z } from 'zod';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '~/ui/primitives/button';
import { Input } from '~/ui/primitives/input';
import { Label } from '~/ui/primitives/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~/ui/primitives/dialog';
import { useAuth } from '~/lib/auth-context';

const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'Indica o teu nome (mín. 2 caracteres)'),
    email: z.string().trim().email('Email inválido'),
    password: z.string().min(8, 'A password deve ter pelo menos 8 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ['confirmPassword'],
    message: 'As passwords não coincidem',
  });

type RegisterErrors = Partial<
  Record<'name' | 'email' | 'password' | 'confirmPassword', string>
>;

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<RegisterErrors>({});
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();
  const { register } = useAuth();

  // Depois do sucesso, redireciona automaticamente ao fim de alguns segundos.
  useEffect(() => {
    if (!showSuccess) return;
    const t = setTimeout(() => router.push('/dashboard'), 3500);
    return () => clearTimeout(t);
  }, [showSuccess, router]);

  const clearFieldError = (field: keyof RegisterErrors) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validação com zod
    const parsed = registerSchema.safeParse({ name, email, password, confirmPassword });
    if (!parsed.success) {
      const errs: RegisterErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof RegisterErrors;
        if (key && !errs[key]) errs[key] = issue.message;
      }
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});
    setLoading(true);

    try {
      await register(name, email, password, 'cliente');
      setShowSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Erro ao registar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {/* Form Card */}
        <div className="bg-white rounded-lg border shadow-sm p-8">
          <h1 className="text-3xl font-bold mb-2">Criar Conta</h1>
          <p className="text-gray-600 mb-8">
            Registe-se para começar a usar a Comfilar
          </p>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                placeholder="João Silva"
                value={name}
                onChange={(e) => { setName(e.target.value); clearFieldError('name'); }}
                disabled={loading}
                aria-invalid={!!fieldErrors.name}
              />
              {fieldErrors.name && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.name}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearFieldError('email'); }}
                disabled={loading}
                aria-invalid={!!fieldErrors.email}
              />
              {fieldErrors.email && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 8 caracteres"
                value={password}
                onChange={(e) => { setPassword(e.target.value); clearFieldError('password'); }}
                disabled={loading}
                aria-invalid={!!fieldErrors.password}
              />
              {fieldErrors.password && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirmar Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Repita sua password"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); clearFieldError('confirmPassword'); }}
                disabled={loading}
                aria-invalid={!!fieldErrors.confirmPassword}
              />
              {fieldErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Registando...' : 'Registar'}
            </Button>
          </form>

          <p className="text-center text-gray-600 mt-6 text-sm">
            Já tem conta?{' '}
            <Link href="/auth/login" className="text-blue-600 hover:underline font-medium">
              Entrar
            </Link>
          </p>
        </div>
      </div>

      {/* Modal de sucesso ao criar conta */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader className="items-center text-center">
            <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <DialogTitle className="text-center">Conta criada com sucesso!</DialogTitle>
            <DialogDescription className="text-center">
              Bem-vindo{name ? `, ${name.split(' ')[0]}` : ''}! A tua conta foi
              criada e já tens sessão iniciada.
            </DialogDescription>
          </DialogHeader>
          <Button className="w-full" onClick={() => router.push('/dashboard')}>
            Ir para o painel
          </Button>
          <p className="text-center text-xs text-gray-400">
            A redirecionar automaticamente…
          </p>
        </DialogContent>
      </Dialog>
    </div>
    );
  }
