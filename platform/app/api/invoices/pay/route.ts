import { createClient } from "@/lib/supabase/server";
import { createStripeSession } from "@/lib/stripe";
import { NextResponse } from "next/server";

// POST /api/invoices/pay  — create Stripe checkout session
export async function POST(request: Request) {
  const { invoiceId } = await request.json();
  if (!invoiceId) return NextResponse.json({ error: "Missing invoiceId" }, { status: 400 });

  const supabase = await createClient();

  const { data: invoice } = await supabase
    .from("invoices")
    .select("*, clients(name, email), companies(name)")
    .eq("id", invoiceId)
    .single();

  if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  if (invoice.status === "paid") return NextResponse.json({ error: "Already paid" }, { status: 400 });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL!;
  const remaining = invoice.total - invoice.amount_paid;

  const session = await createStripeSession(
    invoiceId,
    remaining,
    `Invoice ${invoice.invoice_number} — ${(invoice.companies as Record<string, string>).name}`,
    (invoice.clients as Record<string, string>).email,
    `${baseUrl}/invoice/success?id=${invoiceId}`,
    `${baseUrl}/invoice/${invoiceId}`
  );

  // Store the payment link
  await supabase
    .from("invoices")
    .update({ stripe_payment_link: session.url })
    .eq("id", invoiceId);

  return NextResponse.json({ url: session.url });
}
