'use client';

import { useRouter, useParams } from 'next/navigation';
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

const statusTimeline = ['processamento', 'preparacao', 'enviado', 'entregue'];

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/orders/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!response.ok) {
          throw new Error('Encomenda não encontrada');
        }

        const data = await response.json() as any;
        setOrder(data.data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar encomenda');
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, token]);

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

  const isStatusCompleted = (checkStatus: string) => {
    if (order?.status === 'cancelada') return false;
    const currentIndex = statusTimeline.indexOf(order?.status || '');
    const checkIndex = statusTimeline.indexOf(checkStatus);
    return checkIndex <= currentIndex;
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
          {/* Back Button */}
          <Button 
            variant="ghost"
            onClick={() => router.push('/dashboard/orders')}
            className="mb-6"
          >
            ← Voltar às Encomendas
          </Button>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <p className="text-gray-600">Carregando encomenda...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Order Details */}
          {!loading && !error && order && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900">
                    Encomenda #{order.id}
                  </h1>
                  <p className="text-gray-600 mt-2">
                    Criada em {new Date(order.createdAt).toLocaleDateString('pt-PT')} às {new Date(order.createdAt).toLocaleTimeString('pt-PT')}
                  </p>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {getStatusLabel(order.status)}
                </span>
              </div>

              {/* Timeline */}
              {order.status !== 'cancelada' && (
                <div className="bg-white border border-gray-200 rounded-lg p-8 mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Status da Entrega</h2>
                  <div className="flex items-center justify-between">
                    {statusTimeline.map((status, index) => (
                      <div key={status} className="flex flex-col items-center relative flex-1">
                        {/* Circle */}
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center z-10 ${
                          isStatusCompleted(status)
                            ? 'bg-green-500 text-white'
                            : status === order.status
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          {isStatusCompleted(status) ? '✓' : index + 1}
                        </div>
                        
                        {/* Line */}
                        {index < statusTimeline.length - 1 && (
                          <div className={`h-1 absolute top-6 left-1/2 w-full ${
                            isStatusCompleted(status)
                              ? 'bg-green-500'
                              : 'bg-gray-200'
                          }`} style={{ width: 'calc(100% - 2rem)' }}></div>
                        )}
                        
                        {/* Label */}
                        <p className="text-sm font-medium text-gray-900 mt-3 text-center capitalize">
                          {status}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Items */}
              {order.items && order.items.length > 0 && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Material</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Quantidade</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Preço Unitário</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {order.items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-gray-900">{item.name || 'Item'}</td>
                          <td className="px-6 py-4 text-gray-600">{item.quantity || 1}</td>
                          <td className="px-6 py-4 text-gray-600">€{(item.price || 0).toFixed(2)}</td>
                          <td className="px-6 py-4 text-gray-900 font-medium">
                            €{((item.quantity || 1) * (item.price || 0)).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Total */}
              {order.total !== undefined && (
                <div className="flex justify-end">
                  <div className="bg-blue-50 rounded-lg p-6 w-full max-w-xs">
                    <p className="text-gray-600 text-sm mb-2">Total da Encomenda</p>
                    <p className="text-4xl font-bold text-gray-900">
                      €{order.total.toFixed(2)}
                    </p>
                  </div>
                </div>
              )}

              {/* Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-900 text-sm">
                  Última atualização: {new Date(order.updatedAt).toLocaleDateString('pt-PT')} às {new Date(order.updatedAt).toLocaleTimeString('pt-PT')}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
