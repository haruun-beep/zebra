import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { QuoteDetail } from "@/components/quotes/quote-detail";

export default async function QuotePage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id, role, companies(name, address, phone, email, logo_url)")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") redirect("/dashboard");

  const [{ data: quote }, { data: items }] = await Promise.all([
    supabase
      .from("quotes")
      .select("*, clients(*)")
      .eq("id", params.id)
      .eq("company_id", profile!.company_id!)
      .single(),
    supabase
      .from("quote_items")
      .select("*")
      .eq("quote_id", params.id)
      .order("sort_order"),
  ]);

  if (!quote) notFound();

  return (
    <QuoteDetail
      quote={quote}
      items={items ?? []}
      company={profile!.companies as Record<string, unknown>}
    />
  );
}
