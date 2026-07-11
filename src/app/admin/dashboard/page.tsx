import Link from 'next/link';
import {
  PackageIcon,
  UsersIcon,
  ShoppingCartIcon,
  CalendarIcon,
  ChartIcon
} from '~/ui/icons/admin-icons';
import { db } from '~/db';
import { utilizadorTable, materialsTable, ordersTable } from '~/db/schema';
import { eq } from 'drizzle-orm';
import { NewNotificationsBanner } from './new-notifications-banner';
import { QuickSignals } from './quick-signals';

export default async function AdminDashboardPage() {
  // Buscar contagens
  const utilizadores = await db.select().from(utilizadorTable);
  const totalUsers = utilizadores.length;

  const materiais = await db.select().from(materialsTable).where(eq(materialsTable.isDeleted, false));
  const totalMaterials = materiais.length;

  // Contar encomendas ativas (processamento ou preparacao)
  const encomendasAtivas = await db.select().from(ordersTable).where(
    eq(ordersTable.status, 'processamento')
  );
  const totalActiveOrders = encomendasAtivas.length;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Visão geral da plataforma Comfilar
        </p>
      </div>

      {/* Aviso de notificações novas */}
      <NewNotificationsBanner />

      {/* Métricas Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Utilizadores
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {totalUsers}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
              <UsersIcon />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Materiais
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {totalMaterials}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/20">
              <PackageIcon />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Encomendas Ativas
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {totalActiveOrders}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/20">
              <ShoppingCartIcon />
            </div>
          </div>
        </div>

      </div>

      {/* Ações Rápidas */}
      <div>
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
          Ações Rápidas
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Ações com contadores ao vivo */}
          <QuickSignals />

          <Link
            href="/admin/materials"
            className="group rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-primary hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <PackageIcon />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Gerir Materiais
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Adicionar e editar produtos
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/users"
            className="group rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-primary hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <UsersIcon />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Gerir Utilizadores
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Ver e editar utilizadores
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/orders"
            className="group relative rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-primary hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
          >
            {totalActiveOrders > 0 && (
              <span className="absolute right-4 top-4 flex h-6 min-w-6 items-center justify-center rounded-full bg-purple-600 px-1.5 text-xs font-bold text-white">
                {totalActiveOrders}
              </span>
            )}
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ShoppingCartIcon />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Ver Encomendas
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {totalActiveOrders > 0
                    ? `${totalActiveOrders} ativa(s)`
                    : "Gerir pedidos de clientes"}
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/meetings"
            className="group rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-primary hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <CalendarIcon />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Agendar Reuniões
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Calendário de reuniões
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/reports"
            className="group rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-primary hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ChartIcon />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Ver Relatórios
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Análise e estatísticas
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
