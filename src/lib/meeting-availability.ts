// Disponibilidade de reuniões: dias da semana recorrentes + intervalo de horas.
// A duração de cada reunião é fixa (slots de 30 min gerados dentro do intervalo).
// Guardado em site_settings sob a chave "meeting_availability".

export const MEETING_AVAILABILITY_KEY = "meeting_availability";
export const MEETING_SLOT_MINUTES = 30;

export interface MeetingAvailability {
  /** Dias da semana disponíveis: 0=Domingo … 6=Sábado. */
  weekdays: number[];
  /** Hora de início do atendimento, "HH:MM". */
  startTime: string;
  /** Hora de fim do atendimento, "HH:MM". */
  endTime: string;
}

export const DEFAULT_AVAILABILITY: MeetingAvailability = {
  weekdays: [1, 2, 3, 4, 5], // Segunda a sexta
  startTime: "09:00",
  endTime: "17:00",
};

export const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
export const WEEKDAY_LABELS_LONG = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];

/** Soma minutos a uma hora "HH:MM" e devolve "HH:MM". */
export function addMinutesToTime(time: string, minutes: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + minutes;
  const hh = String(Math.floor(total / 60) % 24).padStart(2, "0");
  const mm = String(total % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}

/** Gera os slots de início possíveis dentro de [startTime, endTime) com o passo dado. */
export function generateSlots(
  startTime: string,
  endTime: string,
  stepMin: number = MEETING_SLOT_MINUTES,
): string[] {
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  const start = sh * 60 + sm;
  const end = eh * 60 + em;
  const slots: string[] = [];
  for (let t = start; t + stepMin <= end; t += stepMin) {
    const hh = String(Math.floor(t / 60)).padStart(2, "0");
    const mm = String(t % 60).padStart(2, "0");
    slots.push(`${hh}:${mm}`);
  }
  return slots;
}

/** Interpreta o valor guardado (JSON) devolvendo sempre uma config válida. */
export function parseAvailability(
  value: string | null | undefined,
): MeetingAvailability {
  if (!value) return DEFAULT_AVAILABILITY;
  try {
    const parsed = JSON.parse(value) as Partial<MeetingAvailability>;
    return {
      weekdays:
        Array.isArray(parsed.weekdays) && parsed.weekdays.length > 0
          ? parsed.weekdays
          : DEFAULT_AVAILABILITY.weekdays,
      startTime: parsed.startTime || DEFAULT_AVAILABILITY.startTime,
      endTime: parsed.endTime || DEFAULT_AVAILABILITY.endTime,
    };
  } catch {
    return DEFAULT_AVAILABILITY;
  }
}
