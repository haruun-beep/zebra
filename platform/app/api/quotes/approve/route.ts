import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET /api/quotes/approve?token=xxx  — public approval page redirect
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });

  const supabase = await createClient();

  const { data: quote, error } = await supabase
    .from("quotes")
    .select("id, status, clients(name)")
    .eq("approval_token", token)
    .single();

  if (error || !quote) {
    return NextResponse.redirect(new URL("/quote-not-found", request.url));
  }

  if (quote.status === "approved") {
    return NextResponse.redirect(new URL(`/quote/already-approved`, request.url));
  }

  // Mark approved
  await supabase
    .from("quotes")
    .update({ status: "approved", approved_at: new Date().toISOString() })
    .eq("approval_token", token);

  return NextResponse.redirect(new URL(`/quote/approved?id=${quote.id}`, request.url));
}
