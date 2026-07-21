"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";
import { Button } from "~/ui/primitives/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/ui/primitives/dialog";

interface ConfirmOptions {
  title?: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** "destructive" (por defeito) para eliminações; "default" para ações neutras. */
  variant?: "destructive" | "default";
}

/**
 * Diálogo de confirmação da app, para substituir o `confirm()` nativo do browser.
 *
 * Uso:
 *   const { confirm, confirmDialog } = useConfirm();
 *   // dentro de um handler async:
 *   if (!(await confirm({ title: "Eliminar", description: "..." }))) return;
 *   // no JSX (uma vez):
 *   {confirmDialog}
 */
export function useConfirm() {
  const [open, setOpen] = useState(false);
  const [opts, setOpts] = useState<ConfirmOptions>({});
  const resolver = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((options: ConfirmOptions = {}) => {
    setOpts(options);
    setOpen(true);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const settle = useCallback((value: boolean) => {
    setOpen(false);
    resolver.current?.(value);
    resolver.current = null;
  }, []);

  const confirmDialog = (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) settle(false);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{opts.title ?? "Confirmar"}</DialogTitle>
          {opts.description ? (
            <DialogDescription>{opts.description}</DialogDescription>
          ) : null}
        </DialogHeader>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => settle(false)}>
            {opts.cancelLabel ?? "Cancelar"}
          </Button>
          <Button variant={opts.variant ?? "destructive"} onClick={() => settle(true)}>
            {opts.confirmLabel ?? "Eliminar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  return { confirm, confirmDialog };
}
