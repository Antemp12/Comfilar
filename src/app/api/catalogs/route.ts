import { getAllCatalogs } from "@/lib/queries/catalogs";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const catalogs = await getAllCatalogs();
    return NextResponse.json({
      success: true,
      data: catalogs,
    });
  } catch (error) {
    console.error("Error fetching catalogs:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch catalogs" },
      { status: 500 }
    );
  }
}
