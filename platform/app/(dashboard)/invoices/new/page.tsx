import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { InvoiceEditor } from "@/components/invoices/invoice-editor";

export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams: { job?: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id, role, companies(tax_rate, payment_terms)")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") redirect("/dashboard");

  const companyId = profile!.company_id!;
  const company = profile!.companies as { tax_rate: number; payment_terms: number } | null;

  const [{ data: clients }, jobResult] = await Promise.all([
    supabase
      .from("clients")
      .select("id, name, email")
      .eq("company_id", companyId)
      .eq("archived", false)
      .order("name"),
    searchParams.job
      ? supabase
          .from("jobs")
          .select("id, title, client_id, clients(name)")
          .eq("id", searchParams.job)
          .single()
      : Promise.resolve({ data: null }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">New Invoice</h1>
        <p className="text-muted-foreground">Create an invoice for a client</p>
      </div>
      <InvoiceEditor
        companyId={companyId}
        clients={clients ?? []}
        defaultTaxRate={company?.tax_rate ?? 0}
        paymentTerms={company?.payment_terms ?? 30}
        linkedJob={jobResult.data ?? undefined}
      />
    </div>
  );
}
