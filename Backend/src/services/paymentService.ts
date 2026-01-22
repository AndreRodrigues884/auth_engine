import stripe from '../config/stripe.ts';
import prisma from '../config/database.js';

export const createPaymentSheet = async (userId: string) => {
  // 1. Procurar o utilizador na base de dados
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('Utilizador não encontrado');
  }

  // 2. Criar ou recuperar um Customer no Stripe
  // É boa prática ter o ID do cliente Stripe guardado para não criar duplicados
  let stripeCustomerId = user.stripeCustomerId;

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { userId: user.id },
    });
    stripeCustomerId = customer.id;

    // Guardar o ID do Stripe no nosso banco de dados
    await prisma.user.update({
      where: { id: userId },
      data: { stripeCustomerId },
    });
  }

  // 3. Criar o Payment Intent (o valor é em CÊNTIMOS, ex: 1990 = 19.90€)
  const paymentIntent = await stripe.paymentIntents.create({
    amount: 1990, 
    currency: 'eur',
    customer: stripeCustomerId,
    automatic_payment_methods: { enabled: true },
    metadata: { userId: user.id }, // Importante para o Webhook saber quem pagou
  });

  return {
    paymentIntent: paymentIntent.client_secret,
    customerId: stripeCustomerId,
  };
};