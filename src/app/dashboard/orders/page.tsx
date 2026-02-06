'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '~/ui/primitives/button';
import { useAuth } from '~/lib/auth-context';
import { ProtectedRoute } from '~/lib/protected-route';

interface Order {
  id: number;
  userId: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  items?: any[];
  total?: number;
}

export default function OrdersPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/orders', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!response.ok) {
          throw new Error('Erro ao carregar encomendas');
        }

        const data = await response.json() as any;
        setOrders(data.data || []);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar encomendas');
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processamento':
        return 'bg-yellow-100 text-yellow-800';
      case 'preparacao':
        return 'bg-blue-100 text-blue-800';
      case 'enviado':
        return 'bg-purple-100 text-purple-800';
      case 'entregue':
        return 'bg-green-100 text-green-800';
      case 'cancelada':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'processamento':
        return 'Em Processamento';
      case 'preparacao':
        return 'Em Preparação';
      case 'enviado':
        return 'Enviado';
      case 'entregue':
        return 'Entregue';
      case 'cancelada':
        return 'Cancelada';
      default:
        return status;
    }
  };

  return (
    <ProtectedRoute>
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

            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => router.push('/dashboard')}>
                Dashboard
              </Button>
              <Button variant="ghost" onClick={() => router.push('/products')}>
                Materiais
              </Button>
              <Button onClick={() => router.push('/dashboard/orders')}>
                Encomendas
              </Button>
            </div>
          </div>
        </nav>

        {/* Content */}
        <div className="container mx-auto max-w-7xl px-4 py-16">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900">Minhas Encomendas</h1>
            <p className="text-gray-600 mt-2">
              Acompanhe o status de suas encomendas e pedidos
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <p className="text-gray-600">Carregando encomendas...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && orders.length === 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhuma encomenda encontrada
              </h3>
              <p className="text-gray-600 mb-4">
                Você ainda não tem encomendas. Comece criando um orçamento!
              </p>
              <Button 
                onClick={() => router.push('/dashboard/quotes')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Ver Orçamentos
              </Button>
            </div>
          )}

          {/* Orders List */}
          {!loading && !error && orders.length > 0 && (
            <div className="space-y-4">
              {orders.map((order) => (
                <div 
                  key={order.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Encomenda #{order.id}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Criada em {new Date(order.createdAt).toLocaleDateString('pt-PT')}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </div>

                  <div className="mb-4">
                    <p className="text-gray-600">
                      {order.items?.length || 0} item(ns) na encomenda
                    </p>
                    {order.total && (
                      <p className="text-lg font-semibold text-gray-900 mt-2">
                        Total: €{order.total.toFixed(2)}
                      </p>
                    )}
                  </div>

                  <Button 
                    variant="outline"
                    onClick={() => router.push(`/dashboard/orders/${order.id}`)}
                  >
                    Rastrear
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
