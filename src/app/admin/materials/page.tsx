'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Loader2,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';
import { PackageIcon } from '~/ui/icons/admin-icons';
import { Button } from '~/ui/primitives/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/ui/primitives/dialog';

interface Material {
  id: number;
  name: string;
  category?: { id: number; name: string };
  price: number | string;
  stock: number;
  isFeatured: boolean;
}

interface Category {
  id: number;
  name: string;
  parentCategoryId: number | null;
}

type SortBy = 'name' | 'price' | 'stock';
type SortOrder = 'asc' | 'desc';

const PAGE_SIZE = 20;

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filtros / ordenação / paginação (estado que vai para o servidor)
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [page, setPage] = useState(1);

  // Material a eliminar (controla o diálogo de confirmação)
  const [toDelete, setToDelete] = useState<Material | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Seleção para ações em lote
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  // Debounce da pesquisa: só dispara 400ms depois de parar de escrever.
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Buscar categorias uma vez (para o filtro).
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/categories?hierarchy=false');
        const data = (await res.json()) as { data?: Category[] };
        setCategories(Array.isArray(data.data) ? data.data : []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    })();
  }, []);

  const fetchMaterials = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: String(PAGE_SIZE),
        page: String(page),
        sortBy,
        sortOrder,
        variants: 'false',
      });
      if (search) params.set('search', search);
      if (categoryId) params.set('categoryId', categoryId);
      if (featuredOnly) params.set('featured', 'true');
      if (inStockOnly) params.set('inStock', 'true');

      const res = await fetch(`/api/materials?${params.toString()}`);
      const data = (await res.json()) as {
        data?: Material[];
        pagination?: { total: number; totalPages: number };
      };
      setMaterials(data.data ?? []);
      setTotal(data.pagination?.total ?? 0);
      setTotalPages(data.pagination?.totalPages ?? 1);
      setSelected(new Set()); // limpa a seleção ao mudar de página/filtro
    } catch (error) {
      console.error('Error fetching materials:', error);
      toast.error('Erro ao carregar materiais');
    } finally {
      setLoading(false);
    }
  }, [page, sortBy, sortOrder, search, categoryId, featuredOnly, inStockOnly]);

  // --- Seleção em lote ---
  const toggleOne = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const allOnPageSelected =
    materials.length > 0 && materials.every((m) => selected.has(m.id));

  const toggleAllOnPage = () => {
    setSelected((prev) => {
      if (materials.every((m) => prev.has(m.id))) {
        const next = new Set(prev);
        materials.forEach((m) => next.delete(m.id));
        return next;
      }
      const next = new Set(prev);
      materials.forEach((m) => next.add(m.id));
      return next;
    });
  };

  const runBulk = async (action: 'feature' | 'unfeature' | 'soft-delete' | 'hard-delete') => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    setBulkBusy(true);
    try {
      const res = await fetch('/api/materials/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ids, action }),
      });
      if (!res.ok) throw new Error('Falha na ação em lote');
      const labels: Record<typeof action, string> = {
        feature: 'marcados como destaque',
        unfeature: 'removidos dos destaques',
        'soft-delete': 'eliminados',
        'hard-delete': 'eliminados permanentemente',
      };
      toast.success(`${ids.length} material(is) ${labels[action]}`);
      setBulkDeleteOpen(false);
      fetchMaterials();
    } catch (error) {
      console.error('Bulk action error:', error);
      toast.error('Erro ao aplicar ação em lote');
    } finally {
      setBulkBusy(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  // Se algum filtro (não a página) muda, volta à página 1.
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setPage(1);
  }, [categoryId, featuredOnly, inStockOnly, sortBy, sortOrder]);

  const toggleSort = (field: SortBy) => {
    if (sortBy === field) {
      setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const confirmDelete = async (permanent: boolean) => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      const url = permanent
        ? `/api/materials/${toDelete.id}?force=true`
        : `/api/materials/${toDelete.id}`;
      const res = await fetch(url, { method: 'DELETE' });
      if (!res.ok) throw new Error('Falha ao eliminar');
      toast.success(
        permanent ? 'Material eliminado permanentemente' : 'Material eliminado',
      );
      setToDelete(null);
      // Se a página ficou vazia e não é a primeira, recua uma.
      if (materials.length === 1 && page > 1) {
        setPage((p) => p - 1);
      } else {
        fetchMaterials();
      }
    } catch (error) {
      console.error('Error deleting material:', error);
      toast.error('Erro ao eliminar material');
    } finally {
      setDeleting(false);
    }
  };

  const hasActiveFilters = useMemo(
    () => Boolean(search || categoryId || featuredOnly || inStockOnly),
    [search, categoryId, featuredOnly, inStockOnly],
  );

  const clearFilters = () => {
    setSearchInput('');
    setSearch('');
    setCategoryId('');
    setFeaturedOnly(false);
    setInStockOnly(false);
  };

  const SortHeader = ({ field, label }: { field: SortBy; label: string }) => (
    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">
      <button
        type="button"
        onClick={() => toggleSort(field)}
        className="inline-flex items-center gap-1 hover:text-gray-900 dark:hover:text-white"
      >
        {label}
        {sortBy === field ? (
          sortOrder === 'asc' ? (
            <ArrowUp className="h-3.5 w-3.5" />
          ) : (
            <ArrowDown className="h-3.5 w-3.5" />
          )
        ) : (
          <ChevronsUpDown className="h-3.5 w-3.5 opacity-40" />
        )}
      </button>
    </th>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Materiais
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Gerir catálogo de materiais
          </p>
        </div>
        <Link href="/admin/materials/new">
          <Button className="gap-2">
            <PackageIcon />
            Novo Material
          </Button>
        </Link>
      </div>

      {/* Filtros */}
      <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Procurar materiais..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            <option value="">Todas as categorias</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.parentCategoryId ? '  ↳ ' : ''}
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={featuredOnly}
              onChange={(e) => setFeaturedOnly(e.target.checked)}
              className="rounded border-gray-300"
            />
            Só em destaque
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="rounded border-gray-300"
            />
            Só com stock
          </label>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm text-primary underline"
            >
              Limpar filtros
            </button>
          )}
          <span className="ml-auto text-sm text-gray-500 dark:text-gray-400">
            {loading ? 'A carregar…' : `${total} material(is)`}
          </span>
        </div>
      </div>

      {/* Barra de ações em lote */}
      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3">
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {selected.size} selecionado(s)
          </span>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" disabled={bulkBusy} onClick={() => runBulk('feature')}>
              Marcar destaque
            </Button>
            <Button variant="outline" size="sm" disabled={bulkBusy} onClick={() => runBulk('unfeature')}>
              Remover destaque
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700 dark:text-red-400"
              disabled={bulkBusy}
              onClick={() => setBulkDeleteOpen(true)}
            >
              Eliminar
            </Button>
          </div>
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className="ml-auto text-sm text-gray-500 underline dark:text-gray-400"
          >
            Limpar seleção
          </button>
        </div>
      )}

      {/* Tabela de Materiais */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
        <table className="w-full">
          <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={allOnPageSelected}
                  onChange={toggleAllOnPage}
                  className="rounded border-gray-300"
                  aria-label="Selecionar todos"
                />
              </th>
              <SortHeader field="name" label="Nome" />
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">
                Categoria
              </th>
              <SortHeader field="price" label="Preço" />
              <SortHeader field="stock" label="Stock" />
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">
                Destaque
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-600 dark:text-gray-400">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                </td>
              </tr>
            ) : materials.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-600 dark:text-gray-400">
                  Nenhum material encontrado
                </td>
              </tr>
            ) : (
              materials.map((material) => {
                const priceNum =
                  typeof material.price === 'number'
                    ? material.price
                    : parseFloat(String(material.price)) || 0;
                return (
                  <tr key={material.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selected.has(material.id)}
                        onChange={() => toggleOne(material.id)}
                        className="rounded border-gray-300"
                        aria-label={`Selecionar ${material.name}`}
                      />
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                      {material.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {material.category?.name || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      €{priceNum.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                          material.stock > 0
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        }`}
                      >
                        {material.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {material.isFeatured ? (
                        <span className="text-yellow-600 dark:text-yellow-400">⭐</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <Link href={`/admin/materials/${material.id}`}>
                          <Button variant="outline" size="sm">
                            Editar
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 dark:text-red-400"
                          onClick={() => setToDelete(material)}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Página {page} de {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Seguinte
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Diálogo de confirmação de eliminação */}
      <Dialog open={!!toDelete} onOpenChange={(open) => !open && setToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar material</DialogTitle>
            <DialogDescription>
              {toDelete && (
                <>
                  Tens a certeza que queres eliminar{' '}
                  <strong>{toDelete.name}</strong>?
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600 dark:bg-gray-800/50 dark:text-gray-400">
            <p>
              <strong>Eliminar</strong> esconde o material mas mantém o histórico
              em encomendas (recomendado).
            </p>
            <p className="mt-1">
              <strong>Eliminar permanentemente</strong> apaga da base de dados e
              não pode ser desfeito.
            </p>
          </div>
          <DialogFooter className="gap-2 sm:justify-between">
            <Button
              variant="outline"
              onClick={() => setToDelete(null)}
              disabled={deleting}
            >
              Cancelar
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="text-red-600 hover:text-red-700 dark:text-red-400"
                onClick={() => confirmDelete(false)}
                disabled={deleting}
              >
                {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Eliminar
              </Button>
              <Button
                className="bg-red-600 text-white hover:bg-red-700"
                onClick={() => confirmDelete(true)}
                disabled={deleting}
              >
                Eliminar permanentemente
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de eliminação em lote */}
      <Dialog open={bulkDeleteOpen} onOpenChange={(open) => !open && setBulkDeleteOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar {selected.size} material(is)</DialogTitle>
            <DialogDescription>
              Escolhe como queres eliminar os materiais selecionados.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600 dark:bg-gray-800/50 dark:text-gray-400">
            <p>
              <strong>Eliminar</strong> esconde-os mas mantém o histórico em
              encomendas (recomendado).
            </p>
            <p className="mt-1">
              <strong>Eliminar permanentemente</strong> apaga da base de dados e
              não pode ser desfeito.
            </p>
          </div>
          <DialogFooter className="gap-2 sm:justify-between">
            <Button variant="outline" onClick={() => setBulkDeleteOpen(false)} disabled={bulkBusy}>
              Cancelar
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="text-red-600 hover:text-red-700 dark:text-red-400"
                onClick={() => runBulk('soft-delete')}
                disabled={bulkBusy}
              >
                {bulkBusy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Eliminar
              </Button>
              <Button
                className="bg-red-600 text-white hover:bg-red-700"
                onClick={() => runBulk('hard-delete')}
                disabled={bulkBusy}
              >
                Eliminar permanentemente
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
