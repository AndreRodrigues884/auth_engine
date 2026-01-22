import { type Request, type Response } from 'express';
import * as paymentService from '../services/paymentService.ts';

export const initializePayment = async (req: Request, res: Response) => {
  try {
    // O userId deve vir do teu middleware de auth (req.user)
    // Se ainda não tiveres o middleware tipado, usa (req as any).user.id
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Utilizador não autenticado' });
    }

    const paymentData = await paymentService.createPaymentSheet(userId);

    return res.status(200).json(paymentData);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};