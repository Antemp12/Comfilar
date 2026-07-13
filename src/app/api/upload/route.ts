import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { validateAdminToken } from "@/lib/auth-api";

export const runtime = "nodejs";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_PDF_BYTES = 30 * 1024 * 1024; // 30 MB
const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
  "application/pdf": "pdf",
};

/**
 * POST /api/upload
 * Recebe um ficheiro de imagem (multipart/form-data, campo "file") carregado do PC,
 * grava-o em public/uploads/ e devolve o URL público { url: "/uploads/<nome>" }.
 * Só admin/funcionário.
 */
export async function POST(request: NextRequest) {
  const user = await validateAdminToken(request);
  if (!user || (user.type !== "admin" && user.type !== "funcionario")) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Nenhum ficheiro enviado" },
        { status: 400 },
      );
    }

    const ext = ALLOWED[file.type];
    if (!ext) {
      return NextResponse.json(
        { error: "Tipo de ficheiro não suportado. Usa JPG, PNG, WEBP, GIF, SVG ou PDF." },
        { status: 400 },
      );
    }

    const maxBytes = ext === "pdf" ? MAX_PDF_BYTES : MAX_IMAGE_BYTES;
    if (file.size > maxBytes) {
      return NextResponse.json(
        {
          error:
            ext === "pdf"
              ? "O PDF é demasiado grande (máx. 30 MB)."
              : "A imagem é demasiado grande (máx. 5 MB).",
        },
        { status: 400 },
      );
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const fileName = `${randomUUID()}.${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, fileName), bytes);

    return NextResponse.json({ url: `/uploads/${fileName}` }, { status: 201 });
  } catch (error) {
    console.error("Erro no upload:", error);
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json(
      { error: `Erro ao carregar imagem: ${message}` },
      { status: 500 },
    );
  }
}
