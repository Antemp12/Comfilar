// src/lib/material-images.ts
// Lógica PURA de normalização das imagens de um material (sem dependências de BD,
// para ser testável isoladamente).

export interface MaterialImageInput {
  url: string;
  isDefault?: boolean;
}

/** Número máximo de imagens por material (galeria). */
export const MAX_MATERIAL_IMAGES = 5;

/**
 * Normaliza uma lista de imagens:
 * - remove URLs vazios, corta ao máximo, garante exatamente uma imagem por-defeito.
 * Devolve as linhas a inserir e o URL da imagem por-defeito.
 */
export function normalizeMaterialImages(images: MaterialImageInput[]): {
  rows: { url: string; ordem: number; isDefault: boolean }[];
  defaultUrl: string;
} {
  const cleaned = images
    .map((img) => ({ url: img.url?.trim() ?? "", isDefault: !!img.isDefault }))
    .filter((img) => img.url)
    .slice(0, MAX_MATERIAL_IMAGES);

  if (cleaned.length === 0) return { rows: [], defaultUrl: "" };

  let defaultIdx = cleaned.findIndex((img) => img.isDefault);
  if (defaultIdx === -1) defaultIdx = 0;

  const rows = cleaned.map((img, idx) => ({
    url: img.url,
    ordem: idx,
    isDefault: idx === defaultIdx,
  }));

  return { rows, defaultUrl: cleaned[defaultIdx].url };
}
