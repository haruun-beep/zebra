import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { JobForm } from "@/components/jobs/job-form";

export default async function NewJobPage({
  searchParams,
}: {
  searchParams: { client?: string };
}) {
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

  if (profile?.role !== "admin") redirect("/jobs");

  const [{ data: clients }, { data: technicians }] = await Promise.all([
    supabase
      .from("clients")
      .select("id, name")
      .eq("company_id", profile!.company_id!)
      .eq("archived", false)
      .order("name"),
    supabase
      .from("profiles")
      .select("id, full_name")
      .eq("company_id", profile!.company_id!),
  ]);

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">New Job</h1>
        <p className="text-muted-foreground">Schedule a new job for a client</p>
      </div>
      <JobForm
        companyId={profile!.company_id!}
        clients={clients ?? []}
        technicians={technicians ?? []}
        defaultClientId={searchParams.client}
      />
    </div>
  );
}
