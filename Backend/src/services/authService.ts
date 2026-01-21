import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import prisma from '../config/database.ts';
import type { RegisterData } from '../types/auth.ts';
import type { LoginData } from '../types/auth.ts';
import * as tokenService from './tokenService.ts';

export const createUser = async (data: RegisterData) => {
  // 1. Verificar se o e-mail já existe
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email }
  });

  if (existingUser) {
    throw new Error('Este e-mail já está em uso.');
  }

  // 2. Hash da password (Salt Rounds: 12 é o padrão profissional atual)
  const hashedPassword = await bcrypt.hash(data.password, 12);

  // 3. Gerar token único para verificação de e-mail
  const verificationToken = crypto.randomBytes(32).toString('hex');

  // 4. Criar utilizador na DB
  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      verificationToken,
      isVerified: false,
    },
  });

  return {
    id: user.id,
    email: user.email,
    verificationToken // Vamos precisar disto para enviar o e-mail no próximo passo
  };
};

export const loginUser = async (data: LoginData) => {
  // 1. Procurar o utilizador
  const user = await prisma.user.findUnique({
    where: { email: data.email }
  });

  if (!user) {
    throw new Error('Credenciais inválidas.');
  }

  // 2. Verificar se o e-mail foi confirmado (Opcional, mas profissional)
  if (!user.isVerified) {
    throw new Error('Por favor, verifique o seu e-mail antes de fazer login.');
  }

  // 3. Comparar a password usando bcrypt
  const isPasswordValid = await bcrypt.compare(data.password, user.password);

  if (!isPasswordValid) {
    throw new Error('Credenciais inválidas.');
  }

  // 4. Gerar os Tokens (Access + Refresh)
  const tokens = await tokenService.generateTokens(user.id, user.email);

  return {
    user: { id: user.id, email: user.email },
    tokens
  };
};

export const forgotPassword = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('Utilizador não encontrado.');

  // Gerar token de reset e expiração (1 hora)
  const resetToken = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 3600000); 

  await prisma.user.update({
    where: { email },
    data: {
      resetPasswordToken: resetToken,
      resetPasswordExpires: expires
    }
  });

  return resetToken;
};

export const resetPassword = async (token: string, newPassword: string) => {
  const user = await prisma.user.findUnique({
    where: { resetPasswordToken: token }
  });

  if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
    throw new Error('Token inválido ou expirado.');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetPasswordToken: null, // Limpa o token após o uso
      resetPasswordExpires: null
    }
  });
};

export const verifyEmail = async (token: string) => {
  const user = await prisma.user.findUnique({
    where: { verificationToken: token }
  });

  if (!user) throw new Error('Token de verificação inválido.');

  await prisma.user.update({
    where: { id: user.id },
    data: {
      isVerified: true,
      verificationToken: null // Limpa o token após usar
    }
  });
};