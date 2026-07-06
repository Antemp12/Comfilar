// scripts/create-material-images.ts
// Cria a tabela material_images e faz backfill a partir de material.image.
// Correr com: bun run scripts/create-material-images.ts

import process from "node:process";
import { sql } from "drizzle-orm";
import { db } from "~/db";

async function main() {
  console.log("🖼️  A criar tabela material_images...");

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS material_images (
      id INT AUTO_INCREMENT PRIMARY KEY,
      material_id INT NOT NULL,
      url TEXT NOT NULL,
      ordem INT NOT NULL DEFAULT 0,
      is_default BOOLEAN NOT NULL DEFAULT FALSE,
      CONSTRAINT fk_material_images_material
        FOREIGN KEY (material_id) REFERENCES material(id) ON DELETE CASCADE
    )
  `);
  console.log("✅ Tabela criada (ou já existia).");

  // Backfill: para cada material com imagem e sem linhas em material_images,
  // cria a imagem por defeito.
  console.log("🔄 Backfill das imagens existentes...");
  await db.execute(sql`
    INSERT INTO material_images (material_id, url, ordem, is_default)
    SELECT m.id, m.imagem, 0, TRUE
    FROM material m
    WHERE m.imagem IS NOT NULL
      AND m.imagem <> ''
      AND NOT EXISTS (
        SELECT 1 FROM material_images mi WHERE mi.material_id = m.id
      )
  `);
  console.log("✅ Backfill concluído.");

  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Erro:", err);
  process.exit(1);
});
