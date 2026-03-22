"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { formatDate, formatTime, formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PhotoUploader } from "@/components/jobs/photo-uploader";
import { Calendar, Clock, User, MapPin, Camera, FileText, Edit } from "lucide-react";
import Link from "next/link";

const statusBadge: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  complete: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-800",
};

interface JobDetailProps {
  job: Record<string, unknown>;
  photos: Record<string, unknown>[];
  technicians: { id: string; full_name: string | null }[];
  role: string;
  currentUserId: string;
}

export function JobDetail({ job, photos: initialPhotos, technicians, role, currentUserId }: JobDetailProps) {
  const router = useRouter();
  const supabase = createClient();
  const [status, setStatus] = useState(job.status as string);
  const [photos, setPhotos] = useState(initialPhotos);
  const [saving, setSaving] = useState(false);

  const client = job.clients as Record<string, string>;
  const assignee = job.profiles as Record<string, string> | null;

  async function updateStatus(newStatus: string) {
    setSaving(true);
    const { error } = await supabase
      .from("jobs")
      .update({ status: newStatus })
      .eq("id", job.id as string);
    setSaving(false);
    if (error) { toast.error("Failed to update status"); return; }
    setStatus(newStatus);
    toast.success("Status updated");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{job.title as string}</h1>
          <Link href={`/clients/${job.client_id}`} className="text-muted-foreground hover:text-primary text-sm">
            {client?.name}
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-sm px-3 py-1 rounded-full font-medium ${statusBadge[status]}`}>
            {status.replace("_", " ")}
          </span>
          {(role === "admin" || job.assigned_to === currentUserId) && (
            <Select value={status} onValueChange={updateStatus} disabled={saving}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="complete">Complete</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          )}
          {role === "admin" && (
            <Link href={`/jobs/${job.id}/edit`}>
              <Button size="sm" variant="outline">
                <Edit className="h-4 w-4 mr-1" /> Edit
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Job details */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {job.scheduled_date && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{formatDate(job.scheduled_date as string)}</span>
              </div>
            )}
            {job.scheduled_time && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{formatTime(job.scheduled_time as string)}</span>
                {job.duration_minutes && (
                  <span className="text-muted-foreground">({job.duration_minutes as number} min)</span>
                )}
              </div>
            )}
            {assignee && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{assignee.full_name ?? "Unknown"}</span>
              </div>
            )}
            {client?.address && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{client.address}</span>
              </div>
            )}
            {job.description && (
              <div className="pt-2 border-t">
                <p className="text-muted-foreground mb-1 font-medium">Description</p>
                <p>{job.description as string}</p>
              </div>
            )}
            {job.notes && (
              <div className="pt-2 border-t">
                <p className="text-muted-foreground mb-1 font-medium">Notes</p>
                <p>{job.notes as string}</p>
              </div>
            )}
            <div className="pt-2 border-t text-xs text-muted-foreground">
              Created {formatDateTime(job.created_at as string)}
            </div>
          </CardContent>
        </Card>

        {/* Photos */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Camera className="h-4 w-4" /> Photos ({photos.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PhotoUploader
              jobId={job.id as string}
              photos={photos}
              onUpload={(photo) => setPhotos((prev) => [...prev, photo])}
            />
          </CardContent>
        </Card>
      </div>

      {/* Admin actions */}
      {role === "admin" && status === "complete" && (
        <Card>
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="font-medium">Job Complete</p>
              <p className="text-sm text-muted-foreground">Ready to generate an invoice?</p>
            </div>
            <Link href={`/invoices/new?job=${job.id}`}>
              <Button>
                <FileText className="mr-2 h-4 w-4" /> Create Invoice
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
