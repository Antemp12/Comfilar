'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2, Upload } from 'lucide-react';
import { Button } from '~/ui/primitives/button';
import { MAX_MATERIAL_IMAGES } from '~/lib/material-images';

// Schema de validação do material (obrigatórios + invalidações)
const materialSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'O nome deve ter pelo menos 2 caracteres')
    .max(150, 'O nome é demasiado longo'),
  description: z.string().max(2000, 'Descrição demasiado longa').optional(),
  price: z
    .number({ error: 'Preço inválido' })
    .finite('Preço inválido')
    .gt(0, 'O preço deve ser maior que 0'),
  stock: z
    .number({ error: 'Stock inválido' })
    .int('O stock deve ser um número inteiro')
    .min(0, 'O stock não pode ser negativo'),
  categoryId: z
    .number({ error: 'Categoria inválida' })
    .int()
    .gt(0, 'Seleciona uma categoria'),
  images: z
    .array(z.object({ url: z.string().trim().url('URL de imagem inválida'), isDefault: z.boolean() }))
    .max(MAX_MATERIAL_IMAGES, `Máximo de ${MAX_MATERIAL_IMAGES} imagens`)
    .optional(),
});

type FieldErrors = Partial<Record<keyof z.infer<typeof materialSchema>, string>>;

// Asterisco de campo obrigatório.
const Req = () => <span className="ml-0.5 text-red-500">*</span>;

interface Subcategory {
  id: number;
  name: string;
}

interface CategoryNode {
  id: number;
  name: string;
  subcategories: Subcategory[];
}

interface CategoryAttribute {
  id: number;
  name: string;
  values: string[];
  type?: string; // "select" | "number"
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

  const [tree, setTree] = useState<CategoryNode[]>([]);
  const [mainCategoryId, setMainCategoryId] = useState<number>(0);
  const [categoryAttributes, setCategoryAttributes] = useState<CategoryAttribute[]>([]);
  const [loading, setLoading] = useState(!isNewMaterial);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [images, setImages] = useState<{ url: string; isDefault: boolean }[]>([
    { url: '', isDefault: true },
  ]);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
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
    fetchTree();
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

  // Resolve qual a categoria PRINCIPAL a partir da categoryId guardada
  // (que pode ser uma subcategoria), assim que a árvore e o material carregam.
  useEffect(() => {
    if (!tree.length || !material.categoryId) return;
    const asMain = tree.find((c) => c.id === material.categoryId);
    if (asMain) {
      setMainCategoryId(asMain.id);
      return;
    }
    const parent = tree.find((c) =>
      c.subcategories.some((s) => s.id === material.categoryId),
    );
    if (parent) setMainCategoryId(parent.id);
  }, [tree, material.categoryId]);

  const fetchTree = async () => {
    try {
      const response = await fetch('/api/categories?hierarchy=true');
      const data = await response.json() as { data?: CategoryNode[] };
      setTree(Array.isArray(data.data) ? data.data : []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Subcategorias da categoria principal selecionada.
  const subcategories =
    tree.find((c) => c.id === mainCategoryId)?.subcategories ?? [];

  // Ao mudar a categoria principal: por defeito guarda a principal como categoria
  // do material (até escolher subcategoria) e limpa atributos.
  const handleMainCategoryChange = (id: number) => {
    setMainCategoryId(id);
    setMaterial({ ...material, categoryId: id, attributes: {} });
  };

  // Ao mudar a subcategoria: se vazio, volta à principal.
  const handleSubcategoryChange = (id: number) => {
    setMaterial({
      ...material,
      categoryId: id || mainCategoryId,
      attributes: {},
    });
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
      const mat = data.data || {};
      setMaterial(mat);

      // Popula as imagens: da tabela dedicada, ou (fallback) da imagem única.
      const imgs: { url: string; isDefault: boolean }[] = Array.isArray(mat.images) && mat.images.length
        ? mat.images.map((i: { url: string; isDefault: boolean }) => ({
            url: i.url,
            isDefault: !!i.isDefault,
          }))
        : mat.image
          ? [{ url: mat.image, isDefault: true }]
          : [{ url: '', isDefault: true }];
      if (!imgs.some((i) => i.isDefault)) imgs[0].isDefault = true;
      setImages(imgs);
    } catch (error) {
      console.error('Error fetching material:', error);
    } finally {
      setLoading(false);
    }
  };

  // --- Gestão das imagens (1 a 3, uma por-defeito) ---
  const updateImageUrl = (idx: number, url: string) => {
    setImages((prev) => prev.map((img, i) => (i === idx ? { ...img, url } : img)));
    clearError('images');
  };

  // Carregar uma foto do PC para a linha `idx`.
  const handleImageFile = async (
    idx: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // permite re-selecionar o mesmo ficheiro
    if (!file) return;
    setUploadingIdx(idx);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        credentials: 'include',
        body: fd,
      });
      const data = (await res.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
      };
      if (!res.ok || !data.url) throw new Error(data?.error || 'Erro ao carregar imagem');
      updateImageUrl(idx, data.url);
      toast.success('Imagem carregada');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao carregar imagem');
    } finally {
      setUploadingIdx(null);
    }
  };

  const addImage = () => {
    setImages((prev) =>
      prev.length >= MAX_MATERIAL_IMAGES ? prev : [...prev, { url: '', isDefault: false }],
    );
  };

  const removeImage = (idx: number) => {
    setImages((prev) => {
      if (prev.length <= 1) return prev;
      const next = prev.filter((_, i) => i !== idx);
      // Se removemos a por-defeito, a primeira passa a ser a por-defeito.
      if (!next.some((i) => i.isDefault)) next[0].isDefault = true;
      return next;
    });
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

    // Só imagens com URL preenchido contam. A primeira é sempre a principal.
    const cleanedImages = images
      .filter((img) => img.url.trim())
      .map((img, i) => ({ ...img, isDefault: i === 0 }));

    // Validação com zod antes de enviar
    const parsed = materialSchema.safeParse({ ...material, images: cleanedImages });
    if (!parsed.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FieldErrors;
        if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      toast.error('Corrige os campos assinalados');
      return;
    }
    setErrors({});
    setSubmitting(true);

    try {
      const url = isNewMaterial ? '/api/materials' : `/api/materials/${materialId}`;
      const method = isNewMaterial ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...material, images: cleanedImages }),
      });

      if (response.ok) {
        toast.success(isNewMaterial ? 'Material criado' : 'Material atualizado');
        router.push('/admin/materials');
      } else {
        const error = (await response.json()) as { message?: string };
        console.error('Save error:', error);
        toast.error('Erro ao guardar: ' + (error?.message || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('Error saving material:', error);
      toast.error('Erro ao guardar material');
    } finally {
      setSubmitting(false);
    }
  };

  // Limpa o erro de um campo quando o utilizador o corrige.
  const clearError = (field: keyof FieldErrors) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
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
            <Req />
          </label>
          <input
            type="text"
            value={material.name || ''}
            onChange={(e) => {
              setMaterial({ ...material, name: e.target.value });
              clearError('name');
            }}
            className={`mt-2 w-full rounded-lg border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:text-white ${
              errors.name
                ? 'border-red-500 dark:border-red-500'
                : 'border-gray-300 dark:border-gray-700'
            }`}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
          )}
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
              <Req />
            </label>
            <input
              type="number"
              step="0.01"
              value={Number.isFinite(material.price) ? material.price : ''}
              onChange={(e) => {
                setMaterial({ ...material, price: parseFloat(e.target.value) });
                clearError('price');
              }}
              className={`mt-2 w-full rounded-lg border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:text-white ${
                errors.price
                  ? 'border-red-500 dark:border-red-500'
                  : 'border-gray-300 dark:border-gray-700'
              }`}
            />
            {errors.price && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.price}</p>
            )}
          </div>

          {/* Stock */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white">
              Stock
              <Req />
            </label>
            <input
              type="number"
              value={Number.isFinite(material.stock) ? material.stock : ''}
              onChange={(e) => {
                setMaterial({ ...material, stock: parseInt(e.target.value) });
                clearError('stock');
              }}
              className={`mt-2 w-full rounded-lg border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:text-white ${
                errors.stock
                  ? 'border-red-500 dark:border-red-500'
                  : 'border-gray-300 dark:border-gray-700'
              }`}
            />
            {errors.stock && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.stock}</p>
            )}
          </div>
        </div>

        {/* Categoria + Subcategoria */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white">
              Categoria Principal
              <Req />
            </label>
            <select
              value={mainCategoryId || 0}
              onChange={(e) => {
                handleMainCategoryChange(parseInt(e.target.value));
                clearError('categoryId');
              }}
              className={`mt-2 w-full rounded-lg border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:text-white ${
                errors.categoryId
                  ? 'border-red-500 dark:border-red-500'
                  : 'border-gray-300 dark:border-gray-700'
              }`}
            >
              <option value={0}>Seleciona uma categoria</option>
              {tree.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.categoryId}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white">
              Subcategoria
              <span className="ml-1 text-xs font-normal text-gray-400">
                (opcional)
              </span>
            </label>
            <select
              value={
                material.categoryId && material.categoryId !== mainCategoryId
                  ? material.categoryId
                  : 0
              }
              onChange={(e) => handleSubcategoryChange(parseInt(e.target.value))}
              disabled={!mainCategoryId || subcategories.length === 0}
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value={0}>
                {subcategories.length === 0
                  ? "Sem subcategorias"
                  : "— Nenhuma —"}
              </option>
              {subcategories.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Atributos da Categoria */}
        {categoryAttributes.length > 0 && (
          <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
            <h3 className="font-medium text-gray-900 dark:text-white">
              Atributos da Categoria
            </h3>
            {categoryAttributes.map((attr) => {
              // Use lowercase key for consistency with filtering
              const normalizedKey = attr.name.toLowerCase();
              return (
                <div key={attr.id}>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white">
                    {attr.name}
                  </label>
                  {attr.type === 'number' ? (
                    <input
                      type="number"
                      step="any"
                      value={material.attributes?.[normalizedKey]?.[0] ?? ''}
                      onChange={(e) => handleAttributeChange(normalizedKey, e.target.value)}
                      placeholder={`${attr.name} (número)`}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                  ) : (
                    <select
                      value={material.attributes?.[normalizedKey]?.[0] ?? ''}
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
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Imagens (1 a 3, uma por-defeito) */}
        <div>
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-900 dark:text-white">
              Imagens do Produto
              <span className="ml-1 text-xs font-normal text-gray-400">
                (até {MAX_MATERIAL_IMAGES} — a primeira é a principal)
              </span>
            </label>
            {images.length < MAX_MATERIAL_IMAGES && (
              <Button type="button" variant="outline" size="sm" onClick={addImage} className="gap-1">
                <Plus className="h-4 w-4" />
                Adicionar
              </Button>
            )}
          </div>

          <div className="mt-2 space-y-3">
            {images.map((img, idx) => (
              <div key={idx} className="flex items-start gap-2">
                {/* Índice / imagem principal */}
                <span
                  className={`mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md border text-xs font-semibold ${
                    idx === 0
                      ? 'border-primary/40 bg-primary/10 text-primary'
                      : 'border-gray-300 text-gray-400 dark:border-gray-700'
                  }`}
                  title={idx === 0 ? 'Imagem principal' : `Imagem ${idx + 1}`}
                >
                  {idx === 0 ? 'Principal' : idx + 1}
                </span>

                <div className="flex-1">
                  {/* Carregar do PC */}
                  <label className="mb-2 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
                    {uploadingIdx === idx ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    Carregar do PC
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                      className="hidden"
                      onChange={(e) => handleImageFile(idx, e)}
                    />
                  </label>
                  <input
                    type="url"
                    placeholder="ou colar um URL: https://..."
                    value={img.url}
                    onChange={(e) => updateImageUrl(idx, e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                  {img.url.trim() && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={img.url}
                      alt={`Imagem ${idx + 1}`}
                      className="mt-2 h-24 w-24 rounded object-cover"
                    />
                  )}
                </div>

                {images.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    title="Remover imagem"
                    className="mt-1 rounded-md border border-gray-300 p-2 text-red-500 hover:bg-red-50 dark:border-gray-700 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          {errors.images && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.images}</p>
          )}
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
        <p className="text-xs text-gray-500 dark:text-gray-400">
          <span className="text-red-500">*</span> Campos obrigatórios
        </p>
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
