import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = await createClient();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.CheckoutSession;
    const invoiceId = session.metadata?.invoice_id;
    if (!invoiceId) return NextResponse.json({ received: true });

    const amountPaid = (session.amount_total ?? 0) / 100;

    await supabase
      .from("invoices")
      .update({
        status: "paid",
        amount_paid: amountPaid,
        paid_at: new Date().toISOString(),
        stripe_payment_intent_id: session.payment_intent as string,
      })
      .eq("id", invoiceId);
  }

  return NextResponse.json({ received: true });
}
