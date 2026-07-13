"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";

import { Button } from "~/ui/primitives/button";
import { Card } from "~/ui/primitives/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/ui/primitives/dialog";
import { Flipbook } from "~/ui/components/flipbook";
import { PdfFlipbook } from "~/ui/components/pdf-flipbook";

interface Catalog {
  id: string;
  title: string;
  imageUrl: string;
  description?: string | null;
  type?: string;
  pages?: string[] | null;
  pdfUrl?: string | null;
}

export default function PromotionsPage() {
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<Catalog | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/catalogs");
        const json = (await res.json()) as { success?: boolean; data?: Catalog[] };
        setCatalogs(Array.isArray(json.data) ? json.data : []);
      } catch (error) {
        console.error("Erro ao carregar catálogos:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Páginas de um catálogo: usa as páginas dedicadas ou, em fallback, a capa.
  const pagesOf = (c: Catalog): string[] =>
    Array.isArray(c.pages) && c.pages.length > 0 ? c.pages : c.imageUrl ? [c.imageUrl] : [];

  const priceLists = catalogs.filter((c) => c.type === "pricelist");

  return (
    <div className="container mx-auto max-w-7xl px-4 py-16">
      <div className="mb-8 rounded-xl border bg-gradient-to-r from-orange-50 to-amber-50 px-6 py-8">
        <h1 className="text-3xl font-bold text-slate-900">Promoções & Catálogos</h1>
        <p className="text-slate-600">
          Folheie as nossas tabelas de preço e catálogos de produtos.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="aspect-[3/4] animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : priceLists.length === 0 ? (
        <Card className="p-12">
          <div className="space-y-6 text-center">
            <div className="mb-4 text-6xl">🎯</div>
            <h2 className="text-2xl font-bold text-slate-900">Ainda não há catálogos</h2>
            <p className="mx-auto max-w-md text-slate-600">
              Estamos a preparar as melhores ofertas e tabelas de preço. Volta mais tarde!
            </p>
            <Button asChild className="mt-6">
              <Link href="/products">Ver todos os produtos</Link>
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {priceLists.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setOpen(c)}
              className="group overflow-hidden rounded-xl border bg-card text-left shadow-sm transition-all hover:shadow-lg"
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={c.imageUrl || (c.pages?.[0] ?? "")}
                  alt={c.title}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent p-3">
                  <div className="flex items-center gap-2 text-white">
                    <BookOpen className="h-4 w-4" />
                    <span className="text-sm font-semibold">Folhear</span>
                  </div>
                </div>
              </div>
              <div className="p-3">
                <p className="truncate font-medium text-slate-900">{c.title}</p>
                <p className="text-xs text-slate-500">
                  {c.pdfUrl ? "Catálogo PDF" : `${pagesOf(c).length} página(s)`}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Visualizador (folhear) */}
      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>{open?.title}</DialogTitle>
          </DialogHeader>
          {open &&
            (open.pdfUrl ? (
              <PdfFlipbook url={open.pdfUrl} title={open.title} />
            ) : (
              <Flipbook pages={pagesOf(open)} title={open.title} />
            ))}
        </DialogContent>
      </Dialog>
    </div>
  );
}
