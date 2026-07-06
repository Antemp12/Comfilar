import { NextRequest, NextResponse } from "next/server";
import { db } from "~/db";
import { materialsTable } from "~/db/schema";
import { validateAdminToken } from "~/lib/auth-api";

/**
 * PUT /api/admin/fix-attributes
 * Normalizes all material attributes keys to lowercase for consistent filtering
 * This ensures filter keys match the material attribute keys
 */
export async function PUT(request: NextRequest) {
  const user = await validateAdminToken(request);
  if (!user || (user.type !== "admin" && user.type !== "funcionario")) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  try {
    // Get all materials
    const materials = await db.select().from(materialsTable);
    
    let fixedCount = 0;
    
    for (const material of materials) {
      if (!material.attributes || Object.keys(material.attributes).length === 0) {
        continue;
      }
      
      // Check if any keys need to be normalized
      const attrs = material.attributes as Record<string, any>;
      const hasNonLowercaseKeys = Object.keys(attrs).some(key => key !== key.toLowerCase());
      
      if (hasNonLowercaseKeys) {
        // Normalize keys to lowercase
        const normalizedAttrs: Record<string, any> = {};
        Object.entries(attrs).forEach(([key, value]) => {
          normalizedAttrs[key.toLowerCase()] = value;
        });
        
        // Update material
        await db
          .update(materialsTable)
          .set({ attributes: normalizedAttrs })
          .where({ id: material.id } as any);
        
        fixedCount++;
      }
    }
    
    return NextResponse.json(
      {
        success: true,
        message: `Fixed ${fixedCount} materials with normalized attribute keys`,
        fixedCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error fixing attributes:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error fixing attributes",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
