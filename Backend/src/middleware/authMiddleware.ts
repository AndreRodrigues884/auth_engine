import { type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';
// Removemos o .ts ou usamos .js conforme a regra do teu projeto
import type { TokenPayload } from '../types/auth.js'; 

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido ou inválido' });
  }

  const token = authHeader.split(' ')[1] as string; // Cast para string para evitar erros no verify
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    console.error("ERRO CRÍTICO: JWT_SECRET não definido.");
    return res.status(500).json({ error: "Erro interno." });
  }

  try {
    // Verificamos o token
    const decoded = jwt.verify(token, secret) as unknown as TokenPayload;
    
    // Agora o TS já conhece o 'user' porque o declaramos no express.d.ts
    req.user = decoded; 
    
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token expirado ou inválido' });
  }
};