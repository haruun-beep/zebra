import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { JobsTable } from "@/components/jobs/jobs-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function JobsPage({
  searchParams,
}: {
  searchParams: { status?: string };
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
  if (!profile?.company_id) redirect("/onboarding");

  let query = supabase
    .from("jobs")
    .select("*, clients(name, email), profiles(full_name)")
    .eq("company_id", profile.company_id)
    .order("scheduled_date", { ascending: false });

  if (profile.role === "technician") {
    query = query.eq("assigned_to", user.id);
  }

  if (searchParams.status) {
    query = query.eq("status", searchParams.status);
  }

  const { data: jobs } = await query;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Jobs</h1>
          <p className="text-muted-foreground">Track and manage field work</p>
        </div>
        {profile.role === "admin" && (
          <Link href="/jobs/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> New Job
            </Button>
          </Link>
        )}
      </div>
      <JobsTable jobs={jobs ?? []} role={profile.role} />
    </div>
  );
}
