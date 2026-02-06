'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '~/ui/primitives/button';
import { useAuth } from '~/lib/auth-context';
import { RoleGuard } from '~/lib/role-guard';
import { CatalogsCarousel } from '~/ui/components/catalogs-carousel';

export default function DashboardPage() {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <RoleGuard allowedRoles={['cliente']}>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        {/* Navbar */}
        <nav className="border-b bg-white/80 backdrop-blur">
          <div className="container mx-auto max-w-7xl px-4 py-4 flex justify-between items-center">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="font-bold text-lg text-gray-900">Comfilar</span>
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
          {/* Catalogs Carousel */}
          <div className="mb-12">
            <CatalogsCarousel />
          </div>

          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900">Bem-vindo, {user?.name}! 👋</h1>
            <p className="text-gray-600 mt-2">
              Você está autenticado como{' '}
              <span className="font-medium capitalize">{user?.type}</span>
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Link href="/products" className="group">
              <div className="p-8 rounded-lg border bg-white hover:shadow-lg hover:border-blue-200 transition-all">
                <div className="text-4xl mb-4">📦</div>
                <h3 className="font-semibold text-lg mb-2">Explorar Materiais</h3>
                <p className="text-gray-600 mb-4">
                  Veja nosso catálogo completo de materiais
                </p>
                <span className="text-blue-600 group-hover:underline">Ver catálogo →</span>
              </div>
            </Link>

            <Link href="/dashboard/quotes" className="group">
              <div className="p-8 rounded-lg border bg-white hover:shadow-lg hover:border-blue-200 transition-all">
                <div className="text-4xl mb-4">📋</div>
                <h3 className="font-semibold text-lg mb-2">Meus Orçamentos</h3>
                <p className="text-gray-600 mb-4">
                  Veja e gerencie seus orçamentos
                </p>
                <span className="text-blue-600 group-hover:underline">Abrir →</span>
              </div>
            </Link>

            <Link href="/dashboard/orders" className="group">
              <div className="p-8 rounded-lg border bg-white hover:shadow-lg hover:border-blue-200 transition-all">
                <div className="text-4xl mb-4">🚚</div>
                <h3 className="font-semibold text-lg mb-2">Minhas Encomendas</h3>
                <p className="text-gray-600 mb-4">
                  Rastreie suas encomendas em tempo real
                </p>
                <span className="text-blue-600 group-hover:underline">Ver encomendas →</span>
              </div>
            </Link>
          </div>

          {/* Welcome Section */}
          <div className="p-12 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <h2 className="text-2xl font-bold mb-4">Comece a criar seu primeiro orçamento</h2>
            <p className="text-blue-100 mb-6">
              Navegue pelo nosso catálogo de materiais, selecione o que precisa e envie um pedido de orçamento.
              Nós processaremos e o aprovaremos em breve.
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/products">Explorar Materiais</Link>
            </Button>
          </div>

          {/* Info Cards */}
          <div className="grid md:grid-cols-2 gap-6 mt-12">
            <div className="p-6 rounded-lg border bg-white">
              <h3 className="font-semibold text-lg mb-2">Como funciona?</h3>
              <ol className="space-y-2 text-gray-600 text-sm">
                <li>1. Explore nosso catálogo de materiais</li>
                <li>2. Selecione os materiais que precisa</li>
                <li>3. Envie um pedido de orçamento</li>
                <li>4. Aguarde aprovação da nossa equipe</li>
                <li>5. Confirme sua encomenda</li>
                <li>6. Acompanhe a entrega em tempo real</li>
              </ol>
            </div>

            <div className="p-6 rounded-lg border bg-white">
              <h3 className="font-semibold text-lg mb-2">Precisa de ajuda?</h3>
              <p className="text-gray-600 text-sm mb-4">
                Nossa equipe está pronta para ajudar. Você pode:
              </p>
              <ul className="space-y-2 text-sm">
                <li>📞 Ligar para nosso suporte</li>
                {isAuthenticated && (
                  <li>💬 Agendar uma reunião com um funcionário</li>
                )}
                <li>📧 Enviar um email para contato@comfilar.pt</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
