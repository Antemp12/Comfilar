import { NextRequest, NextResponse } from "next/server";
import { validateTokenFormat } from "~/lib/auth-middleware";
import { getTokenFromHeader, validateToken } from "~/lib/auth-comfilar";
import { db } from "~/db";
import { 
  ordersTable, 
  orderItemsTable, 
  utilizadorTable,
  quoteRequestsTable,
  quoteItemsTable,
  meetingsTable
} from "~/db/schema";
import { createNotification } from "~/lib/notifications-service";
import { eq } from "drizzle-orm";

async function getUserIdFromRequest(req: NextRequest) {
  const token = getTokenFromHeader(req.headers.get("Authorization"));
  if (!token || !validateTokenFormat(token)) {
    return null;
  }

  const payload = validateToken(token);
  if (!payload || typeof payload !== "object" || !("userId" in payload)) {
    return null;
  }

  return payload.userId as number;
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(req);
    console.log("POST /api/orders/create - userId:", userId);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as {
      items?: unknown;
      deliveryAddress?: unknown;
      deliveryCity?: unknown;
      deliveryPostalCode?: unknown;
      contactPhone?: unknown;
      notes?: unknown;
      total?: unknown;
      meetingDate?: unknown;
      meetingTime?: unknown;
      meetingNotes?: unknown;
    };
    const {
      items,
      deliveryAddress,
      deliveryCity,
      deliveryPostalCode,
      contactPhone,
      notes,
      total,
      meetingDate,
      meetingTime,
      meetingNotes,
    } = body;

    console.log("Creating order for user:", userId, "with items:", items);

    try {
      // Primeiro criar um pedido de orçamento (quote)
      console.log("Step 1: Creating quote request...");
      const [quote] = await db.insert(quoteRequestsTable).values({
        userId,
        status: "approved", // Já aprovado direto (checkout direto)
      });

      const quoteId = Number(quote.insertId);
      console.log("Quote created with ID:", quoteId);

      // Criar items do quote
      if (Array.isArray(items) && items.length > 0) {
        console.log("Step 2: Creating quote items...");
        const quoteItemsData = items.map((item: any) => ({
          quoteId,
          materialId: item.materialId,
          quantity: item.quantity,
        }));
        console.log("Quote items data:", quoteItemsData);

        await db.insert(quoteItemsTable).values(quoteItemsData);
        console.log("Quote items created successfully");
      }

      // Criar encomenda
      console.log("Step 3: Creating order...");
      const [order] = await db.insert(ordersTable).values({
        quoteId,
        status: "processamento",
      });

      const orderId = Number(order.insertId);
      console.log("Order created with ID:", orderId);

      // Criar reunião se tiver data agendada
      if (meetingDate && meetingTime) {
        console.log("Step 4: Creating meeting...");
        const scheduledDateTime = new Date(`${meetingDate}T${meetingTime}`);
        console.log("Meeting date/time:", scheduledDateTime);
        
        await db.insert(meetingsTable).values({
          userId,
          date: scheduledDateTime,
          description: meetingNotes 
            ? `Reunião para Encomenda #${orderId} - ${meetingNotes}` 
            : `Reunião relacionada com a encomenda #${orderId}`,
        });
        console.log("Meeting created successfully");
      }

      // Criar notificações (opcional - não bloquear se falhar)
      try {
        console.log("Step 5: Creating notifications...");
        const adminsAndStaff = await db
          .select({ id: utilizadorTable.id })
          .from(utilizadorTable)
          .where(eq(utilizadorTable.type, "admin"));

        console.log("Found admins:", adminsAndStaff.length);

        for (const user of adminsAndStaff) {
          await createNotification({
            userId: user.id,
            type: "pedido_criado",
            title: "Nova Encomenda",
            message: `Encomenda #${orderId} criada. Confirme se foi processada com sucesso.`,
            relatedId: Number(orderId),
          });
        }

        // Criar notificação para o cliente
        await createNotification({
          userId,
          type: "pedido_criado",
          title: "Encomenda Recebida",
          message: `A sua encomenda #${orderId} foi recebida e está a ser processada.`,
          relatedId: Number(orderId),
        });
        
        console.log("Notifications created successfully");
      } catch (notifError) {
        console.warn("Failed to create notifications (non-critical):", notifError instanceof Error ? notifError.message : String(notifError));
      }

      console.log("Order created successfully:", orderId);

      return NextResponse.json({ 
        success: true, 
        orderId,
        message: "Encomenda criada com sucesso!" 
      });
    } catch (innerError) {
      console.error("Inner error during order creation:", innerError);
      console.error("Inner error details:", innerError instanceof Error ? innerError.message : String(innerError));
      throw innerError; // Re-throw to outer catch
    }
  } catch (error) {
    console.error("Error creating order:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack");
    console.error("Error message:", error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { 
        error: "Failed to create order",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
