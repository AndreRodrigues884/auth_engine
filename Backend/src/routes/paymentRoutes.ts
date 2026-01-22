import { Router, raw } from 'express';
import * as paymentController from '../controllers/paymentController.ts';
import stripe from '../config/stripe.ts';
import prisma from '../config/database.js';
import { authenticate } from '../middleware/authMiddleware.ts';

const router = Router();

// Esta rota será: POST /api/payments/create-checkout
// Importante: Adiciona o teu middleware de auth aqui para proteger a rota!
router.post('/create-checkout', authenticate, paymentController.initializePayment);

router.post('/webhook', raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body, 
      sig, 
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Lógica para quando o pagamento é confirmado
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as any;
    const userId = paymentIntent.metadata.userId;

    console.log(`✅ Pagamento recebido! Atualizando user ${userId} para PRO...`);

    await prisma.user.update({
      where: { id: userId },
      data: { plan: 'PRO' },
    });
  }

  res.json({ received: true });
});

export default router;