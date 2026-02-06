"use client";

import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/ui/primitives/dialog";
import { Button } from "~/ui/primitives/button";

interface AddToCartModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  productImage?: string;
  quantity: number;
}

export function AddToCartModal({
  isOpen,
  onClose,
  productName,
  productImage,
  quantity,
}: AddToCartModalProps) {
  const router = useRouter();

  const handleContinueShopping = () => {
    onClose();
  };

  const handleGoToCheckout = () => {
    onClose();
    router.push("/dashboard/checkout");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="h-6 w-6" />
            <DialogTitle>Adicionado ao carrinho!</DialogTitle>
          </div>
          <DialogDescription>
            {quantity} x {productName} foi adicionado ao seu carrinho.
          </DialogDescription>
        </DialogHeader>

        {productImage && (
          <div className="flex justify-center py-4">
            <img
              src={productImage}
              alt={productName}
              className="h-24 w-24 object-cover rounded"
            />
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={handleContinueShopping}
            className="w-full sm:w-auto"
          >
            Continuar às compras
          </Button>
          <Button
            type="button"
            onClick={handleGoToCheckout}
            className="w-full sm:w-auto"
          >
            Ir para o checkout
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
