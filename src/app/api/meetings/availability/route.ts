import { NextRequest, NextResponse } from "next/server";
import {
  getUserMeetings,
  getAvailableTimeSlots,
} from "@/lib/queries/meetings-mysql";

/**
 * GET /api/meetings/availability
 * Obter reuniões do usuário e horários disponíveis
 * Query params:
 * - userId: number (reuniões do usuário)
 * - date: ISO date string (horários disponíveis para este dia)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const userId = searchParams.get("userId");
    const dateParam = searchParams.get("date");

    // Se userId fornecido, retornar reuniões do usuário
    if (userId) {
      const meetings = await getUserMeetings(parseInt(userId, 10));

      return NextResponse.json(
        {
          success: true,
          data: {
            upcomingMeetings: meetings.map((meeting: any) => ({
              id: meeting.id,
              date: meeting.date,
              description: meeting.description,
            })),
          },
        },
        { status: 200 },
      );
    }

    // Se date fornecido, retornar slots disponíveis
    if (dateParam) {
      const date = new Date(dateParam);
      if (isNaN(date.getTime())) {
        return NextResponse.json(
          { success: false, message: "Data inválida" },
          { status: 400 },
        );
      }

      const slots = await getAvailableTimeSlots(date);

      return NextResponse.json(
        {
          success: true,
          data: {
            date: dateParam,
            availableSlots: slots.map((slot) => ({
              time: slot.toISOString(),
              formatted: `${slot.getHours().toString().padStart(2, "0")}:00`,
            })),
            slotsAvailable: slots.length,
          },
        },
        { status: 200 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Forneça userId ou date como parâmetro de query",
      },
      { status: 400 },
    );
  } catch (error) {
    console.error("Erro ao verificar disponibilidade:", error);
    return NextResponse.json(
      { success: false, message: "Erro ao verificar disponibilidade" },
      { status: 500 },
    );
  }
}
