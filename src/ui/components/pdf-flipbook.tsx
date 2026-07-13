"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Flipbook } from "./flipbook";

interface PdfFlipbookProps {
  url: string;
  title?: string;
}

/**
 * Lê um PDF com o pdf.js, converte cada página numa imagem e mostra-as no flipbook
 * (efeito de folhear). Se o pdf.js falhar, mostra o PDF embebido como alternativa.
 */
export function PdfFlipbook({ url, title }: PdfFlipbookProps) {
  const [pages, setPages] = useState<string[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  useEffect(() => {
    let cancelled = false;
    setPages(null);
    setFailed(false);
    setProgress({ done: 0, total: 0 });

    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        // O worker é carregado de um CDN, com a versão exata instalada.
        pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

        const doc = await pdfjs.getDocument({ url }).promise;
        if (cancelled) return;
        setProgress({ done: 0, total: doc.numPages });

        const imgs: string[] = [];
        for (let i = 1; i <= doc.numPages; i++) {
          if (cancelled) return;
          const page = await doc.getPage(i);
          const viewport = page.getViewport({ scale: 1.5 });
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) continue;
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          // A tipagem do render varia entre versões — cast para evitar fricção.
          await page.render({ canvasContext: ctx, viewport, canvas } as any).promise;
          imgs.push(canvas.toDataURL("image/jpeg", 0.82));
          if (!cancelled) setProgress({ done: i, total: doc.numPages });
        }
        if (!cancelled) setPages(imgs);
      } catch (error) {
        console.error("Erro ao ler PDF:", error);
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [url]);

  // Fallback: PDF embebido (o browser trata da navegação).
  if (failed) {
    return (
      <iframe
        src={url}
        title={title ?? "Catálogo"}
        className="h-[80vh] w-full rounded-lg border"
      />
    );
  }

  if (!pages) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
        <p className="text-sm">
          A preparar o catálogo…{" "}
          {progress.total > 0 ? `${progress.done}/${progress.total} páginas` : ""}
        </p>
      </div>
    );
  }

  return <Flipbook pages={pages} title={title} />;
}
