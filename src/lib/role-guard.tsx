'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from './auth-context';
import { useEffect } from 'react';

type UserType = 'cliente' | 'funcionario' | 'admin';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserType[];
  redirectTo?: string;
}

export function RoleGuard({ children, allowedRoles, redirectTo = '/' }: RoleGuardProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/');
        return;
      }

      if (user && !allowedRoles.includes(user.type)) {
        // Redirecionar para o dashboard correto do utilizador
        const userDashboard = {
          cliente: '/dashboard/home',
          funcionario: '/funcionario',
          admin: '/admin',
        }[user.type];
        
        router.push(userDashboard);
      }
    }
  }, [isAuthenticated, loading, user, router, allowedRoles]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  if (!isAuthenticated || (user && !allowedRoles.includes(user.type))) {
    return null;
  }

  return <>{children}</>;
}
