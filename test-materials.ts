import { db } from "./src/db/index.js";
import { materialsTable } from "./src/db/schema/index.js";

async function testDB() {
  try {
    console.log("🔍 Testing database connection...");
    const materials = await db.select().from(materialsTable).limit(5);
    console.log("✅ Materials found:", materials.length);
    console.log("📋 First material:", materials[0]);
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

testDB();
