"use client";

import Link from "next/link";

import { useFavorites } from "~/lib/hooks/use-favorites";
import { Button } from "~/ui/primitives/button";
import { Card, CardContent } from "~/ui/primitives/card";
import { ProductCard } from "~/ui/components/product-card";

export default function FavoritesPage() {
  const { favoriteItems, loading } = useFavorites();

  if (loading) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">A carregar favoritos...</p>
          </div>
        </div>
      </div>
    );
  }

  if (favoriteItems.length === 0) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <Card className="p-10 text-center">
          <CardContent>
            <h2 className="text-2xl font-bold text-slate-900">Sem favoritos ainda</h2>
            <p className="mt-2 text-slate-600">
              Clica no coração de um produto para guardar aqui.
            </p>
            <Button asChild className="mt-6">
              <Link href="/dashboard/products">Ver produtos</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 rounded-xl border bg-gradient-to-r from-slate-50 to-rose-50 px-6 py-5">
        <h1 className="text-3xl font-bold text-slate-900">Favoritos</h1>
        <p className="text-slate-600">Os teus produtos guardados.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {favoriteItems.map((favorite) => {
          if (!favorite.material) return null;
          return (
            <ProductCard
              key={favorite.material.id}
              product={{
                id: String(favorite.material.id),
                name: favorite.material.name,
                price: Number(favorite.material.price),
                image: favorite.material.image || "/images/placeholder.png",
                category: favorite.category?.name || "Sem categoria",
                inStock: (favorite.material.stock ?? 0) > 0,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
