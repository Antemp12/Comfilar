import { z } from "zod";

// ============================================
// LOGIN / REGISTER SCHEMAS
// ============================================

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(4, "Password deve ter pelo menos 4 caracteres"),
});

export const registerSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(4, "Password deve ter pelo menos 4 caracteres"),
  type: z.enum(["cliente", "funcionario"]).default("cliente"),
});

export const createUserSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(4, "Password deve ter pelo menos 4 caracteres"),
  type: z.enum(["cliente", "funcionario", "admin"]).default("cliente"),
});

// ============================================
// RESPONSE TYPES
// ============================================

export type LoginRequest = z.infer<typeof loginSchema>;
export type RegisterRequest = z.infer<typeof registerSchema>;
export type CreateUserRequest = z.infer<typeof createUserSchema>;

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: {
    id: number;
    email: string;
    name: string;
    type: "cliente" | "funcionario" | "admin";
  };
  token?: string;
}

export interface AuthContext {
  userId: number;
  userType: "cliente" | "funcionario" | "admin";
}
