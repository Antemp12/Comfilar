import { NextRequest, NextResponse } from "next/server";
import { db } from "~/db";
import { categoryAttributesTable, materialsTable } from "~/db/schema";
import { eq } from "drizzle-orm";
import { validateAdminToken } from "~/lib/auth-api";

/** Converte o valor guardado (array ou texto JSON) numa lista de strings. */
function toValues(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.map((v) => String(v));
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.map((v) => String(v)) : [];
    } catch {
      return [];
    }
  }
  return [];
}

/**
 * POST /api/admin/normalize-attributes
 * Limpeza/normalização única dos filtros antigos:
 *  - category_attributes: junta duplicados (mesma categoria + nome, sem distinção de
 *    maiúsculas), une os valores (aparados, sem repetidos nem vazios) e mantém 1 linha.
 *  - materials.attributes: chaves em minúsculas, valores como arrays de strings aparadas.
 */
export async function POST(req: NextRequest) {
  const user = await validateAdminToken(req);
  if (!user || (user.type !== "admin" && user.type !== "funcionario")) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    // ── 1) Normalizar category_attributes ──────────────────────────────────
    const allAttrs = await db.select().from(categoryAttributesTable);

    // Agrupar por categoria + nome (case-insensitive, aparado).
    const groups = new Map<string, typeof allAttrs>();
    for (const a of allAttrs) {
      const key = `${a.categoryId}::${a.attributeName.trim().toLowerCase()}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(a);
    }

    let attrsMerged = 0;
    let attrsDeleted = 0;

    for (const rows of groups.values()) {
      const name = rows[0].attributeName.trim();
      const valSet = new Set<string>();
      for (const r of rows) {
        for (const v of toValues(r.attributeValues)) {
          const t = v.trim();
          if (t) valSet.add(t);
        }
      }
      const values = Array.from(valSet);
      const keep = rows[0];

      // Atualizar a linha a manter (nome aparado + valores limpos).
      await db
        .update(categoryAttributesTable)
        .set({ attributeName: name, attributeValues: values })
        .where(eq(categoryAttributesTable.id, keep.id));

      // Apagar as restantes (duplicadas).
      for (let i = 1; i < rows.length; i++) {
        await db
          .delete(categoryAttributesTable)
          .where(eq(categoryAttributesTable.id, rows[i].id));
        attrsDeleted++;
      }

      if (rows.length > 1) attrsMerged++;
    }

    // ── 2) Normalizar materials.attributes ─────────────────────────────────
    const materials = await db.select().from(materialsTable);
    let materialsFixed = 0;

    for (const m of materials) {
      const attrs = (m.attributes ?? null) as Record<string, unknown> | null;
      if (!attrs || Object.keys(attrs).length === 0) continue;

      const normalized: Record<string, string[]> = {};
      for (const [k, v] of Object.entries(attrs)) {
        const key = k.trim().toLowerCase();
        if (!key) continue;

        let arr: string[];
        if (Array.isArray(v)) arr = v.map((x) => String(x).trim()).filter(Boolean);
        else if (typeof v === "string") arr = v.trim() ? [v.trim()] : [];
        else arr = [];

        if (arr.length === 0) continue; // remove atributos vazios

        normalized[key] = normalized[key]
          ? Array.from(new Set([...normalized[key], ...arr]))
          : arr;
      }

      // Só grava se mudou algo (evita updates inúteis).
      const before = JSON.stringify(attrs);
      const after = JSON.stringify(normalized);
      if (before !== after) {
        await db
          .update(materialsTable)
          .set({ attributes: normalized as unknown as Record<string, string> })
          .where(eq(materialsTable.id, m.id));
        materialsFixed++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Filtros normalizados: ${attrsMerged} agrupado(s), ${attrsDeleted} duplicado(s) removido(s), ${materialsFixed} material(is) corrigido(s).`,
      attrsMerged,
      attrsDeleted,
      materialsFixed,
    });
  } catch (error) {
    console.error("Erro ao normalizar atributos:", error);
    return NextResponse.json(
      { error: "Erro ao normalizar atributos" },
      { status: 500 },
    );
  }
}
