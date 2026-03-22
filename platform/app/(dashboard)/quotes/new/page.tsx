import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { QuoteEditor } from "@/components/quotes/quote-editor";

export default async function NewQuotePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id, role, companies(tax_rate)")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") redirect("/dashboard");

  const { data: clients } = await supabase
    .from("clients")
    .select("id, name, email")
    .eq("company_id", profile!.company_id!)
    .eq("archived", false)
    .order("name");

  const company = profile?.companies as { tax_rate: number } | null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">New Quote</h1>
        <p className="text-muted-foreground">Create a quote for a client</p>
      </div>
      <QuoteEditor
        companyId={profile!.company_id!}
        clients={clients ?? []}
        defaultTaxRate={company?.tax_rate ?? 0}
      />
    </div>
  );
}
