import { NextRequest, NextResponse } from "next/server";
import {
  getMeetingWithUser,
  updateMeeting,
  deleteMeeting,
} from "@/lib/queries/meetings-mysql";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/meetings/[id]
 * Obter detalhes de uma reunião
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID da reunião é obrigatório" },
        { status: 400 },
      );
    }

    const meeting = await getMeetingWithUser(parseInt(id, 10));

    if (!meeting) {
      return NextResponse.json(
        { success: false, message: "Reunião não encontrada" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          id: meeting.id,
          date: meeting.date,
          description: meeting.description,
          user: {
            id: meeting.user.id,
            name: meeting.user.name,
            email: meeting.user.email,
            type: meeting.user.type,
          },
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erro ao buscar reunião:", error);
    return NextResponse.json(
      { success: false, message: "Erro ao buscar reunião" },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/meetings/[id]
 * Atualizar reunião (data e/ou descrição)
 * Body: { date?: ISO string, description?: string }
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json() as { date?: string; description?: string };
    const { date, description } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID da reunião é obrigatório" },
        { status: 400 },
      );
    }

    // Validar que pelo menos um campo está sendo atualizado
    if (!date && !description) {
      return NextResponse.json(
        {
          success: false,
          message: "Pelo menos date ou description deve ser fornecido",
        },
        { status: 400 },
      );
    }

    // Se data foi fornecida, validar formato
    let meetingDate: Date | undefined;
    if (date) {
      meetingDate = new Date(date);
      if (isNaN(meetingDate.getTime())) {
        return NextResponse.json(
          { success: false, message: "Data inválida" },
          { status: 400 },
        );
      }
    }

    const updated = await updateMeeting(parseInt(id, 10), {
      date: meetingDate,
      description,
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Reunião não encontrada" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Reunião atualizada com sucesso",
        data: {
          id: updated.id,
          date: updated.date,
          description: updated.description,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao atualizar reunião";
    console.error("Erro ao atualizar reunião:", error);

    return NextResponse.json(
      { success: false, message },
      { status: message.includes("conflito") ? 409 : 500 },
    );
  }
}

/**
 * DELETE /api/meetings/[id]
 * Deletar reunião
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID da reunião é obrigatório" },
        { status: 400 },
      );
    }

    const deleted = await deleteMeeting(parseInt(id, 10));

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Reunião não encontrada" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Reunião deletada com sucesso",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erro ao deletar reunião:", error);
    return NextResponse.json(
      { success: false, message: "Erro ao deletar reunião" },
      { status: 500 },
    );
  }
}
