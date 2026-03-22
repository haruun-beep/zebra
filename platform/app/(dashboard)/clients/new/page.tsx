import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ClientForm } from "@/components/clients/client-form";

export default async function NewClientPage() {
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

  if (profile?.role !== "admin") redirect("/clients");

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">New Client</h1>
        <p className="text-muted-foreground">Add a new client to your database</p>
      </div>
      <ClientForm companyId={profile!.company_id!} />
    </div>
  );
}
