"use client";

import { useState } from "react";
import Image from "next/image";

interface ProductGalleryProps {
  images: string[];
  name: string;
}

/**
 * Galeria de imagens do produto: imagem principal grande + miniaturas clicáveis.
 * Recebe já a lista ordenada (imagem por-defeito primeiro).
 */
export function ProductGallery({ images, name }: ProductGalleryProps) {
  const gallery = images.length > 0 ? images : ["/images/placeholder-product.jpg"];
  const [active, setActive] = useState(0);
  const activeSrc = gallery[Math.min(active, gallery.length - 1)];

  return (
    <div className="space-y-3">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border bg-muted">
        <Image
          src={activeSrc}
          alt={name}
          fill
          sizes="(max-width: 1024px) 100vw, 60vw"
          className="object-cover"
          priority
        />
      </div>

      {gallery.length > 1 && (
        <div className="flex flex-wrap gap-3">
          {gallery.map((src, idx) => (
            <button
              key={`${src}-${idx}`}
              type="button"
              onClick={() => setActive(idx)}
              aria-label={`Ver imagem ${idx + 1}`}
              aria-current={idx === active}
              className={`relative h-20 w-20 overflow-hidden rounded-xl border-2 transition ${
                idx === active
                  ? "border-primary ring-2 ring-primary/30"
                  : "border-transparent hover:border-muted-foreground/40"
              }`}
            >
              <Image
                src={src}
                alt={`${name} — imagem ${idx + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
