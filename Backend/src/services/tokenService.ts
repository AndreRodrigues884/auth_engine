import jwt from 'jsonwebtoken';
import redisClient from '../config/redis.ts';
import type { TokenPayload } from '../types/auth.ts';

const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET || 'secret123';
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh_secret_123';

export const generateTokens = async (userId: string, email: string) => {
  const payload: TokenPayload = { userId, email };

  // 1. Gerar Access Token (15 minutos)
  const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });

  // 2. Gerar Refresh Token (7 dias)
  const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

  // 3. Guardar no Redis (chave: userId, valor: token)
  // 'EX' define a expiração em segundos (7 dias)
  await redisClient.set(
    `refreshToken:${userId}`,
    refreshToken,
    'EX',
    7 * 24 * 60 * 60
  );

  return { accessToken, refreshToken };
};

export const verifyRefreshToken = async (token: string) => {
  const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET) as TokenPayload;
  
  // Verificar se o token no Redis é igual ao enviado (proteção contra roubo)
  const storedToken = await redisClient.get(`refreshToken:${decoded.userId}`);
  
  if (!storedToken || storedToken !== token) {
    throw new Error('Token inválido ou revogado');
  }

  return decoded;
};