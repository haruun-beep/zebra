import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SettingsTabs } from "@/components/shared/settings-tabs";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*, companies(*)")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/dashboard");

  const { data: teamMembers } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, avatar_url, created_at")
    .eq("company_id", profile!.company_id!);

  const { data: pendingInvites } = await supabase
    .from("invitations")
    .select("*")
    .eq("company_id", profile!.company_id!)
    .is("accepted_at", null)
    .gt("expires_at", new Date().toISOString());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your company and account settings</p>
      </div>
      <SettingsTabs
        profile={profile}
        company={profile!.companies as Record<string, unknown>}
        teamMembers={teamMembers ?? []}
        pendingInvites={pendingInvites ?? []}
      />
    </div>
  );
}
