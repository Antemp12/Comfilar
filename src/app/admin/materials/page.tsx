'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PackageIcon, ChevronDownIcon } from '~/ui/icons/admin-icons';
import { Button } from '~/ui/primitives/button';

interface Material {
  id: number;
  name: string;
  category?: { name: string };
  price: number;
  stock: number;
  isFeatured: boolean;
}

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const response = await fetch('/api/materials?limit=100');
      const data = await response.json() as any;
      setMaterials(data.data || []);
    } catch (error) {
      console.error('Error fetching materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteMaterial = async (id: number, permanent: boolean = false) => {
    const message = permanent 
      ? 'Tem a certeza que quer eliminar PERMANENTEMENTE este material? Esta ação não pode ser desfeita!'
      : 'Tem a certeza que quer eliminar este material?';
    
    if (!confirm(message)) return;
    
    try {
      const url = permanent 
        ? `/api/materials/${id}?force=true`
        : `/api/materials/${id}`;
      
      const response = await fetch(url, {
        method: 'DELETE',
      });
      if (response.ok) {
        setMaterials(materials.filter(m => m.id !== id));
      }
    } catch (error) {
      console.error('Error deleting material:', error);
    }
  };

  const filteredMaterials = materials.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
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

      {/* Filtro de Busca */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <input
          type="text"
          placeholder="Procurar materiais..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        />
      </div>

      {/* Tabela de Materiais */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
        <table className="w-full">
          <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">
                Nome
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">
                Categoria
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">
                Preço
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">
                Stock
              </th>
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
                <td colSpan={6} className="px-6 py-8 text-center text-gray-600 dark:text-gray-400">
                  A carregar...
                </td>
              </tr>
            ) : filteredMaterials.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-600 dark:text-gray-400">
                  Nenhum material encontrado
                </td>
              </tr>
            ) : (
              filteredMaterials.map((material) => (
                <tr key={material.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    {material.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {material.category?.name || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    €{typeof material.price === 'number' ? material.price.toFixed(2) : (parseFloat(String(material.price)) || 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                      material.stock > 0
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
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
                      <div className="group relative">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 dark:text-red-400"
                          onClick={() => deleteMaterial(material.id, false)}
                        >
                          Eliminar
                        </Button>
                        <div className="absolute right-0 top-full mt-1 hidden group-hover:block bg-gray-900 text-white text-xs rounded p-2 w-48 z-10 dark:bg-gray-700">
                          Clica para eliminar (soft delete)
                          <br />
                          <button
                            onClick={() => deleteMaterial(material.id, true)}
                            className="text-red-400 underline mt-1"
                          >
                            ou aqui para eliminar permanentemente
                          </button>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
