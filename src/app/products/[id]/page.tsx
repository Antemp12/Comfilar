import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { formatCurrency, formatQuantityWithUnit } from "~/lib/comfilar-utils-mysql";
import { getMaterialImages, getMaterialWithVariants } from "~/lib/queries/materials-mysql";
import { Badge } from "~/ui/primitives/badge";
import { Separator } from "~/ui/primitives/separator";
import { Button } from "~/ui/primitives/button";

import { ProductActions } from "./product-actions";
import { ProductGallery } from "./product-gallery";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

const getUnitLabel = (priceType?: string | null) =>
  formatQuantityWithUnit(1, priceType).replace(/^1\s/, "");

export default async function ProductPage({ params }: PageProps) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isFinite(id)) notFound();

  const product = await getMaterialWithVariants(id);
  if (!product) notFound();

  const priceValue = Number(product.price ?? 0);
  const stockValue = Number(product.stock ?? 0);
  const unitLabel = getUnitLabel(product.priceType?.type ?? null);
  const imageSrc = product.image || "/images/placeholder-product.jpg";

  // Galeria: imagens dedicadas (por-defeito primeiro); fallback para a imagem principal.
  const galleryRows = await getMaterialImages(product.id);
  const galleryImages = galleryRows.length > 0
    ? galleryRows.map((img: { url: string }) => img.url)
    : [imageSrc];

  const variantsByName = product.variants.reduce(
    (acc, variant) => {
      const name = variant.name ?? "Opções";
      const value = variant.value ?? "";
      if (!value) return acc;
      if (!acc[name]) acc[name] = [];
      acc[name].push(value);
      return acc;
    },
    {} as Record<string, string[]>,
  );

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back Button */}
      <div className="mb-6">
        <Button
          variant="outline"
          size="sm"
          asChild
          className="gap-2"
        >
          <Link href="/products">
            <ArrowLeft className="h-4 w-4" />
            Voltar aos Produtos
          </Link>
        </Button>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <ProductGallery images={galleryImages} name={product.name} />

          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Descrição</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {product.description ||
                "Este produto não tem descrição detalhada ainda."}
            </p>
          </div>

          {Object.keys(variantsByName).length > 0 && (
            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <h2 className="text-lg font-semibold">Variações disponíveis</h2>
              <div className="mt-4 space-y-4">
                {Object.entries(variantsByName).map(([name, values]) => (
                  <div key={name} className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      {name}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {values.map((value) => (
                        <Badge key={`${name}-${value}`} variant="secondary">
                          {value}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <Badge variant="outline">{product.category.name}</Badge>
              {stockValue > 0 ? (
                <Badge className="bg-emerald-500/10 text-emerald-700">
                  Em stock
                </Badge>
              ) : (
                <Badge variant="destructive">Sem stock</Badge>
              )}
            </div>

            <h1 className="mt-4 text-2xl font-semibold text-foreground sm:text-3xl">
              {product.name}
            </h1>

            <div className="mt-4 flex items-end gap-2">
              <span className="text-3xl font-bold text-foreground">
                {formatCurrency(priceValue)}
              </span>
              <span className="text-sm text-muted-foreground">/ {unitLabel}</span>
            </div>

            <Separator className="my-6" />

            <div className="grid gap-4 text-sm text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Categoria</span>
                <span className="font-medium text-foreground">
                  {product.category.name}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Stock disponível</span>
                <span className="font-medium text-foreground">
                  {stockValue > 0
                    ? formatQuantityWithUnit(stockValue, product.priceType?.type)
                    : "Sem stock"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Tipo de preço</span>
                <span className="font-medium text-foreground">
                  {product.priceType?.type ?? "unitario"}
                </span>
              </div>
            </div>

            <Separator className="my-6" />

            <ProductActions
              id={product.id}
              name={product.name}
              image={imageSrc}
              category={product.category.name}
              price={priceValue}
              stock={stockValue}
            />
          </div>

          <div className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground shadow-sm">
            <h2 className="text-lg font-semibold text-foreground">
              Entrega & suporte
            </h2>
            <ul className="mt-3 space-y-2">
              <li>✔️ Entrega em todo o país e ao estrangeiro</li>
              <li>✔️ Suporte técnico especializado</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
