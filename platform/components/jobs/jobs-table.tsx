"use client";

import { useRouter } from "next/navigation";
import { formatDate, formatTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "scheduled", label: "Scheduled" },
  { value: "in_progress", label: "In Progress" },
  { value: "complete", label: "Complete" },
  { value: "cancelled", label: "Cancelled" },
];

const statusBadge: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  scheduled: "outline",
  in_progress: "default",
  complete: "secondary",
  cancelled: "destructive",
};

interface JobsTableProps {
  jobs: Record<string, unknown>[];
  role: string;
}

export function JobsTable({ jobs, role }: JobsTableProps) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = jobs.filter(
    (j) => statusFilter === "all" || j.status === statusFilter
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">{filtered.length} jobs</p>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              {role === "admin" && <TableHead>Assigned To</TableHead>}
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No jobs found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((job) => (
                <TableRow
                  key={job.id as string}
                  className="cursor-pointer hover:bg-accent/50"
                  onClick={() => router.push(`/jobs/${job.id}`)}
                >
                  <TableCell className="font-medium">{job.title as string}</TableCell>
                  <TableCell>
                    {((job.clients as Record<string, string>)?.name) ?? "—"}
                  </TableCell>
                  <TableCell>
                    {job.scheduled_date
                      ? formatDate(job.scheduled_date as string)
                      : "—"}
                  </TableCell>
                  <TableCell>
                    {job.scheduled_time
                      ? formatTime(job.scheduled_time as string)
                      : "—"}
                  </TableCell>
                  {role === "admin" && (
                    <TableCell>
                      {((job.profiles as Record<string, string>)?.full_name) ?? "Unassigned"}
                    </TableCell>
                  )}
                  <TableCell>
                    <Badge variant={statusBadge[job.status as string] ?? "outline"}>
                      {(job.status as string).replace("_", " ")}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
