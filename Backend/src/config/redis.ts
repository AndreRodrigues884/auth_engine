import { Redis } from 'ioredis';

// Prioridade para a URL completa (usada no Docker), depois para host/port, depois padrão
const redisClient = process.env.REDIS_URL 
  ? new Redis(process.env.REDIS_URL)
  : new Redis({
      host: process.env.REDIS_HOST || 'redis',
      port: Number(process.env.REDIS_PORT) || 6379,
    });

redisClient.on('connect', () => {
  console.log('✅ Redis: Conectado com sucesso');
});

redisClient.on('error', (err) => {
  console.error('❌ Redis: Erro na conexão', err);
});

export default redisClient;