import { z } from 'zod';
import { registerSchema, loginSchema } from '../utils/validators.ts';

// Criamos os tipos automaticamente a partir dos Schemas do Zod!
// Isso garante que o Tipo e a Validação estejam sempre em sincronia.
export type RegisterData = z.infer<typeof registerSchema>;
export type LoginData = z.infer<typeof loginSchema>;

export interface TokenPayload {
  userId: string;
  email: string;
}

export interface AuthResponse {
  message: string;
  user: {
    id: string;
    email: string;
  };
  tokens?: {
    accessToken: string;
    refreshToken: string;
  };
}