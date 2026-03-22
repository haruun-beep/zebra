import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { ClientDetail } from "@/components/clients/client-detail";

export default async function ClientPage({ params }: { params: { id: string } }) {
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

  const [{ data: client }, { data: jobs }, { data: invoices }] = await Promise.all([
    supabase
      .from("clients")
      .select("*")
      .eq("id", params.id)
      .eq("company_id", profile.company_id)
      .single(),
    supabase
      .from("jobs")
      .select("*")
      .eq("client_id", params.id)
      .order("scheduled_date", { ascending: false })
      .limit(10),
    supabase
      .from("invoices")
      .select("*")
      .eq("client_id", params.id)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  if (!client) notFound();

  return (
    <ClientDetail
      client={client}
      jobs={jobs ?? []}
      invoices={invoices ?? []}
      role={profile.role}
    />
  );
}
