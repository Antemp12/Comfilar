import { NextRequest, NextResponse } from "next/server";
import { createUser, loginUser } from "~/lib/auth-comfilar";
import { createNotification } from "~/lib/notifications-service";
import { registerSchema } from "~/lib/validations/auth";
import { getUserByEmail } from "~/lib/auth-comfilar";

/**
 * POST /api/auth/register
 * Registar novo cliente
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar schema
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Dados inválidos",
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { name, email, password, type } = validation.data;

    // Verificar se email já existe
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Email já registado",
        },
        { status: 409 },
      );
    }

    // Criar utilizador
    const user = await createUser({
      name,
      email,
      password,
      type,
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Erro ao criar utilizador",
        },
        { status: 500 },
      );
    }

    // Notificação de boas-vindas (não bloquear o registo se falhar)
    try {
      await createNotification({
        userId: user.id,
        type: "sistema",
        title: "Bem-vindo à Comfilar!",
        message: "A sua conta foi criada com sucesso. Estamos prontos para ajudar no que precisar.",
        color: "#a855f7",
      });
    } catch (error) {
      console.warn("Falha ao criar notificação de boas-vindas:", error);
    }

    // Autenticar automaticamente após registo para devolver token e cookie
    const loginResult = await loginUser(email, password);

    const response = NextResponse.json(
      {
        success: true,
        message: "Utilizador criado com sucesso",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          type: user.type,
        },
        token: loginResult?.token ?? null,
      },
      { status: 201 },
    );

    if (loginResult?.token) {
      response.cookies.set("auth_token", loginResult.token, {
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
        sameSite: "lax",
      });
    }

    return response;
  } catch (error) {
    console.error("Erro no registo:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Erro ao registar",
      },
      { status: 500 },
    );
  }
}
