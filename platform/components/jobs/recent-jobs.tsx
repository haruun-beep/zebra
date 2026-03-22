import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Briefcase, ArrowRight } from "lucide-react";

interface RecentJobsProps {
  companyId: string;
  role: string;
  userId: string;
}

const statusBadge: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  scheduled: "outline",
  in_progress: "default",
  complete: "secondary",
  cancelled: "destructive",
};

export async function RecentJobs({ companyId, role, userId }: RecentJobsProps) {
  const supabase = await createClient();

  let query = supabase
    .from("jobs")
    .select("id, title, status, scheduled_date, clients(name)")
    .eq("company_id", companyId)
    .order("scheduled_date", { ascending: false })
    .limit(5);

  if (role === "technician") {
    query = query.eq("assigned_to", userId);
  }

  const { data: jobs } = await query;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base flex items-center gap-2">
          <Briefcase className="h-4 w-4" /> Recent Jobs
        </CardTitle>
        <Link href="/jobs" className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1">
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent className="space-y-2">
        {!jobs || jobs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No jobs yet</p>
        ) : (
          jobs.map((job) => (
            <Link
              key={job.id}
              href={`/jobs/${job.id}`}
              className="flex items-center justify-between p-2 rounded-md hover:bg-accent transition-colors"
            >
              <div>
                <p className="text-sm font-medium">{job.title}</p>
                <p className="text-xs text-muted-foreground">
                  {(job.clients as Record<string, string>)?.name ?? "—"}
                  {job.scheduled_date && ` · ${formatDate(job.scheduled_date)}`}
                </p>
              </div>
              <Badge variant={statusBadge[job.status] ?? "outline"} className="text-xs">
                {job.status.replace("_", " ")}
              </Badge>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}
