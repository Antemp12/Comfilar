import Link from 'next/link';
import { 
  PackageIcon, 
  UsersIcon, 
  ShoppingCartIcon, 
  FileTextIcon,
  CalendarIcon,
  ChartIcon 
} from '~/ui/icons/admin-icons';
import { db } from '~/db';
import { utilizadorTable, materialsTable, ordersTable, quoteRequestsTable } from '~/db/schema';
import { eq } from 'drizzle-orm';

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

  // Contar orçamentos pendentes
  const orcamentosPendentes = await db.select().from(quoteRequestsTable).where(
    eq(quoteRequestsTable.status, 'pendente')
  );
  const totalPendingQuotes = orcamentosPendentes.length;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Visão geral da plataforma Comfilar
        </p>
      </div>

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

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Orçamentos Pendentes
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {totalPendingQuotes}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/20">
              <FileTextIcon />
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
            className="group rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-primary hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ShoppingCartIcon />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Ver Encomendas
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Gerir pedidos de clientes
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/quotes"
            className="group rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-primary hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileTextIcon />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Gerir Orçamentos
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Responder a pedidos
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
