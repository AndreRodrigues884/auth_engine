import { type Request, type Response } from 'express';
import * as authService from '../services/authService.ts';
import { registerSchema } from '../utils/validators.ts';
import { loginSchema } from '../utils/validators.ts';
import * as tokenService from '../services/tokenService.ts';
import redisClient from '../config/redis.ts';
import * as emailService from '../services/emailService.ts';

export const register = async (req: Request, res: Response) => {
  try {
    // 1. Validação com Zod
    const validatedData = registerSchema.parse(req.body);

    // 2. Chamar o serviço
    const newUser = await authService.createUser(validatedData);

    // ENVIAR E-MAIL (Não usamos 'await' aqui se quisermos que a resposta ao 
    // utilizador seja instantânea, ou usamos se quisermos garantir que o e-mail saiu)
    emailService.sendVerificationEmail(newUser.email, newUser.verificationToken)
      .catch(err => console.error("❌ Erro ao enviar e-mail:", err));

    return res.status(201).json({
      message: 'Utilizador registado com sucesso. Verifique o seu e-mail.',
      user: { id: newUser.id, email: newUser.email }
    });

  } catch (error: any) {
    // Tratamento de erros de validação do Zod
    if (error.name === 'ZodError') {
      return res.status(400).json({ errors: error.errors });
    }

    // Erros de negócio (ex: e-mail duplicado)
    return res.status(400).json({ error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    // Validação de input
    const validatedData = loginSchema.parse(req.body);

    // Execução da lógica de negócio
    const result = await authService.loginUser(validatedData);

    return res.status(200).json({
      message: 'Login realizado com sucesso',
      ...result
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ errors: error.errors });
    }
    return res.status(401).json({ error: error.message });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token é obrigatório' });
    }

    // 1. Validar o token e verificar no Redis
    const payload = await tokenService.verifyRefreshToken(refreshToken);

    // 2. Gerar novo par de tokens (Refresh Token Rotation)
    const tokens = await tokenService.generateTokens(payload.userId, payload.email);

    return res.status(200).json(tokens);
  } catch (error: any) {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    // O middleware 'authenticate' já colocou o req.user aqui
    const userId = req.user?.userId;

    if (userId) {
      await redisClient.del(`refreshToken:${userId}`);
    }

    return res.status(200).json({ message: 'Logout efetuado com sucesso' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao fazer logout' });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body; // Idealmente validar com Zod aqui
    const token = await authService.forgotPassword(email);

    await emailService.sendResetPasswordEmail(email, token);

    return res.status(200).json({ message: 'E-mail de recuperação enviado.' });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;
    await authService.resetPassword(token, newPassword);

    return res.status(200).json({ message: 'Password alterada com sucesso.' });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    await authService.verifyEmail(token);
    return res.status(200).json({ message: 'E-mail verificado com sucesso!' });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};