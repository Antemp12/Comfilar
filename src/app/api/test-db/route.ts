import { NextResponse } from "next/server";
import { db } from "~/db";
import { quoteRequestsTable } from "~/db/schema";

export async function GET() {
  try {
    console.log("Testing database connection...");
    
    // Test simple select
    const quotes = await db.select().from(quoteRequestsTable).limit(1);
    console.log("Database query successful, found:", quotes.length, "quotes");
    
    return NextResponse.json({ 
      success: true, 
      message: "Database connection OK",
      quotesCount: quotes.length 
    });
  } catch (error) {
    console.error("Database test error:", error);
    return NextResponse.json(
      { 
        error: "Database test failed",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
