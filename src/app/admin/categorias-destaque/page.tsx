"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "~/ui/primitives/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/ui/primitives/card";
import { Checkbox } from "~/ui/primitives/checkbox";
import { useAuth } from "~/lib/auth-context";

interface Category {
  id: number;
  name: string;
  isFeatured: boolean;
}

export default function CategoriesFeaturedPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Verificar se é admin ou funcionário
  if (user?.type !== "admin" && user?.type !== "funcionario") {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-800">Apenas administradores e funcionários podem acessar esta página.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fetch categorias
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/admin/categories-featured");
        const data = (await response.json()) as any;

        if (data.success && Array.isArray(data.data)) {
          setCategories(data.data);
          const featured = new Set(
            data.data.filter((cat: Category) => cat.isFeatured).map((cat: Category) => cat.id)
          );
          setSelectedIds(featured);
        }
      } catch (error) {
        console.error("Erro ao buscar categorias:", error);
        toast.error("Erro ao carregar categorias");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Toggle categoria
  const toggleCategory = (categoryId: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(categoryId)) {
      newSelected.delete(categoryId);
    } else {
      newSelected.add(categoryId);
    }
    setSelectedIds(newSelected);
  };

  // Salvar alterações
  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch("/api/admin/categories-featured", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryIds: Array.from(selectedIds),
        }),
      });

      const data = (await response.json()) as any;

      if (data.success) {
        toast.success("Categorias atualizadas com sucesso!");
        // Atualizar lista local
        setCategories((prev) =>
          prev.map((cat) => ({
            ...cat,
            isFeatured: selectedIds.has(cat.id),
          }))
        );
      } else {
        toast.error(data.message || "Erro ao salvar");
      }
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar alterações");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">A carregar categorias...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>Categorias em Destaque</CardTitle>
          <CardDescription>
            Seleciona até 4 categorias principais para aparecerem na página inicial
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            {categories.length === 0 ? (
              <p className="text-slate-500">Nenhuma categoria disponível</p>
            ) : (
              categories.map((category) => (
                <label
                  key={category.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <Checkbox
                    checked={selectedIds.has(category.id)}
                    onCheckedChange={() => toggleCategory(category.id)}
                  />
                  <span className="flex-1 font-medium text-slate-900">
                    {category.name}
                  </span>
                  {selectedIds.has(category.id) && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      Em destaque
                    </span>
                  )}
                </label>
              ))
            )}
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-slate-600 mb-4">
              Categorias selecionadas: {selectedIds.size}
            </p>
            <Button
              onClick={handleSave}
              disabled={saving || selectedIds.size === 0}
              className="w-full"
            >
              {saving ? "A guardar..." : "Guardar alterações"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
