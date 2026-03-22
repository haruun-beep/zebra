import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { ClientForm } from "@/components/clients/client-form";

export default async function EditClientPage({ params }: { params: { id: string } }) {
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

  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", params.id)
    .eq("company_id", profile!.company_id!)
    .single();

  if (!client) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Edit Client</h1>
        <p className="text-muted-foreground">{client.name}</p>
      </div>
      <ClientForm companyId={profile!.company_id!} client={client} />
    </div>
  );
}
