import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { JobDetail } from "@/components/jobs/job-detail";

export default async function JobPage({ params }: { params: { id: string } }) {
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

  const [{ data: job }, { data: photos }, { data: technicians }] = await Promise.all([
    supabase
      .from("jobs")
      .select("*, clients(*), profiles(full_name, email)")
      .eq("id", params.id)
      .eq("company_id", profile.company_id)
      .single(),
    supabase
      .from("job_photos")
      .select("*")
      .eq("job_id", params.id)
      .order("created_at"),
    supabase
      .from("profiles")
      .select("id, full_name")
      .eq("company_id", profile.company_id),
  ]);

  if (!job) notFound();

  return (
    <JobDetail
      job={job}
      photos={photos ?? []}
      technicians={technicians ?? []}
      role={profile.role}
      currentUserId={user.id}
    />
  );
}
