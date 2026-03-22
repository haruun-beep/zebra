"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

const jobSchema = z.object({
  title: z.string().min(1, "Title is required"),
  client_id: z.string().min(1, "Client is required"),
  assigned_to: z.string().optional(),
  description: z.string().optional(),
  scheduled_date: z.string().optional(),
  scheduled_time: z.string().optional(),
  duration_minutes: z.coerce.number().optional(),
  notes: z.string().optional(),
  status: z.enum(["scheduled", "in_progress", "complete", "cancelled"]),
});

type JobFormData = z.infer<typeof jobSchema>;

interface JobFormProps {
  companyId: string;
  clients: { id: string; name: string }[];
  technicians: { id: string; full_name: string | null }[];
  defaultClientId?: string;
  job?: Record<string, unknown>;
}

export function JobForm({ companyId, clients, technicians, defaultClientId, job }: JobFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: (job?.title as string) ?? "",
      client_id: (job?.client_id as string) ?? defaultClientId ?? "",
      assigned_to: (job?.assigned_to as string) ?? "",
      description: (job?.description as string) ?? "",
      scheduled_date: (job?.scheduled_date as string) ?? "",
      scheduled_time: (job?.scheduled_time as string) ?? "",
      duration_minutes: (job?.duration_minutes as number) ?? undefined,
      notes: (job?.notes as string) ?? "",
      status: (job?.status as JobFormData["status"]) ?? "scheduled",
    },
  });

  async function onSubmit(data: JobFormData) {
    const payload = {
      ...data,
      assigned_to: data.assigned_to || null,
      scheduled_date: data.scheduled_date || null,
      scheduled_time: data.scheduled_time || null,
      duration_minutes: data.duration_minutes || null,
    };

    if (job) {
      const { error } = await supabase.from("jobs").update(payload).eq("id", job.id as string);
      if (error) { toast.error("Failed to update job"); return; }
      toast.success("Job updated");
      router.push(`/jobs/${job.id}`);
    } else {
      const { data: newJob, error } = await supabase
        .from("jobs")
        .insert({ ...payload, company_id: companyId })
        .select()
        .single();
      if (error || !newJob) { toast.error("Failed to create job"); return; }
      toast.success("Job created");
      router.push(`/jobs/${newJob.id}`);
    }
    router.refresh();
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Job Title *</Label>
            <Input {...register("title")} placeholder="e.g. Lawn mowing & edging" />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Client *</Label>
              <Select
                value={watch("client_id")}
                onValueChange={(v) => setValue("client_id", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.client_id && (
                <p className="text-xs text-destructive">{errors.client_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Assign To</Label>
              <Select
                value={watch("assigned_to") ?? ""}
                onValueChange={(v) => setValue("assigned_to", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Unassigned</SelectItem>
                  {technicians.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.full_name ?? "Unknown"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" {...register("scheduled_date")} />
            </div>
            <div className="space-y-2">
              <Label>Time</Label>
              <Input type="time" {...register("scheduled_time")} />
            </div>
            <div className="space-y-2">
              <Label>Duration (min)</Label>
              <Input type="number" {...register("duration_minutes")} placeholder="60" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={watch("status")}
              onValueChange={(v) => setValue("status", v as JobFormData["status"])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="complete">Complete</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea {...register("description")} rows={2} />
          </div>
          <div className="space-y-2">
            <Label>Internal Notes</Label>
            <Textarea {...register("notes")} rows={2} />
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : job ? "Update Job" : "Create Job"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
