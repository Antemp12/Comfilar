'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '~/ui/primitives/button';
import { useAuth } from '~/lib/auth-context';
import { RoleGuard } from '~/lib/role-guard';

export default function FuncionarioPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <RoleGuard allowedRoles={['funcionario']}>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        {/* Navbar */}
        <nav className="border-b bg-white/80 backdrop-blur">
          <div className="container mx-auto max-w-7xl px-4 py-4 flex justify-between items-center">
            <Link href="/funcionario" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="font-bold text-lg text-gray-900">Comfilar - Funcionário</span>
            </Link>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-medium text-gray-900">{user?.name}</p>
                <p className="text-sm text-gray-600">{user?.email}</p>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                Sair
              </Button>
            </div>
          </div>
        </nav>

        {/* Dashboard Content */}
        <div className="container mx-auto max-w-7xl px-4 py-16">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900">Dashboard Funcionário 👨‍💼</h1>
            <p className="text-gray-600 mt-2">
              Bem-vindo, {user?.name}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Link href="/funcionario/clientes" className="group">
              <div className="p-8 rounded-lg border bg-white hover:shadow-lg hover:border-blue-200 transition-all">
                <div className="text-4xl mb-4">👥</div>
                <h3 className="font-semibold text-lg mb-2">Gerir Clientes</h3>
                <p className="text-gray-600 mb-4">
                  Visualizar e gerir clientes
                </p>
                <span className="text-blue-600 group-hover:underline">Abrir →</span>
              </div>
            </Link>

            <Link href="/funcionario/orcamentos" className="group">
              <div className="p-8 rounded-lg border bg-white hover:shadow-lg hover:border-blue-200 transition-all">
                <div className="text-4xl mb-4">📋</div>
                <h3 className="font-semibold text-lg mb-2">Orçamentos</h3>
                <p className="text-gray-600 mb-4">
                  Processar orçamentos de clientes
                </p>
                <span className="text-blue-600 group-hover:underline">Ver orçamentos →</span>
              </div>
            </Link>

            <Link href="/funcionario/encomendas" className="group">
              <div className="p-8 rounded-lg border bg-white hover:shadow-lg hover:border-blue-200 transition-all">
                <div className="text-4xl mb-4">🚚</div>
                <h3 className="font-semibold text-lg mb-2">Encomendas</h3>
                <p className="text-gray-600 mb-4">
                  Gerir encomendas e entregas
                </p>
                <span className="text-blue-600 group-hover:underline">Ver encomendas →</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
