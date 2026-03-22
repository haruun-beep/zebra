import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
  typescript: true,
});

export async function createPaymentLink(
  invoiceId: string,
  amount: number,
  description: string,
  customerEmail: string
) {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // convert to cents
    currency: "usd",
    receipt_email: customerEmail,
    description,
    metadata: {
      invoice_id: invoiceId,
    },
  });

  return paymentIntent;
}

export async function createStripeSession(
  invoiceId: string,
  amount: number,
  description: string,
  customerEmail: string,
  successUrl: string,
  cancelUrl: string
) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: description },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    customer_email: customerEmail,
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { invoice_id: invoiceId },
  });

  return session;
}
