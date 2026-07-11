"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "~/ui/primitives/button";

export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

interface TablePaginationProps {
  page: number;
  totalPages: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  /** Desativa os botões enquanto carrega. */
  loading?: boolean;
  /** Opções de itens por página (por defeito 10/20/50/100). */
  pageSizeOptions?: readonly number[];
  /** Palavra usada na contagem: "material(is)", "utilizador(es)"... */
  itemLabel?: string;
}

/**
 * Barra de paginação reutilizável: escolha de itens por página + navegação.
 * Serve tanto para paginação no servidor como client-side.
 */
export function TablePagination({
  page,
  totalPages,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  loading = false,
  pageSizeOptions = PAGE_SIZE_OPTIONS,
  itemLabel = "resultado(s)",
}: TablePaginationProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <span>Mostrar</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          aria-label="Itens por página"
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
        <span>por página</span>
        <span className="ml-2 hidden text-gray-400 sm:inline">
          · {total} {itemLabel}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Página {page} de {totalPages}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || loading}
            onClick={() => onPageChange(Math.max(1, page - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages || loading}
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          >
            Seguinte
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
