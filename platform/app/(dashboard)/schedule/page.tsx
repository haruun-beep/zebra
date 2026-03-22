import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ScheduleCalendar } from "@/components/jobs/schedule-calendar";

export default async function SchedulePage() {
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
    .select("*, clients(name)")
    .eq("company_id", profile.company_id)
    .not("scheduled_date", "is", null);

  if (profile.role === "technician") {
    query = query.eq("assigned_to", user.id);
  }

  const { data: jobs } = await query;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Schedule</h1>
        <p className="text-muted-foreground">Calendar view of all scheduled jobs</p>
      </div>
      <ScheduleCalendar jobs={jobs ?? []} />
    </div>
  );
}
