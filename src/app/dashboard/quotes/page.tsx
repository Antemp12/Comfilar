'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '~/ui/primitives/button';
import { useAuth } from '~/lib/auth-context';
import { ProtectedRoute } from '~/lib/protected-route';

interface Quote {
  id: number;
  userId: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  items?: any[];
  total?: number;
}

export default function QuotesPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/quotes', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!response.ok) {
          throw new Error('Erro ao carregar orçamentos');
        }

        const data = await response.json() as any;
        setQuotes(data.data || []);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar orçamentos');
        setQuotes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchQuotes();
  }, [token]);

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
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900">Meus Orçamentos</h1>
            <p className="text-gray-600 mt-2">
              Gerencie seus orçamentos e pedidos de construção
            </p>
          </div>

          {/* Create New Quote Button */}
          <div className="mb-8">
            <Button 
              onClick={() => router.push('/products')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Criar Novo Orçamento
            </Button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <p className="text-gray-600">Carregando orçamentos...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && quotes.length === 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhum orçamento encontrado
              </h3>
              <p className="text-gray-600 mb-4">
                Comece criando seu primeiro orçamento para materiais de construção
              </p>
              <Button 
                onClick={() => router.push('/products')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Explorar Materiais
              </Button>
            </div>
          )}

          {/* Quotes List */}
          {!loading && !error && quotes.length > 0 && (
            <div className="space-y-4">
              {quotes.map((quote) => (
                <div 
                  key={quote.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Orçamento #{quote.id}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Criado em {new Date(quote.createdAt).toLocaleDateString('pt-PT')}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(quote.status)}`}>
                      {getStatusLabel(quote.status)}
                    </span>
                  </div>

                  <div className="mb-4">
                    <p className="text-gray-600">
                      {quote.items?.length || 0} item(ns) no orçamento
                    </p>
                    {quote.total && (
                      <p className="text-lg font-semibold text-gray-900 mt-2">
                        Total: €{quote.total.toFixed(2)}
                      </p>
                    )}
                  </div>

                  <Button 
                    variant="outline"
                    onClick={() => router.push(`/dashboard/quotes/${quote.id}`)}
                  >
                    Ver Detalhes
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
