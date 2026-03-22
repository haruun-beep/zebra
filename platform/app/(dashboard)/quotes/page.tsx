import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { QuotesTable } from "@/components/quotes/quotes-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function QuotesPage() {
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
  if (profile?.role !== "admin") redirect("/dashboard");

  const { data: quotes } = await supabase
    .from("quotes")
    .select("*, clients(name, email)")
    .eq("company_id", profile!.company_id!)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quotes</h1>
          <p className="text-muted-foreground">Send and manage client quotes</p>
        </div>
        <Link href="/quotes/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> New Quote
          </Button>
        </Link>
      </div>
      <QuotesTable quotes={quotes ?? []} />
    </div>
  );
}
