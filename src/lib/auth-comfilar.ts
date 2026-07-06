import bcryptjs from "bcryptjs";
import { db } from "@/db";
import {
  utilizadorTable,
  type Utilizador,
  type NewUtilizador,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { signSessionToken, verifySessionToken } from "@/lib/session-token";

// ============================================
// PASSWORD HASHING
// ============================================

/**
 * Hash uma password
 * @param password - Password em texto plano
 * @returns Password hasheada
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcryptjs.genSalt(10);
  return await bcryptjs.hash(password, salt);
}

/**
 * Verifica se a password corresponde ao hash
 * @param password - Password em texto plano
 * @param hash - Hash da password
 * @returns true se corresponder
 */
export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return await bcryptjs.compare(password, hash);
}

// ============================================
// USER QUERIES
// ============================================

/**
 * Busca utilizador por email
 */
export async function getUserByEmail(
  email: string,
): Promise<Utilizador | null> {
  const result = await db
    .select()
    .from(utilizadorTable)
    .where(eq(utilizadorTable.email, email))
    .limit(1);

  return result[0] ?? null;
}

/**
 * Busca utilizador por ID
 */
export async function getUserById(id: number): Promise<Utilizador | null> {
  const result = await db
    .select()
    .from(utilizadorTable)
    .where(eq(utilizadorTable.id, id))
    .limit(1);

  return result[0] ?? null;
}

/**
 * Criar novo utilizador
 */
export async function createUser(
  data: NewUtilizador,
): Promise<Utilizador | null> {
  try {
    // Hash a password antes de guardar
    const hashedPassword = await hashPassword(data.password);

    await db
      .insert(utilizadorTable)
      .values({
        ...data,
        password: hashedPassword,
      });

    // Fetch the created user by email
    const created = await getUserByEmail(data.email);
    return created ?? null;
  } catch (error) {
    console.error("Erro ao criar utilizador:", error);
    return null;
  }
}

/**
 * Login - Valida email e password
 */
export async function loginUser(
  email: string,
  password: string,
): Promise<{ user: Utilizador; token: string } | null> {
  try {
    const user = await getUserByEmail(email);

    if (!user) {
      return null;
    }

    // Verifica a password
    const isPasswordValid = await verifyPassword(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    // Token de sessão assinado com HMAC (ver session-token.ts)
    const token = signSessionToken(user.id);

    return { user, token };
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    return null;
  }
}

/**
 * Listar todos os utilizadores (admin only)
 */
export async function getAllUsers(): Promise<Utilizador[]> {
  return await db.select().from(utilizadorTable).orderBy(utilizadorTable.name);
}

/**
 * Eliminar utilizador (admin only)
 */
export async function deleteUser(id: number): Promise<boolean> {
  try {
    await db
      .delete(utilizadorTable)
      .where(eq(utilizadorTable.id, id));

    return true;
  } catch (error) {
    console.error("Erro ao eliminar utilizador:", error);
    return false;
  }
}

/**
 * Atualizar tipo de utilizador (admin only)
 */
export async function updateUserType(
  id: number,
  type: "cliente" | "funcionario" | "admin",
): Promise<Utilizador | null> {
  try {
    const result = await db
      .update(utilizadorTable)
      .set({ type })
      .where(eq(utilizadorTable.id, id))
        ;

      // Return the updated user
      const updated = await getUserById(id);
      return updated ?? null;
  } catch (error) {
    console.error("Erro ao atualizar tipo de utilizador:", error);
    return null;
  }
}

// ============================================
// SESSION MANAGEMENT
// ============================================

/**
 * Valida um token de sessão (assinatura HMAC + expiração).
 */
export function validateToken(token: string): { userId: number } | null {
  return verifySessionToken(token);
}

/**
 * Extrai o token do header Authorization
 */
export function getTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.substring(7);
}
