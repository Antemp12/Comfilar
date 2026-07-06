'use client';

import Link from 'next/link';
import { Button } from '~/ui/primitives/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~/ui/primitives/dialog';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
}

export function AuthModal({
  open,
  onClose,
  title = 'Autenticação Necessária',
  message = 'Para continuar, precisa de iniciar sessão ou criar uma conta.',
}: AuthModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 mt-4">
          <Button asChild size="lg" onClick={onClose}>
            <Link href="/auth/login">Iniciar Sessão</Link>
          </Button>
          <Button asChild variant="outline" size="lg" onClick={onClose}>
            <Link href="/auth/register">Criar Conta</Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
