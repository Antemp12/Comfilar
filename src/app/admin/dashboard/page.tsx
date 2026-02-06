'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '~/ui/primitives/button';
import { useAuth } from '~/lib/auth-context';
import { RoleGuard } from '~/lib/role-guard';

export default function AdminDashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <RoleGuard allowedRoles={['admin']}>
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
        {/* Navbar */}
        <nav className="border-b bg-white/80 backdrop-blur">
          <div className="container mx-auto max-w-7xl px-4 py-4 flex justify-between items-center">
            <Link href="/admin" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="font-bold text-lg text-gray-900">Comfilar - Admin</span>
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
            <h1 className="text-4xl font-bold text-gray-900">Dashboard Admin 👨‍💼</h1>
            <p className="text-gray-600 mt-2">
              Painel de administração - {user?.name}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Link href="/admin/users" className="group">
              <div className="p-8 rounded-lg border bg-white hover:shadow-lg hover:border-purple-200 transition-all">
                <div className="text-4xl mb-4">👥</div>
                <h3 className="font-semibold text-lg mb-2">Utilizadores</h3>
                <p className="text-gray-600 mb-4">
                  Gerir utilizadores do sistema
                </p>
                <span className="text-purple-600 group-hover:underline">Gerir →</span>
              </div>
            </Link>

            <Link href="/admin/materials" className="group">
              <div className="p-8 rounded-lg border bg-white hover:shadow-lg hover:border-purple-200 transition-all">
                <div className="text-4xl mb-4">📦</div>
                <h3 className="font-semibold text-lg mb-2">Materiais</h3>
                <p className="text-gray-600 mb-4">
                  Gerir catálogo de materiais
                </p>
                <span className="text-purple-600 group-hover:underline">Ver catálogo →</span>
              </div>
            </Link>

            <Link href="/admin/categorias-destaque" className="group">
              <div className="p-8 rounded-lg border bg-white hover:shadow-lg hover:border-purple-200 transition-all">
                <div className="text-4xl mb-4">⭐</div>
                <h3 className="font-semibold text-lg mb-2">Categorias Destaque</h3>
                <p className="text-gray-600 mb-4">
                  Escolher 4 categorias para a página inicial
                </p>
                <span className="text-purple-600 group-hover:underline">Gerir →</span>
              </div>
            </Link>

            <Link href="/admin/produtos-destaque" className="group">
              <div className="p-8 rounded-lg border bg-white hover:shadow-lg hover:border-purple-200 transition-all">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="font-semibold text-lg mb-2">Produtos Destaque</h3>
                <p className="text-gray-600 mb-4">
                  Escolher até 8 produtos para a página inicial
                </p>
                <span className="text-purple-600 group-hover:underline">Gerir →</span>
              </div>
            </Link>

            <Link href="/admin/reports" className="group">
              <div className="p-8 rounded-lg border bg-white hover:shadow-lg hover:border-purple-200 transition-all">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="font-semibold text-lg mb-2">Relatórios</h3>
                <p className="text-gray-600 mb-4">
                  Visualizar estatísticas e relatórios
                </p>
                <span className="text-purple-600 group-hover:underline">Ver relatórios →</span>
              </div>
            </Link>
          </div>

          {/* System Stats */}
          <div className="grid md:grid-cols-4 gap-6">
            <div className="p-6 rounded-lg border bg-white">
              <p className="text-sm text-gray-600 mb-1">Total Utilizadores</p>
              <p className="text-3xl font-bold text-gray-900">0</p>
            </div>
            <div className="p-6 rounded-lg border bg-white">
              <p className="text-sm text-gray-600 mb-1">Materiais</p>
              <p className="text-3xl font-bold text-gray-900">0</p>
            </div>
            <div className="p-6 rounded-lg border bg-white">
              <p className="text-sm text-gray-600 mb-1">Orçamentos Pendentes</p>
              <p className="text-3xl font-bold text-gray-900">0</p>
            </div>
            <div className="p-6 rounded-lg border bg-white">
              <p className="text-sm text-gray-600 mb-1">Encomendas Ativas</p>
              <p className="text-3xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
