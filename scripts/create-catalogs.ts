/**
 * Script para criar catálogos de exemplo
 * 
 * Executar: npx tsx scripts/create-catalogs.ts
 */

import { db } from "~/db";
import { catalogsTable } from "~/db/schema/catalogs";

async function createCatalogs() {
  console.log("✨ Criando catálogos de exemplo...");

  try {
    const catalogs = [
      {
        id: "catalog-1",
        title: "Promoção Especial - Casas de Banho",
        description: "Descubra as melhores ofertas em revestimentos para casas de banho com até 50% de desconto",
        imageUrl: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1920&q=75",
        order: 1,
      },
      {
        id: "catalog-2",
        title: "Novidade - Pavimentos Premium",
        description: "Explore nossa nova coleção de pavimentos em estilo moderno e contemporâneo",
        imageUrl: "https://images.unsplash.com/photo-1578500494198-246f612d03b3?w=1920&q=75",
        order: 2,
      },
      {
        id: "catalog-3",
        title: "Climatização Inteligente",
        description: "Sistemas de climatização eficientes para conforto máximo em sua casa ou empresa",
        imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=75",
        order: 3,
      },
    ];

    for (const catalog of catalogs) {
      try {
        await db.insert(catalogsTable).values(catalog);
        console.log(`✅ Catálogo criado: ${catalog.title}`);
      } catch (error: any) {
        if (error.code === "ER_DUP_ENTRY") {
          console.log(`⏭️  Catálogo já existe: ${catalog.title}`);
        } else {
          throw error;
        }
      }
    }

    console.log("✅ Script concluído!");
  } catch (error) {
    console.error("❌ Erro ao criar catálogos:", error);
    throw error;
  }
}

createCatalogs();
