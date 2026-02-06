'use client';

import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '~/ui/primitives/button';
import { useAuth } from '~/lib/auth-context';
import { ProtectedRoute } from '~/lib/protected-route';
import { toast } from 'sonner';

interface Quote {
  id: number;
  userId: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  items?: any[];
  total?: number;
}

export default function QuoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const router = useRouter();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchQuote = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/quotes/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!response.ok) {
          throw new Error('Orçamento não encontrado');
        }

        const data = await response.json() as any;
        setQuote(data.data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar orçamento');
        setQuote(null);
      } finally {
        setLoading(false);
      }
    };

    fetchQuote();
  }, [id, token]);

  const handleApprove = async () => {
    if (!quote) return;

    try {
      setSubmitting(true);
      const response = await fetch(`/api/quotes/${quote.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'approved' }),
      });

      if (!response.ok) {
        throw new Error('Erro ao aprovar orçamento');
      }

      toast.success('Orçamento aprovado com sucesso!');
      router.push('/dashboard/quotes');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao aprovar orçamento');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!quote) return;

    try {
      setSubmitting(true);
      const response = await fetch(`/api/quotes/${quote.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'rejected' }),
      });

      if (!response.ok) {
        throw new Error('Erro ao rejeitar orçamento');
      }

      toast.success('Orçamento rejeitado');
      router.push('/dashboard/quotes');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao rejeitar orçamento');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConvert = async () => {
    if (!quote) return;

    try {
      setSubmitting(true);
      const response = await fetch(`/api/quotes/${quote.id}/convert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao converter para encomenda');
      }

      toast.success('Orçamento convertido em encomenda!');
      router.push('/dashboard/quotes');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao converter orçamento');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'converted':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'approved':
        return 'Aprovado';
      case 'rejected':
        return 'Rejeitado';
      case 'converted':
        return 'Convertido';
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
              <Button onClick={() => router.push('/dashboard/quotes')}>
                Orçamentos
              </Button>
            </div>
          </div>
        </nav>

        {/* Content */}
        <div className="container mx-auto max-w-7xl px-4 py-16">
          {/* Back Button */}
          <Button 
            variant="ghost"
            onClick={() => router.push('/dashboard/quotes')}
            className="mb-6"
          >
            ← Voltar aos Orçamentos
          </Button>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <p className="text-gray-600">Carregando orçamento...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Quote Details */}
          {!loading && !error && quote && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900">
                    Orçamento #{quote.id}
                  </h1>
                  <p className="text-gray-600 mt-2">
                    Criado em {new Date(quote.createdAt).toLocaleDateString('pt-PT')} às {new Date(quote.createdAt).toLocaleTimeString('pt-PT')}
                  </p>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(quote.status)}`}>
                  {getStatusLabel(quote.status)}
                </span>
              </div>

              {/* Items */}
              {quote.items && quote.items.length > 0 && (
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
                      {quote.items.map((item, idx) => (
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
              {quote.total !== undefined && (
                <div className="flex justify-end">
                  <div className="bg-blue-50 rounded-lg p-6 w-full max-w-xs">
                    <p className="text-gray-600 text-sm mb-2">Total do Orçamento</p>
                    <p className="text-4xl font-bold text-gray-900">
                      €{quote.total.toFixed(2)}
                    </p>
                  </div>
                </div>
              )}

              {/* Actions */}
              {quote.status === 'pending' && (
                <div className="flex gap-4 pt-6 border-t border-gray-200">
                  <Button 
                    onClick={handleApprove}
                    disabled={submitting}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {submitting ? 'Processando...' : 'Aprovar Orçamento'}
                  </Button>
                  <Button 
                    onClick={handleReject}
                    disabled={submitting}
                    variant="outline"
                  >
                    {submitting ? 'Processando...' : 'Rejeitar'}
                  </Button>
                </div>
              )}

              {quote.status === 'approved' && quote.status !== 'converted' && (
                <div className="flex gap-4 pt-6 border-t border-gray-200">
                  <Button 
                    onClick={handleConvert}
                    disabled={submitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {submitting ? 'Processando...' : 'Converter em Encomenda'}
                  </Button>
                </div>
              )}

              {quote.status === 'converted' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800">
                    Este orçamento foi convertido em uma encomenda. Acompanhe seu pedido em "Minhas Encomendas".
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
