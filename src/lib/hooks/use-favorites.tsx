"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";

import { useAuth } from "~/lib/auth-context";

interface FavoriteMaterial {
  materialId: number;
  material: {
    id: number;
    name: string;
    price: string;
    image: string;
    stock: number;
    categoryId: number;
  } | null;
  category: {
    id: number;
    name: string;
  } | null;
}

interface FavoritesContextType {
  favorites: Set<number>;
  favoriteItems: FavoriteMaterial[];
  loading: boolean;
  isFavorite: (materialId: number) => boolean;
  toggleFavorite: (materialId: number) => Promise<void>;
  refreshFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

function getAuthHeader(token: string | null) {
  if (!token) return "";
  return `Bearer ${token}`;
}

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { token, user } = useAuth();
  const [favoriteItems, setFavoriteItems] = useState<FavoriteMaterial[]>([]);
  const [loading, setLoading] = useState(false);

  const favorites = useMemo(() => {
    return new Set(
      favoriteItems
        .map((item) => item.material?.id)
        .filter((id): id is number => typeof id === "number"),
    );
  }, [favoriteItems]);

  const refreshFavorites = useCallback(async () => {
    if (!user?.id || !token) {
      setFavoriteItems([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/favorites", {
        headers: {
          Authorization: getAuthHeader(token),
        },
      });
      if (!response.ok) {
        setFavoriteItems([]);
        return;
      }
      const data = (await response.json()) as { data?: FavoriteMaterial[] };
      setFavoriteItems(Array.isArray(data?.data) ? data.data : []);
    } catch (error) {
      console.error("Erro ao carregar favoritos:", error);
      setFavoriteItems([]);
    } finally {
      setLoading(false);
    }
  }, [token, user?.id]);

  useEffect(() => {
    refreshFavorites();
  }, [refreshFavorites]);

  const toggleFavorite = useCallback(
    async (materialId: number) => {
      if (!user?.id || !token) {
        toast.error("Faça login para adicionar aos favoritos");
        return;
      }

      const currentlyFavorite = favorites.has(materialId);
      try {
        const response = await fetch("/api/favorites", {
          method: currentlyFavorite ? "DELETE" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: getAuthHeader(token),
          },
          body: JSON.stringify({ materialId }),
        });

        if (!response.ok) {
          throw new Error("Falha ao atualizar favorito");
        }

        const data = (await response.json()) as { data?: FavoriteMaterial[] };
        setFavoriteItems(Array.isArray(data?.data) ? data.data : []);

        toast.success(
          currentlyFavorite
            ? "Removido dos favoritos"
            : "Adicionado aos favoritos",
        );
      } catch (error) {
        console.error("Erro ao atualizar favorito:", error);
        toast.error("Erro ao atualizar favorito");
      }
    },
    [favorites, token, user?.id],
  );

  const isFavorite = useCallback(
    (materialId: number) => favorites.has(materialId),
    [favorites],
  );

  const value = useMemo(
    () => ({
      favorites,
      favoriteItems,
      loading,
      isFavorite,
      toggleFavorite,
      refreshFavorites,
    }),
    [favorites, favoriteItems, loading, isFavorite, refreshFavorites, toggleFavorite],
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within FavoritesProvider");
  }
  return context;
}
