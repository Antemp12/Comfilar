"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { Button } from "~/ui/primitives/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/ui/primitives/card";
import { Checkbox } from "~/ui/primitives/checkbox";
import { Input } from "~/ui/primitives/input";
import { useAuth } from "~/lib/auth-context";

interface Product {
  id: number;
  name: string;
  price: string;
  image: string;
  stock: number;
  isFeatured: boolean;
}

export default function ProductsFeaturedPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Verificar se é admin ou funcionário
  if (user?.type !== "admin" && user?.type !== "funcionario") {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-12">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-800">Apenas administradores e funcionários podem acessar esta página.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fetch produtos
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/admin/products-featured");
        const data = (await response.json()) as any;

        if (data.success && Array.isArray(data.data)) {
          setProducts(data.data);
          setFilteredProducts(data.data);
          const featured = new Set(
            data.data.filter((p: Product) => p.isFeatured).map((p: Product) => p.id)
          );
          setSelectedIds(featured);
        }
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
        toast.error("Erro ao carregar produtos");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filtrar produtos
  useEffect(() => {
    const filtered = products.filter((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  // Toggle produto
  const toggleProduct = (productId: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedIds(newSelected);
  };

  // Salvar alterações
  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch("/api/admin/products-featured", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productIds: Array.from(selectedIds),
        }),
      });

      const data = (await response.json()) as any;

      if (data.success) {
        toast.success("Produtos atualizados com sucesso!");
        // Atualizar lista local
        setProducts((prev) =>
          prev.map((p) => ({
            ...p,
            isFeatured: selectedIds.has(p.id),
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
      <div className="container mx-auto max-w-6xl px-4 py-12">
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">A carregar produtos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>Produtos em Destaque</CardTitle>
          <CardDescription>
            Seleciona até 8 produtos para aparecerem na página inicial
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-3">
            <Input
              placeholder="Pesquisar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {filteredProducts.length === 0 ? (
            <p className="text-slate-500 text-center py-8">
              {searchTerm ? "Nenhum produto encontrado" : "Nenhum produto disponível"}
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((product) => (
                <label
                  key={product.id}
                  className="flex gap-3 p-4 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <Checkbox
                    checked={selectedIds.has(product.id)}
                    onCheckedChange={() => toggleProduct(product.id)}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex gap-2 mb-2">
                      {product.image && (
                        <div className="relative w-16 h-16 rounded border overflow-hidden flex-shrink-0">
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-slate-900 truncate text-sm">
                          {product.name}
                        </h4>
                        <p className="text-sm text-slate-600">
                          €{Number(product.price).toFixed(2)}
                        </p>
                        <p className="text-xs text-slate-500">
                          Stock: {product.stock}
                        </p>
                      </div>
                    </div>
                    {selectedIds.has(product.id) && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded inline-block">
                        Em destaque
                      </span>
                    )}
                  </div>
                </label>
              ))}
            </div>
          )}

          <div className="pt-4 border-t">
            <p className="text-sm text-slate-600 mb-4">
              Produtos selecionados: {selectedIds.size}
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
