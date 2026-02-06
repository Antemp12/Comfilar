import { db } from "@/db";
import { meetingsTable, utilizadorTable } from "@/db/schema";
import { eq, desc, and, gte, lte, ne } from "drizzle-orm";

/**
 * Obter detalhes de uma reunião
 */
export async function getMeetingWithUser(meetingId: number) {
  const meeting = await db.query.meetingsTable.findFirst({
    where: eq(meetingsTable.id, meetingId),
    with: {
      user: true,
    },
  });

  return meeting;
}

/**
 * Listar reuniões de um usuário específico
 */
export async function getUserMeetings(
  userId: number,
  options: { limit?: number; offset?: number } = {},
) {
  const { limit = 50, offset = 0 } = options;

  return await db.query.meetingsTable.findMany({
    where: eq(meetingsTable.userId, userId),
    with: { user: true },
    orderBy: desc(meetingsTable.date),
    limit,
    offset,
  });
}

/**
 * Listar todas as reuniões (para admin/funcionarios)
 */
export async function getAllMeetings(options: {
  limit?: number;
  offset?: number;
  startDate?: Date;
  endDate?: Date;
} = {}) {
  const { limit = 50, offset = 0, startDate, endDate } = options;

  let conditions = [];

  if (startDate) {
    conditions.push(gte(meetingsTable.date, startDate));
  }

  if (endDate) {
    conditions.push(lte(meetingsTable.date, endDate));
  }

  const query = db.query.meetingsTable.findMany({
    with: { user: true },
    orderBy: desc(meetingsTable.date),
    limit,
    offset,
  });

  if (conditions.length === 0) {
    return query;
  }

  const meetings = await query;
  return meetings.filter((meeting: { date: Date }) => {
    if (startDate && meeting.date < startDate) return false;
    if (endDate && meeting.date > endDate) return false;
    return true;
  });
}

/**
 * Verificar conflito de horário
 * Retorna true se há conflito (reunião no mesmo horário)
 * Considera janela de 1 hora para cada reunião
 */
export async function checkMeetingConflict(
  date: Date,
  excludeMeetingId?: number,
): Promise<boolean> {
  const oneHourBefore = new Date(date.getTime() - 60 * 60 * 1000);
  const oneHourAfter = new Date(date.getTime() + 60 * 60 * 1000);

  const conflictingMeetings = await db.query.meetingsTable.findMany({
    where: (meeting: typeof meetingsTable) => {
      let condition = and(
        gte(meeting.date, oneHourBefore),
        lte(meeting.date, oneHourAfter),
      );

      if (excludeMeetingId) {
        // Excluir a reunião sendo editada
        condition = and(condition, ne(meeting.id, excludeMeetingId));
      }

      return condition;
    },
  });

  return conflictingMeetings.length > 0;
}

/**
 * Criar nova reunião
 */
export async function createMeeting(data: {
  userId: number;
  date: Date;
  description?: string;
}) {
  // Verificar conflito
  const hasConflict = await checkMeetingConflict(data.date);
  if (hasConflict) {
    throw new Error(
      "Já existe uma reunião agendada neste horário. Escolha outro horário.",
    );
  }

  const newMeeting = await db
    .insert(meetingsTable)
    .values({
      userId: data.userId,
      date: data.date,
      description: data.description,
    });

  const created = await db.query.meetingsTable.findFirst({
    where: eq(meetingsTable.userId, data.userId),
    orderBy: desc(meetingsTable.id),
  });
  return created!;
}

/**
 * Atualizar reunião
 */
export async function updateMeeting(
  meetingId: number,
  data: {
    date?: Date;
    description?: string;
  },
) {
  const meeting = await getMeetingWithUser(meetingId);
  if (!meeting) {
    throw new Error("Reunião não encontrada");
  }

  // Se está mudando a data, verificar conflito
  if (data.date && data.date.getTime() !== meeting.date.getTime()) {
    const hasConflict = await checkMeetingConflict(data.date, meetingId);
    if (hasConflict) {
      throw new Error(
        "Já existe uma reunião agendada neste horário. Escolha outro horário.",
      );
    }
  }

  const updated = await db
    .update(meetingsTable)
    .set({
      ...(data.date && { date: data.date }),
      ...(data.description && { description: data.description }),
    })
    .where(eq(meetingsTable.id, meetingId))
    ;

  const refreshed = await getMeetingWithUser(meetingId);
  return refreshed || null;
}

/**
 * Deletar reunião
 */
export async function deleteMeeting(meetingId: number): Promise<boolean> {
  const deleted = await db
    .delete(meetingsTable)
    .where(eq(meetingsTable.id, meetingId))
    ;

  return true;
}

/**
 * Obter próximas reuniões (próximos 7 dias)
 */
export async function getUpcomingMeetings() {
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  return await db.query.meetingsTable.findMany({
    where: (meeting: typeof meetingsTable) =>
      and(gte(meeting.date, now), lte(meeting.date, nextWeek)),
    with: { user: true },
    orderBy: meetingsTable.date,
  });
}

/**
 * Obter reuniões de um período específico
 */
export async function getMeetingsByDateRange(startDate: Date, endDate: Date) {
  return await db.query.meetingsTable.findMany({
    where: (meeting: typeof meetingsTable) =>
      and(gte(meeting.date, startDate), lte(meeting.date, endDate)),
    with: { user: true },
    orderBy: meetingsTable.date,
  });
}

/**
 * Verificar disponibilidade de horário (retorna slots disponíveis)
 */
export async function getAvailableTimeSlots(
  date: Date,
  slotDurationMinutes: number = 60,
): Promise<Date[]> {
  const meetings = await getMeetingsByDateRange(
    new Date(date.setHours(0, 0, 0, 0)),
    new Date(date.setHours(23, 59, 59, 999)),
  );

  const occupiedTimes = new Set<number>();

  // Marcar horários ocupados
  for (const meeting of meetings) {
    const startTime = meeting.date.getTime();
    const endTime = startTime + 60 * 60 * 1000; // 1 hora de duração

    for (let time = startTime; time < endTime; time += slotDurationMinutes * 60 * 1000) {
      occupiedTimes.add(time);
    }
  }

  // Gerar slots disponíveis (08:00 - 18:00)
  const availableSlots: Date[] = [];
  const dayStart = new Date(date);
  dayStart.setHours(8, 0, 0, 0);

  for (let hour = 8; hour < 18; hour++) {
    const slotTime = new Date(dayStart);
    slotTime.setHours(hour, 0, 0, 0);

    if (!occupiedTimes.has(slotTime.getTime())) {
      availableSlots.push(new Date(slotTime));
    }
  }

  return availableSlots;
}
