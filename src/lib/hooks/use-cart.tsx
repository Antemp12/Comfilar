"use client";

import * as React from "react";

import { useAuth } from "~/lib/auth-context";
import type { CartItem } from "~/ui/components/cart";

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

export interface CartContextType {
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  clearCart: () => void;
  itemCount: number;
  items: CartItem[];
  removeItem: (id: string) => void;
  subtotal: number;
  updateQuantity: (id: string, quantity: number) => void;
}

/* -------------------------------------------------------------------------- */
/*                                Context                                     */
/* -------------------------------------------------------------------------- */

const CartContext = React.createContext<CartContextType | undefined>(undefined);

/* -------------------------------------------------------------------------- */
/*                              Cart API Helpers                              */
/* -------------------------------------------------------------------------- */

const getAuthHeader = (token?: string | null) => {
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const fetchCart = async (token?: string | null) => {
  try {
    const response = await fetch("/api/cart", {
      headers: getAuthHeader(token),
    });
    if (!response.ok) return [];
    return response.json();
  } catch (error) {
    console.error("Failed to fetch cart:", error);
    return [];
  }
};

const addItemToAPI = async (
  materialId: number,
  quantity: number,
  token?: string | null
) => {
  try {
    const response = await fetch("/api/cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(token),
      },
      body: JSON.stringify({ materialId, quantity }),
    });
    if (!response.ok) return null;
    return response.json();
  } catch (error) {
    console.error("Failed to add item to cart:", error);
    return null;
  }
};

const updateItemInAPI = async (
  materialId: number,
  quantity: number,
  token?: string | null
) => {
  try {
    const response = await fetch("/api/cart", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(token),
      },
      body: JSON.stringify({ materialId, quantity }),
    });
    if (!response.ok) return null;
    return response.json();
  } catch (error) {
    console.error("Failed to update cart item:", error);
    return null;
  }
};

const removeItemFromAPI = async (
  materialId: number,
  token?: string | null
) => {
  try {
    const response = await fetch(`/api/cart?materialId=${materialId}`, {
      method: "DELETE",
      headers: getAuthHeader(token),
    });
    if (!response.ok) return null;
    return response.json();
  } catch (error) {
    console.error("Failed to remove cart item:", error);
    return null;
  }
};

const clearCartAPI = async (token?: string | null) => {
  try {
    const response = await fetch("/api/cart", {
      method: "DELETE",
      headers: getAuthHeader(token),
    });
    if (!response.ok) return null;
    return response.json();
  } catch (error) {
    console.error("Failed to clear cart:", error);
    return null;
  }
};

/* -------------------------------------------------------------------------- */
/*                               Provider                                     */
/* -------------------------------------------------------------------------- */

export function CartProvider({ children }: React.PropsWithChildren) {
  const { isAuthenticated, token, user } = useAuth();
  const [items, setItems] = React.useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  /* -------- Load cart when auth state changes (login/logout/user change) ------- */
  React.useEffect(() => {
    const loadCart = async () => {
      setIsLoading(true);
      if (isAuthenticated && token) {
        const cartData = await fetchCart(token);
        
        // Transform DB items to CartItem format
        const transformedItems = (cartData || [])
          .filter((item: any) => {
            return item.material;
          })
          .map((item: any) => ({
            id: String(item.materialId),
            name: item.material?.name || "",
            price: Number(item.material?.price || 0),
            image: item.material?.image || "",
            category: "",
            quantity: item.quantity,
          }));
        
        setItems(transformedItems);
      } else {
        setItems([]);
      }
      setIsLoading(false);
    };

    loadCart();
  }, [user?.id, token, isAuthenticated]);

  /* ----------------------------- Actions -------------------------------- */
  const addItem = React.useCallback(
    async (newItem: Omit<CartItem, "quantity">, qty = 1) => {
      // Only allow adding to cart if authenticated
      if (!isAuthenticated || !token) {
        console.warn("Must be authenticated to add items to cart");
        return;
      }

      if (qty <= 0) return;

      const materialId = Number(newItem.id);
      const result = await addItemToAPI(materialId, qty, token);

      if (result) {
        const transformedItems = result.map(
          (item: any) => ({
            id: String(item.materialId),
            name: item.material?.name || "",
            price: Number(item.material?.price || 0),
            image: item.material?.image || "",
            category: "",
            quantity: item.quantity,
          })
        );
        setItems(transformedItems);
      }
    },
    [isAuthenticated, token]
  );

  const removeItem = React.useCallback(
    async (id: string) => {
      if (!token) return;

      const materialId = Number(id);
      const result = await removeItemFromAPI(materialId, token);

      if (result) {
        const transformedItems = result.map(
          (item: any) => ({
            id: String(item.materialId),
            name: item.material?.name || "",
            price: Number(item.material?.price || 0),
            image: item.material?.image || "",
            category: "",
            quantity: item.quantity,
          })
        );
        setItems(transformedItems);
      }
    },
    [token]
  );

  const updateQuantity = React.useCallback(
    async (id: string, qty: number) => {
      if (!token) return;

      const materialId = Number(id);
      const result = await updateItemInAPI(materialId, qty, token);

      if (result) {
        const transformedItems = result.map(
          (item: any) => ({
            id: String(item.materialId),
            name: item.material?.name || "",
            price: Number(item.material?.price || 0),
            image: item.material?.image || "",
            category: "",
            quantity: item.quantity,
          })
        );
        setItems(transformedItems);
      }
    },
    [token]
  );

  const clearCart = React.useCallback(async () => {
    if (!token) return;

    const result = await clearCartAPI(token);
    if (result !== null) {
      setItems([]);
    }
  }, [token]);

  /* --------------------------- Derived data ----------------------------- */
  const itemCount = React.useMemo(
    () => items.reduce((t, i) => t + i.quantity, 0),
    [items]
  );

  const subtotal = React.useMemo(
    () => items.reduce((t, i) => t + i.price * i.quantity, 0),
    [items]
  );

  /* ----------------------------- Context value -------------------------- */
  const value = React.useMemo<CartContextType>(
    () => ({
      addItem,
      clearCart,
      itemCount,
      items,
      removeItem,
      subtotal,
      updateQuantity,
    }),
    [
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      itemCount,
      subtotal,
    ]
  );

  return <CartContext value={value}>{children}</CartContext>;
}

/* -------------------------------------------------------------------------- */
/*                                 Hook                                      */
/* -------------------------------------------------------------------------- */

export function useCart(): CartContextType {
  const ctx = React.use(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
