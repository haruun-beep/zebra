import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { InvoiceDetail } from "@/components/invoices/invoice-detail";

export default async function InvoicePage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id, role, companies(name, address, phone, email, logo_url, tax_rate)")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") redirect("/dashboard");

  const [{ data: invoice }, { data: items }] = await Promise.all([
    supabase
      .from("invoices")
      .select("*, clients(*), jobs(title)")
      .eq("id", params.id)
      .eq("company_id", profile!.company_id!)
      .single(),
    supabase
      .from("invoice_items")
      .select("*")
      .eq("invoice_id", params.id)
      .order("sort_order"),
  ]);

  if (!invoice) notFound();

  return (
    <InvoiceDetail
      invoice={invoice}
      items={items ?? []}
      company={profile!.companies as Record<string, unknown>}
    />
  );
}
