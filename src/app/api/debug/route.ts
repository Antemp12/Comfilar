import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("📝 Debug Register - Body recebido:", body);
    
    return NextResponse.json({
      success: true,
      message: "Debug OK - body recebido",
      received: body
    }, { status: 200 });
  } catch (error) {
    console.error("❌ Debug Error:", error);
    return NextResponse.json({
      success: false,
      message: "Erro no debug",
      error: error instanceof Error ? error.message : "Erro desconhecido"
    }, { status: 500 });
  }
}
