"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  ImageIcon,
  Loader2,
  Pencil,
  Plus,
  SlidersHorizontal,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/ui/primitives/button";
import { Input } from "@/ui/primitives/input";
import { Badge } from "@/ui/primitives/badge";
import { Switch } from "@/ui/primitives/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/ui/primitives/dialog";
import { useAuth } from "@/lib/auth-context";

interface Subcategory {
  id: number;
  name: string;
  image: string | null;
  isFeatured: boolean;
  isActive: boolean;
  parentCategoryId: number | null;
}

interface Category extends Subcategory {
  subcategories: Subcategory[];
}

type DialogState =
  | { mode: "create"; parentId: number | null; parentName?: string }
  | { mode: "edit"; category: Subcategory }
  | null;

// Aceita: vazio, um URL absoluto (http/https) ou um caminho local carregado (/uploads/...).
const imageValueSchema = z
  .string()
  .trim()
  .refine(
    (v) => v === "" || v.startsWith("/") || /^https?:\/\//i.test(v),
    "URL de imagem inválida",
  );

const categoryFormSchema = z.object({
  name: z.string().trim().min(2, "O nome deve ter pelo menos 2 caracteres"),
  image: imageValueSchema.optional(),
});

export default function CategoriesPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const [dialog, setDialog] = useState<DialogState>(null);
  const [formName, setFormName] = useState("");
  const [formImage, setFormImage] = useState("");
  const [formErrors, setFormErrors] = useState<{ name?: string; image?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  const [toDelete, setToDelete] = useState<Subcategory | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // IDs em processo de ativar/desativar (para desativar o switch enquanto guarda)
  const [togglingIds, setTogglingIds] = useState<Set<number>>(new Set());

  // Editor de filtros (atributos) de uma categoria
  const [filterCat, setFilterCat] = useState<Subcategory | null>(null);
  const [filterAttrs, setFilterAttrs] = useState<
    { name: string; valuesText: string; type: "select" | "number" }[]
  >([]);
  const [filterLoading, setFilterLoading] = useState(false);
  const [filterSaving, setFilterSaving] = useState(false);
  const [normalizing, setNormalizing] = useState(false);

  // Limpeza única: junta filtros duplicados e uniformiza valores/atributos.
  const normalizeFilters = async () => {
    if (
      !window.confirm(
        "Normalizar os filtros antigos? Junta duplicados e uniformiza os valores. É seguro e pode ser repetido.",
      )
    )
      return;
    setNormalizing(true);
    try {
      const res = await fetch("/api/admin/normalize-attributes", {
        method: "POST",
        credentials: "include",
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        message?: string;
      };
      if (!res.ok) throw new Error(data?.error || "Erro ao normalizar");
      toast.success(data.message || "Filtros normalizados");
      fetchCategories();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao normalizar");
    } finally {
      setNormalizing(false);
    }
  };

  const openFilters = async (cat: Subcategory) => {
    setFilterCat(cat);
    setFilterAttrs([]);
    setFilterLoading(true);
    try {
      const res = await fetch(`/api/admin/categories/${cat.id}/attributes`, {
        credentials: "include",
      });
      const data = (await res.json()) as {
        data?: { name: string; values: string[]; type?: string }[];
      };
      setFilterAttrs(
        (data.data ?? []).map((a) => ({
          name: a.name,
          valuesText: (a.values ?? []).join(", "),
          type: a.type === "number" ? "number" : "select",
        })),
      );
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao carregar filtros");
    } finally {
      setFilterLoading(false);
    }
  };

  const addFilterAttr = () =>
    setFilterAttrs((p) => [...p, { name: "", valuesText: "", type: "select" }]);
  const removeFilterAttr = (idx: number) =>
    setFilterAttrs((p) => p.filter((_, i) => i !== idx));
  const updateFilterAttr = (
    idx: number,
    field: "name" | "valuesText" | "type",
    value: string,
  ) =>
    setFilterAttrs((p) =>
      p.map((a, i) => (i === idx ? { ...a, [field]: value } : a)),
    );

  const saveFilters = async () => {
    if (!filterCat) return;
    const attributes = filterAttrs
      .map((a) => ({
        name: a.name.trim(),
        type: a.type,
        values:
          a.type === "number"
            ? []
            : a.valuesText
                .split(",")
                .map((v) => v.trim())
                .filter(Boolean),
      }))
      .filter((a) => a.name && (a.type === "number" || a.values.length > 0));

    const names = attributes.map((a) => a.name.toLowerCase());
    if (new Set(names).size !== names.length) {
      toast.error("Há filtros com o mesmo nome");
      return;
    }

    setFilterSaving(true);
    try {
      const res = await fetch(`/api/admin/categories/${filterCat.id}/attributes`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ attributes }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data?.error || "Erro ao guardar");
      toast.success("Filtros guardados");
      setFilterCat(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao guardar");
    } finally {
      setFilterSaving(false);
    }
  };

  const fetchCategories = async () => {
    setLoading(true);
    try {
      // includeInactive=true: no admin queremos ver também as categorias desativadas.
      const res = await fetch("/api/categories?hierarchy=true&includeInactive=true", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Erro ao buscar categorias");
      const data = await res.json() as { data?: Category[] };
      setCategories(Array.isArray(data?.data) ? data.data : []);
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao carregar categorias");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchCategories();
  }, [user]);

  const toggleExpand = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const openCreate = (parentId: number | null, parentName?: string) => {
    setFormName("");
    setFormImage("");
    setFormErrors({});
    setDialog({ mode: "create", parentId, parentName });
  };

  const openEdit = (category: Subcategory) => {
    setFormName(category.name);
    setFormImage(category.image ?? "");
    setFormErrors({});
    setDialog({ mode: "edit", category });
  };

  const closeDialog = () => setDialog(null);

  const handleSubmit = async () => {
    if (!dialog) return;

    // Validação com zod
    const parsed = categoryFormSchema.safeParse({ name: formName, image: formImage });
    if (!parsed.success) {
      const errs: { name?: string; image?: string } = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as "name" | "image";
        if (key && !errs[key]) errs[key] = issue.message;
      }
      setFormErrors(errs);
      return;
    }
    setFormErrors({});
    const name = formName.trim();

    setSubmitting(true);
    try {
      let res: Response;
      if (dialog.mode === "create") {
        res = await fetch("/api/admin/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            name,
            image: formImage.trim() || null,
            parentCategoryId: dialog.parentId,
          }),
        });
      } else {
        res = await fetch(`/api/admin/categories/${dialog.category.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ name, image: formImage.trim() || null }),
        });
      }

      const data = await res.json().catch(() => ({})) as { error?: string };
      if (!res.ok) throw new Error(data?.error || "Erro ao guardar");

      toast.success(
        dialog.mode === "create" ? "Categoria criada" : "Categoria atualizada",
      );
      if (dialog.mode === "create" && dialog.parentId) {
        setExpanded((prev) => new Set(prev).add(dialog.parentId!));
      }
      closeDialog();
      fetchCategories();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao guardar");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFilePicked = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Limpa o valor para permitir re-selecionar o mesmo ficheiro depois.
    e.target.value = "";
    if (!file) return;

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data?.error || "Erro ao carregar imagem");
      setFormImage(data.url);
      if (formErrors.image) setFormErrors((p) => ({ ...p, image: undefined }));
      toast.success("Imagem carregada");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao carregar imagem");
    } finally {
      setUploading(false);
    }
  };

  const handleToggleActive = async (category: Subcategory) => {
    const next = !category.isActive;
    setTogglingIds((prev) => new Set(prev).add(category.id));
    try {
      const res = await fetch(`/api/admin/categories/${category.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isActive: next }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data?.error || "Erro ao atualizar estado");
      toast.success(next ? "Categoria ativada" : "Categoria desativada");
      fetchCategories();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao atualizar estado");
    } finally {
      setTogglingIds((prev) => {
        const nextSet = new Set(prev);
        nextSet.delete(category.id);
        return nextSet;
      });
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/categories/${toDelete.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({})) as { error?: string };
      if (!res.ok) throw new Error(data?.error || "Erro ao eliminar");
      toast.success("Categoria eliminada");
      setToDelete(null);
      fetchCategories();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao eliminar");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const Thumb = ({ image, name }: { image: string | null; name: string }) =>
    image ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={image}
        alt={name}
        className="h-10 w-10 flex-shrink-0 rounded object-cover"
      />
    ) : (
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded bg-gray-100 dark:bg-gray-800">
        <ImageIcon className="h-4 w-4 text-gray-400" />
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Gestão de Categorias
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Cria, edita e organiza categorias e subcategorias
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={normalizeFilters}
            disabled={normalizing}
            title="Junta filtros duplicados e uniformiza os valores antigos"
          >
            {normalizing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <SlidersHorizontal className="h-4 w-4" />
            )}
            Normalizar filtros
          </Button>
          <Button className="gap-2" onClick={() => openCreate(null)}>
            <Plus className="h-4 w-4" />
            Nova Categoria
          </Button>
        </div>
      </div>

      {categories.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center text-gray-500 dark:border-gray-700">
          Ainda não há categorias. Cria a primeira!
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map((cat) => {
            const isOpen = expanded.has(cat.id);
            return (
              <div
                key={cat.id}
                className="rounded-lg border border-gray-200 dark:border-gray-800"
              >
                {/* Categoria principal */}
                <div className="flex items-center gap-3 p-3">
                  <button
                    type="button"
                    onClick={() => toggleExpand(cat.id)}
                    className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    aria-label={isOpen ? "Recolher" : "Expandir"}
                  >
                    {isOpen ? (
                      <ChevronDown className="h-5 w-5" />
                    ) : (
                      <ChevronRight className="h-5 w-5" />
                    )}
                  </button>
                  <div className={cat.isActive ? "" : "opacity-50"}>
                    <Thumb image={cat.image} name={cat.name} />
                  </div>
                  <div className={`flex-1 ${cat.isActive ? "" : "opacity-60"}`}>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {cat.name}
                    </span>
                    {!cat.isActive && (
                      <Badge variant="secondary" className="ml-2">
                        Inativa
                      </Badge>
                    )}
                    <span className="ml-2 text-xs text-gray-400">
                      {cat.subcategories.length} subcategoria(s)
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <label
                      className="mr-1 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400"
                      title={cat.isActive ? "Desativar categoria" : "Ativar categoria"}
                    >
                      <Switch
                        checked={cat.isActive}
                        disabled={togglingIds.has(cat.id)}
                        onCheckedChange={() => handleToggleActive(cat)}
                      />
                      {cat.isActive ? "Ativa" : "Inativa"}
                    </label>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1"
                      onClick={() => openCreate(cat.id, cat.name)}
                    >
                      <Plus className="h-4 w-4" />
                      Subcategoria
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openFilters(cat)}
                      aria-label="Filtros"
                      title="Filtros da categoria"
                    >
                      <SlidersHorizontal className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEdit(cat)}
                      aria-label="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 dark:text-red-400"
                      onClick={() => setToDelete(cat)}
                      aria-label="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Subcategorias */}
                {isOpen && (
                  <div className="border-t border-gray-100 dark:border-gray-800/60">
                    {cat.subcategories.length === 0 ? (
                      <p className="px-14 py-3 text-sm text-gray-400">
                        Sem subcategorias.
                      </p>
                    ) : (
                      cat.subcategories.map((sub) => (
                        <div
                          key={sub.id}
                          className="flex items-center gap-3 px-14 py-2 hover:bg-gray-50 dark:hover:bg-gray-800/40"
                        >
                          <div className={sub.isActive ? "" : "opacity-50"}>
                            <Thumb image={sub.image} name={sub.name} />
                          </div>
                          <span
                            className={`flex-1 text-sm text-gray-800 dark:text-gray-200 ${
                              sub.isActive ? "" : "opacity-60"
                            }`}
                          >
                            {sub.name}
                            {!sub.isActive && (
                              <Badge variant="secondary" className="ml-2">
                                Inativa
                              </Badge>
                            )}
                          </span>
                          <div className="flex items-center gap-1">
                            <Switch
                              checked={sub.isActive}
                              disabled={togglingIds.has(sub.id)}
                              onCheckedChange={() => handleToggleActive(sub)}
                              title={sub.isActive ? "Desativar" : "Ativar"}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openFilters(sub)}
                              aria-label="Filtros"
                              title="Filtros da subcategoria"
                            >
                              <SlidersHorizontal className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEdit(sub)}
                              aria-label="Editar"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 dark:text-red-400"
                              onClick={() => setToDelete(sub)}
                              aria-label="Eliminar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Dialog criar/editar */}
      <Dialog open={!!dialog} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialog?.mode === "create"
                ? dialog.parentId
                  ? `Nova subcategoria em "${dialog.parentName}"`
                  : "Nova categoria"
                : "Editar categoria"}
            </DialogTitle>
            <DialogDescription>
              Define o nome e, opcionalmente, uma imagem (URL).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Nome<span className="ml-0.5 text-red-500">*</span>
              </label>
              <Input
                value={formName}
                onChange={(e) => {
                  setFormName(e.target.value);
                  if (formErrors.name) setFormErrors((p) => ({ ...p, name: undefined }));
                }}
                placeholder="Ex: Cimento e Aglomerantes"
                autoFocus
                aria-invalid={!!formErrors.name}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !submitting) handleSubmit();
                }}
              />
              {formErrors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.name}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Imagem — opcional
              </label>

              {/* Carregar ficheiro do PC */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                className="hidden"
                onChange={handleFilePicked}
              />
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  Carregar do PC
                </Button>
                {formImage.trim() && (
                  <button
                    type="button"
                    className="text-sm text-red-600 hover:underline dark:text-red-400"
                    onClick={() => setFormImage("")}
                  >
                    Remover
                  </button>
                )}
              </div>

              <p className="my-2 text-center text-xs text-gray-400">ou usar um URL</p>

              <Input
                value={formImage}
                onChange={(e) => {
                  setFormImage(e.target.value);
                  if (formErrors.image) setFormErrors((p) => ({ ...p, image: undefined }));
                }}
                placeholder="https://..."
                aria-invalid={!!formErrors.image}
              />
              {formErrors.image && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.image}</p>
              )}
              {formImage.trim() && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={formImage}
                  alt="Pré-visualização"
                  className="mt-2 h-32 w-full rounded object-cover"
                />
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={submitting}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog eliminar */}
      <Dialog open={!!toDelete} onOpenChange={(open) => !open && setToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar categoria</DialogTitle>
            <DialogDescription>
              {toDelete && (
                <>
                  Tens a certeza que queres eliminar{" "}
                  <strong>{toDelete.name}</strong>? Se tiver subcategorias ou
                  materiais associados, a eliminação será bloqueada.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setToDelete(null)}
              disabled={deleting}
            >
              Cancelar
            </Button>
            <Button
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog editor de filtros (atributos) */}
      <Dialog open={!!filterCat} onOpenChange={(open) => !open && setFilterCat(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Filtros — {filterCat?.name}</DialogTitle>
            <DialogDescription>
              Define os filtros (ex: Cor, Diâmetro) e os valores possíveis, separados
              por vírgula. Os produtos desta categoria vão poder ser filtrados por eles.
              {filterCat?.parentCategoryId != null && (
                <span className="mt-1 block text-xs text-gray-500">
                  Nota: os filtros da categoria-mãe já são herdados automaticamente.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          {filterLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : (
            <div className="space-y-3">
              {filterAttrs.length === 0 && (
                <p className="py-4 text-center text-sm text-gray-500">
                  Ainda não há filtros. Adiciona o primeiro.
                </p>
              )}
              {filterAttrs.map((attr, idx) => (
                <div
                  key={idx}
                  className="space-y-2 rounded-lg border border-gray-200 p-3 dark:border-gray-800"
                >
                  <div className="flex items-center gap-2">
                    <Input
                      value={attr.name}
                      onChange={(e) => updateFilterAttr(idx, "name", e.target.value)}
                      placeholder="Nome do filtro (ex: Cor)"
                    />
                    <select
                      value={attr.type}
                      onChange={(e) => updateFilterAttr(idx, "type", e.target.value)}
                      className="rounded-md border border-gray-300 px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    >
                      <option value="select">Lista</option>
                      <option value="number">Número</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => removeFilterAttr(idx)}
                      className="rounded-md border border-gray-300 p-2 text-red-500 hover:bg-red-50 dark:border-gray-700 dark:hover:bg-red-900/20"
                      aria-label="Remover filtro"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  {attr.type === "number" ? (
                    <p className="text-xs text-gray-500">
                      Filtro numérico (ex: Potência em W). Cada material terá um número; no
                      catálogo filtra-se por intervalo mín–máx.
                    </p>
                  ) : (
                    <Input
                      value={attr.valuesText}
                      onChange={(e) => updateFilterAttr(idx, "valuesText", e.target.value)}
                      placeholder="Valores separados por vírgula (ex: Branco, Preto, Cinza)"
                    />
                  )}
                </div>
              ))}

              <Button variant="outline" className="w-full gap-2" onClick={addFilterAttr}>
                <Plus className="h-4 w-4" />
                Adicionar filtro
              </Button>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setFilterCat(null)}
              disabled={filterSaving}
            >
              Cancelar
            </Button>
            <Button onClick={saveFilters} disabled={filterSaving || filterLoading}>
              {filterSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar filtros
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
