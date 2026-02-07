'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '~/ui/primitives/button';

interface Category {
  id: number;
  name: string;
  parentCategoryId: number | null;
}

interface CategoryAttribute {
  id: number;
  name: string;
  values: string[];
}

interface Material {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: number;
  isFeatured: boolean;
  image: string;
  attributes?: Record<string, string[]>; // Changed to array for filtering
}

export default function MaterialFormPage() {
  const router = useRouter();
  const params = useParams();
  const materialId = params?.id as string;
  const isNewMaterial = materialId === 'new';

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryAttributes, setCategoryAttributes] = useState<CategoryAttribute[]>([]);
  const [loading, setLoading] = useState(!isNewMaterial);
  const [submitting, setSubmitting] = useState(false);
  const [material, setMaterial] = useState<Partial<Material>>({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    categoryId: 0,
    isFeatured: false,
    image: '',
    attributes: {},
  });

  useEffect(() => {
    fetchMainCategories();
    if (!isNewMaterial) {
      fetchMaterial();
    }
  }, [materialId, isNewMaterial]);

  // Quando categoria muda, busca os atributos
  useEffect(() => {
    if (material.categoryId) {
      fetchCategoryAttributes(material.categoryId);
    } else {
      setCategoryAttributes([]);
    }
  }, [material.categoryId]);

  const fetchMainCategories = async () => {
    try {
      const response = await fetch('/api/categories?mainOnly=true');
      const data = await response.json() as any;
      // Filtra apenas categorias principais (sem parentCategoryId)
      const mainCategories = (data.data || []).filter((cat: Category) => !cat.parentCategoryId);
      setCategories(mainCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchCategoryAttributes = async (categoryId: number) => {
    try {
      const response = await fetch(`/api/categories/${categoryId}/attributes`);
      const data = await response.json() as any;
      setCategoryAttributes(data.data || []);
    } catch (error) {
      console.error('Error fetching category attributes:', error);
      setCategoryAttributes([]);
    }
  };

  const fetchMaterial = async () => {
    try {
      const response = await fetch(`/api/materials/${materialId}`);
      const data = await response.json() as any;
      setMaterial(data.data || {});
    } catch (error) {
      console.error('Error fetching material:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAttributeChange = (attributeName: string, value: string) => {
    // Use lowercase key for consistency with filtering (which uses normalized names)
    const normalizedKey = attributeName.toLowerCase();
    setMaterial({
      ...material,
      attributes: {
        ...(material.attributes || {}),
        [normalizedKey]: value ? [value] : [], // Save as array for filtering
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      console.log("📝 Saving material with attributes:", material.attributes);
      
      const url = isNewMaterial ? '/api/materials' : `/api/materials/${materialId}`;
      const method = isNewMaterial ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(material),
      });

      if (response.ok) {
        console.log("✅ Material saved successfully!");
        router.push('/admin/materials');
      } else {
        const error = (await response.json()) as any;
        console.error("❌ Save error:", error);
        alert('Erro ao guardar material: ' + (error?.message || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('Error saving material:', error);
      alert('Erro ao guardar material');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600 dark:text-gray-400">A carregar...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {isNewMaterial ? 'Novo Material' : 'Editar Material'}
        </h1>
        <Link href="/admin/materials">
          <Button variant="outline">Voltar</Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        {/* Nome */}
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white">
            Nome
          </label>
          <input
            type="text"
            required
            value={material.name || ''}
            onChange={(e) => setMaterial({ ...material, name: e.target.value })}
            className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>

        {/* Descrição */}
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white">
            Descrição
          </label>
          <textarea
            value={material.description || ''}
            onChange={(e) => setMaterial({ ...material, description: e.target.value })}
            rows={4}
            className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Preço */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white">
              Preço (€)
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={material.price || 0}
              onChange={(e) => setMaterial({ ...material, price: parseFloat(e.target.value) })}
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* Stock */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white">
              Stock
            </label>
            <input
              type="number"
              required
              value={material.stock || 0}
              onChange={(e) => setMaterial({ ...material, stock: parseInt(e.target.value) })}
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>

        {/* Categoria */}
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white">
            Categoria Principal
          </label>
          <select
            required
            value={material.categoryId || 0}
            onChange={(e) => setMaterial({ ...material, categoryId: parseInt(e.target.value), attributes: {} })}
            className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            <option value={0}>Seleciona uma categoria</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Atributos da Categoria */}
        {categoryAttributes.length > 0 && (
          <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
            <h3 className="font-medium text-gray-900 dark:text-white">
              Filtros da Categoria
            </h3>
            {categoryAttributes.map((attr) => {
              // Use lowercase key for consistency with filtering
              const normalizedKey = attr.name.toLowerCase();
              return (
                <div key={attr.id}>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white">
                    {attr.name}
                  </label>
                  <select
                    value={(material.attributes?.[normalizedKey] || '')}
                    onChange={(e) => handleAttributeChange(normalizedKey, e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="">-- Seleciona --</option>
                    {attr.values.map((value, idx) => (
                      <option key={idx} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>
        )}

        {/* Imagem */}
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white">
            URL da Imagem
          </label>
          <input
            type="url"
            value={material.image || ''}
            onChange={(e) => setMaterial({ ...material, image: e.target.value })}
            className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>

        {/* Destaque */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="featured"
            checked={material.isFeatured || false}
            onChange={(e) => setMaterial({ ...material, isFeatured: e.target.checked })}
            className="rounded border-gray-300"
          />
          <label htmlFor="featured" className="text-sm font-medium text-gray-900 dark:text-white">
            Material em Destaque
          </label>
        </div>

        {/* Botões */}
        <div className="flex gap-3">
          <Button type="submit" disabled={submitting}>
            {submitting ? 'A guardar...' : 'Guardar'}
          </Button>
          <Link href="/admin/materials">
            <Button variant="outline">Cancelar</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
