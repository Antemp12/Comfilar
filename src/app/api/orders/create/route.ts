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
  meetingRequestsTable
} from "~/db/schema";
import { createNotification } from "~/lib/notifications-service";
import { eq } from "drizzle-orm";

// ═══════════════════════════════════════════════════════════════════════════════
// FUNÇÃO AUXILIAR: Extrair e validar ID do utilizador a partir do token JWT
// ═══════════════════════════════════════════════════════════════════════════════
async function getUserIdFromRequest(req: NextRequest) {
  // Procurar token em Authorization header (case-insensitive)
  const authHeader = req.headers.get("authorization") ?? req.headers.get("Authorization");
  let token = getTokenFromHeader(authHeader);

  // Fallback: procurar em cookies
  if (!token) {
    token = req.cookies.get("auth_token")?.value ?? null;
  }

  // Validar formato do token
  if (!token || !validateTokenFormat(token)) {
    return null;
  }

  // Decodificar payload e extrair userId
  const payload = validateToken(token);
  if (!payload || typeof payload !== "object" || !("userId" in payload)) {
    return null;
  }

  return payload.userId as number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// POST /api/orders/create - Converter carrinho em orçamento e depois em encomenda
// ═══════════════════════════════════════════════════════════════════════════════
export async function POST(req: NextRequest) {
  try {
    // Extrair ID do utilizador do token JWT
    const userId = await getUserIdFromRequest(req);
    console.log("POST /api/orders/create - userId:", userId);

    // Retornar erro 401 se não autenticado
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Extrair dados do corpo da requisição (items, endereço, etc)
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
      // ─────────────────────────────────────────────────────────────────────────────
      // PASSO 1: Criar um pedido de orçamento (quote)
      // ─────────────────────────────────────────────────────────────────────────────
      console.log("Step 1: Creating quote request...");
      const [quote] = await db.insert(quoteRequestsTable).values({
        userId,
        status: "approved", // Já aprovado direto (checkout direto)
      });

      const quoteId = Number(quote.insertId);
      console.log("Quote created with ID:", quoteId);

      // ─────────────────────────────────────────────────────────────────────────────
      // PASSO 2: Inserir items do orçamento
      // ─────────────────────────────────────────────────────────────────────────────
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
      const orderResult = await db.insert(ordersTable).values({
        userId,
        quoteId,
        status: "processamento",
        confirmationDate: new Date(), // Guardar a data/hora exata de criação
      });

      // Com Drizzle, o insertId está em orderResult[0].insertId se houver
      const orderId = orderResult[0]?.insertId || quoteId; // Fallback usar quoteId
      console.log("Order created with ID:", orderId, "from result:", orderResult);

      // Criar items da encomenda
      if (Array.isArray(items) && items.length > 0) {
        console.log("Step 4: Creating order items...");
        const orderItemsData = items.map((item: any) => ({
          orderId: Number(orderId),
          materialId: item.materialId,
          quantity: item.quantity,
          unitPrice: item.price, // Preço do item no momento da encomenda
        }));
        console.log("Order items data:", orderItemsData);

        await db.insert(orderItemsTable).values(orderItemsData);
        console.log("Order items created successfully");
        
        // Reduzir stock dos materiais
        console.log("Step 4.1: Reducing material stock...");
        for (const item of items) {
          await db.execute(
            `UPDATE material SET stock = stock - ${item.quantity} WHERE id = ${item.materialId}`
          );
        }
        console.log("Material stock reduced successfully");
      }

      // Criar reunião se tiver data agendada
      if (meetingDate && meetingTime) {
        console.log("Step 5: Creating meeting request...");
        console.log("Received meetingDate:", meetingDate);
        console.log("Received meetingTime:", meetingTime);
        
        const [hours, minutes] = meetingTime.split(':');
        
        // Criar data corretamente sem conversão de timezone
        // meetingDate vem como "2026-02-15" do input type="date"
        const [year, month, day] = meetingDate.split('-').map(Number);
        
        // Criar Date object em UTC para corresponder exatamente à data/hora escolhida
        const scheduledDate = new Date(Date.UTC(year, month - 1, day, parseInt(hours), parseInt(minutes), 0, 0));
        
        console.log("Scheduled date object:", scheduledDate);
        console.log("Scheduled date ISO:", scheduledDate.toISOString());
        
        // Calcular hora de fim (1 hora depois por padrão)
        const endHour = (parseInt(hours) + 1).toString().padStart(2, '0');
        const endTime = `${endHour}:${minutes}`;
        
        await db.insert(meetingRequestsTable).values({
          userId,
          date: scheduledDate,
          startTime: meetingTime,
          endTime: endTime,
          subject: meetingNotes 
            ? `Encomenda #${orderId} - ${meetingNotes}` 
            : `Reunião relacionada com a encomenda #${orderId}`,
          status: "pendente", // Requer aprovação
        });
        console.log("Meeting request created successfully");
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
        orderId: Number(orderId),
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
