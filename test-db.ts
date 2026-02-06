import { db } from "./src/db";
import { materialsTable, categoriesTable } from "./src/db/schema";

async function testDB() {
  try {
    console.log("🔍 Testando BD...\n");

    // Verificar categorias
    const categories = await db.select().from(categoriesTable).limit(5);
    console.log(`✅ Categorias encontradas: ${categories.length}`);
    if (categories.length > 0) {
      console.log("   Primeiras 3:", categories.slice(0, 3).map(c => c.name));
    }

    // Verificar materiais
    const materials = await db.select().from(materialsTable).limit(5);
    console.log(`\n✅ Materiais encontrados: ${materials.length}`);
    if (materials.length > 0) {
      console.log("   Primeiros 3:", materials.slice(0, 3).map(m => m.name));
    } else {
      console.log("   ⚠️  NENHUM MATERIAL NA BD!");
    }

    console.log("\n🎯 Se não há materiais, execute o comfilar.sql no phpMyAdmin!");
  } catch (error) {
    console.error("❌ Erro:", error);
  }
}

testDB();
