import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

if (!process.env.JWT_SECRET) {
  throw new Error("ERRO CRÍTICO: JWT_SECRET não definido no arquivo .env");
}

export default prisma;