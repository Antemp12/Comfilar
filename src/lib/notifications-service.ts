import { db } from "@/db";
import { notificationsTable, utilizadorTable } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";

type NotificationType =
  | "pedido_criado"
  | "pedido_confirmado"
  | "pedido_preparacao"
  | "pedido_enviado"
  | "pedido_entregue"
  | "reuniao_agendada"
  | "reuniao_cancelada"
  | "sistema"
  | "mensagem"
  | "promocao";

interface NotificationData {
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  relatedId?: number;
  color?: string;
}

const defaultNotificationColors: Record<NotificationType, string> = {
  pedido_criado: "#f59e0b", // amarelo (pendente)
  pedido_confirmado: "#22c55e", // verde (sucesso)
  pedido_preparacao: "#22c55e", // verde (sucesso)
  pedido_enviado: "#22c55e", // verde (sucesso)
  pedido_entregue: "#22c55e", // verde (sucesso)
  reuniao_agendada: "#22c55e", // verde (sucesso)
  reuniao_cancelada: "#ef4444", // vermelho (não sucesso)
  sistema: "#3b82f6", // azul (mensagens gerais)
  mensagem: "#3b82f6", // azul (falar com funcionário)
  promocao: "#a855f7", // roxo (promoções)
};

/**
 * Criar notificação (site + email)
 */
export async function createNotification(data: NotificationData) {
  // Criar notificação no banco
  const notification = await db
    .insert(notificationsTable)
    .values({
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      relatedId: data.relatedId,
      color: data.color ?? defaultNotificationColors[data.type],
      sentEmail: false,
    });

  // Enviar email (async, não aguarda)
  sendNotificationEmail(data).catch((err) => {
    console.error("Erro ao enviar email:", err);
  });

  const createdRows = await db
    .select()
    .from(notificationsTable)
    .where(eq(notificationsTable.userId, data.userId))
    .orderBy(desc(notificationsTable.createdAt))
    .limit(1);
  const created = createdRows[0];
  return created!;
}

/**
 * Enviar email de notificação
 */
async function sendNotificationEmail(data: NotificationData) {
  try {
    // Buscar email do usuário
    const userRows = await db
      .select()
      .from(utilizadorTable)
      .where(eq(utilizadorTable.id, data.userId))
      .limit(1);
    const user = userRows[0];

    if (!user || !user.email) {
      console.log("Usuário não encontrado ou email vazio");
      return;
    }

    // Usar Resend (já está na deps)
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    const emailTemplates: { [key in NotificationType]: { subject: string } } =
      {
        pedido_criado: {
          subject: "Pedido criado com sucesso",
        },
        pedido_confirmado: {
          subject: "Pedido confirmado",
        },
        pedido_preparacao: {
          subject: "Seu pedido está em preparação",
        },
        pedido_enviado: {
          subject: "Seu pedido foi enviado",
        },
        pedido_entregue: {
          subject: "Seu pedido foi entregue",
        },
        reuniao_agendada: {
          subject: "Reunião agendada com sucesso",
        },
        reuniao_cancelada: {
          subject: "Reunião cancelada",
        },
        sistema: {
          subject: "Notificação do sistema",
        },
      };

    const template = emailTemplates[data.type];

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Comfilar <onboarding@resend.dev>",
      to: user.email,
      subject: template.subject,
      html: `
        <h2>${data.title}</h2>
        <p>${data.message}</p>
        <hr />
        <p style="color: #666; font-size: 12px;">
          Comfilar - Materiais de Construção
        </p>
      `,
    });

    // Marcar como enviado
    await db
      .update(notificationsTable)
      .set({ sentEmail: true })
      .where(eq(notificationsTable.userId, data.userId));
  } catch (error) {
    console.error("Erro ao enviar notificação por email:", error);
  }
}

/**
 * Obter notificações do usuário
 */
export async function getUserNotifications(
  userId: number,
  options: { limit?: number; offset?: number; unreadOnly?: boolean } = {},
) {
  const { limit = 50, offset = 0, unreadOnly = false } = options;

  const whereCondition = unreadOnly
    ? and(
        eq(notificationsTable.userId, userId),
        eq(notificationsTable.read, false),
      )!
    : eq(notificationsTable.userId, userId);

  return db.query.notificationsTable.findMany({
    where: whereCondition,
    orderBy: desc(notificationsTable.createdAt),
    limit,
    offset,
  });
}

/**
 * Marcar notificação como lida
 */
export async function markNotificationAsRead(notificationId: number) {
  const updated = await db
    .update(notificationsTable)
    .set({ read: true })
    .where(eq(notificationsTable.id, notificationId))
    ;

  const refreshedRows = await db
    .select()
    .from(notificationsTable)
    .where(eq(notificationsTable.id, notificationId))
    .limit(1);
  const refreshed = refreshedRows[0];
  return refreshed || null;
}

/**
 * Marcar todas as notificações como lidas
 */
export async function markAllNotificationsAsRead(userId: number) {
  await db
    .update(notificationsTable)
    .set({ read: true })
    .where(eq(notificationsTable.userId, userId));
}

/**
 * Contar notificações não lidas
 */
export async function getUnreadNotificationCount(userId: number) {
  const unread = await db.query.notificationsTable.findMany({
    where: and(eq(notificationsTable.userId, userId), eq(notificationsTable.read, false)),
  });

  return unread.length;
}

/**
 * Deletar notificação
 */
export async function deleteNotification(notificationId: number) {
  const deleted = await db
    .delete(notificationsTable)
    .where(eq(notificationsTable.id, notificationId))
    ;

  return true;
}

// ============================================
// NOTIFICAÇÕES PRÉ-CONFIGURADAS
// ============================================

export async function notifyOrderCreated(userId: number, orderId: number) {
  return createNotification({
    userId,
    type: "pedido_criado",
    title: "Pedido criado com sucesso",
    message: "Seu pedido foi criado e está em processamento.",
    relatedId: orderId,
  });
}

export async function notifyOrderConfirmed(userId: number, orderId: number) {
  return createNotification({
    userId,
    type: "pedido_confirmado",
    title: "Pedido confirmado",
    message: "Seu pedido foi confirmado e aguarda processamento.",
    relatedId: orderId,
  });
}

export async function notifyOrderInPreparation(userId: number, orderId: number) {
  return createNotification({
    userId,
    type: "pedido_preparacao",
    title: "Pedido em preparação",
    message: "Seu pedido está sendo preparado para envio.",
    relatedId: orderId,
  });
}

export async function notifyOrderShipped(userId: number, orderId: number) {
  return createNotification({
    userId,
    type: "pedido_enviado",
    title: "Pedido enviado",
    message: "Seu pedido foi enviado e está a caminho.",
    relatedId: orderId,
  });
}

export async function notifyOrderDelivered(userId: number, orderId: number) {
  return createNotification({
    userId,
    type: "pedido_entregue",
    title: "Pedido entregue",
    message: "Seu pedido foi entregue com sucesso.",
    relatedId: orderId,
  });
}

export async function notifyMeetingScheduled(
  userId: number,
  meetingId: number,
) {
  return createNotification({
    userId,
    type: "reuniao_agendada",
    title: "Reunião agendada",
    message: "Uma reunião foi agendada para você.",
    relatedId: meetingId,
  });
}

export async function notifyMeetingCancelled(
  userId: number,
  meetingId: number,
) {
  return createNotification({
    userId,
    type: "reuniao_cancelada",
    title: "Reunião cancelada",
    message: "Uma reunião foi cancelada.",
    relatedId: meetingId,
  });
}
