import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string()
    .email("Formato de e-mail inválido")
    .trim()
    .toLowerCase(),
  
  password: z.string()
    .min(8, "A password deve ter pelo menos 8 caracteres")
    .regex(/[A-Z]/, "A password deve conter pelo menos uma letra maiúscula")
    .regex(/[0-9]/, "A password deve conter pelo menos um número")
    .regex(/[^a-zA-Z0-9]/, "A password deve conter pelo menos um caractere especial"),
});

export const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(1, "Password é obrigatória"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("E-mail inválido"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token é obrigatório"),
  newPassword: z.string().min(8, "A nova password deve ter pelo menos 8 caracteres"),
});