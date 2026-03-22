import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardStats } from "@/components/shared/dashboard-stats";
import { RecentJobs } from "@/components/jobs/recent-jobs";
import { OutstandingInvoices } from "@/components/invoices/outstanding-invoices";

export default async function DashboardPage() {
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

  if (!profile?.company_id) redirect("/onboarding");

  const companyId = profile.company_id;
  const today = new Date().toISOString().split("T")[0];
  const monthStart = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1
  ).toISOString();

  const [
    { count: todayJobsCount },
    { data: outstandingInvoices },
    { data: monthInvoices },
  ] = await Promise.all([
    supabase
      .from("jobs")
      .select("*", { count: "exact", head: true })
      .eq("company_id", companyId)
      .eq("scheduled_date", today),
    supabase
      .from("invoices")
      .select("id, invoice_number, total, amount_paid, due_date, clients(name)")
      .eq("company_id", companyId)
      .in("status", ["sent", "overdue"])
      .order("due_date", { ascending: true })
      .limit(5),
    supabase
      .from("invoices")
      .select("total")
      .eq("company_id", companyId)
      .eq("status", "paid")
      .gte("paid_at", monthStart),
  ]);

  const monthRevenue =
    monthInvoices?.reduce((sum, inv) => sum + (inv.total || 0), 0) ?? 0;
  const outstandingTotal =
    outstandingInvoices?.reduce(
      (sum, inv) => sum + ((inv.total || 0) - (inv.amount_paid || 0)),
      0
    ) ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening today.</p>
      </div>

      <DashboardStats
        todayJobs={todayJobsCount ?? 0}
        outstandingTotal={outstandingTotal}
        monthRevenue={monthRevenue}
        outstandingCount={outstandingInvoices?.length ?? 0}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentJobs companyId={companyId} role={profile.role} userId={user.id} />
        <OutstandingInvoices invoices={outstandingInvoices ?? []} />
      </div>
    </div>
  );
}
