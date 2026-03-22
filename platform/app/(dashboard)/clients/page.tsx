import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ClientsTable } from "@/components/clients/clients-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: { archived?: string; search?: string };
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

  const showArchived = searchParams.archived === "true";

  let query = supabase
    .from("clients")
    .select("*")
    .eq("company_id", profile.company_id)
    .eq("archived", showArchived)
    .order("name");

  if (searchParams.search) {
    query = query.ilike("name", `%${searchParams.search}%`);
  }

  const { data: clients } = await query;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Clients</h1>
          <p className="text-muted-foreground">
            {showArchived ? "Archived clients" : "Manage your client base"}
          </p>
        </div>
        {profile.role === "admin" && (
          <Link href="/clients/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> New Client
            </Button>
          </Link>
        )}
      </div>
      <ClientsTable
        clients={clients ?? []}
        role={profile.role}
        showArchived={showArchived}
      />
    </div>
  );
}
