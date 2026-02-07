"use client";

import { useEffect, useState } from "react";
import { Button } from "@/ui/primitives/button";
import { Input } from "@/ui/primitives/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/ui/primitives/dialog";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface Category {
  id: number;
  name: string;
  image: string | null;
  isFeatured: boolean;
  parentCategoryId: number | null;
}

export default function CategoriesPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchCategories();
  }, [user]);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories?hierarchy=false", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Erro ao buscar categorias");
      const data = await response.json();
      
      // Handle multiple response formats
      const categoriesList = Array.isArray(data?.data) ? data.data : 
                             Array.isArray(data) ? data : [];
      setCategories(categoriesList.filter((cat: Category) => !cat.parentCategoryId));
    } catch (error) {
      console.error("Erro:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpdate = async () => {
    if (!editingId || !imageUrl.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/admin/categories/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ image: imageUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Erro detalhado:", errorData);
        throw new Error(errorData?.error || "Erro ao atualizar imagem");
      }

      const updatedCategory = await response.json();
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === editingId ? { ...cat, image: imageUrl } : cat
        )
      );
      setEditingId(null);
      setImageUrl("");
      alert("Imagem atualizada com sucesso!");
    } catch (error) {
      console.error("Erro:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro ao atualizar imagem";
      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Imagens de Categorias</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div key={cat.id} className="border rounded-lg overflow-hidden">
            {cat.image ? (
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-48 object-cover"
              />
            ) : (
              <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">Sem imagem</span>
              </div>
            )}

            <div className="p-4">
              <h2 className="font-semibold mb-2">{cat.name}</h2>
              {cat.isFeatured && (
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded mb-2 inline-block">
                  Em Destaque
                </span>
              )}

              <Dialog open={editingId === cat.id} onOpenChange={(open) => {
                if (!open) {
                  setEditingId(null);
                  setImageUrl("");
                }
              }}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setEditingId(cat.id);
                      setImageUrl(cat.image || "");
                    }}
                  >
                    Editar Imagem
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Editar Imagem - {cat.name}</DialogTitle>
                    <DialogDescription>
                      Cole a URL de uma imagem (ex: Unsplash)
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <Input
                      placeholder="https://images.unsplash.com/..."
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                    />

                    {imageUrl && (
                      <img
                        src={imageUrl}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded"
                        onError={() =>
                          alert("URL de imagem inválida")
                        }
                      />
                    )}

                    <Button
                      onClick={handleImageUpdate}
                      disabled={submitting || !imageUrl.trim()}
                      className="w-full"
                    >
                      {submitting ? (
                        <Loader2 className="animate-spin mr-2 h-4 w-4" />
                      ) : null}
                      Salvar Imagem
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
