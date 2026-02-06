import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "~/db";
import { siteSettingsTable } from "~/db/schema";
import { validateAdminToken } from "~/lib/auth-api";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (key) {
      // Get specific setting
      const [setting] = await db
        .select()
        .from(siteSettingsTable)
        .where(eq(siteSettingsTable.key, key))
        .limit(1);

      return NextResponse.json({ data: setting || null });
    }

    // Get all settings
    const settings = await db.select().from(siteSettingsTable);

    return NextResponse.json({ data: settings });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await validateAdminToken(request);
    if (!user || (user.type !== "admin" && user.type !== "funcionario")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json() as { key: string; value: string };
    const { key, value } = body;

    if (!key) {
      return NextResponse.json(
        { error: "Key is required" },
        { status: 400 }
      );
    }

    // Check if setting exists
    const [existing] = await db
      .select()
      .from(siteSettingsTable)
      .where(eq(siteSettingsTable.key, key))
      .limit(1);

    if (existing) {
      // Update existing setting
      await db
        .update(siteSettingsTable)
        .set({ value, updatedAt: new Date() })
        .where(eq(siteSettingsTable.key, key));
    } else {
      // Insert new setting
      await db.insert(siteSettingsTable).values({ key, value });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating setting:", error);
    return NextResponse.json(
      { error: "Failed to update setting" },
      { status: 500 }
    );
  }
}
