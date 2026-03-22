import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PaymentsOverview } from "@/components/invoices/payments-overview";

export default async function PaymentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id, role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") redirect("/dashboard");

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: recentPayments } = await supabase
    .from("invoices")
    .select("*, clients(name)")
    .eq("company_id", profile!.company_id!)
    .eq("status", "paid")
    .gte("paid_at", thirtyDaysAgo.toISOString())
    .order("paid_at", { ascending: false });

  const { data: overdue } = await supabase
    .from("invoices")
    .select("*, clients(name)")
    .eq("company_id", profile!.company_id!)
    .eq("status", "overdue")
    .order("due_date", { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Payments</h1>
        <p className="text-muted-foreground">Track payment status and history</p>
      </div>
      <PaymentsOverview
        recentPayments={recentPayments ?? []}
        overdue={overdue ?? []}
      />
    </div>
  );
}
