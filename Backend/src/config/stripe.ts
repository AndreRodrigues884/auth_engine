import Stripe from 'stripe';

// Inicializamos o Stripe apenas com a chave. 
// Ele usará automaticamente a versão da API configurada no teu Dashboard do Stripe.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export default stripe;