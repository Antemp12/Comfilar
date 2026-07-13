"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface FlipbookProps {
  pages: string[];
  title?: string;
}

const DURATION = 600;

/**
 * Visualizador de catálogo com efeito de "folhear" (page-flip).
 * Recebe uma lista de URLs de imagens (páginas) e permite virar página a página.
 */
export function Flipbook({ pages, title }: FlipbookProps) {
  const [index, setIndex] = useState(0);
  const [flip, setFlip] = useState<null | "next" | "prev">(null);

  const goNext = useCallback(() => {
    setIndex((i) => {
      if (i >= pages.length - 1) return i;
      setFlip("next");
      window.setTimeout(() => setFlip(null), DURATION);
      return i;
    });
  }, [pages.length]);

  const goPrev = useCallback(() => {
    setIndex((i) => {
      if (i <= 0) return i;
      setFlip("prev");
      window.setTimeout(() => setFlip(null), DURATION);
      return i;
    });
  }, []);

  // Depois de a animação começar, avança/recua o índice a meio da virada.
  useEffect(() => {
    if (!flip) return;
    const t = window.setTimeout(() => {
      setIndex((i) => (flip === "next" ? Math.min(pages.length - 1, i + 1) : Math.max(0, i - 1)));
    }, DURATION / 2);
    return () => window.clearTimeout(t);
  }, [flip, pages.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev]);

  if (pages.length === 0) return null;

  // Página de "fundo" (o destino da virada) e a página que está a virar.
  const baseSrc =
    flip === "next"
      ? pages[Math.min(pages.length - 1, index + 1)]
      : flip === "prev"
        ? pages[Math.max(0, index - 1)]
        : pages[index];

  const flipSrc = flip === "next" ? pages[index] : flip === "prev" ? pages[Math.max(0, index - 1)] : null;
  const shownPage = flip === "next" ? index + 2 : flip === "prev" ? index : index + 1;

  return (
    <div className="w-full">
      <style>{`
        @keyframes fb-next { from { transform: rotateY(0deg); } to { transform: rotateY(-180deg); } }
        @keyframes fb-prev { from { transform: rotateY(-180deg); } to { transform: rotateY(0deg); } }
      `}</style>

      <div
        className="relative mx-auto w-full max-w-3xl select-none"
        style={{ perspective: "2200px" }}
      >
        <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-muted shadow-2xl">
          {/* Página de fundo */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={baseSrc}
            alt={title ? `${title} — página` : "página"}
            className="absolute inset-0 h-full w-full object-contain bg-white"
            draggable={false}
          />

          {/* Página a virar */}
          {flip && flipSrc && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={flipSrc}
              alt=""
              draggable={false}
              className="absolute inset-0 h-full w-full object-contain bg-white shadow-2xl"
              style={{
                transformOrigin: "left center",
                backfaceVisibility: "hidden",
                animation: `${flip === "next" ? "fb-next" : "fb-prev"} ${DURATION}ms ease-in-out forwards`,
              }}
            />
          )}

          {/* Zonas de clique (esquerda/direita) */}
          <button
            type="button"
            aria-label="Página anterior"
            onClick={goPrev}
            disabled={index <= 0}
            className="absolute inset-y-0 left-0 w-1/2 cursor-w-resize disabled:cursor-default"
          />
          <button
            type="button"
            aria-label="Página seguinte"
            onClick={goNext}
            disabled={index >= pages.length - 1}
            className="absolute inset-y-0 right-0 w-1/2 cursor-e-resize disabled:cursor-default"
          />
        </div>

        {/* Controlos */}
        <div className="mt-4 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={goPrev}
            disabled={index <= 0}
            className="flex h-10 w-10 items-center justify-center rounded-full border bg-background shadow-sm transition-colors hover:bg-muted disabled:opacity-40"
            aria-label="Página anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="min-w-24 text-center text-sm text-muted-foreground">
            Página {Math.min(pages.length, Math.max(1, shownPage))} de {pages.length}
          </span>
          <button
            type="button"
            onClick={goNext}
            disabled={index >= pages.length - 1}
            className="flex h-10 w-10 items-center justify-center rounded-full border bg-background shadow-sm transition-colors hover:bg-muted disabled:opacity-40"
            aria-label="Página seguinte"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
