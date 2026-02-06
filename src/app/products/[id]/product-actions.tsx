"use client";

import { Heart, Minus, Plus, ShoppingCart } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { useAuth } from "~/lib/auth-context";
import { useCart } from "~/lib/hooks/use-cart";
import { useFavorites } from "~/lib/hooks/use-favorites";
import { AuthModal } from "~/ui/components/auth-modal";
import { AddToCartModal } from "~/ui/components/add-to-cart-modal";
import { Button } from "~/ui/primitives/button";

type ProductActionsProps = {
  id: number;
  name: string;
  image: string;
  category: string;
  price: number;
  stock: number;
};

export function ProductActions({
  id,
  name,
  image,
  category,
  price,
  stock,
}: ProductActionsProps) {
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [quantity, setQuantity] = React.useState(1);
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  const [showAddToCartModal, setShowAddToCartModal] = React.useState(false);
  const isOutOfStock = stock <= 0;

  const handleAddToCart = React.useCallback(() => {
    if (isOutOfStock) {
      toast.error("Sem stock disponível");
      return;
    }

    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    addItem(
      {
        id: String(id),
        name,
        image,
        category,
        price,
      },
      quantity,
    );

    setShowAddToCartModal(true);
  }, [addItem, category, id, image, isAuthenticated, isOutOfStock, name, price, quantity]);

  return (
    <div className="space-y-4">
      <AuthModal open={showAuthModal} onClose={() => setShowAuthModal(false)} />
      <AddToCartModal
        isOpen={showAddToCartModal}
        onClose={() => setShowAddToCartModal(false)}
        productName={name}
        productImage={image}
        quantity={quantity}
      />
      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          if (!isAuthenticated) {
            setShowAuthModal(true);
            return;
          }
          toggleFavorite(id);
        }}
      >
        <Heart
          className={
            isFavorite(id)
              ? "mr-2 h-4 w-4 fill-red-500 text-red-500"
              : "mr-2 h-4 w-4"
          }
        />
        {isFavorite(id) ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      </Button>
      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-full border bg-background px-2 py-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            aria-label="Diminuir quantidade"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-10 text-center text-sm font-medium">
            {quantity}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setQuantity((q) => Math.min(stock || 1, q + 1))}
            disabled={stock > 0 ? quantity >= stock : true}
            aria-label="Aumentar quantidade"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <Button
          className="flex-1"
          onClick={handleAddToCart}
          disabled={isOutOfStock}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {isOutOfStock ? "Sem stock" : "Adicionar ao carrinho"}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Precisas de ajuda? Estamos disponíveis para esclarecer dúvidas sobre o
        produto.
      </p>
    </div>
  );
}