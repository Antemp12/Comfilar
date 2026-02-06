"use client";

import { Heart, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";

import { cn } from "~/lib/cn";
import { useFavorites } from "~/lib/hooks/use-favorites";
import { Badge } from "~/ui/primitives/badge";
import { Button } from "~/ui/primitives/button";
import { Card, CardContent, CardFooter } from "~/ui/primitives/card";

type ProductCardProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onError"
> & {
  onAddToCart?: (productId: string) => void;
  onAddToWishlist?: (productId: string) => void;
  product: {
    category: string;
    id: string;
    image: string;
    inStock?: boolean;
    name: string;
    originalPrice?: number;
    price: number;
    rating?: number;
  };
  variant?: "compact" | "default";
};

export function ProductCard({
  className,
  onAddToCart,
  onAddToWishlist,
  product,
  variant = "default",
  ...props
}: ProductCardProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();
  const isInWishlist = isFavorite(Number(product.id));

  // Wishlist toggles state locally and calls parent handler
  // Card footer action now leads to product details instead of add-to-cart

  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onAddToWishlist) {
      onAddToWishlist(product.id);
      return;
    }
    toggleFavorite(Number(product.id));
  };

  const discount = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
    : 0;

  const renderStars = () => {
    const rating = product.rating ?? 0;
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    return (
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            className={cn(
              "h-4 w-4",
              i < fullStars
                ? "fill-yellow-400 text-yellow-400"
                : i === fullStars && hasHalfStar
                ? "fill-yellow-400/50 text-yellow-400"
                : "stroke-muted/40 text-muted"
            )}
            key={`star-${product.id}-position-${i + 1}`}
          />
        ))}
        {rating > 0 && (
          <span className="ml-1 text-xs text-muted-foreground">
            {rating.toFixed(1)}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className={cn("group", className)} {...props}>
      <Card
        className={cn(
          `
            relative h-full overflow-hidden rounded-lg py-0 transition-all
            duration-200 ease-in-out
            hover:shadow-md
          `,
          isHovered && "ring-1 ring-primary/20"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link className="block" href={`/products/${product.id}`}>
          <div className="relative aspect-square overflow-hidden rounded-t-lg">
            {product.image && (
              <Image
                alt={product.name}
                className={cn(
                  "object-cover transition-transform duration-300 ease-in-out",
                  isHovered && "scale-105"
                )}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                src={product.image}
              />
            )}

            {/* Category badge */}
            <Badge
              className={`
                absolute top-2 left-2 bg-background/80 backdrop-blur-sm
              `}
              variant="outline"
            >
              {product.category}
            </Badge>

            {/* Discount badge */}
            {discount > 0 && (
              <Badge
                className={`
                absolute top-2 right-2 bg-destructive
                text-destructive-foreground
              `}
              >
                {discount}% OFF
              </Badge>
            )}

            {/* Wishlist button */}
            <Button
              className={cn(
                `
                  absolute right-2 bottom-2 z-10 rounded-full bg-background/80
                  backdrop-blur-sm transition-opacity duration-300
                `,
                !isHovered && !isInWishlist && "opacity-0"
              )}
              onClick={handleAddToWishlist}
              size="icon"
              type="button"
              variant="outline"
            >
              <Heart
                className={cn(
                  "h-4 w-4",
                  isInWishlist
                    ? "fill-destructive text-destructive"
                    : "text-muted-foreground"
                )}
              />
              <span className="sr-only">Adicionar aos favoritos</span>
            </Button>
          </div>
        </Link>

        <CardContent className="p-4 pt-4">
          {/* Product name with line clamp */}
          <Link
            className="block"
            href={`/products/${product.id}`}
          >
            <h3
              className={`
                line-clamp-2 text-base font-medium transition-colors
                group-hover:text-primary
              `}
            >
              {product.name}
            </h3>
          </Link>

          {variant === "default" && (
            <>
              <div className="mt-1.5">{renderStars()}</div>
              <div className="mt-2 flex items-center gap-1.5">
                <span className="font-medium text-foreground">
                  ${Number(product.price).toFixed(2)}
                </span>
                {product.originalPrice ? (
                  <span className="text-sm text-muted-foreground line-through">
                    ${Number(product.originalPrice).toFixed(2)}
                  </span>
                ) : null}
              </div>
            </>
          )}
        </CardContent>

        {variant === "default" && (
          <CardFooter className="p-4 pt-0">
            <Button asChild className="w-full" variant="secondary">
              <Link href={`/products/${product.id}`}>
                Ver detalhes
              </Link>
            </Button>
          </CardFooter>
        )}

        {variant === "compact" && (
          <CardFooter className="p-4 pt-0">
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-foreground">
                  ${Number(product.price).toFixed(2)}
                </span>
                {product.originalPrice ? (
                  <span className="text-sm text-muted-foreground line-through">
                    ${Number(product.originalPrice).toFixed(2)}
                  </span>
                ) : null}
              </div>
              <Button asChild className="h-8" size="sm" variant="outline">
                <Link href={`/products/${product.id}`}>
                  Ver detalhes
                </Link>
              </Button>
            </div>
          </CardFooter>
        )}

          {!product.inStock && (
            <div
              className={`
                absolute inset-0 flex items-center justify-center
                bg-background/80 backdrop-blur-sm
              `}
            >
              <Badge className="px-3 py-1 text-sm" variant="destructive">
                Sem Stock
              </Badge>
            </div>
          )}
        </Card>
    </div>
  );
}
