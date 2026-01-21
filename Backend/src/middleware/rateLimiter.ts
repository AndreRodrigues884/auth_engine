import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import redisClient from '../config/redis.ts';

// Limite para criação de contas (mais rigoroso)
export const registerLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 5,
  message: { error: 'Muitas contas criadas. Tente novamente mais tarde.' },
  store: new RedisStore({
    // Ajuste aqui: forçamos o tipo para satisfazer o RedisStore
    sendCommand: (...args: string[]) => (redisClient as any).call(...args),
  }),
});

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Demasiadas tentativas de login. Bloqueado por 15 min.' },
  store: new RedisStore({
    // Ajuste aqui também
    sendCommand: (...args: string[]) => (redisClient as any).call(...args),
  }),
});